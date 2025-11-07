import { Module } from '@nestjs/common';
import { GeeService } from './gee.service';


@Module({
  providers: [GeeService],
  exports: [GeeService]
})
export class GeeModule {}