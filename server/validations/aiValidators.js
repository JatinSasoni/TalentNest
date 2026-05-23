import { body } from "express-validator";

export const validateGenerateJobDescription = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Job title is required for AI suggestions"),
];

export const validateGenerateApplicantSummary = [
  body("applicationId")
    .notEmpty()
    .withMessage("Application ID is required"),
];

export const validateInterviewFeedback = [
  body("transcript")
    .isArray({ min: 1 })
    .withMessage("Transcript must be a non-empty array"),
  body("transcript.*.role").notEmpty().withMessage("Transcript role is required"),
  body("transcript.*.content")
    .notEmpty()
    .withMessage("Transcript content is required"),
];
