import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateAuthDto } from './dto/create-auth.dto';
import { AuthGuard } from '@nestjs/passport';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) { }

  @Post('/login')
  create(@Body() createAuthDto: CreateAuthDto) {
    return this.authService.authLogin(createAuthDto);
  }

  @Get('/google')
  @UseGuards(AuthGuard('google'))
  google() {
    return this.authService.loginWithGoogle();
  }

  @Get('/google/callback')
  @UseGuards(AuthGuard('google'))
  googleCallback(@Req() req) {
    return this.authService.googleCallback(req);
  }
}
