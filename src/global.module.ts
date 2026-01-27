import { Global, Module } from '@nestjs/common';
import { StorageService } from './storage.service.js';
import { PostgresService } from './postgres.service.js';

@Global()
@Module({
  imports: [],
  providers: [PostgresService, StorageService],
  exports: [PostgresService, StorageService],
})
export class GlobalModule {}
