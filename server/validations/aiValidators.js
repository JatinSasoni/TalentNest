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
