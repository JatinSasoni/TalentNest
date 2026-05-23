import { Router } from "express";
import isAuthentication from "../middleware/userAuthentications.js";
import requireRecruiterSubscription from "../middleware/requireRecruiterSubscription.js";
import validateResults from "../middleware/validate-result.js";
import {
  validateGenerateApplicantSummary,
  validateGenerateJobDescription,
  validateInterviewFeedback,
} from "../validations/aiValidators.js";
import {
  generateApplicantSummary,
  generateJobDescription,
  reviewStudentResume,
  startJobInterviewPractice,
  getInterviewSession,
  getJobInterviewHistory,
  submitInterviewFeedback,
} from "../controller/AI-Controller.js";

const router = Router();

router.post(
  "/job-description/generate",
  isAuthentication,
  requireRecruiterSubscription,
  validateGenerateJobDescription,
  validateResults,
  generateJobDescription
);

router.post(
  "/applicant/summary",
  isAuthentication,
  requireRecruiterSubscription,
  validateGenerateApplicantSummary,
  validateResults,
  generateApplicantSummary
);

router.post("/resume/review", isAuthentication, reviewStudentResume);

router.post(
  "/interview/job/:jobId/start",
  isAuthentication,
  startJobInterviewPractice
);

router.get(
  "/interview/session/:sessionId",
  isAuthentication,
  getInterviewSession
);

router.get(
  "/interview/job/:jobId/history",
  isAuthentication,
  getJobInterviewHistory
);

router.post(
  "/interview/session/:sessionId/feedback",
  isAuthentication,
  validateInterviewFeedback,
  validateResults,
  submitInterviewFeedback
);

export default router;
