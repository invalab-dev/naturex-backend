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
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy.js';
import { AuthSessionsService } from './auth-sessions.service.js';

@Module({
  imports: [
    PassportModule,
    UsersModule,
    OrganizationsModule,
    JwtModule.register({}),
  ],
  providers: [
    AuthService,
    AuthSessionsService,
    JwtAccessStrategy,
    JwtRefreshStrategy,
    {
      provide: APP_GUARD,
      useClass: JwtAccessGuard,
    },
  ],
  controllers: [AuthController],
})
export class AuthModule {}
