import { UseGuards, applyDecorators } from '@nestjs/common';
import { ApiUnauthorizedResponse } from '@nestjs/swagger';
import { ApiKeyGuard } from './api-key.guard';

export function UseApiKey() {
  return applyDecorators(
    UseGuards(ApiKeyGuard),
    ApiUnauthorizedResponse({ description: 'Unauthorized' }),
  );
}
