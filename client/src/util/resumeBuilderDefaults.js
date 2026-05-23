export const RESUME_BUILDER_STORAGE_KEY = "talentnest_resume_builder_draft";

const createId = () =>
  typeof crypto !== "undefined" && crypto.randomUUID
    ? crypto.randomUUID()
    : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

export const emptyExperience = () => ({
  id: createId(),
  company: "",
  role: "",
  start: "",
  end: "",
  bullets: [""],
});

export const emptyEducation = () => ({
  id: createId(),
  school: "",
  degree: "",
  year: "",
});

export const emptyProject = () => ({
  id: createId(),
  name: "",
  link: "",
  start: "",
  end: "",
  bullets: [""],
});

export const emptyDraft = () => ({
  personal: {
    fullName: "",
    email: "",
    phone: "",
    location: "",
    summary: "",
  },
  experience: [emptyExperience()],
  projects: [emptyProject()],
  education: [emptyEducation()],
  skills: [],
  skillsInput: "",
});

export const parseSkillsFromInput = (value = "") =>
  value
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

export const prefillFromUser = (user) => {
  const draft = emptyDraft();
  if (!user) return draft;

  draft.personal.fullName = user.username || "";
  draft.personal.email = user.email || "";
  draft.personal.phone = user.phoneNumber || "";
  draft.personal.summary = user.profile?.bio || "";
  draft.skills = [...(user.profile?.skills || [])];
  draft.skillsInput = draft.skills.join(", ");

  return draft;
};

const mergeDraft = (stored, user) => {
  const base = prefillFromUser(user);
  if (!stored || typeof stored !== "object") return base;

  return {
    personal: { ...base.personal, ...(stored.personal || {}) },
    experience:
      Array.isArray(stored.experience) && stored.experience.length > 0
        ? stored.experience.map((exp) => ({
            id: exp.id || createId(),
            company: exp.company || "",
            role: exp.role || "",
            start: exp.start || "",
            end: exp.end || "",
            bullets:
              Array.isArray(exp.bullets) && exp.bullets.length > 0
                ? exp.bullets
                : [""],
          }))
        : base.experience,
    projects:
      Array.isArray(stored.projects) && stored.projects.length > 0
        ? stored.projects.map((proj) => ({
            id: proj.id || createId(),
            name: proj.name || "",
            link: proj.link || "",
            start: proj.start || "",
            end: proj.end || "",
            bullets:
              Array.isArray(proj.bullets) && proj.bullets.length > 0
                ? proj.bullets
                : [""],
          }))
        : Array.isArray(stored.projects)
          ? []
          : base.projects,
    education:
      Array.isArray(stored.education) && stored.education.length > 0
        ? stored.education.map((edu) => ({
            id: edu.id || createId(),
            school: edu.school || "",
            degree: edu.degree || "",
            year: edu.year || "",
          }))
        : base.education,
    skills: Array.isArray(stored.skills) ? stored.skills : base.skills,
    skillsInput:
      typeof stored.skillsInput === "string"
        ? stored.skillsInput
        : Array.isArray(stored.skills)
          ? stored.skills.join(", ")
          : base.skillsInput,
  };
};

export const loadDraft = (user) => {
  try {
    const raw = localStorage.getItem(RESUME_BUILDER_STORAGE_KEY);
    if (!raw) return prefillFromUser(user);
    return mergeDraft(JSON.parse(raw), user);
  } catch {
    return prefillFromUser(user);
  }
};

export const saveDraft = (draft) => {
  try {
    localStorage.setItem(RESUME_BUILDER_STORAGE_KEY, JSON.stringify(draft));
  } catch {
    /* ignore quota errors */
  }
};

export const clearDraftStorage = () => {
  localStorage.removeItem(RESUME_BUILDER_STORAGE_KEY);
};
