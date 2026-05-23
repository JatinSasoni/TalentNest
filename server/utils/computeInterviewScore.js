const CATEGORY_KEYS = [
  "communicationSkills",
  "technicalKnowledge",
  "problemSolving",
  "culturalRoleFit",
  "confidenceClarity",
];

export const computeInterviewTotalScore = (feedback) => {
  if (!feedback || typeof feedback !== "object") {
    return null;
  }

  const scores = CATEGORY_KEYS.map((key) =>
    Number(feedback[key]?.score)
  ).filter((n) => !Number.isNaN(n));

  if (scores.length === 0) {
    return null;
  }

  const average = scores.reduce((sum, n) => sum + n, 0) / scores.length;
  return Math.round(average * 10) / 10;
};
