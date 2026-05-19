import { PDFParse } from "pdf-parse";

const MAX_RESUME_CHARS = 8000;

export const fetchResumeTextFromUrl = async (resumeUrl) => {
  if (!resumeUrl || typeof resumeUrl !== "string") {
    throw new Error("Applicant has not uploaded a resume");
  }

  const parser = new PDFParse({ url: resumeUrl });

  try {
    const result = await parser.getText();
    const text = (result.text || "").trim();

    if (!text) {
      throw new Error("Could not read text from resume PDF");
    }

    return text.slice(0, MAX_RESUME_CHARS);
  } finally {
    await parser.destroy();
  }
};
