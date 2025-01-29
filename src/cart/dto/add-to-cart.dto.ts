import { IsInt, IsNotEmpty, IsString, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToCartDto {
  @ApiProperty({
    description: 'ID of the product to add to cart',
    example: 'prod_123abc',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;

  @ApiProperty({
    description: 'Quantity of the product to add',
    minimum: 1,
    example: 1,
  })
  @IsInt()
  @Min(1)
  quantity: number;
}
