import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PassportModule } from '@nestjs/passport';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy';
import { JwtAccessGuard } from './guards/jwt-access.guard';
import { APP_GUARD } from '@nestjs/core';


@Module({
  imports: [
    PassportModule,
    UsersModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
    // JwtModule.registerAsync({
    //   imports: [ConfigModule],
    //   useFactory: async (configService: ConfigService) => ({
    //     secret: configService.get<string>('JWT_SECRET'),
    //     signOptions: { expiresIn: '60s' },
    //   }),
    //   inject: [ConfigService],
    // }),
  ],
  providers: [
    AuthService,
    JwtAccessStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}