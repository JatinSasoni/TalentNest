import OpenAI from "openai";
import User from "../models/user-model.js";
import { safeJsonParse } from "../utils/parseAiJson.js";
import { fetchResumeTextFromUrl } from "../utils/fetchResumeText.js";
import { loadApplicationForRecruiter } from "../utils/loadApplicationForRecruiter.js";

const getAiClient = () => {
  if (!process.env.GEMINI_API_KEY) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.GEMINI_API_KEY,
    baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/",
  });
};

export const generateJobDescription = async (req, res) => {
  try {
    if (req.role !== "recruiter") {
      return res.status(403).json({
        MESSAGE: "Only recruiters can use AI job suggestions",
        SUCCESS: false,
      });
    }

    const {
      title,
      location,
      jobType,
      experienceLevel,
      salary,
      companyName,
      hints,
    } = req.body;

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        MESSAGE:
          "AI service is not configured.",
        SUCCESS: false,
      });
    }

    const contextParts = [
      `Job title: ${title}`,
      companyName ? `Company: ${companyName}` : null,
      location ? `Location: ${location}` : null,
      jobType ? `Job type: ${jobType}` : null,
      experienceLevel !== undefined && experienceLevel !== ""
        ? `Experience level (years): ${experienceLevel}`
        : null,
      salary !== undefined && salary !== "" ? `Salary (LPA): ${salary}` : null,
      hints ? `Additional notes from recruiter: ${hints}` : null,
    ].filter(Boolean);

    const prompt = `You are an expert HR copywriter for a job portal in India.

Using the details below, write a professional job posting.

${contextParts.join("\n")}

Return ONLY valid JSON (no markdown fences) in this exact shape:
{
  "description": "2-4 short paragraphs describing the role, responsibilities, and what the company offers. Use plain text with line breaks where helpful.",
  "requirements": ["skill or requirement 1", "skill or requirement 2", "at least 5 items, max 10"]
}

Keep language clear, inclusive, and specific to the role. Do not invent company names if not provided.`;

    const response = await ai.chat.completions.create({
      model: "gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_completion_tokens: 1200,
    });

    const rawContent = response.choices[0]?.message?.content;
    const parsed = safeJsonParse(rawContent);

    if (!parsed.description || !Array.isArray(parsed.requirements)) {
      return res.status(500).json({
        MESSAGE: "Oops! Something went wrong. Please try again.",
        SUCCESS: false,
      });
    }

    const requirements = parsed.requirements
      .map((item) => String(item).trim())
      .filter(Boolean);

    return res.status(200).json({
      SUCCESS: true,
      MESSAGE: "AI job suggestion generated successfully",
      data: {
        description: String(parsed.description).trim(),
        requirements,
      },
    });
  } catch (error) {
    console.error("AI job description error:", error);

    const status = error?.status || error?.response?.status;
    if (status === 429) {
      return res.status(429).json({
        MESSAGE: "AI rate limit reached. Please wait a minute and try again.",
        SUCCESS: false,
      });
    }

    return res.status(500).json({
      MESSAGE: error.message || "Failed to generate AI job suggestion",
      SUCCESS: false,
    });
  }
};

export const generateApplicantSummary = async (req, res) => {
  try {
    if (req.role !== "recruiter") {
      return res.status(403).json({
        MESSAGE: "Only recruiters can generate applicant summaries",
        SUCCESS: false,
      });
    }

    const { applicationId, forceRegenerate = false } = req.body;

    const application = await loadApplicationForRecruiter(applicationId, req.id);

    if (!application) {
      return res.status(404).json({
        MESSAGE: "Application not found or access denied",
        SUCCESS: false,
      });
    }

    if (application.aiSummary && !forceRegenerate) {
      return res.status(200).json({
        SUCCESS: true,
        MESSAGE: "Applicant summary loaded from saved insights",
        cached: true,
        data: {
          summary: application.aiSummary,
          matchScore: application.aiMatchScore ?? null,
          generatedAt: application.aiInsightsAt,
        },
      });
    }

    const resumeUrl = application.applicant?.profile?.resume;
    if (!resumeUrl) {
      return res.status(400).json({
        MESSAGE: "Applicant has not uploaded a resume",
        SUCCESS: false,
      });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        MESSAGE: "AI service is not configured.",
        SUCCESS: false,
      });
    }

    const resumeText = await fetchResumeTextFromUrl(resumeUrl);
    const job = application.job;
    const applicant = application.applicant;
    const skills = applicant.profile?.skills?.join(", ") || "Not listed";
    const bio = applicant.profile?.bio || "Not provided";

    const prompt = `You are an expert technical recruiter screening candidates for a specific job.

JOB POSTING:
- Title: ${job.title}
- Description: ${job.description}
- Requirements: ${(job.requirements || []).join(", ")}
- Experience level (years): ${job.experienceLevel ?? "Not specified"}
- Location: ${job.location || "Not specified"}
- Job type: ${job.jobType || "Not specified"}

APPLICANT PROFILE:
- Name: ${applicant.username}
- Bio: ${bio}
- Skills: ${skills}

RESUME TEXT:
${resumeText}

Compare the resume and profile against this job. Return ONLY valid JSON (no markdown):
{
  "summary": "One concise sentence (max 25 words) highlighting fit, key strength, and main gap",
  "matchScore": 0
}

matchScore must be an integer from 0 to 100 representing overall fit for this job.`;

    const response = await ai.chat.completions.create({
      model: "gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_completion_tokens: 300,
    });

    const parsed = safeJsonParse(response.choices[0]?.message?.content);

    if (!parsed.summary) {
      return res.status(500).json({
        MESSAGE: "Oops! Something went wrong. Please try again.",
        SUCCESS: false,
      });
    }

    const matchScore = Math.min(
      100,
      Math.max(0, Math.round(Number(parsed.matchScore) || 0))
    );

    const summary = String(parsed.summary).trim();

    application.aiSummary = summary;
    application.aiMatchScore = matchScore;
    application.aiInsightsAt = new Date();
    await application.save();

    return res.status(200).json({
      SUCCESS: true,
      MESSAGE: "Applicant summary generated successfully",
      cached: false,
      data: {
        summary,
        matchScore,
        generatedAt: application.aiInsightsAt,
      },
    });
  } catch (error) {
    console.error("AI applicant summary error:", error);

    const status = error?.status || error?.response?.status;
    if (status === 429) {
      return res.status(429).json({
        MESSAGE: "AI rate limit reached. Please wait a minute and try again.",
        SUCCESS: false,
      });
    }

    return res.status(500).json({
      MESSAGE: error.message || "Failed to generate applicant summary",
      SUCCESS: false,
    });
  }
};

const formatUserForClient = (user) => ({
  _id: user._id,
  username: user.username,
  email: user.email,
  password: "",
  phoneNumber: user.phoneNumber,
  createdAt: user.createdAt,
  updatedAt: user.updatedAt,
  role: user.role,
  profile: user.profile,
  savedJobs: user.savedJobs,
  subscription: user.subscription,
});

export const reviewStudentResume = async (req, res) => {
  try {
    if (req.role !== "student") {
      return res.status(403).json({
        MESSAGE: "Only job seekers can review resumes",
        SUCCESS: false,
      });
    }

    const { forceRegenerate = false } = req.body;

    const user = await User.findById(req.id);
    if (!user) {
      return res.status(404).json({
        MESSAGE: "User not found",
        SUCCESS: false,
      });
    }

    const resumeUrl = user.profile?.resume;
    if (!resumeUrl) {
      return res.status(400).json({
        MESSAGE: "Please upload your resume first",
        SUCCESS: false,
      });
    }

    const hasCachedReview =
      user.profile?.aiResumeReview &&
      user.profile?.aiResumeReviewUrl === resumeUrl &&
      user.profile?.aiResumeScore != null;

    if (hasCachedReview && !forceRegenerate) {
      return res.status(200).json({
        SUCCESS: true,
        MESSAGE: "Resume review loaded from your profile",
        cached: true,
        data: {
          score: user.profile.aiResumeScore,
          summary: user.profile.aiResumeReview,
          strengths: user.profile.aiResumeStrengths || [],
          improvements: user.profile.aiResumeImprovements || [],
          generatedAt: user.profile.aiResumeReviewAt,
        },
        user: formatUserForClient(user),
      });
    }

    const ai = getAiClient();
    if (!ai) {
      return res.status(503).json({
        MESSAGE: "AI service is not configured.",
        SUCCESS: false,
      });
    }

    const resumeText = await fetchResumeTextFromUrl(resumeUrl);
    const skills = user.profile?.skills?.join(", ") || "Not listed";
    const bio = user.profile?.bio || "Not provided";

    const prompt = `You are an expert career coach reviewing a job seeker's resume for a job portal in India.

CANDIDATE:
- Name: ${user.username}
- Bio: ${bio}
- Skills listed: ${skills}

RESUME TEXT:
${resumeText}

Analyze the resume for clarity, impact, skills presentation, and employability. Return ONLY valid JSON (no markdown):
{
  "score": 0,
  "summary": "2-3 sentences overall assessment",
  "strengths": ["strength 1", "strength 2", "at least 3 items, max 5"],
  "improvements": ["improvement 1", "improvement 2", "at least 3 items, max 5"]
}

score must be an integer from 0 to 100 (overall resume quality for job applications).`;

    const response = await ai.chat.completions.create({
      model: "gemini-2.5-flash-lite",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.5,
      max_completion_tokens: 900,
    });

    const parsed = safeJsonParse(response.choices[0]?.message?.content);

    if (!parsed.summary || parsed.score === undefined) {
      return res.status(500).json({
        MESSAGE: "Oops! Something went wrong. Please try again.",
        SUCCESS: false,
      });
    }

    const score = Math.min(
      100,
      Math.max(0, Math.round(Number(parsed.score) || 0))
    );

    const strengths = Array.isArray(parsed.strengths)
      ? parsed.strengths.map((s) => String(s).trim()).filter(Boolean)
      : [];
    const improvements = Array.isArray(parsed.improvements)
      ? parsed.improvements.map((s) => String(s).trim()).filter(Boolean)
      : [];

    user.profile.aiResumeScore = score;
    user.profile.aiResumeReview = String(parsed.summary).trim();
    user.profile.aiResumeStrengths = strengths;
    user.profile.aiResumeImprovements = improvements;
    user.profile.aiResumeReviewAt = new Date();
    user.profile.aiResumeReviewUrl = resumeUrl;

    await user.save();

    return res.status(200).json({
      SUCCESS: true,
      MESSAGE: "Resume reviewed successfully",
      cached: false,
      data: {
        score,
        summary: user.profile.aiResumeReview,
        strengths,
        improvements,
        generatedAt: user.profile.aiResumeReviewAt,
      },
      user: formatUserForClient(user),
    });
  } catch (error) {
    console.error("AI resume review error:", error);

    const status = error?.status || error?.response?.status;
    if (status === 429) {
      return res.status(429).json({
        MESSAGE: "AI rate limit reached. Please wait a minute and try again.",
        SUCCESS: false,
      });
    }

    return res.status(500).json({
      MESSAGE: error.message || "Failed to review resume",
      SUCCESS: false,
    });
  }
};
