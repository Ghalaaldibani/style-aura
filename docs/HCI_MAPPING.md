# Style Aura — HCI & Accessibility Mapping

Each row maps one adaptive or accessibility feature to the code that implements it, the HCI principle behind it, and the human-centred goal. All adaptive logic is written by the team (no adaptive or accessibility plugins).

## 1. Context-aware sensors and adaptations

| Adaptive UX feature | Implementation logic (file / hook) | HCI / accessibility principle | Impact / human-centred goal |
|---|---|---|---|
| **Error & cognitive-load sensor** | `src/adaptive/useFieldErrorTracker.js`. Real DOM listeners on the `<form>`: `focusin`, `input`, `focusout`, `invalid`, `submit`. It counts errors **per field**, measures time from focus to first keystroke (> 8 s is logged as `hesitation`) and total form time (`task_time`). | Nielsen #5 Error prevention; #9 Help users recognise, diagnose and recover from errors | Detects users who struggle with a specific field instead of treating all errors the same. |
| **Dynamic error adaptation** | Same hook + `Input.jsx` / `ChipGroup.jsx` (`adaptiveHint`). After **2 errors on the same field**, a hint with an example appears in a highlighted box, and the field gets a rose ring. `aria-invalid`, `aria-describedby` (error + hint) and focus moves to the first invalid field; a summary is announced in an `aria-live` region. The error and hint disappear as soon as the value becomes valid (live re-validation on `input`). Used on Sign Up, Log In, Forgot Password, Add Item, Event Planner, Friends search, Profile forms. | Nielsen #9; WCAG 3.3.1 Error Identification, 3.3.3 Error Suggestion, 4.1.2 Name/Role/Value, 4.1.3 Status Messages | Users get extra help only when they need it, so experts aren't slowed down and struggling users recover faster. |
| **Log In recovery shortcut** | `src/pages/auth/LogIn.jsx`. After 2 failed log-ins, the small "Forgot password?" link becomes a highlighted "Having trouble? Reset your password" box. Friendly Firebase error messages in `src/lib/authErrors.js`. | Nielsen #9; recognition rather than recall (#6) | Prevents users from getting locked out by "too many attempts". |
| **Real-time friction / dwell-time log** | `src/adaptive/useDwellTime.js` on every quiz question (`QuizQuestion.jsx`). Counts only **visible** time (`visibilitychange`). After **15 s** without an answer it logs `hesitation` and shows a reassuring tip + a short description under every option. On "Next" it logs `dwell_time` with the duration and whether the user hesitated. | Visibility of system status (#1); Help & documentation (#10); progressive disclosure | Descriptions appear only for hesitant users, so the default screen stays light and visual. |
| **Contextual simplification (cognitive-load reduction)** | `src/adaptive/useSimplifiedUI.js` with DOM listeners (`pointerdown`, `keydown`, `input`, `wheel`, `touchmove`). On **Create Outfit**, **Add Item** and **Event Planner**: after 20–25 s of inactivity **or** 2 errors, optional filters and fields are hidden, the primary button gets bigger, and a one-line tip appears. On Create Outfit the tip points to **AI Suggest**. "Show more options" restores everything (`ui_restored`). Logged as `ui_simplified` with the reason. | **Hick's Law** (fewer choices → faster decisions); Aesthetic & minimalist design (#8); User control & freedom (#3) | Reduces decision overload at the moment the user seems stuck, without taking control away. |
| **Auto high contrast** | `src/adaptive/AdaptiveProvider.jsx` (`reportError`): **3 failed attempts in a session** turn on high contrast. `ContrastBanner.jsx` (`role="status"`, `aria-live`) explains why and offers **Undo**, **Keep it** (saved to the profile) and a link to Settings. The colours are switched by overriding Tailwind CSS variables in `.high-contrast` (`src/index.css`). | Universal design; WCAG 1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast; User control & freedom (#3) | Repeated errors can mean the user can't read the screen well (glare, low vision). The app adapts but always lets the user undo. |
| **Respect OS preferences** | `AdaptiveProvider.jsx` `defaultSettings()`: `prefers-contrast: more` → high contrast on first load; `prefers-reduced-motion` → reduce motion. | Universal design; WCAG 2.3.3 Animation from Interactions | Users who already set accessibility options in their phone don't have to repeat them. |
| **Adaptive content (style-based boards)** | `src/pages/main/Home.jsx`: boards are filtered by the quiz result by default ("For you · Streetwear"); chips let the user see other styles. | Personalisation; Match between system and the real world (#2) | Users see relevant outfits first, with fewer irrelevant choices. |
| **Interaction log (live database)** | `AdaptiveProvider.logEvent` → batched and debounced writes to Firestore `users/{uid}/interactionLogs` (kept in memory when offline, retried, dropped on log-out). Viewer: `src/pages/profile/InteractionLog.jsx`. Events: `input_error`, `hint_shown`, `hesitation`, `dwell_time`, `ui_simplified`, `ui_restored`, `auto_contrast_on/undo/kept`, `manual_contrast_toggle`, `ai_suggest`, `ai_cancel`, `regenerate`, `task_time`, … | Visibility of system status; transparency | Evidence for evaluation, and the user can see what the app recorded about them. |
| **User control over adaptation** | Profile → Accessibility: **High contrast**, **Larger text**, **Reduce motion**, **Adaptive help** on/off (`Switch.jsx`, `role="switch"`). Settings are saved in Firestore (`users/{uid}.settings`). | User control & freedom (#3); Flexibility & efficiency of use (#7) | Adaptation is helpful, never forced. |

## 2. "AI Suggest" stylist (explainable, rule-based)

| Feature | Implementation logic | Principle | Goal |
|---|---|---|---|
| Outfit builder | `src/lib/stylist.js` `suggestOutfit()`: picks top + bottom (or dress) + shoes + optional outerwear/accessory from the user's own wardrobe; scores style-tag match, colour harmony (neutrals + max one accent, clashing pairs penalised), season, event formality; random tie-break; never repeats the last 3 suggestions. | Honest AI / transparency | Useful suggestions without a black box. |
| "Why this outfit?" | `SuggestionResult.jsx` lists the reasons returned by the stylist. | Explainable AI; Visibility of system status | Users understand and trust the suggestion. |
| Loading state with Cancel | `CreateOutfit.jsx`: "Styling your outfit…", real progress bar (`role="progressbar"`, `aria-valuenow`), **Cancel** via `AbortController`, **Regenerate**. | Visibility of system status (#1); User control & freedom (#3) | Users always know what's happening and can stop it. |
| Missing pieces → products | `planEvent()` / `suggestProducts()`; Event Planner shows owned vs missing items → Product Detail → external retailer (`rel="noopener noreferrer"`, warning box "You will leave Style Aura"). | Error prevention; Match with the real world | No surprise when leaving the app. |

## 3. Accessibility (WCAG 2.1 AA) work

| Feature | Where | WCAG |
|---|---|---|
| Semantic landmarks, one `h1` per screen, skip link "Skip to main content" | `AppLayout.jsx`, every page | 1.3.1, 2.4.1, 2.4.6 |
| Page title updates on every screen | `src/lib/usePageTitle.js` | 2.4.2 |
| Focus moves to `<main>` after navigation | `AppLayout.jsx` | 2.4.3 |
| Visible focus ring (thicker in high contrast) | `src/index.css` `:focus-visible` | 2.4.7 |
| All controls ≥ 44×44 px | `Button`, `ChipGroup`, `HeartButton`, icon buttons | 2.5.5 |
| Labels on every field, errors in text + icon, `aria-invalid`, `aria-describedby` | `Input.jsx`, `ChipGroup.jsx` | 1.3.1, 3.3.1, 3.3.2 |
| Selection never shown by colour alone (check mark + border / filled pill) | `ChipGroup`, quiz options, skin-tone swatches, Share audience, tabs | 1.4.1 (Phase 2 audit fix) |
| Helper text #3E3838 (10.8:1) | `--color-helper` | 1.4.3 (Phase 2 audit fix) |
| Dialogs: `role="dialog"`, `aria-modal`, focus trap, Esc, focus returns | `Dialog.jsx` | 2.1.2, 2.4.3 |
| Toasts in `aria-live`, timer pauses on hover/focus, Undo action | `ToastProvider.jsx` | 4.1.3, 2.2.1 |
| Tabs follow the WAI-ARIA pattern (arrow keys, Home/End) | `Tabs.jsx` | 2.1.1, 4.1.2 |
| Real radio buttons / checkboxes behind custom pills and cards | `ChipGroup`, quiz, ratings, audience | 2.1.1, 4.1.2 |
| Larger text mode (rem-based type scale) | `html.large-text` | 1.4.4 |
| Reduce motion (OS + in-app) | `index.css` | 2.3.3 |
| Images: meaningful `alt` / `role="img"` + `aria-label`; decorative art `aria-hidden` | `GarmentArt`, `StyleScene`, `AvatarFigure` | 1.1.1 |
| `lang="en"`, `theme-color`, works with keyboard only | `index.html` | 3.1.1, 2.1.1 |

## 4. Error prevention (from Phase 1/2)

| Feature | Where | Principle |
|---|---|---|
| Quiz "Next" disabled until an option is chosen + helper text | `QuizQuestion.jsx` | Nielsen #5 |
| Delete asks for confirmation + **Undo** toast (5 s) | Item, outfit, favourites, posts | Nielsen #3 and #5 |
| Discard-changes dialog when leaving Add Item with unsaved changes (+ `beforeunload`) | `AddItem.jsx` | Nielsen #5 |
| Date can't be in the past (`min` + validation) | `EventPlanner.jsx` | Nielsen #5 |
| Password strength meter (bars + text) | `PasswordStrength.jsx` | Nielsen #1 |
| Same message for "Forgot password" whether or not the email exists | `ForgotPassword.jsx` | Privacy / security |
