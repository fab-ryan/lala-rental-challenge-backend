import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import {Repository} from 'typeorm';
import * as bcrypt from 'bcrypt';

import { CreateUserDto } from './dto/create-user.dto';
import {User} from './entities/user.entity';
import { UpdateUserDto } from './dto/update-user.dto';
import { ResponseService, hashPassword } from '@/utils';


@Injectable()
export class UsersService {
  constructor(
  @InjectRepository(User)
  private userRepository : Repository<User>,
  private readonly responseService: ResponseService
  ){}


 async create(createUserDto: CreateUserDto) {
    try{
      const {email, name, password, role} = createUserDto;
      const emailExists = await this.checkEmailExist(email);
      if(emailExists){
        this.responseService.Response({
          message: 'Email already exists',
          statusCode: 400,
          
        })
      }
      const hashedPassword = await hashPassword(password);
      const user = this.userRepository.create({
        email,
        name,
        password: hashedPassword,
        role,
      })
      console.log(user);
      await this.userRepository.save(user);

      return this.responseService.Response({
        message: 'User created successfully',
        data: user,
        statusCode: 201,
        key:'user'
      })
     
    }catch(error){
      const errorMessage= (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async checkEmailExist(email: string): Promise<boolean>{
    const exists = await this.userRepository.exists({
      where: {email},
      withDeleted: true,
    })
    return exists;
  }
  async hashPassword(password: string): Promise<string>{
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  }

  async findAll() {
    try{
      const users = await this.userRepository.find();
      console.log(users);
      return this.responseService.Response({
        message: 'Users fetched successfully',
        data: users,
        key: 'users'
      })
    }
    catch(error){
      console.log((error as Error).message);
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async findOne(id: string) {
    try{
      const user = await this.userRepository.findOne({
        where: {id},
        withDeleted: true,
      });
      if(!user){
        return this.responseService.Response({
          message: 'User not found',
          statusCode: 404,
        })
      }
      return this.responseService.Response({
        message: 'User fetched successfully',
        data: user,
        key: 'user'
      })
    }
    catch(error){
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto) {
    try{
      const user = await this.userRepository.findOne({
        where: {id},
        withDeleted: true,
      });
      if(!user){
        return this.responseService.Response({
          message: 'User not found',
          statusCode: 404,
        })
      }
      await this.userRepository.update(id, updateUserDto);
      return this.responseService.Response({
        message: 'User updated successfully',
        statusCode: 200,
      })
    }
    catch(error){
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }

  async remove(id: string) {
    try{
      const user = await this.userRepository.findOne({
        where: {id},
        withDeleted: true,
      });
      if(!user){
        return this.responseService.Response({
          message: 'User not found',
          statusCode: 404,
        })
      }
      await this.userRepository.softDelete(id);
      return this.responseService.Response({
        message: 'User deleted successfully',
        statusCode: 200,
      })
    }
    catch(error){
      const errorMessage = (error as Error).message;
      this.responseService.Response({
        message: errorMessage,
      })
    }
  }
}
