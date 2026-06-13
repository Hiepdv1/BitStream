import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
  NotFoundException,
  InternalServerErrorException,
  ValidationPipe,
  ConflictException,
} from '@nestjs/common';
import { ProviderType } from 'src/generated/prisma/enums';
import { Role } from 'src/common/enums/role.enum';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';
import * as bcrypt from 'bcrypt';
import { CredentialsDto, SignUpDto } from '../dtos/auth.dto';
import { JwtTokenService } from 'src/modules/security/jwt/services/jwt.service';
import {
  AccessTokenPayload,
  AuthPayload,
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
import {
  ChangePasswordDto,
  SetupPasswordDto,
} from 'src/modules/user/dtos/user.dto';

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
        name: user.name,
        avatar: user?.profileImages?.[0]?.storageKey || '',
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

    const socialAccount = user.accounts.find(
      (acc) => acc.provider === provider,
    );

    if (!socialAccount) {
      throw new InternalServerErrorException();
    }

    const sid = generateRandomString();

    const authSession = await this.createAuthSession(
      {
        id: user.id,
        role: user.role,
        isVerified: socialAccount.isVerified,
        email: user.email,
        name: user.name,
        avatar: user?.profileImages?.[0]?.storageKey || '',
        provider: ProviderType.CREDENTIALS,
      },
      sid,
    );

    return {
      ...authSession,
      provider: ProviderType.CREDENTIALS,
    };
  }

  public async refreshToken(token: string) {
    const {
      sub,
      sid,
      isVerified,
      provider,
      jti: tokenJti,
    } = this.jwtTokenService.verify<RefreshTokenPayload>(
      JwtTokenType.REFRESH,
      token,
    );

    const redisKey = RedisKeyManager.getAuthSessionKey(sub, sid, 'refresh');
    const jti = await this.redisService.get<string>(redisKey);

    if (!jti || tokenJti !== jti) {
      throw new UnauthorizedException();
    }

    const user = await this.getRequiredUserById(sub);

    const authSession = await this.createAuthSession(
      {
        id: user.id,
        role: user.role,
        isVerified,
        email: user.email,
        provider,
        name: user.name,
        avatar: user?.profileImages?.[0].storageKey || '',
      },
      sid,
    );

    return {
      ...authSession,
      provider,
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
          role: Role.Viewer,
          accounts: {
            create: {
              provider: ProviderType.CREDENTIALS,
              providerAccountId: email,
              password: hashedPassword,
              isVerified: false,
            },
          },
        },
        include: { accounts: true, profileImages: { take: 1 } },
      });

      const sid = generateRandomString();

      const authSession = await this.createAuthSession(
        {
          id: newUser.id,
          role: newUser.role,
          isVerified: newUser.accounts[0].isVerified,
          email: newUser.email,
          provider: newUser.accounts[0].provider,
          name: newUser.name,
          avatar: newUser?.profileImages?.[0].storageKey || '',
        },
        sid,
      );

      return {
        ...authSession,
        provider: ProviderType.CREDENTIALS,
      };
    });
  }

  public async resendVerificationEmail(auth: AccessTokenPayload) {
    const key = RedisKeyManager.getResendVerificationEmailKey(auth.sub);
    const expiresAt = await this.redisService.get<string>(key);

    if (expiresAt) {
      return {
        remainingSeconds: Number(expiresAt),
      };
    }

    const user = await this.prisma.user.findUnique({
      where: { id: auth.sub },
      include: {
        accounts: true,
      },
    });

    if (!user) throw new BadRequestException('User not found');

    const acc = user.accounts.find((acc) => acc.provider === auth.provider);

    if (!acc) throw new BadRequestException('Account not found');

    if (acc.isVerified)
      throw new BadRequestException('Account is already verified');

    const verifyToken = this.jwtTokenService.sign<VerifyTokenPayload>(
      JwtTokenType.VERIFY_EMAIL,
      {
        sub: user.id,
        sid: generateRandomString(),
      },
    );
    const verifyUrl = `${process.env.FRONTEND_URL}?v=${verifyToken.token}`;

    const payload = plainToInstance(SendMailPayload, {
      to: user.email,
      subject: 'Verify your account',
      template: MailTemplate.VERIFY_EMAIL,
      context: {
        url: verifyUrl,
        username: user.name || '',
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
        context: 'resendVerificationEmail',
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'System error during registration',
      );
    }

    const kafkaErr = await this.kafka.publish(KafkaTopic.MAIL_SEND, data);

    if (kafkaErr) {
      this.logger.error({
        message: 'Kafka Mail Send Failed',
        error: {
          name: kafkaErr.name,
          message: kafkaErr.message,
        },
        service: 'Auth Service',
        context: 'resendVerificationEmail',
        timestamp: new Date().toISOString(),
      });
      throw new InternalServerErrorException(
        'System error during registration',
      );
    }

    const remainingSeconds = Math.ceil(Date.now() / 1000) + 60;

    await this.redisService.set(key, remainingSeconds, {
      ttlSeconds: 60,
    });

    return {
      remainingSeconds,
    };
  }

  public async verifyAccount(email: string, auth: AuthPayload, token: string) {
    const verifyToken = this.jwtTokenService.verify<VerifyTokenPayload>(
      JwtTokenType.VERIFY_EMAIL,
      token,
    );

    const redisKey = RedisKeyManager.getBlacklistKey(verifyToken.jti);
    const now = Math.ceil(Date.now() / 1000);
    const remainingSeconds = verifyToken.exp - now;

    if (remainingSeconds <= 0) throw new BadRequestException('Token expired');

    const isSet = await this.redisService.setNX(
      redisKey,
      '1',
      remainingSeconds,
    );

    if (!isSet) {
      throw new BadRequestException('This link has already been used.');
    }

    try {
      const updated = await this.prisma.account.update({
        where: {
          provider_providerAccountId: {
            provider: auth.provider,
            providerAccountId: email,
          },
          isVerified: false,
          userId: auth.sub,
        },
        data: { isVerified: true },
        include: { user: { include: { profileImages: { take: 1 } } } },
      });

      const authSession = await this.createAuthSession(
        {
          id: updated.userId,
          role: updated.user.role,
          isVerified: updated.isVerified,
          email: updated.providerAccountId,
          name: updated.user.name,
          avatar: updated.user?.profileImages?.[0].storageKey || '',
          provider: updated.provider,
        },
        auth.sid,
      );

      return { ...authSession, provider: updated.provider };
    } catch (error) {
      if (error.code === 'P2025') {
        throw new BadRequestException(
          'Account is already verified or invalid link.',
        );
      }
      throw error;
    }
  }

  public async getRequiredUserByEmail(email: string) {
    const user = await this.findUserByEmail(email);
    if (!user) throw new NotFoundException(`User ${email} not found`);
    return user;
  }

  public async getRequiredUserById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: { accounts: true, profileImages: { take: 1 } },
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

  public async logout(auth: AuthPayload) {
    const redisKey = RedisKeyManager.getAuthSessionKey(
      auth.sub,
      auth.sid,
      'refresh',
    );
    const blacklistKey = RedisKeyManager.getBlacklistKey(auth.jti);

    const nowInSeconds = Math.ceil(Date.now() / 1000);
    const ttlSeconds = auth.exp - nowInSeconds;

    if (ttlSeconds > 0) {
      await this.redisService.set(blacklistKey, '1', { ttlSeconds });
    }

    return await this.redisService.del(redisKey);
  }

  public async setupPassword(auth: AuthPayload, password: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        email: auth.email,
      },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) throw new BadRequestException('User not found');

    const isCredentials = user.accounts.some(
      (account) => account.provider === ProviderType.CREDENTIALS,
    );

    if (isCredentials) {
      throw new ConflictException(
        'Password has already been set up for this account',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const account = await this.prisma.account.create({
      data: {
        provider: ProviderType.CREDENTIALS,
        providerAccountId: user.email,
        password: hashedPassword,
        userId: user.id,
        isVerified: true,
      },
    });

    return account;
  }

  public async linkSocialAccount(auth: AuthPayload, account: SocialAuth) {
    const user = await this.prisma.user.findUnique({
      where: {
        id: auth.sub,
      },
      include: {
        accounts: {
          select: {
            provider: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    if (user.email !== account.email) {
      throw new BadRequestException(
        'The social network email does not match your profile email',
      );
    }

    const existingAccount = await this.prisma.account.findFirst({
      where: {
        provider: account.provider,
        providerAccountId: account.email,
      },
    });

    if (existingAccount) {
      if (existingAccount.userId === user.id) {
        throw new ConflictException(
          `This account is already linked with ${account.provider}`,
        );
      } else {
        throw new ConflictException(
          'This social account is already linked to another user',
        );
      }
    }

    return await this.prisma.account.create({
      data: {
        provider: account.provider,
        providerAccountId: account.email,
        userId: user.id,
        isVerified: true,
      },
      select: {
        provider: true,
        providerAccountId: true,
        userId: true,
        isVerified: true,
      },
    });
  }

  public async unlinkSocialAccount(auth: AuthPayload, provider: ProviderType) {
    if (provider === ProviderType.CREDENTIALS) {
      throw new BadRequestException(
        'Security violation: System credentials cannot be unlinked or deleted',
      );
    }

    const user = await this.prisma.user.findUnique({
      where: {
        id: auth.sub,
      },
      include: {
        accounts: {
          select: {
            provider: true,
            providerAccountId: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const targetAccount = user.accounts.find(
      (acc) => acc.provider === provider,
    );
    if (!targetAccount) {
      throw new NotFoundException(
        `This profile is not linked with a ${provider} account`,
      );
    }

    if (user.accounts.length <= 1) {
      throw new BadRequestException(
        `Action denied: Cannot unlink your last remaining login method. Your account must maintain at least one valid authentication provider.`,
      );
    }

    return await this.prisma.account.delete({
      where: {
        provider_providerAccountId: {
          provider: targetAccount.provider,
          providerAccountId: targetAccount.providerAccountId,
        },
      },
      select: {
        provider: true,
        providerAccountId: true,
      },
    });
  }

  public async updatePassword(auth: AuthPayload, data: ChangePasswordDto) {
    const { password, oldPassword } = data;

    const user = await this.prisma.user.findUnique({
      where: {
        id: auth.sub,
      },
      include: {
        accounts: {
          where: {
            provider: ProviderType.CREDENTIALS,
          },
          select: {
            id: true,
            provider: true,
            providerAccountId: true,
            password: true,
          },
        },
      },
    });

    if (!user) {
      throw new BadRequestException('User not found');
    }

    const credentialsAccount = user.accounts[0];

    if (
      !credentialsAccount ||
      credentialsAccount.provider !== ProviderType.CREDENTIALS ||
      !credentialsAccount.password
    ) {
      throw new BadRequestException(
        'Password authentication has not been enabled for this account',
      );
    }

    const isPasswordValid = await bcrypt.compare(
      oldPassword,
      credentialsAccount.password,
    );

    if (!isPasswordValid) {
      throw new BadRequestException(
        'The old password you entered is incorrect',
      );
    }

    const isNewPasswordSameAsOld = await bcrypt.compare(
      password,
      credentialsAccount.password,
    );

    if (isNewPasswordSameAsOld) {
      throw new BadRequestException(
        'Your new password cannot be the same as your current password',
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    return await this.prisma.account.update({
      where: {
        id: credentialsAccount.id,
      },
      data: {
        password: hashedPassword,
      },
      select: {
        provider: true,
        providerAccountId: true,
      },
    });
  }
  // ------------------------------- PRIVATE METHODS -------------------------------
  private async createAuthSession(
    user: {
      id: string;
      role: number;
      isVerified: boolean;
      email: string;
      name: string;
      avatar: string;
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
      name: user.name,
      avatar: user.avatar,
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
    const isCredentials = provider === ProviderType.CREDENTIALS;

    if (!user) {
      if (isCredentials && (!password || !name)) {
        throw new BadRequestException('Password and name are required');
      }

      const accountData: Prisma.AccountCreateWithoutUserInput = {
        provider,
        providerAccountId: email,
        isVerified: !isCredentials,
      };

      if (isCredentials && password) {
        accountData.password = await bcrypt.hash(password, 10);
      }

      return this.prisma.user.create({
        data: {
          email,
          name: name || email.split('@')[0],
          accounts: {
            create: accountData,
          },
        },
        include: {
          accounts: true,
          profileImages: {
            select: {
              storageKey: true,
            },
            take: 1,
          },
        },
      });
    }

    const existingAccount = user.accounts.find((a) => a.provider === provider);

    if (!existingAccount) {
      if (!isCredentials) {
        const credentialsAccount = user.accounts.find(
          (c) => c.provider === ProviderType.CREDENTIALS,
        );

        if (credentialsAccount && !credentialsAccount.isVerified) {
          throw new ConflictException(
            'Email already registered, but not verified, please login with username and password to verify your email.',
          );
        }

        let hashedPassword: string | null = null;
        if (isCredentials) {
          if (!password) {
            throw new BadRequestException(
              'Password is required for create link account',
            );
          }
          hashedPassword = await bcrypt.hash(password, 10);
        }

        await this.prisma.account.create({
          data: {
            provider,
            providerAccountId: email,
            isVerified: !isCredentials,
            userId: user.id,
            password: hashedPassword,
          },
        });

        return this.getRequiredUserByEmail(email);
      }
    }

    return user;
  }

  private issueAuthSession(user: {
    id: string;
    role: number;
    isVerified: boolean;
    sid: string;
    email: string;
    name: string;
    avatar: string;
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
        name: user.name,
        avatar: user.avatar,
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
      include: { accounts: true, profileImages: { take: 1 } },
    });
  }
}
