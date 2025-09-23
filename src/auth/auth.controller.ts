import { Body, Controller, Delete, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';


@Controller("auth")
export class AuthController {
  constructor(private authService: AuthService) {}

  @HttpCode(HttpStatus.CREATED)
  @Post("signup")
  signUp(@Body() signUpDTO: Record<string, any>) {
    return this.authService.signUp(signUpDTO.email, signUpDTO.password, signUpDTO.name);
  }

  @HttpCode(HttpStatus.OK)
  @Post("login")
  login(@Body() loginDTO: Record<string, any>) {
    return this.authService.login(loginDTO.email, loginDTO.password);
  }

  @HttpCode(HttpStatus.OK)
  @Delete("withdraw")
  withdraw() {

  }
}