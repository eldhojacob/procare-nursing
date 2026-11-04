# Implementation Plan — Procare Nursing Website

Each task is small, ordered, and linked to requirements from `requirements.md`. Default
hosting is **GitHub Pages + Formspree** (form works on Pages). Work through tasks top to
bottom.

- [x] 1. Scaffold project and build toolchain
  - Create `package.json` with build-time scripts only (`dev`, `build`); no runtime deps.
  - Add `tailwind.config.js` (content paths, teal+sand palette tokens, Fraunces/Inter
    families) and `postcss.config.js`.
  - Create `src/input.css` with Tailwind directives and an empty `@layer components` block.
  - Add `.gitignore` (node_modules, dist is committed for Pages or built in CI — note choice).
  - Verify `npm run build` emits a minified `dist/styles.css`.
  - _Requirements: 16.1_

- [x] 2. Create the editable config block
  - Implement `src/config.js` exporting the single `SITE` object (business, contact, hours,
    suburbs array, links, form provider) exactly per design, fully commented for non-devs.
  - Mark all unknown real values (ABN, phone, legal name, D9389 URL, Charter URL) with `TODO`.
  - _Requirements: 14.1, 14.3_

- [x] 3. Build the base HTML shell, header, and theme system
  - Create `index.html` with semantic landmarks, skip link, one `h1`, and font preloads.
  - Build the sticky header: wordmark, tap-to-call pill (`tel:`), "Request a callback" link,
    theme toggle; mobile-collapsing layout.
  - Add the inline no-flash theme script in `<head>` and the light/dark toggle (localStorage +
    `prefers-color-scheme`) in `src/main.js`.
  - _Requirements: 1.1, 12.1, 12.6, 12.7, 15.1_

- [x] 4. Wire config hydration and global motion utilities
  - In `main.js`, read `SITE` and hydrate `data-config` placeholders (phone links, email, ABN,
    hours, suburb list) on `DOMContentLoaded`, with static fallbacks already in the HTML.
  - Implement `IntersectionObserver` scroll-reveal and the reduced-motion `@media` block.
  - _Requirements: 14.2, 12.3, 12.4_

- [x] 5. Build the hero section
  - Add eyebrow, `h1` "Procare Nursing", headline, and three pill CTAs (Call / Request a
    callback / Refer a patient) wired to `tel:` and in-page anchors.
  - Add our own low-opacity (10–15%) floating nurse-at-home SVG background + optional blurred
    photo layer with teal→sand gradient overlay; staggered fade-in on text.
  - _Requirements: 1.2, 1.3, 1.4, 1.5, 12.2_

- [x] 6. Build "Care & availability" section
  - Three service cards: wound care, medication assistance, clinically required showering &
    dressing help.
  - Suburbs-served chip grid (hydrated from config) and an availability / phone-hours panel.
  - _Requirements: 2.1, 2.2, 2.3, 2.4_

- [x] 7. Build "Getting care" Q&A section with compliance copy
  - Four cards: Can I receive care? / Will I pay? / How do I start? / What happens at the
    first visit?
  - Write compliant original copy: Veteran Card + assessed clinical need; White Card confirmed
    with DVA before care starts; no out-of-pocket cost to eligible clients; no DVA logo; never
    "preferred provider".
  - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2, 13.4_

- [x] 8. Build "How it works" timeline
  - 4-step timeline (Call → Referral → Nurse visit → Care plan) with SVG icons; horizontal on
    desktop, vertical single-column on mobile; short title + one-line description each.
  - _Requirements: 4.1, 4.2, 4.3_

- [x] 9. Build "Meet your nurse" section
  - Photo placeholder with descriptive alt, qualifications, short intro, all clearly marked as
    placeholder content.
  - _Requirements: 5.1, 5.2, 5.3_

- [x] 10. Build "Refer a patient" section
  - Show intake phone + intake email (from config), secure-referral-channel note, and
    acknowledgement time.
  - Link to the official DVA D9389 form opening in a new tab with `rel="noopener noreferrer"`.
  - _Requirements: 6.1, 6.2, 6.3, 6.4_

- [x] 11. Build "Existing clients" section
  - Change-a-visit / contact-my-nurse guidance, after-hours instructions, and the "for a
    medical emergency, call 000" line.
  - _Requirements: 7.1, 7.2, 7.3_

- [x] 12. Build the callback form (markup + accessibility)
  - Fields: name, phone, suburb, who it's for, safe time to call, optional message; all with
    visible associated labels; honeypot `company` field (visually hidden, `tabindex="-1"`,
    `aria-hidden`).
  - Persistent "For a medical emergency, call 000." note; do NOT include medical-record or
    Veteran Card fields.
  - _Requirements: 8.1, 8.2, 8.8, 8.9, 15.4_

- [x] 13. Implement form validation and submission logic
  - In `main.js`: honeypot silent-reject; required-field validation with inline
    `aria-describedby` errors and focus management; disabled "Sending…" state.
  - Submit to the configured backend (Formspree default via `fetch`; Netlify path guarded by
    config) and surface success (`role="status"`) and error (`role="alert"` + phone fallback)
    states.
  - _Requirements: 8.3, 8.4, 8.5, 8.6, 8.7_

- [x] 14. Build the testimonials placeholder
  - Clearly-labelled empty "real, consented stories coming soon" block; no invented quotes or
    names.
  - _Requirements: 11.1, 11.2_

- [x] 15. Build the footer
  - Legal business name + ABN (from config), privacy.html link, feedback/complaints contact,
    and DVA Community Nursing Client Charter link.
  - _Requirements: 9.1, 9.2, 9.3, 9.4_

- [x] 16. Build privacy.html
  - Privacy policy covering callback-form data collected, use, retention, and how to make a
    privacy enquiry; reuse the shared header, footer, palette, and theme logic.
  - _Requirements: 10.1, 10.2_

- [x] 17. Create our own illustrations and 404 page
  - Produce the hero nurse-at-home SVG and the four timeline step icons (original, teal/sand);
    decorative SVGs `aria-hidden`.
  - Add a friendly `404.html` using the shared shell.
  - _Requirements: 12.2, 12.5, 15.2_

- [x] 18. Accessibility and performance pass
  - Verify contrast in both themes, keyboard operability, visible focus, heading order, alt
    text; run Lighthouse on `index.html` and `privacy.html` and fix until performance and
    accessibility both score 90+.
  - Confirm reduced-motion fully disables non-essential motion.
  - _Requirements: 12.4, 15.1, 15.2, 15.3, 15.4, 15.5_

- [x] 19. Production build and GitHub hosting setup
  - Run the Tailwind production (minified, non-CDN) build.
  - Add `.github/workflows/deploy.yml` to build and publish to GitHub Pages; add `CNAME` with
    `procarenursing.com.au`.
  - Initialise the repo and push to the GitHub project (eldhojacob/procare-nursing); enable
    Pages + Enforce HTTPS.
  - _Requirements: 16.1, 16.2, 16.3_

- [ ] 20. Document config, DNS, and the pre-launch DVA verification checklist
  - Write `README.md`: how to edit the config block, local dev/build commands, and the GitHub
    Pages DNS steps for procarenursing.com.au (apex A records + `www` CNAME, enforce HTTPS);
    include the Netlify+Formspree alternative note.
  - Add a pre-launch checklist to verify all DVA wording, the D9389 URL, and the Client
    Charter URL against https://dva.gov.au, and to fill every `TODO` in `config.js`.
  - _Requirements: 13.3, 16.4, 14.1_
