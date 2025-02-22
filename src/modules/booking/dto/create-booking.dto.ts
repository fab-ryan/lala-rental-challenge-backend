import { IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
export class CreateBookingDto {
    @ApiProperty()
    @IsNotEmpty()
    propertyId: string;

    @ApiProperty()
    @IsNotEmpty()
    checkInDate: string;

    @ApiProperty()
    @IsNotEmpty()
    checkOutDate: string;


    @ApiProperty()
    @IsOptional()
    review?: string;
}