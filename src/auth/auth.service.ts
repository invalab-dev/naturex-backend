import { BadRequestException, HttpException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';


@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}

  async signUp(email: string, password: string, name: string): Promise<any> {
    const user = await this.usersService.createOne(email, password, name);

    const payload = { usb: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }

  async login(email: string, password: string): Promise<{ access_token: string }> {
    const user = await this.usersService.findOne(email);

    if(user?.password !== password) {
      throw new UnauthorizedException();
    }

    const payload = { usb: user.id, username: user.name };
    return {
      access_token: await this.jwtService.signAsync(payload),
    }
  }
}