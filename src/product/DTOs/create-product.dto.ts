import {
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUrl,
  Min,
  MinLength,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateProductDto {
  @ApiProperty({
    description: 'Unique product code',
    example: 'PROD-001',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  code: string;

  @ApiProperty({
    description: 'Product name',
    example: 'Gaming Mouse',
  })
  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  name: string;

  @ApiPropertyOptional({
    description: 'Product description',
    example: 'High-performance gaming mouse with RGB lighting',
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({
    description: 'URL to product image',
    example: 'https://example.com/images/gaming-mouse.jpg',
  })
  @IsUrl()
  @IsOptional()
  image?: string;

  @ApiPropertyOptional({
    description: 'Product category',
    example: 'Gaming Peripherals',
  })
  @IsString()
  @IsOptional()
  category?: string;

  @ApiProperty({
    description: 'Product price',
    minimum: 0,
    example: 59.99,
  })
  @IsNumber()
  @IsPositive()
  @IsNotEmpty()
  @Min(0)
  price: number;

  @ApiProperty({
    description: 'Available quantity',
    minimum: 0,
    example: 100,
  })
  @IsInt()
  @IsPositive()
  @IsNotEmpty()
  @Min(0)
  quantity: number;

  @ApiPropertyOptional({
    description: 'Internal reference code',
    example: 'REF-001',
  })
  @IsString()
  @IsOptional()
  internalReference?: string;

  @ApiPropertyOptional({
    description: 'Shell ID for external system reference',
    example: 1234,
  })
  @IsInt()
  @IsPositive()
  @IsOptional()
  shellId?: number;
}
