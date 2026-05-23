import mongoose from "mongoose";

const transcriptEntrySchema = new mongoose.Schema(
  {
    role: { type: String, required: true },
    content: { type: String, required: true },
  },
  { _id: false }
);

const interviewSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    jobId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
      index: true,
    },
    jobTitle: { type: String, required: true },
    companyName: { type: String, default: "" },
    questions: [{ type: String }],
    transcript: [transcriptEntrySchema],
    feedback: { type: mongoose.Schema.Types.Mixed, default: null },
    totalScore: { type: Number, default: null },
    status: {
      type: String,
      enum: ["ready", "in_progress", "completed"],
      default: "ready",
    },
  },
  { timestamps: true }
);

interviewSessionSchema.index({ userId: 1, jobId: 1, createdAt: -1 });

const InterviewSession = mongoose.model(
  "InterviewSession",
  interviewSessionSchema
);

export default InterviewSession;
