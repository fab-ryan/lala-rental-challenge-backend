import {
    IsNotEmpty,
    IsString,
    MaxLength,
    MinLength,
    IsOptional,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';


export class CreatePropertyDto {


    @ApiProperty(
        {
            description: 'Name of the property',
            type: String,
            example: 'House in the woods',
            required: true,
            nullable: false,
            minLength: 3,
            maxLength: 30,
        }
    )
    @IsNotEmpty()
    @IsString()
    title: string;

    @ApiProperty({
        description: 'Description of the property',
        type: String,
        example: 'A beautiful house in the woods'
    })
    @IsNotEmpty()
    @IsString()
    description: string;

    @ApiProperty({
        description: 'Location of the property',
        type: String,
        example: '1234 Elm Street'
    })
    @IsNotEmpty()
    @IsString()
    location: string;

    @ApiProperty({
        description: 'Price of the property per night',
        example: 1000
    })
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        description: 'thumbNail image of the property',
        type: 'string',
        example: 'https://example.com/image.jpg',
        format: 'binary'
    })
    @IsOptional()
    thumbnail?: string;

    @ApiProperty({
        description: 'Images of the property',
        type: 'string',
        example: 'https://example.com/image.jpg',
        format: 'binary',
    })
    @IsOptional()
    gallery?: Express.Multer.File[];

    @ApiProperty({
        description: 'Host of the property amenities',
        type: 'string',
    })
    @IsOptional()
    amenities?: string;


}

export class ImageslDto {

    thumbnail: Express.Multer.File;
    gallery: Express.Multer.File[];
}
export class GalleryDto {
    gallery: Express.Multer.File[];
}