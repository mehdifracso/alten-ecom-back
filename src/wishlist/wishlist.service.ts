import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

@Injectable()
export class WishlistService {
  constructor(private prisma: PrismaService) {}

  async getWishlist(userId: string) {
    const wishlist = await this.prisma.wishlist.findUnique({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!wishlist) {
      await this.prisma.wishlist.create({
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

    return wishlist;
  }

  async addToWishlist(userId: string, dto: AddToWishlistDto) {
    await this.prisma.$transaction(async (tx) => {
      // Check if product exists
      const product = await tx.product.findUnique({
        where: { id: dto.productId },
      });

      if (!product) {
        throw new NotFoundException('Product not found');
      }

      // Get or create wishlist
      let wishlist = await tx.wishlist.findUnique({
        where: { userId },
      });

      if (!wishlist) {
        wishlist = await tx.wishlist.create({
          data: { userId },
        });
      }

      // Check if item already exists in wishlist
      const existingItem = await tx.wishlistItem.findUnique({
        where: {
          wishlistId_productId: {
            wishlistId: wishlist.id,
            productId: dto.productId,
          },
        },
        include: {
          product: true,
        },
      });

      if (existingItem) {
        return await this.getWishlist(userId);
      }

      // Add new item to wishlist
      await tx.wishlistItem.create({
        data: {
          wishlistId: wishlist.id,
          productId: dto.productId,
        },
        include: {
          product: true,
        },
      });
    });

    return await this.getWishlist(userId);
  }

  async removeFromWishlist(userId: string, itemId: string) {
    await this.prisma.$transaction(async (tx) => {
      const wishlist = await tx.wishlist.findUnique({
        where: { userId },
        include: { items: true },
      });

      if (!wishlist) {
        throw new NotFoundException('Wishlist not found');
      }

      const item = wishlist.items.find((i) => i.id === itemId);
      if (!item) {
        throw new NotFoundException('Wishlist item not found');
      }

      await tx.wishlistItem.delete({
        where: { id: itemId },
      });
    });

    return await this.getWishlist(userId);
  }
}
