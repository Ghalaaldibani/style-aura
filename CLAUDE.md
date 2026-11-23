# Style Aura — project context for Claude Code

## Who you are helping
Ghala Aldibani (team leader) with Jana Asiri and Raneem Ayman, HCI2011 (User Interface Design), Umm Al-Qura University, Section 10.
All three code on this laptop (Windows, PowerShell, VS Code).

**Always reply in Arabic (Saudi dialect).** Go one small step at a time, explain what each change does and why, and wait for the user to confirm ("خلصت") before the next step. The team must understand the code because they will be asked about it.

## The app
Style Aura: a personal digital closet with a built-in stylist for women 18–24 (mobile-first).
- 10-question style quiz → one of 4 styles (Emo, Y2K, Old Money, Streetwear); quiz can be skipped.
- Home: outfit boards adapted to the quiz style.
- Wardrobe + Add Item; Create Outfit with an "AI Suggest" tab (Regenerate / Create Manually) and a loading state "Styling your outfit…" with progress bar + Cancel. "AI" is a rule-based outfit builder from the user's own items (real AI was out of scope in Phase 1).
- Avatar (skin tone, body shape); Favorites; Event Planner (owned vs missing items → Product Detail → external retailer link).
- Share (Friends / Public audience) → Friends Feed → Post Detail (rate/comment).
- Error prevention: quiz Next disabled until an option is chosen; delete asks for confirmation + Undo.

## Platform decision
Mobile-first **web app styled as a phone app**: full screen on a phone, 390×844 phone frame on laptop (Tailwind `md:`). Not React Native — the course needs a live URL and DOM event listeners.

## Stack
React + Vite (ESLint) · Tailwind CSS v4 via `@tailwindcss/vite` · react-router-dom · later Firebase (Auth + Firestore) for the bonus · deploy on Vercel.

## Design tokens (from Figma "Design System" page) — defined in `src/index.css` `@theme`
primary #5B2A86 · primary-dark #44206A · primary-light #EFE6F7 · rose #C2477A · rose-light #FBE6EE · ink #1F1A24 · muted #6B6472 · line #E6E1EA · canvas #FAF7FC · error #D93025 · success #1E8E3E · warning #B26A00 · info #1A73E8.
Font Inter: H1 28 bold, H2 22 semibold, H3 18 semibold, body 16, small 14, caption 12 medium. Helper text uses #3E3838 (Phase 2 accessibility audit fix, 10.8:1 contrast).
Figma file key: `SFZvgtzAtmPTGmgpzItSEM` (screens: Sign Up 4:2, Log In 6:209, welcome1 24:103, Quiz Intro 4:19, Quiz 1–10, Style Result 4:53, Outfit Boards 4:64, Product Details 4:100, Avatar 4:116, Wardrobe 4:141, Add Item 4:189, Event Planner 4:211, Create Outfit 4:237, Share 4:272, Friends Feed 4:292, Post Detail 6:227, Favorites 4:319). Figma image fills are low resolution — redraw as SVG when quality is poor.

## Current code
- `src/components/AppLayout.jsx` — phone frame (`overflow-hidden`), bottom nav only on /home /wardrobe /outfits /favorites
- `src/components/BottomNav.jsx` — Home · Wardrobe · Outfits · Favorites (white rounded card, circle + label, active = purple)
- `src/pages/Welcome.jsx` — done, matches Figma welcome1
- `src/pages/Placeholder.jsx` — temporary screens
- `src/App.jsx` routes: / , /signup, /login, /home, /wardrobe, /outfits, /favorites, *
- `src/main.jsx` — BrowserRouter
- `public/logo.png`, `public/avatar.svg`
- Step 8.1 (may or may not be saved yet — check): `src/adaptive/AdaptiveContext.js` (context + `useAdaptive()`), `src/adaptive/AdaptiveProvider.jsx` (errorCount, highContrast, autoContrast, logs, `logEvent`, `reportError(source)`, `undoContrast`, `toggleContrast`; auto high contrast after 3 errors; toggles `high-contrast` class on <html>).

## Phase 3 requirements (rubric, 10 marks + bonus up to 4)
1. Technical implementation & AI coding (3) — clean code written from scratch, matches Figma.
2. Adaptive UX & accessibility (3) — Context-aware sensors (error tracking, cognitive-load detection) reacting in real time; ARIA / accessibility standards.
3. HCI mapping & documentation (2) — table mapping each feature to HCI principles.
4. Deliverables (2) — live URL + Prompt Engineering Log.
Bonus: live database (Firebase) storing user data or interaction logs.
**Rules:** UI styling libraries (Tailwind) are allowed; drag-and-drop builders, ready-made templates or plugins that provide the adaptive features are NOT. All adaptive logic must be our own code.

## Adaptive feature plan
| Feature | Where | HCI principle |
|---|---|---|
| Dynamic error adaptation | Sign Up / Log In / Add Item forms: per-field error counter, after 2 errors on a field show a hint + example and highlight the field | Nielsen: error prevention & recovery |
| Real-time friction / dwell-time log | Quiz questions: >15 s without answering = hesitation → log it + show short descriptions of the options | Visibility of system status, help |
| Cognitive load reduction | Create Outfit / Event Planner: on hesitation or repeated errors hide non-essential filters/tabs and emphasise "AI Suggest" | Hick's Law |
| Auto-contrast | Global: 3 errors in a session → high contrast on, banner with Undo | Universal design, WCAG 1.4.3, user control & freedom |

## Progress (update after every phase) — build follows FULL_SPEC.md §8 (12 phases)
- ✅ Phase 1 (2026-11-22): AdaptiveProvider wired in main.jsx, `.high-contrast` CSS variable overrides, ContrastBanner, shared UI in `src/components/ui/` (Button, Input, Dialog, Toast, Tabs, Card, PageHeader). Dev test page `/dev/ui`.
- ✅ Phase 2 (2026-11-22): Firebase project `style-aura-6b73e` (Auth Email/Password + Firestore, rules published from `firestore.rules`), config in git-ignored `.env.local`, `src/lib/firebase.js`, `src/auth/` (AuthProvider, useAuth, ProtectedRoute, PublicOnlyRoute). Verified: /home redirects to /login.
- ✅ GitHub (2026-11-23): public repo https://github.com/Ghalaaldibani/style-aura (branch main). `gh` CLI logged in as Ghalaaldibani (if `gh` is not found in a shell, reload PATH from Machine+User env vars). Git identity = GitHub noreply email. Collaborators invited with write access: JanaAi1 (Jana), Khran6-max (Raneem). Team guide in Arabic: `docs/GITHUB_GUIDE.md` (includes Co-authored-by lines for Jana/Raneem). Commit + push at the end of every phase.
- ✅ Phases 3–10 (2026-11-23): all screens in `src/pages/` (auth, quiz, main, wardrobe, outfits, events, social, profile), sensors in `src/adaptive/` (useFieldErrorTracker, useDwellTime, useSimplifiedUI), stylist `src/lib/stylist.js`, Firestore helpers `src/lib/db.js`, original SVG art `src/components/art/`, full `firestore.rules`, PWA (`public/manifest.webmanifest`, `public/sw.js`), `vercel.json`. Catalog/boards are static data in `src/data/catalog.js` (not Firestore). Dev-only pages: `/dev/ui`, `/dev/art`.
- ✅ Phase 12 docs: `docs/HCI_MAPPING.md`, `docs/SCREENSHOTS_CHECKLIST.md`, README.
- Figma connector hit the Starter-plan call limit after 11 frames; Event Planner, Create Outfit, Share, Feed, Post Detail were designed in the same style without the frames.
- ✅ Phase 11 (2026-11-23): deployed with Vercel CLI (logged in as the team leader; project `style-aura`, linked in `.vercel/`). Live: https://style-aura-inky.vercel.app. 6 `VITE_FIREBASE_*` env vars added as type `config` (Firebase web keys are public by design). Redeploy: `npx vercel deploy --prod --yes` (auto-deploy on push NOT connected yet).
- ⏳ Waiting for the team: publish the NEW `firestore.rules`, add `style-aura-inky.vercel.app` to Firebase Auth → Authorized domains, test on a phone, install vercel-plugin themselves if wanted (`npx plugins add vercel/vercel-plugin`, needs Bun; the agent is not allowed to install plugins on itself). Then: Lighthouse scores, screenshots, final PROMPT_LOG cleanup.

## Next steps (original plan)
- 8.2 Wrap the app in `AdaptiveProvider` (main.jsx) + add `.high-contrast` CSS variable overrides in index.css
- 8.3 `ContrastBanner` component (role="status", aria-live, Undo button)
- 8.4 Sign Up screen (Figma 4:2) with dynamic error adaptation (aria-invalid, aria-describedby, hints)
- 8.5 Log In screen (Figma 6:209)
- Then: Quiz Intro + 10 questions with dwell-time sensor → Style Result → Home/Outfit Boards → Wardrobe/Add Item → Create Outfit (AI Suggest + cognitive load) → Event Planner → Favorites/Avatar/Share/Feed → Firebase → GitHub → Vercel → report (HCI mapping table + prompt log).

## Prompt log — IMPORTANT
Keep `PROMPT_LOG.md` (project root) updated after every important prompt, error, or AI mistake that the team corrected: date, stage, prompt/problem, AI answer/fix, outcome. It will be used for the report.
