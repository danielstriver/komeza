const CRISIS_KEYWORDS_EN = [
  "i can't go on", "i cant go on", "want to die", "wanna die",
  "end my life", "kill myself", "killing myself", "no reason to live",
  "can't take it anymore", "cant take it anymore", "don't want to be here",
  "dont want to be here", "no point", "end it all", "end it",
  "suicide", "suicidal", "hurt myself", "self harm",
];

const CRISIS_KEYWORDS_RW = [
  "nyanze kubaho", "nshaka gupfa", "sinshaka kubaho", "kwiyahura",
  "gupfa", "nta mpamvu yo kubaho", "sinshaka kubaho",
  "nshaka guhera", "kurimbuka", "kwikoma",
];

export function detectCrisis(text: string): boolean {
  const lower = text.toLowerCase().trim();
  return (
    CRISIS_KEYWORDS_EN.some((kw) => lower.includes(kw)) ||
    CRISIS_KEYWORDS_RW.some((kw) => lower.includes(kw))
  );
}
