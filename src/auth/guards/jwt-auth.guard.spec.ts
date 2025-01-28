import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { mock } from 'node:test';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  describe('handleRequest', () => {
    it('should return user when no error and user exists', () => {
      const mockUser = { id: 1, email: 'test@example.com' };
      const result = guard.handleRequest(null, mockUser);
      expect(result).toBe(mockUser);
    });

    it('should throw UnauthorizedException when error exists', () => {
      const mockError = new Error('Auth Error');
      expect(() => guard.handleRequest(mockError, null)).toThrow(mockError);
    });

    it('should throw UnauthorizedException when no user exists', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should throw original error if it exists', () => {
      const mockError = new Error('Original Error');
      expect(() => guard.handleRequest(mockError, null)).toThrow(mockError);
    });

    it('should throw UnauthorizedException with custom message when no user and no error', () => {
      try {
        guard.handleRequest(null, null);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
      }
    });
  });
});
