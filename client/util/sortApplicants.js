export const SORT_MODES = {
  DATE: "date",
  AI: "ai",
};

export const sortApplicants = (applicants, mode = SORT_MODES.DATE) => {
  const list = [...applicants];

  if (mode === SORT_MODES.AI) {
    return list.sort((a, b) => {
      const scoreA = a.aiMatchScore ?? -1;
      const scoreB = b.aiMatchScore ?? -1;

      if (scoreB !== scoreA) {
        return scoreB - scoreA;
      }

      return new Date(b.createdAt) - new Date(a.createdAt);
    });
  }

  return list.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );
};

export const getTopPickIds = (applicants, limit = 3) => {
  const ranked = applicants.filter((app) => app.aiMatchScore != null);
  return new Set(ranked.slice(0, limit).map((app) => app._id));
};

export const countScoredApplicants = (applicants) =>
  applicants.filter((app) => app.aiMatchScore != null).length;
