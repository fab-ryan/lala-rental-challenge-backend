import {
    IsEmail,
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    Matches,
    IsOptional,
  } from 'class-validator';
  import { ApiProperty } from '@nestjs/swagger';

import { RolesEnum } from '@/enums';

export class CreateUserDto {
    @ApiProperty(
        {
            description: 'Name of the user',
            type: String,
            example: 'John Doe',
            required: true,
            nullable: false,
            minLength: 3,
            maxLength: 30,
        }
    )
    @IsNotEmpty()
    @IsString()
    @MinLength(3)
    @MaxLength(30)
    name: string;
  
    @ApiProperty({
        description: 'Email of the user',
        type: String,
        example: 'example@example.com'
    })
    @IsNotEmpty()
    @IsEmail()
    email: string;
  
    @ApiProperty({
        description: 'Password of the user',
        type: String,
        example: 'Password123',
        minLength: 8,
    })
    @IsNotEmpty()
    @IsString()
    @MinLength(8)
    @MaxLength(30)
 
    password: string;

    @ApiProperty({
        description: 'Role of the user',
        type: String,
        example: 'renter',
        enum: [ 'host'],
    })
    @IsOptional()
    @IsString()
    role: RolesEnum;

}
