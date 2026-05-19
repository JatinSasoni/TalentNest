import { Router } from "express";
import isAuthentication from "../middleware/userAuthentications.js";
import requireRecruiterSubscription from "../middleware/requireRecruiterSubscription.js";
import validateResults from "../middleware/validate-result.js";
import {
  validateGenerateApplicantSummary,
  validateGenerateJobDescription,
} from "../validations/aiValidators.js";
import {
  generateApplicantSummary,
  generateJobDescription,
  reviewStudentResume,
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

export default router;
