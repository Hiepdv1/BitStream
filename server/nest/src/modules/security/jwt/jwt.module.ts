import { Module } from '@nestjs/common';
import { JwtModule as NestJwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { JwtStrategy } from './strategy/jwt.strategy';
import { JwtTokenService } from './services/jwt.service';
import { PrismaModule } from 'src/infrastructure/database/prisma/prisma.module';
import { PrismaService } from 'src/infrastructure/database/prisma/prisma.service';

@Module({
  imports: [PrismaModule, PassportModule, NestJwtModule.register({})],
  providers: [JwtStrategy, JwtTokenService],
  exports: [JwtTokenService, PassportModule],
})
export class JwtSecurityModule {}
