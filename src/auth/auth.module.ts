import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { APP_GUARD } from '@nestjs/core';
import { UsersModule } from '../users/users.module.js';
import { AuthService } from './auth.service.js';
import { JwtAccessStrategy } from './strategies/jwt-access.strategy.js';
import { JwtAccessGuard } from './guards/jwt-access.guard.js';
import { AuthController } from './auth.controller.js';
import { OrganizationsModule } from '../organizations/organizations.module.js';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    OrganizationsModule,
    JwtModule.register({
      global: true,
      secret: process.env.JWT_SECRET,
      signOptions: { expiresIn: '1d' },
    }),
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
