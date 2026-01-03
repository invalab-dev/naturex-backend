import { Injectable } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';


@Injectable()
export class QueueProducer {
  constructor(@InjectQueue("myqueue") private myQueue: Queue) {

    (async () => {
      for(let i = 0; i < 100; i++) {
        await myQueue.add(`job(${i})`, {
          c: i
        })
      }
    })()
  }
}