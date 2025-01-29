import { Test, TestingModule } from '@nestjs/testing';
import { WishlistService } from './wishlist.service';
import { PrismaService } from '../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

describe('WishlistService', () => {
  let service: WishlistService;

  const mockWishlist = {
    id: '1',
    userId: 'user1',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 'prod1',
    name: 'Test Product',
    price: 100,
  };

  const mockWishlistItem = {
    id: 'item1',
    wishlistId: '1',
    productId: 'prod1',
    product: mockProduct,
  };

  const mockPrismaService = {
    wishlist: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    wishlistItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    },
    product: {
      findUnique: jest.fn(),
    },
    $transaction: jest.fn((callback) => callback(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        WishlistService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<WishlistService>(WishlistService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should return existing wishlist', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);

      const result = await service.getWishlist('user1');
      expect(result).toEqual(mockWishlist);
    });

    it('should create new wishlist if none exists', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue(null);
      mockPrismaService.wishlist.create.mockResolvedValue(mockWishlist);

      await service.getWishlist('user1');

      expect(mockPrismaService.wishlist.create).toHaveBeenCalledWith({
        data: { userId: 'user1' },
        include: {
          items: {
            include: {
              product: true,
            },
          },
        },
      });
    });
  });

  describe('addToWishlist', () => {
    const addToWishlistDto: AddToWishlistDto = {
      productId: 'prod1',
    };

    it('should add new item to wishlist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findUnique.mockResolvedValue(null);
      mockPrismaService.wishlistItem.create.mockResolvedValue(mockWishlistItem);
      mockPrismaService.wishlist.findUnique.mockResolvedValue({
        ...mockWishlist,
        items: [mockWishlistItem],
      });

      const result = await service.addToWishlist('user1', addToWishlistDto);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockWishlistItem);
    });

    it('should not duplicate items in wishlist', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.wishlist.findUnique.mockResolvedValue(mockWishlist);
      mockPrismaService.wishlistItem.findUnique.mockResolvedValue(
        mockWishlistItem,
      );

      await service.addToWishlist('user1', addToWishlistDto);
      expect(mockPrismaService.wishlistItem.create).not.toHaveBeenCalled();
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue({
        ...mockWishlist,
        items: [mockWishlistItem],
      });
      mockPrismaService.wishlistItem.delete.mockResolvedValue(mockWishlistItem);

      await service.removeFromWishlist('user1', 'item1');
      expect(mockPrismaService.wishlistItem.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent item', async () => {
      mockPrismaService.wishlist.findUnique.mockResolvedValue({
        ...mockWishlist,
        items: [],
      });

      await expect(
        service.removeFromWishlist('user1', 'item1'),
      ).rejects.toThrow(NotFoundException);
    });
  });
});
