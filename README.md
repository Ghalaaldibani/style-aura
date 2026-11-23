# Style Aura 👗✨

**Your digital closet with a built-in stylist.** A mobile-first web app for women aged 18–24: take a 10-question style quiz, organise your wardrobe, get outfit ideas from a rule-based "AI" stylist, plan event outfits, and share looks with friends. The interface **adapts in real time** to errors, hesitation and cognitive load.

> HCI2011 User Interface Design · Umm Al-Qura University · Section 10
> Team: **Ghala Aldibani** (leader), **Jana Asiri**, **Raneem Ayman**

🔗 **Live app:** _added after deployment_
🎨 **Figma:** Lab 6 Prototype

## Features

- **Style quiz** (10 visual questions) → Emo, Y2K, Old Money or Streetwear (can be skipped)
- **Home**: outfit boards matched to your style → pieces → retailer links
- **Wardrobe**: add items with a photo (compressed in the browser) or an auto-drawn illustration, edit, delete with Undo
- **Create Outfit**: **AI Suggest** (rule-based, explains *why*, Cancel / Regenerate) or Create Manually
- **Event Planner**: what you own vs what's missing → product suggestions
- **Avatar** (skin tone, body shape) wearing your outfits
- **Favorites**, **Share** (Friends / Public), **Feed**, **Post Detail** (rating 1–5, comments), **Friends**
- **Profile**: accessibility settings, interaction-log viewer, change password, delete account
- Installable (PWA), works on phones; phone-frame view on laptops

## Adaptive UX (our own code, no plugins)

| Sensor / adaptation | File |
|---|---|
| Per-field error tracking → hints with examples after 2 errors | `src/adaptive/useFieldErrorTracker.js` |
| Dwell-time sensor on quiz questions (15 s → help) | `src/adaptive/useDwellTime.js` |
| Cognitive-load simplification (idle / errors → fewer options) | `src/adaptive/useSimplifiedUI.js` |
| Auto high contrast after 3 errors, with Undo | `src/adaptive/AdaptiveProvider.jsx`, `src/components/ContrastBanner.jsx` |
| Interaction log saved to Firestore | `AdaptiveProvider.logEvent` → `users/{uid}/interactionLogs` |

Full mapping to HCI principles: [`docs/HCI_MAPPING.md`](docs/HCI_MAPPING.md) · Prompt log: [`PROMPT_LOG.md`](PROMPT_LOG.md)

## Tech stack

React 19 + Vite · Tailwind CSS v4 · React Router · Firebase Auth + Cloud Firestore · Vercel. All illustrations are original SVGs drawn in code (`src/components/art/`).

## Run it locally

```bash
git clone https://github.com/Ghalaaldibani/style-aura.git
cd style-aura
npm install
cp .env.example .env.local   # then paste the Firebase web config values
npm run dev                  # http://localhost:5173
```

Other scripts: `npm run lint`, `npm run build`, `npm run preview`.

Firestore security rules are in [`firestore.rules`](firestore.rules) (paste them into Firebase console → Firestore → Rules).

## Project structure

```
src/
  adaptive/     sensors + AdaptiveProvider (our adaptive logic)
  auth/         AuthProvider, route guards
  components/   layout, UI kit (Button, Input, Dialog, Toast, Tabs…), SVG art
  data/         styles, quiz, product catalog, colours, categories
  lib/          Firebase, Firestore helpers, stylist, validators, image compression
  pages/        one folder per area (auth, quiz, main, wardrobe, outfits, events, social, profile)
docs/           HCI mapping, GitHub guide (Arabic), screenshot checklist
```
