import { Injectable } from '@nestjs/common';
import { CreateAuthDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';
import { RolesEnum as Roles } from '@/enums';
import { User } from '@/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { hashPassword, ResponseService } from '@/utils';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import e from 'express';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private userRepository: Repository<User>,
    private readonly jwtService: JwtService,
    private readonly responseService: ResponseService,
    private readonly userService: UsersService,
  ) { }

  async authLogin(createAuthDto: CreateAuthDto) {
    try {

      const userExist = await this.userService.checkEmailExist(createAuthDto.email);
      if (!userExist) {
        return this.responseService.Response({
          message: 'User not found',
          statusCode: 404,
        });
      }
      const user = await this.userRepository.findOne({ where: { email: createAuthDto.email } });

      const passwordMatch = await bcrypt.compare(createAuthDto.password, user.password);
      if (!passwordMatch) {
        return this.responseService.Response({
          message: 'Incorrect email or password',
          statusCode: 400,
        })
      }

      const payload = { id: user.id, role: user.role };
      const token = this.jwtService.sign(payload);

      return this.responseService.Response({
        message: 'Login successful',
        statusCode: 200,
        data: { token },
        key: 'access_token'
      })

    } catch (error) {
      const errorMessage = (error as Error).message;
      return this.responseService.Response({
        message: errorMessage,
        statusCode: 500,
      });
    }
  }

  loginWithGoogle() {
    return this.responseService.Response({
      message: 'Login with google',
      statusCode: 200,
    })
  }

  async googleCallback(req: any) {
    try {
      const { user } = req;
      const userExist = await this.userService.checkEmailExist(user.email);
      if (!userExist) {
        const userRole= Roles.RENTER;
        const reqUser=  this.userRepository.create({
          email: user.email,
          name: user.firstName + ' ' + user.lastName,
          role: userRole,
          password:await hashPassword('password'),
          status: true,
        })
        await this.userRepository.save(reqUser);
      }
      const existingUser = await this.userRepository.findOne({ where: { email: user.email } });
      const payload = { id: existingUser.id, role: existingUser.role };
      const token = this.jwtService.sign(payload);
      return this.responseService.Response({
        message: 'Login successful',
        statusCode: 200,
        data: { token },
        key: 'access_token'
      })
    } catch (error) {
      const errorMessage = (error as Error).message;
      return this.responseService.Response({
        message: errorMessage,
        statusCode: 500,
      });
    }
  }

}
