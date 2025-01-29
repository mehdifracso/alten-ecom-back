import { Test, TestingModule } from '@nestjs/testing';
import { WishlistController } from './wishlist.controller';
import { WishlistService } from './wishlist.service';
import { AddToWishlistDto } from './dto/add-to-wishlist.dto';

describe('WishlistController', () => {
  let controller: WishlistController;

  const mockWishlist = {
    id: '1',
    userId: 'user1',
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockWishlistService = {
    getWishlist: jest.fn(),
    addToWishlist: jest.fn(),
    removeFromWishlist: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [WishlistController],
      providers: [
        {
          provide: WishlistService,
          useValue: mockWishlistService,
        },
      ],
    }).compile();

    controller = module.get<WishlistController>(WishlistController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getWishlist', () => {
    it('should return user wishlist', async () => {
      mockWishlistService.getWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.getWishlist('user1');
      expect(result).toEqual(mockWishlist);
      expect(mockWishlistService.getWishlist).toHaveBeenCalledWith('user1');
    });
  });

  describe('addToWishlist', () => {
    const addToWishlistDto: AddToWishlistDto = {
      productId: 'prod1',
    };

    it('should add item to wishlist', async () => {
      const mockWishlistWithItem = {
        ...mockWishlist,
        items: [
          {
            id: 'item1',
            productId: 'prod1',
          },
        ],
      };

      mockWishlistService.addToWishlist.mockResolvedValue(mockWishlistWithItem);

      const result = await controller.addToWishlist('user1', addToWishlistDto);
      expect(result).toEqual(mockWishlistWithItem);
      expect(mockWishlistService.addToWishlist).toHaveBeenCalledWith(
        'user1',
        addToWishlistDto,
      );
    });
  });

  describe('removeFromWishlist', () => {
    it('should remove item from wishlist', async () => {
      mockWishlistService.removeFromWishlist.mockResolvedValue(mockWishlist);

      const result = await controller.removeFromWishlist('user1', 'item1');
      expect(result).toEqual(mockWishlist);
      expect(mockWishlistService.removeFromWishlist).toHaveBeenCalledWith(
        'user1',
        'item1',
      );
    });
  });
}); 