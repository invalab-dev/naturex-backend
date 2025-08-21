import { Global, Module } from '@nestjs/common';
import { S3Service } from './s3.service';
import { PostgresService } from './postgres.service';

@Global()
@Module({
  providers: [S3Service, PostgresService],
  exports: [S3Service, PostgresService],
})
export class GlobalModule {

}