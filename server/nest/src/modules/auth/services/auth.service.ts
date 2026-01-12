import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  ValidationPipe,
} from '@nestjs/common';
import { ProviderType, UserRole } from 'src/generated/prisma/enums';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CredentialsDto, SignUpDto } from '../dtos/auth.dto';
import { JwtTokenService } from 'src/modules/security/jwt/services/jwt.service';
import {
  AccessTokenPayload,
  RefreshTokenPayload,
  VerifyTokenPayload,
} from '../types/auth';
import { JwtTokenType } from 'src/modules/security/jwt/types/jwt.type';
import { RedisService } from 'src/infrastructure/redis/redis.service';
import { Prisma } from 'src/generated/prisma/browser';
import {
  formatDuration,
  generateRandomString,
  validateKafkaPayload,
} from 'src/common/utils';
import { FormFieldException } from 'src/common/exceptions';
import { KafkaProducerService } from 'src/infrastructure/kafka/kafka.producer';
import { KafkaTopic } from 'src/infrastructure/kafka/kafka.topics';
import { RedisKeyManager } from 'src/infrastructure/redis/redis-key.manager';
import { LoggerService } from 'src/infrastructure/logger/logger.service';
import { SocialAuth } from 'src/modules/security/token-providers/providers/token-verifier.interface';
import { SendMailPayload } from 'src/common/kafka-payloads/mail';
import { MailTemplate } from 'src/common/kafka-payloads/mail/mail-template.enum';
import { plainToInstance } from 'class-transformer';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtTokenService: JwtTokenService,
    private readonly redisService: RedisService,
    private readonly kafka: KafkaProducerService,
    private readonly logger: LoggerService,
  ) {}

  public async authenticateWithCredentials(dto: CredentialsDto) {
    const { email, password } = dto;
    const user = await this.resolveUserAccount(
      email,
      ProviderType.CREDENTIALS,
      password,
    );

    const credentialAccount = user.accounts.find(
      (acc) => acc.provider === ProviderType.CREDENTIALS,
    );
    if (!credentialAccount?.password) {
      throw new BadRequestException(
        'Password login not set. Use Social Login.',
      );
    }

    const isMatch = await bcrypt.compare(password, credentialAccount.password);
    if (!isMatch) throw new UnauthorizedException('Invalid email or password');

    const sid = generateRandomString();

    const authSession = await this.createAuthSession(
      {
        id: user.id,
        role: user.role,
        isVerified: credentialAccount.isVerified,
        email: user.email,
        provider: ProviderType.CREDENTIALS,
      },
      sid,
    );

    return {
      ...authSession,
      provider: ProviderType.CREDENTIALS,
    };
  }

  public async socialSignIn(verifiedToken: SocialAuth) {
    const { email, provider } = verifiedToken;
    const user = await this.resolveUserAccount(email, provider);

    return user;
  }

  public async refreshToken(token: string) {
    const { sub, sid, isVerified, provider } =
      this.jwtTokenService.verify<RefreshTokenPayload>(
        JwtTokenType.REFRESH,
        token,
      );
    const user = await this.getRequiredUserById(sub);

    const authSession = await this.createAuthSession(
      {
        id: user.id,
        role: user.role,
        isVerified,
        email: user.email,
        provider,
      },
      sid,
    );

    return {
      ...authSession,
      provider: ProviderType.CREDENTIALS,
    };
  }

  public async signUp(dto: SignUpDto) {
    const { email, password, fullName } = dto;

    const user = await this.prisma.user.findFirst({
      where: { email },
      select: { id: true },
    });

    if (user)
      throw new FormFieldException<SignUpDto>('email', 'Email already exists');
    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          name: fullName,
          role: UserRole.VIEWER,
          accounts: {
            create: {
              provider: ProviderType.CREDENTIALS,
              providerAccountId: email,
              password: hashedPassword,
              isVerified: false,
            },
          },
        },
        include: { accounts: true },
      });

      const sid = generateRandomString();

      const authSession = await this.createAuthSession(
        {
          id: newUser.id,
          role: newUser.role,
          isVerified: newUser.accounts[0].isVerified,
          email: newUser.email,
          provider: newUser.accounts[0].provider,
        },
        sid,
      );

      const verifyToken = this.jwtTokenService.sign<VerifyTokenPayload>(
        JwtTokenType.VERIFY_EMAIL,
        {
          sub: newUser.id,
          sid,
        },
      );
      const verifyUrl = `${process.env.FRONTEND_URL}?v=${verifyToken.token}`;

      const payload = plainToInstance(SendMailPayload, {
        to: newUser.email,
        subject: 'Verify your account',
        template: MailTemplate.VERIFY_EMAIL,
        context: {
          url: verifyUrl,
          username: newUser.name || '',
          expiresIn: formatDuration(verifyToken.expiresIn),
        },
        retryCount: 0,
        maxRetry: 3,
        eventId: generateRandomString(),
        occurredAt: new Date().toISOString(),
      } as SendMailPayload);

      const { data, errors } = await validateKafkaPayload(
        SendMailPayload,
        payload,
      );

      if (errors) {
        const error = errors[0];

        this.logger.error({
          message: 'Kafka Mail Payload Validation Failed',
          error: {
            name: error.field,
            message: error.errors.join(','),
          },
          service: 'Auth Service',
          context: 'signUp',
          timestamp: new Date().toISOString(),
        });
        throw new InternalServerErrorException(
          'System error during registration',
        );
      }

      await this.kafka.publish(KafkaTopic.MAIL_SEND, data);

      return {
        ...authSession,
        provider: ProviderType.CREDENTIALS,
      };
    });
  }

  public async verifyAccount(
    email: string,
    auth: AccessTokenPayload,
    token: string,
  ) {
    const verifyToken = this.jwtTokenService.verify<VerifyTokenPayload>(
      JwtTokenType.VERIFY_EMAIL,
      token,
    );

    const redisKey = RedisKeyManager.getBlacklistKey(verifyToken.jti);
    const exist = await this.redisService.exists(redisKey);

    if (exist) {
      throw new BadRequestException(
        'This verification link has already been used.',
      );
    }

    let updated;

    try {
      updated = await this.prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: auth.provider,
            providerAccountId: email,
          },
          isVerified: false,
        },
        data: { isVerified: true },
        include: { user: true },
      });
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'Account is already verified or the link is invalid.',
        );
      }
      throw error;
    }

    const authSession = await this.createAuthSession(
      {
        id: verifyToken.sub,
        role: updated.user.role,
        isVerified: updated.isVerified,
        email: updated.providerAccountId,
        provider: updated.provider,
      },
      auth.sid,
    );

    const newInSeconds = Math.ceil(Date.now() / 1000);
    const remainingSeconds = verifyToken.exp - newInSeconds;

    if (remainingSeconds > 0) {
      const redisKey = RedisKeyManager.getBlacklistKey(verifyToken.jti);
      await this.redisService.set(redisKey, '1', {
        ttlSeconds: remainingSeconds,
      });
    }

    return {
      ...authSession,
      provider: updated.provider,
    };
  }

  public async getRequiredUserByEmail(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new NotFoundException(`User ${email} not found`);
    return user;
  }

  public async getRequiredUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true },
    });
    if (!user) throw new NotFoundException(`User ID ${id} not found`);
    return user;
  }

  public async createAccount(value: Prisma.AccountCreateManyInput) {
    if (value.provider === ProviderType.CREDENTIALS) {
      if (!value.password)
        throw new InternalServerErrorException(
          'Account password missing for Credentials provider',
        );

      const hashedPassword = await bcrypt.hash(value.password, 10);
      value.password = hashedPassword;
    }

    return this.prisma.account.create({ data: value });
  }

  // ------------------------------- PRIVATE METHODS -------------------------------
  private async createAuthSession(
    user: {
      id: string;
      role: UserRole;
      isVerified: boolean;
      email: string;
      provider: ProviderType;
    },
    sid: string,
  ) {
    const authSession = this.issueAuthSession({
      id: user.id,
      role: user.role,
      isVerified: user.isVerified,
      sid,
      email: user.email,
      provider: user.provider,
    });

    const redisKey = RedisKeyManager.getAuthSessionKey(user.id, sid, 'refresh');

    await this.redisService.set(redisKey, authSession.refreshToken.jti, {
      ttlSeconds: authSession.refreshToken.expiresIn,
    });

    return authSession;
  }

  private async resolveUserAccount(
    email: string,
    provider: ProviderType,
    password?: string,
    name?: string,
  ) {
    const user = await this.findUserByEmail(email);

    if (!user) {
      const hashedPassword = password ? await bcrypt.hash(password, 10) : null;
      return this.prisma.user.create({
        data: {
          email,
          name,
          role: UserRole.VIEWER,
          accounts: {
            create: {
              provider,
              providerAccountId: email,
              password: hashedPassword,
              isVerified: provider !== ProviderType.CREDENTIALS,
            },
          },
        },
        include: { accounts: true },
      });
    }

    const account = user.accounts.find((acc) => acc.provider === provider);
    if (!account) {
      await this.createAccount({
        provider,
        providerAccountId: email,
        password,
        userId: user.id,
        isVerified: provider !== ProviderType.CREDENTIALS,
      });
      return this.getRequiredUserByEmail(email);
    }

    return user;
  }

  private issueAuthSession(user: {
    id: string;
    role: UserRole;
    isVerified: boolean;
    sid: string;
    email: string;
    provider: ProviderType;
  }) {
    const accessToken = this.jwtTokenService.sign<AccessTokenPayload>(
      JwtTokenType.ACCESS,
      {
        sub: user.id,
        isVerified: user.isVerified,
        role: user.role,
        sid: user.sid,
        email: user.email,
        provider: user.provider,
      },
    );

    const refreshToken = this.jwtTokenService.sign<RefreshTokenPayload>(
      JwtTokenType.REFRESH,
      {
        sub: user.id,
        sid: user.sid,
        isVerified: user.isVerified,
        provider: user.provider,
      },
    );

    return { accessToken, refreshToken };
  }

  private async findUserByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: { email },
      include: { accounts: true },
    });
  }
}
