import { IsOptional, IsNumber } from 'class-validator';

export class GetProductsQuery {
  @IsOptional()
  @IsNumber()
  limit?: number = 50;

  @IsOptional()
  @IsNumber()
  offset?: number = 0;
}
