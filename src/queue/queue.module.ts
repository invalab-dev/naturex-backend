import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { join } from 'node:path';
import { QueueProducer } from './queue.producer.js';
import { QueueConsumer } from './queue.consumer.js';
import { QueueListener } from './queue.listener.js';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'myqueue',
      processors: [new URL('./queue.separate.consumer.js', import.meta.url)],
    }),
  ],
  providers: [QueueProducer, QueueConsumer, QueueListener],
})
export class QueueModule {}
