# Design — Procare Nursing Website

## Overview

A static, mobile-first, accessible single-page site (`index.html`) plus a `privacy.html`
page, styled with a Tailwind CSS production build and progressively enhanced with a small
amount of vanilla JavaScript. The site's one job is to move a veteran, family member, or
referrer toward one of three actions — **call**, **request a callback**, or **refer a
patient** — with zero friction and no account.

The build is intentionally lightweight: there is no SPA framework and no runtime data
fetching for content. All editable business data lives in a single, well-commented JavaScript
config object that hydrates the DOM on load, so a non-developer can change the phone number,
ABN, suburbs, and hours in one place.

Node.js is used only as a **build-time** toolchain (Tailwind CLI + a tiny dev server). The
shipped artefact is plain static HTML/CSS/JS — nothing Node is required at runtime. This keeps
us comfortably inside GitHub Pages / Netlify static hosting and the Lighthouse 90+ budget.

> This design satisfies the 16 requirements in `requirements.md`. Requirement references
> appear as _(R#)_ against the relevant design decisions.

---

## How we differ from the reference

The reference site (totalveteranhealthcare.com) is a multi-service, multi-clinic
practice. We match its *strengths* — a clear promise of easy/fast/quality access, simple
service cards, a reassuring tone, and testimonial-style social proof — but we are a focused,
single-service, in-home provider, and the execution is deliberately distinct:

| Dimension | Reference site | Procare Nursing (ours) |
|---|---|---|
| Positioning | Four pillars, clinics across Australia | One thing done well: in-home nursing for veterans, Greater Sydney |
| Palette | Cool corporate blues/neutrals | Fresh **teal + mint**, calm and modern, light/dark, with gradient pill buttons and a radial hero glow |
| Hero | Headline-left marketing block | Staggered fade-in text over a **softly floating, 10–15% opacity illustration** of a nurse caring for a patient at home |
| Section order | Services → clinics → onboarding → testimonials | **Jobs-first**: hero actions → care & availability → getting care Q&A → how it works → meet your nurse → refer → existing clients → callback → testimonials placeholder |
| Social proof | Populated testimonials | **Empty, clearly-labelled placeholder** — no invented quotes _(R11)_ |
| Type | Reference's own fonts | **Fraunces** headings + **Inter** body, 18px base |
| Imagery | Stock clinical photography | **Our own inline SVG illustrations** (home-care motif), optional licensed photo as faded/blurred background |
| Copy | Reference's wording | **100% original copy**; no reuse of wording, layout, colours, images, logo, or testimonials |

No wording, structure, colour, image, logo, or testimonial from the reference is reused.

---

## Architecture

### File structure

```
procare_nursing/
├── index.html                # Home: all primary sections (R1–R9, R11, R12)
├── privacy.html              # Privacy policy (R10)
├── 404.html                  # Friendly not-found (GitHub Pages)
├── src/
│   ├── config.js             # SINGLE editable config block (R14)
│   ├── main.js               # Hydration, theme, scroll-reveal, form logic (R8, R12)
│   └── input.css             # Tailwind directives + @layer custom components
├── assets/
│   ├── illustrations/        # Our own SVGs (hero nurse-at-home, step icons)
│   └── img/                  # Optional licensed/optimised photos, favicon
├── dist/
│   └── styles.css            # Tailwind PRODUCTION build output (R16)
├── tailwind.config.js        # Palette, fonts, content paths
├── postcss.config.js
├── package.json              # Build scripts only; no runtime deps
├── netlify.toml              # Netlify build + Forms config (if Netlify)
├── CNAME                     # procarenursing.com.au (if GitHub Pages)
├── .github/workflows/deploy.yml  # Build Tailwind + publish to Pages
└── README.md                 # Setup, config editing, DNS, DVA verification checklist
```

### Rendering model

- HTML is authored statically with real, semantic, crawlable content (not JS-generated), so
  the site works and scores well even if JS fails _(R15)_.
- `config.js` holds editable values. `main.js` reads them and writes them into
  `data-config="..."` placeholders (e.g. phone links, suburb list, ABN, hours) on
  `DOMContentLoaded`. Static fallback text matching the config defaults is present in the
  HTML so there is never an empty flash _(R14, R15)_.
- No external runtime JS libraries. Motion and reveal use the native
  `IntersectionObserver` and CSS transitions only.

### Config block (single source of truth) _(R14)_

`src/config.js` exports one commented object. Shape:

```js
export const SITE = {
  business: {
    name: "Procare Nursing",
    legalName: "Procare Nursing Pty Ltd",   // TODO verify legal entity
    abn: "00 000 000 000",                   // TODO real ABN
    domain: "procarenursing.com.au",
  },
  contact: {
    phone: "02 0000 0000",                   // display
    phoneHref: "+61200000000",               // tel: E.164
    intakeEmail: "intake@procarenursing.com.au",
    feedbackEmail: "intake@procarenursing.com.au",
    acknowledgeTime: "within 1 business day",
  },
  hours: {
    phone: "Mon–Fri, 8:00am – 6:00pm",
    service: "Scheduled visits 7 days; after-hours guidance below",
    afterHours: "For urgent clinical concerns after hours, call …; " +
                "for a medical emergency call 000.",
  },
  // Editable suburb list — add/remove freely (R2)
  suburbs: [
    "Sydney CBD", "Parramatta", "Blacktown", "Liverpool", "Bankstown",
    "Penrith", "Hornsby", "Chatswood", "Sutherland", "Campbelltown",
    "Bondi", "Manly", "Ryde", "Auburn", "Castle Hill",
  ],
  links: {
    d9389: "https://www.dva.gov.au/…/d9389",        // TODO verify exact URL
    clientCharter: "https://www.dva.gov.au/…/charter", // TODO verify exact URL
  },
  form: {
    provider: "netlify",      // "netlify" | "formspree"
    formspreeId: "",          // used only when provider === "formspree"
  },
};
```

All `TODO` values are collected into the README pre-launch checklist.

---

## Page layout and section order _(R1–R12)_

**Sticky header (every page) _(R1, R12)_:** compact bar with the Procare wordmark, a
tap-to-call pill button (`tel:` from config), a "Request a callback" link, and a theme
toggle. Stays fixed; collapses to wordmark + call button + menu on mobile.

**`index.html` sections, in order:**

1. **Hero _(R1, R12)_** — Eyebrow "DVA-contracted Community Nursing provider", a warm H1
   ("Caring for those who served, in the comfort of home." with a teal gradient emphasis
   span), a supporting line, and three pill CTAs (Call / Request a callback / Refer a
   patient). Background: a radial mint glow plus our own low-opacity (10–15%) floating SVGs
   (a nurse caring for a patient at home, and a drifting heart). Text fades in staggered.
   (The company name "Procare Nursing" appears in the sticky header wordmark on every page.)
2. **Care & availability _(R2)_** — Three service cards (wound care; medication assistance;
   showering & dressing help), a suburbs-served chip grid (from config), and an availability
   / phone-hours panel.
3. **Getting care Q&A _(R3)_** — Four cards: Can I receive care? / Will I pay? / How do I
   start? / What happens at the first visit? Contains the eligibility + cost compliance copy.
4. **How it works _(R4)_** — 4-step timeline (Call → Referral → Nurse visit → Care plan),
   horizontal on desktop, vertical on mobile, each with an SVG icon.
5. **Meet your nurse _(R5)_** — Photo placeholder, qualifications, short intro, clearly
   marked as placeholder.
6. **Refer a patient _(R6)_** — Intake phone + intake email, secure-referral-channel note,
   acknowledgement time, and a button to the official DVA D9389 form (new tab, `noopener`).
7. **Existing clients _(R7)_** — Change a visit / contact my nurse, plus after-hours
   instructions and the "call 000 for an emergency" line.
8. **Callback form _(R8)_** — See "Form design" below.
9. **Testimonials placeholder _(R11)_** — Empty, clearly-labelled "Coming soon: real,
   consented client stories" block. No quotes.
10. **Footer _(R9)_** — Legal name, ABN, privacy link, feedback/complaints contact, DVA
    Community Nursing Client Charter link.

**`privacy.html` _(R10)_** reuses the same header, footer, palette, and theme logic.

---

## Visual design system _(R12, R15)_

### Palette (Tailwind theme tokens)

Fresh teal + mint, tuned for ≥4.5:1 text contrast in both themes _(R15)_. (The Tailwind key
names `teal`/`sand`/`ink`/`night`/`cloud` are retained for continuity; the `sand` scale now
holds the mint values.)

| Token | Light | Dark | Use |
|---|---|---|---|
| `teal.600` | `#0F766E` | — | Primary actions, links, gradient start |
| `teal.500` | `#0B8276` | — | Button gradient end (AA-safe with white text) |
| `teal.700` | `#115E59` | — | Hover/pressed, in-text links |
| `teal.400` | `#14B8A6` | `#14B8A6` | Bright accent for **decorative art only** (fails text contrast) |
| `teal.300` | — | `#2DD4BF` | Dark-mode accents / primary |
| `sand.50` | `#F4FAF9` | — | Light page background (mint-tinted) |
| `sand.100` | `#FFFFFF` | — | Card surfaces (light) — crisp white |
| `sand.200` | `#D9F1EE` | — | Soft mint: section bands, chips, borders |
| `ink.900` | `#12302F` | — | Body text (light) |
| `ink.700` | `#4B6A68` | — | Muted body text (light) |
| `night.900` | — | `#0B1D1C` | Dark page background |
| `night.800` | — | `#122A29` | Card surfaces (dark) |
| `cloud.50` | — | `#E6F4F2` | Body text (dark) |
| `cloud.200` | — | `#9BBDB9` | Muted body text (dark) |

Buttons use a teal gradient (`teal.600 → teal.500`, light; `teal.300 → teal.400`, dark) with
a lift-and-glow on hover; cards use teal-tinted soft shadows and an optional hover lift.
`teal.400` is reserved for low-opacity decorative art because white text on it fails AA.

### Typography _(R12)_

- Headings: **Fraunces** (variable, optical). Body/UI: **Inter**. Base **18px** / 1.65.
- Self-hosted `woff2` with `font-display: swap` and preload of the two primary weights to
  protect LCP and the Lighthouse budget _(R15, R16)_.

### Components

Rounded cards (`rounded-2xl`) with teal-tinted soft shadows and a subtle hover lift,
**gradient pill buttons** (`rounded-full`) that lift and glow on hover, alternating mint
section bands for rhythm, generous section padding (`py-20`+), max content width ~72rem.
Defined as reusable classes in `@layer components` in `input.css`.

### Motion _(R12.3, R12.4)_

- **Scroll-reveal:** `IntersectionObserver` adds `.is-visible`; CSS transitions opacity +
  small translate. Elements are visible by default if JS never runs (no content hidden
  behind JS).
- **Hero float:** two slow CSS `@keyframes` drifts (offset timing/direction) on the two
  decorative background illustrations only.
- **Reduced motion:** a single top-of-stylesheet
  `@media (prefers-reduced-motion: reduce)` block removes float, disables reveal transitions
  (content shown immediately), and zeroes animation durations.

### Theming _(R12.6)_

`class="dark"` strategy on `<html>`. On load, `main.js` applies saved choice from
`localStorage`, else falls back to `prefers-color-scheme`. Toggle persists the choice. No
flash: a tiny inline script in `<head>` sets the class before first paint.

---

## Form design — callback request _(R8, R15)_

### Fields

| Field | Name | Required | Notes |
|---|---|---|---|
| Name | `name` | Yes | |
| Phone | `phone` | Yes | `inputmode="tel"` |
| Suburb | `suburb` | Yes | free text or datalist from config suburbs |
| Who it's for | `who_for` | Yes | radio: Myself / A family member / Someone I care for |
| Safe time to call | `safe_time` | Yes | select: Morning / Afternoon / Evening |
| Message | `message` | No | textarea |
| Honeypot | `company` | — | visually hidden + `tabindex="-1"` + `aria-hidden`; bots fill it _(R8.2)_ |

Explicitly **not** collected: medical records, Veteran Card numbers _(R8.8)_. A persistent
note reads "For a medical emergency, call 000." _(R8.9)_.

### Backends (config-switchable) _(R8.5)_

- **Netlify Forms (default):** `<form name="callback" data-netlify="true"
  netlify-honeypot="company">`, a hidden `form-name` input, and a hidden static duplicate
  form so Netlify's build-time bot detects it. Netlify emails the owner via a form
  notification.
- **Formspree (alt):** `action="https://formspree.io/f/<id>"`, submitted via `fetch` with
  `Accept: application/json`.

### Submission flow _(R8.3–R8.7)_

```
submit
 └─ honeypot filled? ── yes ─► silently resolve as success, send nothing (R8.3)
         │ no
         ▼
   validate required fields ── invalid ─► inline aria-describedby errors, focus first (R8.4)
         │ valid
         ▼
   disable button + show "Sending…"
         ▼
   POST to configured backend
    ├─ ok  ─► success panel (role="status"), reset form (R8.6)
    └─ err ─► error panel (role="alert") with phone fallback link (R8.7)
```

Client validation is an enhancement; `required`/`type` attributes provide a native fallback
if JS is unavailable. All errors are announced via `aria-live` and tied with
`aria-describedby` _(R15)_.

---

## Accessibility & performance strategy _(R15)_

- Landmarks (`header`/`main`/`nav`/`footer`), one `h1` per page, ordered headings, skip link.
- Every control labelled; visible focus ring (`:focus-visible`) on all interactive elements.
- Contrast ≥4.5:1 (text) / ≥3:1 (large text, UI) verified in both themes.
- Decorative SVGs `aria-hidden="true"`; meaningful images have descriptive `alt` _(R5.3)_.
- Performance: Tailwind purged to a tiny `dist/styles.css`, inline SVG (no image requests for
  icons), preloaded fonts, lazy-loaded optional photos, no blocking third-party JS → targets
  Lighthouse 90+ performance & accessibility _(R15.3, R16.1)_.

---

## Build, hosting & deployment _(R16)_

### Toolchain

`package.json` scripts (build-time only):

- `dev` — `tailwindcss -i src/input.css -o dist/styles.css --watch` + a static server.
- `build` — `tailwindcss -i src/input.css -o dist/styles.css --minify` (production, **not
  CDN**) _(R16.1)_.

### Hosting — GitHub Pages (primary, per your GitHub preference)

- `.github/workflows/deploy.yml`: on push to `main`, install deps, run `build`, upload the
  static root as a Pages artefact, deploy.
- `CNAME` file contains `procarenursing.com.au`; Pages enforces HTTPS _(R16.2, R16.3)_.

### Hosting — Netlify (alternative, needed only if you want native Netlify Forms)

- `netlify.toml` sets `command = "npm run build"` and `publish = "."`; Forms + email
  notification configured in the Netlify UI. Decision recorded in tasks; **default is GitHub
  Pages + Formspree** so forms work on Pages.

### DNS steps (documented in README + tasks) _(R16.4)_

- GitHub Pages: apex `procarenursing.com.au` → four A records
  (185.199.108–111.153) + optional AAAA; `www` → CNAME `eldhojacob.github.io`. Enable
  "Enforce HTTPS" after the cert provisions.
- Netlify: point apex/`www` to Netlify per their DNS panel; HTTPS auto-provisions.

---

## Compliance handling _(R3, R13)_

- No DVA logo anywhere; Procare's own wordmark only _(R13.1)_.
- Never the phrase "preferred provider" _(R13.2)_.
- Standing eligibility/cost copy: eligibility depends on the **Veteran Card and assessed
  clinical need**; **White Card coverage is confirmed with DVA before care starts**;
  **DVA-covered services have no out-of-pocket cost to eligible clients** _(R3, R13.4)_.
- README includes a **pre-launch DVA verification checklist**: confirm all DVA wording, the
  D9389 form URL, and the Client Charter URL against https://dva.gov.au before go-live
  _(R13.3)_.

---

## Testing approach

- **Manual accessibility:** keyboard-only walkthrough, screen-reader pass on the form and
  nav, both themes, reduced-motion on/off.
- **Automated:** Lighthouse (performance + accessibility ≥90) on `index.html` and
  `privacy.html`; HTML validation; axe DevTools quick scan.
- **Functional:** callback form happy path, each validation error, honeypot rejection, and
  the error/fallback state (temporarily point to a bad endpoint to exercise it).
- **Config:** change a suburb/phone in `config.js` and confirm it propagates everywhere.
- Full WCAG conformance requires manual assistive-technology testing and expert review; the
  above is the practical pre-launch gate.
