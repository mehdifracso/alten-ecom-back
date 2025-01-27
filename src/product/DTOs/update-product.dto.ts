import { PickType } from '@nestjs/swagger';
import { CreateProductDto } from './create-product.dto';

export class UpdateProductDto extends PickType(CreateProductDto, [
  'name',
  'description',
  'image',
  'price',
  'quantity',
  'internalReference',
  'shellId',
]) {}
