import { Body, Controller, Delete, HttpCode, HttpStatus, Post, Res } from '@nestjs/common';
import { AuthService } from './auth.service';
import { type Response } from 'express';
import { Public } from './guards/jwt-access.guard';


@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @Public()
  @HttpCode(HttpStatus.CREATED)
  @Post("signup")
  signUp(@Body() signUpDTO: Record<string, any>) {
    return this.authService.signUp(signUpDTO.email, signUpDTO.password, signUpDTO.name);
  }

  @Public()
  @HttpCode(HttpStatus.OK)
  @Post("login")
  async login(@Body() loginDTO: { email: string; password: string }, @Res({ passthrough: true })res: Response) {
    const { access_token } = await this.authService.login(loginDTO.email, loginDTO.password);

    res.cookie("access_token", access_token, {
      httpOnly: true,
      sameSite: "lax", // 포트번호만 다르면 상관x; "none" 사용시 secure: true가 필수이다.
      secure: false
    });

    return { ok: true };
  }
}