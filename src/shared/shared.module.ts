import { Module } from '@nestjs/common';
import { ApiKeyGuard } from '../common/api-key.guard';
import { DocumentChangeGateway } from '../common/document-change.gateway';

@Module({
  providers: [ApiKeyGuard, DocumentChangeGateway],
  exports: [ApiKeyGuard, DocumentChangeGateway],
})
export class SharedModule {}
