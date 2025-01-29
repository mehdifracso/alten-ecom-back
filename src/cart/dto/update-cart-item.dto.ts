import { PickType } from '@nestjs/swagger';
import { AddToCartDto } from './add-to-cart.dto';

export class UpdateCartItemDto extends PickType(AddToCartDto, ['quantity']) {}
