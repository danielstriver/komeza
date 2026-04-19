import type { ChatMessage, SomaticRatings } from '../types';
import type { Language } from './i18n';

const API_KEY = import.meta.env.VITE_ANTHROPIC_API_KEY as string | undefined;

const SYSTEM_PROMPT = `You are Komeza, a warm and compassionate AI wellness companion designed for Rwandan youth. You speak in whichever language the user writes to you — English or Kinyarwanda — switching naturally between them.

Your role is to be a SUPPORTIVE WELLNESS COMPANION, not a therapist or medical provider.

Core principles:
- NEVER use clinical diagnostic language like "depression", "anxiety disorder", or "mental illness" unless the user introduces those terms
- Frame everything around physical wellness and daily life ("How has your body been feeling?", "What happened in your day?")
- Be warm, like a caring and wise friend — not a form, not a robot
- Ask one gentle follow-up question per response — do not interrogate
- Keep responses SHORT (2–4 sentences max) and conversational
- Honour Rwandan culture: family matters, community matters, physical metaphors for emotional states are common
- Gently weave PHQ-9 / GAD-7 type questions into natural conversation when appropriate (e.g., "How have you been sleeping this week?" rather than "Score your sleep on a scale of 1–9")
- If you sense distress, acknowledge warmly and suggest the user might find it helpful to speak with someone — mention that the 114 hotline is free and available 24/7
- NEVER provide medical advice or diagnosis
- Celebrate progress and resilience — Komeza means "to persist, to continue"`;

function buildCheckInContext(ratings: Partial<SomaticRatings>, lang: Language): string {
  if (!ratings.energy && !ratings.sleep && !ratings.mood && !ratings.bodyPain) return '';

  const labels = lang === 'rw'
    ? { energy: 'Imbaraga', sleep: 'Itiro', mood: 'Umutima', bodyPain: 'Ububabare' }
    : { energy: 'Energy', sleep: 'Sleep', mood: 'Mood', bodyPain: 'Body Pain' };

  const parts: string[] = [];
  if (ratings.energy !== undefined) parts.push(`${labels.energy}: ${ratings.energy}/5`);
  if (ratings.sleep !== undefined) parts.push(`${labels.sleep}: ${ratings.sleep}/5`);
  if (ratings.mood !== undefined) parts.push(`${labels.mood}: ${ratings.mood}/5`);
  if (ratings.bodyPain !== undefined) parts.push(`${labels.bodyPain}: ${ratings.bodyPain}/5 (higher = more pain)`);

  return `\n\n[Today's check-in: ${parts.join(', ')}]`;
}

const DEMO_RESPONSES = [
  "Thank you for checking in today. Based on how you have described your energy and sleep, it sounds like your body may be carrying some extra weight lately. What has been on your mind most this week?",
  "I hear you. That kind of tiredness often comes from more than just the body — sometimes the mind is working hard too. Has anything at school, work, or home been feeling heavy recently?",
  "That makes a lot of sense. It is not easy to carry that. You have taken a good step by sharing — Komeza means to keep going, and that is exactly what you are doing. Would it help to think through one small thing you could do for yourself today?",
  "Thank you for trusting me with that. When you notice that fatigue coming on, does it usually happen at a particular time of day, or is it more constant throughout?",
  "You are doing well by paying attention to how your body feels — that awareness is a real strength. Remember, if things ever feel too heavy to carry alone, the 114 hotline is free and available day and night. You are not alone in this.",
];

let demoIndex = 0;

export async function sendMessage(
  messages: ChatMessage[],
  currentRatings: Partial<SomaticRatings>,
  language: Language
): Promise<string> {
  const checkInContext = buildCheckInContext(currentRatings, language);

  if (!API_KEY) {
    // Demo mode: return a scripted response
    await new Promise((r) => setTimeout(r, 1200 + Math.random() * 800));
    const response = DEMO_RESPONSES[demoIndex % DEMO_RESPONSES.length];
    demoIndex++;
    return response;
  }

  const apiMessages = messages.map((m) => ({
    role: m.role as 'user' | 'assistant',
    content: m.content,
  }));

  // Inject check-in context into the last user message
  if (apiMessages.length > 0 && apiMessages[apiMessages.length - 1].role === 'user') {
    apiMessages[apiMessages.length - 1] = {
      ...apiMessages[apiMessages.length - 1],
      content: apiMessages[apiMessages.length - 1].content + checkInContext,
    };
  }

  const response = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
      'anthropic-version': '2023-06-01',
      'anthropic-dangerous-direct-browser-access': 'true',
    },
    body: JSON.stringify({
      model: 'claude-sonnet-4-5',
      max_tokens: 300,
      system: SYSTEM_PROMPT,
      messages: apiMessages,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error ${response.status}: ${error}`);
  }

  const data = await response.json();
  return data.content[0].text as string;
}

export function getOpeningMessage(
  ratings: Partial<SomaticRatings>,
  language: Language
): string {
  if (language === 'rw') {
    const energyNote = ratings.energy && ratings.energy <= 2
      ? 'Mbona imbaraga zawe nke uyu munsi. '
      : ratings.energy && ratings.energy >= 4
      ? 'Biragaragara ko uri n\'imbaraga nziza uyu munsi. '
      : '';

    return `Muraho! Ndi Komeza, inshuti yawe y'ubuzima. ${energyNote}Nshaka kumva ibintu byinshi kuri wewe. Umunsi wawe wagendeye ute?`;
  }

  const energyNote = ratings.energy && ratings.energy <= 2
    ? 'I can see your energy is lower today. '
    : ratings.energy && ratings.energy >= 4
    ? "It looks like you are feeling energised today. "
    : '';

  const painNote = ratings.bodyPain && ratings.bodyPain >= 4
    ? 'I noticed you mentioned some body discomfort. '
    : '';

  return `Hi, I am Komeza — your wellness companion. ${energyNote}${painNote}I would love to hear more about your day. What has been on your mind?`;
}
