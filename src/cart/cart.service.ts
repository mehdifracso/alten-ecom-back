import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

@Injectable()
export class CartService {
  constructor(private prisma: PrismaService) {}

  async getCart(userId: string) {
    const cart = await this.prisma.cart.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!cart) {
      return await this.prisma.cart.create({
        data: { userId },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    }

    return cart;
  }

  async addToCart(userId: string, dto: AddToCartDto) {
    await this.prisma.$transaction(async (tx) => {
      // Check product availability
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.quantity < dto.quantity) {
        throw new BadRequestException(
          `Only ${product.quantity} items available in stock`,
        );
      }

      // Get or create cart
      let cart = await tx.cart.findUnique({
        where: { userId },
      });

      if (!cart) {
        cart = await tx.cart.create({
          data: { userId },
        });
      }

      // Check existing cart item
      const existingItem = await tx.cartItem.findUnique({
        where: {
          cartId_productId: {
            cartId: cart.id,
            productId: dto.productId,
          },
        },
      });

      if (existingItem) {
        const newQuantity = existingItem.quantity + dto.quantity;
        if (newQuantity > product.quantity) {
          throw new BadRequestException(
            `Cannot add ${dto.quantity} more items. Only ${
              product.quantity - existingItem.quantity
            } more items available`,
          );
        }

        await tx.cartItem.update({
          where: { id: existingItem.id },
          data: {
            quantity: newQuantity,
          },
          include: {
            product: true,
          },
        });
      } else {
        await tx.cartItem.create({
          data: {
            cartId: cart.id,
            productId: dto.productId,
            quantity: dto.quantity,
          },
          include: {
            product: true,
          },
        });
      }
    });

    return await this.getCart(userId);
  }

  async updateCartItem(userId: string, itemId: string, dto: UpdateCartItemDto) {
    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = cart.items.find((i) => i.id === itemId);
      if (!item) {
        throw new NotFoundException('Cart item not found');
      }

      // Check product availability
      const product = await tx.product.findUnique({
        where: { id: item.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      if (product.quantity < dto.quantity) {
        throw new BadRequestException(
          `Only ${product.quantity} items available in stock`,
        );
      }

      await tx.cartItem.update({
        where: { id: itemId },
        data: { quantity: dto.quantity },
        include: {
          product: true,
        },
      });
    });

    return await this.getCart(userId);
  }

  async removeFromCart(userId: string, itemId: string) {
    await this.prisma.$transaction(async (tx) => {
      const cart = await tx.cart.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!cart) {
        throw new NotFoundException('Cart not found');
      }

      const item = cart.items.find((i) => i.id === itemId);
      if (!item) {
        throw new NotFoundException('Cart item not found');
      }

      await tx.cartItem.delete({
        where: { id: itemId },
      });
    });

    return await this.getCart(userId);
  }
}
