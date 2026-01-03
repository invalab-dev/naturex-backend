import { SandboxedJob } from 'bullmq';

export default async (job: SandboxedJob): Promise<void> => {
  const c = job.data.c;
  await new Promise((r) => setTimeout(r, 500));
  console.log(`[separate worker] c: ${c}`);
}