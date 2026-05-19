export const safeJsonParse = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }

  const trimmed = text.trim();
  const jsonMatch = trimmed.match(/\{[\s\S]*\}/);

  if (!jsonMatch) {
    throw new Error("AI response did not contain valid JSON");
  }

  return JSON.parse(jsonMatch[0]);
};
