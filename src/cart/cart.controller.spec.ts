import { Test, TestingModule } from '@nestjs/testing';
import { CartController } from './cart.controller';
import { CartService } from './cart.service';
import { AddToCartDto } from './dto/add-to-cart.dto';
import { UpdateCartItemDto } from './dto/update-cart-item.dto';

describe('CartController', () => {
  let controller: CartController;

  const mockCart = {
    id: '1',
    userId: 'user1',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCartService = {
    getCart: jest.fn(),
    addToCart: jest.fn(),
    updateCartItem: jest.fn(),
    removeFromCart: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CartController],
      providers: [
        {
          provide: CartService,
          useValue: mockCartService,
        },
      ],
    }).compile();

    controller = module.get<CartController>(CartController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getCart', () => {
    it('should return user cart', async () => {
      mockCartService.getCart.mockResolvedValue(mockCart);

      const result = await controller.getCart('user1');
      expect(result).toEqual(mockCart);
      expect(mockCartService.getCart).toHaveBeenCalledWith('user1');
    });
  });

  describe('addToCart', () => {
    const addToCartDto: AddToCartDto = {
      productId: 'prod1',
      quantity: 2,
    };

    it('should add item to cart', async () => {
      const mockCartWithItem = {
        ...mockCart,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            quantity: 2,
          },
        ],
      };

      mockCartService.addToCart.mockResolvedValue(mockCartWithItem);

      const result = await controller.addToCart('user1', addToCartDto);
      expect(result).toEqual(mockCartWithItem);
      expect(mockCartService.addToCart).toHaveBeenCalledWith(
        'user1',
        addToCartDto,
      );
    });
  });

  describe('updateCartItem', () => {
    const updateCartItemDto: UpdateCartItemDto = {
      quantity: 3,
    };

    it('should update cart item quantity', async () => {
      const mockCartWithUpdatedItem = {
        ...mockCart,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
            quantity: 3,
          },
        ],
      };

      mockCartService.updateCartItem.mockResolvedValue(mockCartWithUpdatedItem);

      const result = await controller.updateCartItem(
        'user1',
        'item1',
        updateCartItemDto,
      );
      expect(result).toEqual(mockCartWithUpdatedItem);
      expect(mockCartService.updateCartItem).toHaveBeenCalledWith(
        'user1',
        'item1',
        updateCartItemDto,
      );
    });
  });

  describe('removeFromCart', () => {
    it('should remove item from cart', async () => {
      mockCartService.removeFromCart.mockResolvedValue(mockCart);

      const result = await controller.removeFromCart('user1', 'item1');
      expect(result).toEqual(mockCart);
      expect(mockCartService.removeFromCart).toHaveBeenCalledWith(
        'user1',
        'item1',
      );
    });
  });
}); 