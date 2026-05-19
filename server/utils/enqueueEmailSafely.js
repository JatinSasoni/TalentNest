import { emailQueue } from "../queues/emailQueue.js";

export const enqueueEmailSafely = async (jobName, data) => {
  try {
    await emailQueue.add(jobName, data);
  } catch (error) {
    console.error(`Email queue skipped (${jobName}):`, error.message);
  }
};
