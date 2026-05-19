import mongoose from "mongoose";
import { Schema, model } from "mongoose";

const applicationSchema = new Schema(
  {
    job: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Job",
      required: true,
    },
    applicant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "accepted", "rejected"],
      default: "pending",
    },
    aiSummary: {
      type: String,
      default: "",
    },
    aiMatchScore: {
      type: Number,
      min: 0,
      max: 100,
    },
    aiInsightsAt: {
      type: Date,
    },
  },
  { timestamps: true }
);

const Application = model("Application", applicationSchema);
export default Application;
