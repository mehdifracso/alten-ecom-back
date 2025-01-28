import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { ConflictException, UnauthorizedException } from '@nestjs/common';

describe('UserController', () => {
  let controller: UserController;

  const mockUserService = {
    createUser: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    controller = module.get<UserController>(UserController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createUser', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      username: 'testuser',
      firstname: 'Test',
    };

    it('should create a new user successfully', async () => {
      const expectedResponse = {
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        firstname: createUserDto.firstname,
      };

      mockUserService.createUser.mockResolvedValue(expectedResponse);

      const result = await controller.createUser(createUserDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.createUser).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle ConflictException', async () => {
      mockUserService.createUser.mockRejectedValue(
        new ConflictException('Email already exists'),
      );

      await expect(controller.createUser(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'Password123!',
    };

    it('should return access token on successful login', async () => {
      const expectedResponse = {
        access_token: 'jwt-token',
      };

      mockUserService.login.mockResolvedValue(expectedResponse);

      const result = await controller.login(loginDto);

      expect(result).toEqual(expectedResponse);
      expect(mockUserService.login).toHaveBeenCalledWith(loginDto);
    });

    it('should handle UnauthorizedException', async () => {
      mockUserService.login.mockRejectedValue(
        new UnauthorizedException('Invalid credentials'),
      );

      await expect(controller.login(loginDto)).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });
});
