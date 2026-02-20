import { Module } from '@nestjs/common';
import { TransmissionsController } from './transmissions.controller.js';
import { TransmissionsService } from './transmissions.service.js';

@Module({
  controllers: [TransmissionsController],
  providers: [TransmissionsService],
  exports: [TransmissionsService],
})
export class TransmissionsModule {}
