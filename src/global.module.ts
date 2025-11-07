import { Global, Module } from '@nestjs/common';
import { PostgresService } from './postgres.service';
import { GeeModule } from './gee/gee.module';

@Global()
@Module({
  imports: [GeeModule],
  providers: [PostgresService],
  exports: [PostgresService]
})
export class GlobalModule {}