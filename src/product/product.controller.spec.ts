import { Test, TestingModule } from '@nestjs/testing';
import { ProductController } from './product.controller';
import { ProductService } from './services/product.service';
import { CreateProductDto } from './DTOs/create-product.dto';
import { InventoryStatus } from '@prisma/client';
import { UpdateProductDto } from './DTOs/update-product.dto';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { ValidationConfig } from '../config/validation.config';

describe('ProductController', () => {
  let controller: ProductController;
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

  const mockProductService = {
    getProducts: jest.fn(),
    getProduct: jest.fn(),
    createProduct: jest.fn(),
    updateProduct: jest.fn(),
    deleteProduct: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProductController],
      providers: [
        {
          provide: ProductService,
          useValue: mockProductService,
        },
      ],
    }).compile();

    controller = module.get<ProductController>(ProductController);
    service = module.get<ProductService>(ProductService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('getProducts', () => {
    it('should return an array of products', async () => {
      const query = { limit: 10, offset: 0 };
      mockProductService.getProducts.mockResolvedValue([mockProduct]);

      const result = await controller.getProducts(query);
      expect(result).toEqual([mockProduct]);
      expect(service.getProducts).toHaveBeenCalledWith(query);
    });
  });

  describe('createProduct', () => {
    it('should create a product', async () => {
      const createDto: CreateProductDto = {
        code: 'TEST123',
        name: 'Test Product',
        description: 'Test Description',
        price: 99.99,
        quantity: 10,
      };

      mockProductService.createProduct.mockResolvedValue(mockProduct);

      const result = await controller.createProduct(createDto);
      expect(result).toEqual(mockProduct);
      expect(service.createProduct).toHaveBeenCalledWith(createDto);
    });
  });

  describe('updateProduct', () => {
    it('should delete restricted fields from the dto', async () => {
      const plainUpdateDto = {
        name: 'Updated Product',
        price: 100,
        quantity: 10,
        code: 'TEST123',
      };

      const updateDto = plainToInstance(UpdateProductDto, plainUpdateDto);
      const errors = await validate(updateDto, ValidationConfig);

      expect(errors).toEqual([]);
      expect(updateDto).toEqual({
        name: 'Updated Product',
        price: 100,
        quantity: 10,
      });
    });
  });

  describe('getProduct', () => {
    it('should return a single product', async () => {
      mockProductService.getProduct.mockResolvedValue(mockProduct);

      const result = await controller.getProduct('1');
      expect(result).toEqual(mockProduct);
      expect(service.getProduct).toHaveBeenCalledWith('1');
    });
  });
});
