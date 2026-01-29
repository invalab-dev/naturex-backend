import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { User, UserRole, UsersService } from '../users/users.service.js';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(
    userDTO: Omit<
      User,
      | 'id'
      | 'roles'
      | 'name'
      | 'phoneNumber'
      | 'bio'
      | 'organizationId'
      | 'language'
      | 'timezone'
    > & {
      roles?: UserRole[] | undefined | null;
      name?: string | undefined | null;
      phoneNumber?: string | undefined | null;
      bio?: string | undefined | null;
      organizationId?: string | undefined | null;
      language?: string | undefined | null;
      timezone?: string | undefined | null;
    },
  ): Promise<any> {
    const user = await this.usersService.createOne(userDTO);

    const payload = { sub: user.id, userRoles: [user.roles] };
    return {
      access_token: await this.jwtService.signAsync(payload),
    };
  }

  async login(
    email: string,
    password: string,
  ): Promise<{ access_token: string; user: Omit<User, 'password'> }> {
    const user = await this.usersService.findOneByEmail(email);

    if (!user || user?.password !== password) {
      throw new UnauthorizedException();
    }

    const payload = { sub: user.id, userRoles: [user.roles] };
    const { ['password']: _, ...insensitiveUser } = user;
    return {
      access_token: await this.jwtService.signAsync(payload),
      user: insensitiveUser,
    };
  }
}
