import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Put,
  Query,
  UseGuards,
} from '@nestjs/common';
import { GetProductsQuery } from './DTOs/get-product-query.dto';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './DTOs/create-product.dto';
import { UpdateProductDto } from './DTOs/update-product.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { AdminGuard } from '../auth/guards/admin.guard';

@Controller('products')
@UseGuards(JwtAuthGuard)
export class ProductController {
  constructor(private readonly productService: ProductService) {}

  @Get()
  async getProducts(@Query() query: GetProductsQuery) {
    return await this.productService.getProducts(query);
  }

  @UseGuards(AdminGuard)
  @Post()
  async createProduct(@Body() body: CreateProductDto) {
    return await this.productService.createProduct(body);
  }

  @Get(':id')
  async getProduct(@Param('id') id: string) {
    return await this.productService.getProduct(id);
  }

  @UseGuards(AdminGuard)
  @Put(':id')
  async updateProduct(@Param('id') id: string, @Body() body: UpdateProductDto) {
    return await this.productService.updateProduct(id, body);
  }

  @UseGuards(AdminGuard)
  @Delete(':id')
  async deleteProduct(@Param('id') id: string) {
    return await this.productService.deleteProduct(id);
  }
}
