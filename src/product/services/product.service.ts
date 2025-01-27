import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { GetProductsQuery } from '../DTOs/get-product-query.dto';
import { CreateProductDto } from '../DTOs/create-product.dto';
import { InventoryStatus, Product } from '@prisma/client';
import { UpdateProductDto } from '../DTOs/update-product.dto';

@Injectable()
export class ProductService {
  private readonly logger = new Logger(ProductService.name);

  constructor(private readonly prisma: PrismaService) {}

  calculateInventoryStatus(quantity: number) {
    if (quantity < 1) return InventoryStatus.OUTOFSTOCK;
    else if (quantity < 10) return InventoryStatus.LOWSTOCK;
    else return InventoryStatus.INSTOCK;
  }

  async getProducts(query: GetProductsQuery) {
    return this.prisma.product
      .findMany({
        take: query.limit ?? 50,
        skip: query.offset ?? 0,
      })
      .catch((error) => {
        console.error(error);
        throw new InternalServerErrorException('Failed to fetch products');
      });
  }

  async getProduct(id: string): Promise<Product> {
    return await this.prisma.product.findUnique({ where: { id } });
  }

  async createProduct(data: CreateProductDto): Promise<Product> {
    const inventoryStatus = this.calculateInventoryStatus(data.quantity);

    return await this.prisma.product
      .create({
        data: {
          ...data,
          rating: 0,
          inventoryStatus,
        },
      })
      .catch((error) => {
        this.logger.error(error);
        if (error.code === 'P2002') {
          const target = error.meta?.target;
          if (target) {
            const field = target[0];
            throw new ConflictException(
              `Product with this ${field} already exists`,
            );
          }
          throw new ConflictException(
            'Product with unique constraint violation',
          );
        }
        throw new InternalServerErrorException('Failed to create product');
      });
  }

  async updateProduct(id: string, data: UpdateProductDto): Promise<Product> {
    return await this.prisma.product
      .update({ where: { id }, data })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException('Failed to update product');
      });
  }

  async deleteProduct(id: string): Promise<Product> {
    return await this.prisma.product
      .delete({ where: { id } })
      .catch((error) => {
        this.logger.error(error);
        throw new InternalServerErrorException('Failed to delete product');
      });
  }
}
