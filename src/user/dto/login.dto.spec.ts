import { validate } from 'class-validator';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should pass validation with valid data', async () => {
    const dto = new LoginDto();
    dto.email = 'test@example.com';
    dto.password = 'StrongPass123!';

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  describe('email validation', () => {
    it('should fail with invalid email', async () => {
      const dto = new LoginDto();
      dto.email = 'invalid-email';
      dto.password = 'StrongPass123!';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });

    it('should fail with empty email', async () => {
      const dto = new LoginDto();
      dto.email = '';
      dto.password = 'StrongPass123!';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('email');
    });
  });

  describe('password validation', () => {
    it('should fail with empty password', async () => {
      const dto = new LoginDto();
      dto.email = 'test@example.com';
      dto.password = '';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('password');
    });

    it('should pass with any non-empty password', async () => {
      const dto = new LoginDto();
      dto.email = 'test@example.com';
      dto.password = 'anypassword';

      const errors = await validate(dto);
      expect(errors.length).toBe(1);
    });
  });
});
