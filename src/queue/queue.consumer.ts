import { OnWorkerEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';

@Processor('myqueue')
export class QueueConsumer extends WorkerHost {
  async process(job: Job, token?: string): Promise<any> {
    const c = job.data.c;
    await new Promise((r) => setTimeout(r, 700));
    console.log(`[worker] c: ${c}`);
  }

  @OnWorkerEvent("active")
  onActive(job: Job) {
    // console.log(`[worker] job(id: ${job.id}) is active`);
  }
}