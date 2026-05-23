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

export const safeJsonArrayParse = (text) => {
  if (!text || typeof text !== "string") {
    throw new Error("Empty AI response");
  }

  const trimmed = text.trim().replace(/```json|```/g, "").trim();
  const arrMatch = trimmed.match(/\[[\s\S]*\]/);

  if (!arrMatch) {
    throw new Error("AI response did not contain a JSON array");
  }

  const parsed = JSON.parse(arrMatch[0]);
  if (!Array.isArray(parsed)) {
    throw new Error("AI response was not an array");
  }

  return parsed.map((q) => String(q).trim()).filter(Boolean);
};
