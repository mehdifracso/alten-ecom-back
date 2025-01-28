import { validate } from 'class-validator';
import { CreateUserDto } from './create-user.dto';

describe('CreateUserDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new CreateUserDto();
    dto.email = 'test@example.com';
    dto.password = 'StrongPass123!';
    dto.username = 'testuser';
    dto.firstname = 'Test';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('email validation', () => {
    it('should fail with invalid email', async () => {
      const dto = new CreateUserDto();
      dto.email = 'invalid-email';
      dto.password = 'StrongPass123!';
      dto.username = 'testuser';
      dto.firstname = 'Test';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail with empty email', async () => {
      const dto = new CreateUserDto();
      dto.email = '';
      dto.password = 'StrongPass123!';
      dto.username = 'testuser';
      dto.firstname = 'Test';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('password validation', () => {
    it('should fail with weak password', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'weak';
      dto.username = 'testuser';
      dto.firstname = 'Test';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should fail with empty password', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = '';
      dto.username = 'testuser';
      dto.firstname = 'Test';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });
  });

  describe('username validation', () => {
    it('should fail with empty username', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'StrongPass123!';
      dto.username = '';
      dto.firstname = 'Test';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('username');
    });
  });

  describe('firstname validation', () => {
    it('should fail with empty firstname', async () => {
      const dto = new CreateUserDto();
      dto.email = 'test@example.com';
      dto.password = 'StrongPass123!';
      dto.username = 'testuser';
      dto.firstname = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('firstname');
    });
  });
}); 