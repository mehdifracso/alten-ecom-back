import { Test, TestingModule } from '@nestjs/testing';
import { ProductService } from './product.service';
import { PrismaService } from '../../prisma/prisma.service';
import {
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InventoryStatus } from '@prisma/client';

describe('ProductService', () => {
  let service: ProductService;

  const mockProduct = {
    id: '1',
    code: 'TEST123',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    quantity: 10,
    inventoryStatus: InventoryStatus.INSTOCK,
    rating: 0,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPrismaService = {
    product: {
      findMany: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProductService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ProductService>(ProductService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateInventoryStatus', () => {
    it.each([
      [0, InventoryStatus.OUTOFSTOCK],
      [5, InventoryStatus.LOWSTOCK],
      [10, InventoryStatus.INSTOCK],
      [15, InventoryStatus.INSTOCK],
    ])('should return correct status for quantity %i', (quantity, expected) => {
      expect(service.calculateInventoryStatus(quantity)).toBe(expected);
    });
  });

  describe('createProduct', () => {
    it('should create a product successfully', async () => {
      const createDto = {
        code: 'TEST123',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        quantity: 10,
      };

      mockPrismaService.product.create.mockResolvedValue(mockProduct);

      const result = await service.createProduct(createDto);
      expect(mockPrismaService.product.create).toHaveBeenCalledWith({
        data: {
          ...createDto,
          rating: 0,
          inventoryStatus: InventoryStatus.INSTOCK,
        },
      });
      expect(result).toEqual(mockProduct);
    });

    it('should throw ConflictException when product code already exists', async () => {
      const createDto = {
        code: 'TEST123',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        quantity: 10,
      };

      mockPrismaService.product.create.mockRejectedValue({
        code: 'P2002',
        meta: { target: ['code'] },
      });

      await expect(service.createProduct(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('getProducts', () => {
    it('should return products with pagination', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.getProducts({ limit: 10, offset: 0 });

      expect(result).toEqual([mockProduct]);
      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        take: 10,
        skip: 0,
      });
    });

    it('should use default pagination values', async () => {
      await service.getProducts({});

      expect(mockPrismaService.product.findMany).toHaveBeenCalledWith({
        take: 50,
        skip: 0,
      });
    });

    it('should handle database errors', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(new Error());

      await expect(service.getProducts({})).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });

  describe('getProduct', () => {
    it('should return a single product', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(mockProduct);

      const result = await service.getProduct('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.findUnique).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should return null if product not found', async () => {
      mockPrismaService.product.findUnique.mockResolvedValue(null);

      const result = await service.getProduct('1');

      expect(result).toBeNull();
    });
  });

  describe('updateProduct', () => {
    it('should update a product', async () => {
      const updateDto = {
        name: 'Updated Product',
        price: 199.99,
        quantity: 5,
      };

      mockPrismaService.product.update.mockResolvedValue({
        ...mockProduct,
        ...updateDto,
        inventoryStatus: InventoryStatus.LOWSTOCK,
      });

      const result = await service.updateProduct('1', updateDto);

      expect(result.name).toBe(updateDto.name);
      expect(result.inventoryStatus).toBe(InventoryStatus.LOWSTOCK);
      expect(mockPrismaService.product.update).toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockPrismaService.product.update.mockRejectedValue(new Error());

      await expect(
        service.updateProduct('1', {
          name: 'test',
          price: 100,
          quantity: 10,
        }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });

  describe('deleteProduct', () => {
    it('should delete a product', async () => {
      mockPrismaService.product.delete.mockResolvedValue(mockProduct);

      const result = await service.deleteProduct('1');

      expect(result).toEqual(mockProduct);
      expect(mockPrismaService.product.delete).toHaveBeenCalledWith({
        where: { id: '1' },
      });
    });

    it('should handle database errors', async () => {
      mockPrismaService.product.delete.mockRejectedValue(new Error());

      await expect(service.deleteProduct('1')).rejects.toThrow(
        InternalServerErrorException,
      );
    });
  });
});
