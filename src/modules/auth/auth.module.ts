import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtModule } from '@nestjs/jwt';
import { config } from '@/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from '@/strategy/jwt.strategy';
import { GoogleStrategy } from '@/strategy/google.strategy';

@Module({
  imports: [
    JwtModule.register({
      secret: config().secret,
      signOptions: { expiresIn: '1d' },
      global: true,
    }),
    TypeOrmModule.forFeature([User]),
    UsersModule
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, GoogleStrategy],
  exports: [AuthService]
})
export class AuthModule { }
