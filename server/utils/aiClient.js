import OpenAI from "openai";

/** Groq / OpenAI-compatible providers — forces valid JSON objects */
export const JSON_RESPONSE_FORMAT = { type: "json_object" };

export const getAiClient = () => {
  if (!process.env.AI_API_KEY || !process.env.AI_BASE_URL) {
    return null;
  }

  return new OpenAI({
    apiKey: process.env.AI_API_KEY,
    baseURL: process.env.AI_BASE_URL,
  });
};

export const createJsonCompletion = (ai, options) => {
  const { messages, temperature = 0.5, max_completion_tokens = 1024 } = options;

  return ai.chat.completions.create({
    model: process.env.AI_MODEL,
    messages,
    temperature,
    max_completion_tokens,
    response_format: JSON_RESPONSE_FORMAT,
  });
};
