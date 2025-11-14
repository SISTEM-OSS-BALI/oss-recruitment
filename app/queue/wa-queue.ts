import { redis } from "@/lib/redis";
import BullMQ from "bullmq";

const { Queue, QueueEvents } = BullMQ;

export type WaJobData = {
  applicantId: string;
  templateId: string;
  ctx?: Record<string, any>;
};

export const waQueue = new Queue<WaJobData>("whatsapp", {
  connection: redis,
  defaultJobOptions: {
    attempts: 5,
    backoff: { type: "exponential", delay: 5000 },
    removeOnComplete: { age: 3600, count: 1000 },
    removeOnFail: { age: 24 * 3600 },
    // limiter: { max: 20, duration: 1000 }, // aktifkan jika WA API perlu rate-limit
  },
});

export async function enqueueWa(data: WaJobData, opts?: { delayMs?: number }) {
  // idempotensi: satu kombinasi applicant+template = satu job
  const jobId = `wa:${data.applicantId}:${data.templateId}`;
  return waQueue.add("send", data, { jobId, delay: opts?.delayMs ?? 0 });
}

// opsional: dengarkan event global (buat logging/metric)
export const waEvents = new QueueEvents("whatsapp", { connection: redis });
