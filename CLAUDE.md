# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
npm run dev        # start dev server (Vite HMR)
npm run build      # type-check + production build (tsc -b && vite build)
npm run lint       # ESLint
npm run preview    # serve production build locally
```

No test suite is configured yet.

## Environment

Copy `.env.example` to `.env.local` and set `VITE_ANTHROPIC_API_KEY`. Without it the app runs in **demo mode** — scripted responses cycle through `DEMO_RESPONSES` in `src/lib/claude.ts` with a simulated delay.

## Architecture

**Single-page React app** — no router. Navigation is managed entirely through `AppState.screen` (a discriminated union: `onboarding | home | chat | insights | brief | safety`). `App.tsx` switches on this value and wraps transitions in Framer Motion's `AnimatePresence`.

**State** lives in `src/context/AppContext.tsx` — a `useReducer` + React Context. All persistence side-effects (localStorage reads/writes) happen inside the reducer or on initial load. The storage layer is in `src/lib/storage.ts`, which uses five `localStorage` keys prefixed `komeza_*`. Entries are capped at 90 days; chat history at 50 messages.

**Screens** (`src/screens/`):
| Screen | Purpose |
|---|---|
| `OnboardingScreen` | Language selection, first-run only |
| `HomeScreen` | Daily somatic check-in (energy/sleep/mood/bodyPain, each 1–5) |
| `ChatScreen` | Conversation with Komeza AI; appends today's ratings as context |
| `InsightsScreen` | Recharts line charts over 7- or 30-day windows |
| `BriefScreen` | Weekly averages, jsPDF download |
| `SafetyScreen` | Crisis overlay, always rendered over everything when `crisisDetected` is true |

**AI integration** (`src/lib/claude.ts`): calls `https://api.anthropic.com/v1/messages` directly from the browser using `anthropic-dangerous-direct-browser-access: true`. Uses `claude-sonnet-4-5`. Today's somatic ratings are injected into the last user message as a bracketed annotation before sending. The system prompt instructs the model to behave as a non-clinical wellness companion for Rwandan youth.

**Crisis detection** (`src/lib/crisis.ts`): keyword scan on every user message (English + Kinyarwanda lists). On match, dispatches `TRIGGER_CRISIS` which forces the `SafetyScreen` overlay. The 114 Rwanda mental health hotline is the primary CTA.

**i18n** (`src/lib/i18n.ts`): flat key-value objects for `en` and `rw`. All UI strings must go through `t[language][key]`. No runtime interpolation library — use template literals where values need inserting.

**Layout**: `DesktopLayout` centers the mobile shell (max-width ~390px) on wide screens. `BottomNav` is shown on all screens except onboarding. Tailwind CSS v4 (via `@tailwindcss/vite` plugin, no `tailwind.config.js`).

## Key conventions

- `bodyPain` rating is **inverted** for wellness scoring: 1 = no pain (good), 5 = severe pain (bad).
- Demo seed data is generated and written to `localStorage` on first load if no entries exist — subsequent saves merge by date (one entry per calendar day).
- The `Language` type is defined in both `src/types/index.ts` and `src/lib/i18n.ts` — prefer importing from `src/lib/i18n.ts` in files that use `t[lang]`.
