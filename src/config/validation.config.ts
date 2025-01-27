import { ValidationPipeOptions } from '@nestjs/common';

export const ValidationConfig: ValidationPipeOptions = {
  transform: true,
  whitelist: true,
};
