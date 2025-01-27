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

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('calculateInventoryStatus', () => {
    it('should return LOWSTOCK when quantity is less than 10', () => {
      expect(service.calculateInventoryStatus(5)).toBe(
        InventoryStatus.LOWSTOCK,
      );
    });

    it('should return OUTOFSTOCK when quantity is less than 1', () => {
      expect(service.calculateInventoryStatus(0)).toBe(
        InventoryStatus.OUTOFSTOCK,
      );
    });

    it('should return INSTOCK when quantity is 10 or more', () => {
      expect(service.calculateInventoryStatus(10)).toBe(
        InventoryStatus.INSTOCK,
      );
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
    it('should return an array of products', async () => {
      mockPrismaService.product.findMany.mockResolvedValue([mockProduct]);

      const result = await service.getProducts({ limit: 10, offset: 0 });
      expect(result).toEqual([mockProduct]);
    });

    it('should throw InternalServerErrorException on database error', async () => {
      mockPrismaService.product.findMany.mockRejectedValue(new Error());

      await expect(
        service.getProducts({ limit: 10, offset: 0 }),
      ).rejects.toThrow(InternalServerErrorException);
    });
  });
});
