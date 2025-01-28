import { UnauthorizedException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { PrismaService } from '../../prisma/prisma.service';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
  });

  it('should be defined', () => {
    expect(strategy).toBeDefined();
  });

  describe('validate', () => {
    it('should return user when valid', async () => {
      const mockUser = {
        id: '1',
        email: 'test@example.com',
        username: 'testuser',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await strategy.validate({
        sub: '1',
        email: 'test@example.com',
      });
      expect(result).toEqual(mockUser);
    });

    it('should throw UnauthorizedException when user not found', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        strategy.validate({ sub: '1', email: 'test@example.com' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
