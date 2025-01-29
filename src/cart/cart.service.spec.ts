import { Test, TestingModule } from '@nestjs/testing';
import { CartService } from './cart.service';
import { PrismaService } from '../prisma/prisma.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartService', () => {
  let service: CartService;

  const mockCart = {
    id: '1',
    userId: 'user1',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockProduct = {
    id: 'prod1',
    name: 'Test Product',
    quantity: 10,
    price: 100,
  };

  const mockCartItem = {
    id: 'item1',
    cartId: '1',
    productId: 'prod1',
    quantity: 2,
    product: mockProduct,
  };

  const mockPrismaService = {
    cart: {
      findUnique: jest.fn(),
      create: jest.fn(),
    },
    cartItem: {
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
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
        CartService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<CartService>(CartService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return existing cart', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);

      const result = await service.getCart('user1');
      expect(result).toEqual(mockCart);
    });

    it('should create new cart if none exists', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);
      mockPrismaService.cart.create.mockResolvedValue(mockCart);

      const result = await service.getCart('user1');
      expect(result).toEqual(mockCart);
    });
  });

  describe('addToCart', () => {
    const addToCartDto: AddToCartDto = {
      productId: 'prod1',
      quantity: 2,
    };

    it('should add new item to cart', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findUnique.mockResolvedValue(null);
      mockPrismaService.cartItem.create.mockResolvedValue(mockCartItem);
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });

      const result = await service.addToCart('user1', addToCartDto);
      expect(result.items).toHaveLength(1);
      expect(result.items[0]).toEqual(mockCartItem);
    });

    it('should throw BadRequestException if quantity exceeds stock', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue({
        ...mockProduct,
        quantity: 1,
      });

      await expect(
        service.addToCart('user1', { ...addToCartDto, quantity: 2 }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should update quantity for existing cart item', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cart.findUnique.mockResolvedValue(mockCart);
      mockPrismaService.cartItem.findUnique.mockResolvedValue(mockCartItem);
      mockPrismaService.cartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 4,
      });

      await service.addToCart('user1', addToCartDto);
      expect(mockPrismaService.cartItem.update).toHaveBeenCalled();
    });
  });

  describe('updateCartItem', () => {
    const updateDto: UpdateCartItemDto = {
      quantity: 3,
    };

    it('should update cart item quantity', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);
      mockPrismaService.cartItem.update.mockResolvedValue({
        ...mockCartItem,
        quantity: 3,
      });

      await service.updateCartItem('user1', 'item1', updateDto);
      expect(mockPrismaService.cartItem.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent cart', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue(null);

      await expect(
        service.updateCartItem('user1', 'item1', updateDto),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [mockCartItem],
      });
      mockPrismaService.cartItem.delete.mockResolvedValue(mockCartItem);

      await service.removeFromCart('user1', 'item1');
      expect(mockPrismaService.cartItem.delete).toHaveBeenCalled();
    });

    it('should throw NotFoundException for non-existent item', async () => {
      mockPrismaService.cart.findUnique.mockResolvedValue({
        ...mockCart,
        items: [],
      });

      await expect(service.removeFromCart('user1', 'item1')).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
