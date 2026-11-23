# Style Aura — Full build specification (Phase 3 + bonus)

Read together with `CLAUDE.md` (context, tokens, rules) and keep `PROMPT_LOG.md` updated.
Goal: a complete, deployed, mobile-first web app that earns full marks on every rubric line **and** the database bonus.

---

## 0. How to work
- Build in the phases below. At the end of each phase: run `npx eslint .` and `npm run build`, fix everything, add PROMPT_LOG entries, then **stop and give the team a short Arabic (Saudi) summary** of what was built and how to test it. Wait for "خلصت" before the next phase.
- Phases marked 🧑‍💻 need the team (accounts, keys, approvals). Explain exactly what to click, then wait.
- Match the Figma file (key `SFZvgtzAtmPTGmgpzItSEM`) screen by screen. If the Figma MCP is not available in this editor, ask the team for screenshots of the frame.
- All adaptive logic is our own code. Allowed libraries: React, react-router-dom, Tailwind, Firebase SDK. No UI kits / templates / accessibility plugins. Ask before adding any other dependency.
- Every screen must have: loading state, empty state, error state, keyboard focus styles, labels/ARIA, 44×44 px touch targets, works at 360–430 px wide.

---

## 1. Screens (routes)

### Auth & onboarding
| Route | Screen | Notes |
|---|---|---|
| `/` | Welcome (done) | Get Started → /signup, Log In → /login. Logged-in users → /home |
| `/signup` | Sign Up (Figma 4:2) | Name, email, password (+ show/hide), confirm password, password-strength meter, terms checkbox. Dynamic error adaptation. Firebase `createUserWithEmailAndPassword` + `updateProfile`, create `users/{uid}` doc → /quiz |
| `/login` | Log In (Figma 6:209) | Email, password, show/hide, "Forgot password?" link, "Create a new account". Friendly Firebase error messages (wrong password, no user, too many requests). Dynamic error adaptation |
| `/forgot-password` | Forgot password | Email field → `sendPasswordResetEmail` → success state "Check your inbox" with resend (60 s cooldown) and back to log in. Same message whether or not the email exists (privacy) |
| `/verify-email` | (optional) | `sendEmailVerification` after sign-up, banner on Home until verified |
| `/quiz` | Quiz Intro (4:19) | Start or **Skip quiz** (FR3) |
| `/quiz/:n` | Quiz 1–10 (4:30, 6:2…6:186) | Progress bar "Question n of 10", image option cards, Next disabled until an answer (error prevention), Back. **Dwell-time sensor** |
| `/result` | Style Result (4:53) | Style name + description + "View outfits" + "Customize my avatar". Saved to Firestore |

### Main app (bottom nav visible)
| Route | Screen | Notes |
|---|---|---|
| `/home` | Home / Outfit Boards (4:64) | Boards filtered by the user's style (adaptive content). Retake quiz entry |
| `/product/:id` | Product Details (4:100) | Image, name, price, store, "Open in store" (external link, `rel="noopener"`), save to favorites |
| `/wardrobe` | My Wardrobe (4:141) | Grid of the user's items, filter by category, "+ Add item", "Plan an event outfit". Empty state |
| `/wardrobe/add` | Add Item (4:189) | Photo (camera/file, compressed client-side), name, category (Top/Bottom/Shoes/Accessory/Outerwear), colour, season, style tags. Dynamic error adaptation. Discard-changes dialog (58:32) |
| `/wardrobe/:id` | Item detail / edit | Edit, delete with confirmation dialog (58:2) + **Undo** toast (5 s) |
| `/outfits` | Outfits list | Saved outfits, open → detail |
| `/outfits/create` | Create Outfit (4:237) | Tabs **AI Suggest** / **Create Manually**. AI Suggest = our rule-based stylist (see §4). Loading "Styling your outfit…" + progress + **Cancel**; **Regenerate**; Save. **Cognitive-load reduction** |
| `/outfits/:id` | Outfit detail | Avatar preview, edit, share, delete + undo |
| `/events` | Event Planner (4:211) | Event name, date, type (wedding, graduation, casual…), builds outfit, shows **owned vs missing** pieces → missing piece → product suggestions. Saves event |
| `/avatar` | Avatar (4:116) | Skin tone (selected ring, not colour only), body shape, preview of outfit on avatar (SVG layers) |
| `/favorites` | Favorites (4:319) | Saved products + outfits, tabs, remove with undo |
| `/share/:outfitId` | Share (4:272) | Caption, audience **Friends / Public** (FR12) |
| `/feed` | Friends Feed (4:292) | Posts from friends + public, rating 1–5 |
| `/post/:id` | Post Detail (6:227) | Rate, comment, delete own comment |
| `/friends` | Friends | Search user by email/username, send/accept requests |
| `/profile` | Profile & Settings | Name, photo, style, **Accessibility settings** (high contrast, larger text, reduce motion, adaptive features on/off), "My interaction log" viewer, change password, log out, delete account (confirm) |
| `*` | 404 | Friendly not-found with button home |

Route guards: protected routes redirect to `/login` (remember where they wanted to go); auth routes redirect logged-in users to `/home`.

---

## 2. Backend — Firebase (bonus)
Use Firebase **Auth** (email/password) + **Cloud Firestore**. Do **not** depend on Firebase Storage (new projects need the paid Blaze plan): compress item photos in the browser (canvas → WebP/JPEG, max 600 px, < 200 KB) and store as a data URL in the item doc, or let the user pick from built-in sample images.

Config in `.env.local` (`VITE_FIREBASE_*`), never committed; add `.env.example`. `src/lib/firebase.js` initialises the app.

### Firestore data model
```
users/{uid}: name, email, style, styleScores, avatar{skinTone, bodyShape}, settings{highContrast, largeText, reduceMotion, adaptiveOn}, createdAt
users/{uid}/items/{itemId}: name, category, color, season, tags[], image, createdAt
users/{uid}/outfits/{outfitId}: name, itemIds[], source('ai'|'manual'), eventId?, createdAt
users/{uid}/favorites/{favId}: type('product'|'outfit'), refId, createdAt
users/{uid}/events/{eventId}: name, date, type, outfitId, missing[]
users/{uid}/interactionLogs/{logId}: type, screen, field?, durationMs?, count?, details, timestamp, sessionId
products/{productId}: name, price, store, url, image, category, styles[]      (seeded catalog)
boards/{boardId}: title, style, productIds[]                                   (seeded)
posts/{postId}: ownerId, ownerName, outfitSnapshot, caption, audience('friends'|'public'), ratingSum, ratingCount, createdAt
posts/{postId}/ratings/{uid}: value
posts/{postId}/comments/{commentId}: uid, name, text, createdAt
friendships/{id}: users[2], status('pending'|'accepted'), requestedBy
```
Write `firestore.rules`: users read/write only their own `users/{uid}/**`; products/boards read-only for signed-in users; posts readable if public or the reader is an accepted friend; only owners edit/delete their posts/comments; one rating per user. Provide a seed script/page (dev only) for products and boards per style.

### Interaction logging (bonus evidence)
`AdaptiveProvider.logEvent` batches events and writes them to `interactionLogs` (debounced; also keep in memory if offline). Events: `input_error`, `hint_shown`, `hesitation`, `dwell_time`, `ui_simplified`, `auto_contrast_on`, `auto_contrast_undo`, `manual_contrast_toggle`, `ai_suggest`, `ai_cancel`, `regenerate`. The Profile → "My interaction log" screen lists them (proves the DB integration in the demo).

---

## 3. Context-aware & adaptive features (rubric line 2 — must be excellent)
All built on `src/adaptive/` (provider + hooks). Each is configurable and can be turned off in settings.

1. **Cognitive load & error sensing** — `useFieldErrorTracker`: DOM `input` / `blur` / `invalid` / `submit` listeners count repeated errors per field and measure time between focus and first keystroke.
2. **Dynamic error adaptation** — after 2 errors on the same field: inline hint with an example, field highlighted, `aria-invalid` + `aria-describedby`, focus moved to the first invalid field, error announced via an `aria-live="polite"` region. Hint disappears when fixed.
3. **Contextual adaptation / simplification** — on Create Outfit, Add Item and Event Planner: if hesitation (no action for > N s) or ≥ 2 errors, collapse optional fields/filters ("Show more options" to restore), enlarge the primary action, show a one-line tip. Logged as `ui_simplified`.
4. **Real-time friction log (dwell time)** — `useDwellTime(screen, thresholdMs)`: on each quiz question and key task, when dwell time exceeds the threshold, log `hesitation` and show contextual help (short description of each style option). Uses `visibilitychange` so hidden-tab time is not counted.
5. **Accessibility contrast toggle** — 3 errors in a session → high-contrast mode automatically, `role="status"` banner "We increased contrast to make things easier to read" + **Undo** + link to settings. Manual toggle in Profile and a quick toggle in the header.
6. Extra (nice for marks): **larger text** mode, **reduce motion** (respect `prefers-reduced-motion`), and respect `prefers-contrast: more` on first load.

---

## 4. "AI Suggest" stylist (rule-based, explain it honestly in the report)
Input: user's items, style result, optional event type, avatar. Algorithm: pick one top + bottom (or dress) + shoes + optional accessory/outerwear; score combinations by style-tag match, colour harmony rules (neutral + accent, avoid clashing pairs), season, event formality; random tie-break so **Regenerate** gives a different outfit; never repeat the last 3 suggestions. Show "Why this outfit" explanation (explainable AI / transparency). Missing category → "You're missing shoes — see suggestions" → products of the user's style. Simulated 1.5–2.5 s "Styling your outfit…" with real progress and a working Cancel (AbortController-style).

---

## 5. Accessibility (WCAG 2.1 AA)
Semantic landmarks, one `h1` per screen, page title updates on route change, skip link, visible focus ring, all images with alt (decorative `alt=""`), icon buttons with `aria-label`, dialogs with focus trap + Esc + return focus, toasts in `aria-live`, contrast ≥ 4.5:1 (check high-contrast palette too), selection never shown by colour alone (rings/borders/checkmarks — from our Phase 2 audit), form errors in text, `lang="en"`, works with keyboard only. Test with Lighthouse (aim ≥ 95 accessibility) and record the scores for the report.

---

## 6. PWA & polish
`manifest.webmanifest` (name, icons from logo, theme `#5B2A86`, display `standalone`), meta `theme-color`, apple-touch-icon, simple service worker or `vite-plugin-pwa` (ask first), safe-area insets for iPhone notch, smooth page transitions (disabled with reduce motion).

---

## 7. Deployment & deliverables
- 🧑‍💻 **GitHub**: init git, good `.gitignore` (node_modules, .env*), meaningful commits per phase, push to a new repo; README with features, stack, setup, screenshots, live link, team.
- 🧑‍💻 **Vercel**: import repo, add `VITE_FIREBASE_*` env vars, `vercel.json` SPA rewrite to `/index.html`, add the Vercel domain to Firebase Auth → Authorized domains. Test the live URL on a phone.
- **Report helpers** (generate in `docs/`): `HCI_MAPPING.md` (table: Adaptive UX Feature | Implementation Logic (file/hook) | HCI / Accessibility Principle | Impact / Human-Centric Goal — cover every adaptive feature, ARIA work and Phase 2 audit fixes), cleaned `PROMPT_LOG.md` (most critical prompts, challenges, iterative solutions), list of screenshots to take, Lighthouse scores. The team writes the final report text themselves.

---

## 8. Phases
1. Adaptive core wiring (8.2 provider in main.jsx + `.high-contrast` CSS, 8.3 ContrastBanner), shared UI components (Button, Input with error/hint, Dialog, Toast, Tabs, Card, PageHeader).
2. 🧑‍💻 Firebase setup (team creates the project + enables Email/Password + Firestore, pastes config into `.env.local`), `AuthProvider`, route guards.
3. Auth screens: Sign Up, Log In, Forgot Password (+ verify email), Profile basics, log out — with dynamic error adaptation.
4. Quiz (intro, 10 questions, dwell-time sensor, skip) + Style Result saved to Firestore.
5. Seed catalog → Home / Outfit Boards (adaptive by style) → Product Details → Favorites.
6. Wardrobe CRUD (add with photo compression, edit, delete + undo, discard dialog) with contextual simplification.
7. Create Outfit (AI Suggest + manual, loading/cancel/regenerate, explanation) + Outfits list/detail + Avatar.
8. Event Planner (owned vs missing → products).
9. Social: Share (audience), Friends, Feed, Post Detail (rating, comments) + Firestore rules.
10. Settings & accessibility modes, interaction-log viewer, 404, PWA, polish, Lighthouse pass.
11. 🧑‍💻 GitHub + Vercel deployment, authorized domain, phone test.
12. `docs/HCI_MAPPING.md`, final PROMPT_LOG cleanup, README, screenshot checklist.
