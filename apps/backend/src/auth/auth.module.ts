import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { PassportModule } from '@nestjs/passport';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';
import type ms from 'ms';
import { User, UserSchema } from '../users/schemas/user.schema';
import { UsersModule } from '../users/users.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  imports: [
    ConfigModule,
    UsersModule,
    MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
    PassportModule.register({ defaultStrategy: 'jwt' }),
    // General API default (60 req/min/IP). The auth endpoints below override
    // this with a stricter limit via @Throttle; everything else inherits it.
    ThrottlerModule.forRoot([{ ttl: 60000, limit: 60 }]),
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'development-secret',
        signOptions: {
          expiresIn:
            (configService.get<string>('JWT_EXPIRES_IN') as
              | ms.StringValue
              | undefined) ?? '1h',
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    JwtStrategy,
    // Enforce the general 60 req/min/IP default API-wide. The auth endpoints
    // below keep their stricter per-route @Throttle overrides, which take
    // precedence over this global default.
    { provide: APP_GUARD, useClass: ThrottlerGuard },
  ],
})
export class AuthModule {}
