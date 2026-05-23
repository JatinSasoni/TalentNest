import { emailQueue } from "../queues/emailQueue.js";

export const enqueueEmailSafely = async (jobName, data, jobOptions) => {
  try {
    await emailQueue.add(jobName, data, jobOptions);
  } catch (error) {
    console.error(`Email queue skipped (${jobName}):`, error.message);
  }
};
