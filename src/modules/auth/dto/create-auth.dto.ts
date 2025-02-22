import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsEmail } from 'class-validator';
export class CreateAuthDto {
    @ApiProperty({
        example: 'example@xample.com'
    })
    @IsString()
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @ApiProperty({
        example: 'password'
    })
    @IsString()
    @IsNotEmpty()
    password: string;
}
