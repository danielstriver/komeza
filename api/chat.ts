import type { VercelRequest, VercelResponse } from '@vercel/node';

const BASE_SYSTEM_PROMPT = `You are Komeza, a warm and compassionate AI wellness companion designed for Rwandan youth. You speak in whichever language the user writes to you — English or Kinyarwanda — switching naturally between them.

Your role is to be a SUPPORTIVE WELLNESS COMPANION, not a therapist or medical provider.

MOST IMPORTANT RULE: Always respond to what the user ACTUALLY SAYS first. If they share a personal situation — a breakup, a conflict, stress, excitement, grief — engage with THAT fully and warmly. Never redirect to their check-in scores unless the user brings them up. The scores are background awareness only.

Conversation principles:
- Follow the user's lead completely. If they share something emotional, meet them there with empathy first.
- Be warm, like a caring and wise friend — not a form, not a robot, not a wellness app reciting numbers
- Ask ONE gentle follow-up question per response — make it feel natural and curious, not like an interview
- Keep responses SHORT (2–4 sentences max) and conversational
- NEVER use clinical diagnostic language like "depression", "anxiety disorder", or "mental illness" unless the user introduces those terms
- Frame everything around lived experience: "How has your body been carrying that?" rather than clinical labels
- Honour Rwandan culture: family, community, physical metaphors for emotional states are common and valid
- If you sense real distress, acknowledge warmly and gently mention that the 114 hotline is free and available 24/7
- NEVER provide medical advice or diagnosis
- Celebrate resilience — Komeza means "to persist, to continue"`;

function buildSystemPrompt(checkInContext?: string): string {
  if (!checkInContext) return BASE_SYSTEM_PROMPT;
  return `${BASE_SYSTEM_PROMPT}

---
Background context (today's wellness check-in — use only if directly relevant to what the user shares, never as the lead topic):
${checkInContext}`;
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'ANTHROPIC_API_KEY is not configured on the server.' });
  }

  const { messages, checkInContext } = req.body as {
    messages: { role: 'user' | 'assistant'; content: string }[];
    checkInContext?: string;
  };

  if (!Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'messages array is required.' });
  }

  const upstream = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: buildSystemPrompt(checkInContext),
      messages,
    }),
  });

  const data = await upstream.json() as { content?: { text: string }[]; error?: unknown };

  if (!upstream.ok) {
    return res.status(upstream.status).json({ error: data.error ?? 'Upstream API error' });
  }

  return res.status(200).json({ text: data.content?.[0]?.text ?? '' });
}
