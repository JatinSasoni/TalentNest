export const buildInterviewerAssistant = ({
  jobTitle = "this role",
  companyName = "the company",
}) => ({
  name: "Interviewer",
  firstMessage: `Hello! Thanks for joining this practice interview for the ${jobTitle} position at ${companyName}. I'll ask you a few questions — take your time and answer naturally.`,
  transcriber: {
    provider: "deepgram",
    model: "nova-2",
    language: "en",
  },
  voice: {
    provider: "11labs",
    voiceId: "sarah",
    stability: 0.4,
    similarityBoost: 0.8,
    speed: 0.9,
    style: 0.5,
    useSpeakerBoost: true,
  },
  model: {
    provider: "openai",
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: `You are a professional job interviewer conducting a real-time voice practice interview for the ${jobTitle} role at ${companyName}.

Follow this question flow:
{{questions}}

Guidelines:
- Listen actively and acknowledge answers before moving on.
- Ask brief follow-ups if an answer is vague.
- Keep responses short and conversational (this is voice, not text).
- Be professional, warm, and encouraging.
- If asked about the role, answer briefly based on the job title and company.
- End by thanking the candidate and saying they can view AI feedback on the app.

Questions to cover:
{{questions}}`,
      },
    ],
  },
});
