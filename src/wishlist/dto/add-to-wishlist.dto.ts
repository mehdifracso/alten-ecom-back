import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AddToWishlistDto {
  @ApiProperty({
    description: 'ID of the product to add to wishlist',
    example: 'prod_123abc',
  })
  @IsString()
  @IsNotEmpty()
  productId: string;
}
