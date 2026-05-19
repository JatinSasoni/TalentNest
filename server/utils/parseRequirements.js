export const parseRequirements = (requirements) => {
  if (Array.isArray(requirements)) {
    return requirements.map((item) => String(item).trim()).filter(Boolean);
  }

  if (typeof requirements !== "string") {
    return [];
  }

  return requirements
    .split(/[,\n]/)
    .map((item) => item.trim())
    .filter(Boolean);
};
