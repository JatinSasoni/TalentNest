# Vapi Interview Practice — Setup Guide

## What you need to provide

### 1. Vapi account (required for voice calls)

1. Sign up at [https://dashboard.vapi.ai](https://dashboard.vapi.ai)
2. Go to **API Keys** and copy your **Public** key (not the private/server key).
3. Add it to the client env file:

**`JOB PORTAL/client/public/env.js`**

```js
VITE_VAPI_PUBLIC_API_KEY: "your-vapi-public-key-here",
```

4. Restart the Vite dev server (`npm run dev` in `client/`).

> Vapi bills per minute of voice usage. Check their pricing and add credits in the dashboard before testing.

### 2. Gemini API key (required for questions + feedback)

Already used for other AI features. Ensure **`JOB PORTAL/server/.env`** has:

```env
GEMINI_API_KEY=your_gemini_key
```

Get a free key: [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)

### 3. Microphone + HTTPS

- Browser will ask for **microphone permission** when starting a call.
- For production, serve the site over **HTTPS** (mic often blocked on HTTP except localhost).

### 4. Production deploy

Add `VITE_VAPI_PUBLIC_API_KEY` to your hosted env (Netlify/Vercel env vars **and** update `public/env.js` or your build inject step).

---

## How to test locally

1. Start server: `cd server && npm run dev`
2. Start client: `cd client && npm run dev`
3. Log in as a **student**
4. Open any job → **Practice interview**
5. Click **Start interview** → speak → **End interview**
6. Wait for AI feedback → report page

---

## Optional Vapi dashboard settings

PrepX uses inline assistant config (same approach here). If calls fail:

- Ensure your Vapi account has **Deepgram** + **OpenAI** (or compatible) providers enabled
- Or create an assistant in Vapi dashboard and we can switch to assistant ID later

---

## API routes added

| Method | Route |
|--------|--------|
| POST | `/api/v1/ai/interview/job/:jobId/start` |
| GET | `/api/v1/ai/interview/session/:sessionId` |
| POST | `/api/v1/ai/interview/session/:sessionId/feedback` |
