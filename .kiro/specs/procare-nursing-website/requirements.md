# Requirements — Procare Nursing Website

## Introduction

Procare Nursing is a Sydney-based, DVA-contracted Community Nursing provider delivering
in-home nursing to veterans across Greater Sydney. The website is a static, mobile-first,
accessible marketing and intake site whose job is to let a veteran, a family member, or a
referrer quickly do one of three things: find out if Procare can help, speak to a nurse, or
send a referral — all without creating an account.

The site takes design inspiration (not copy) from a competitor reference, matching its
strengths — a clear promise of easy, fast, quality access; simple service cards; a
reassuring tone; and testimonial-style social proof — while remaining visually and
editorially distinct.

This document defines the requirements in EARS format. Terms:

- **System** — the Procare Nursing website (static HTML/CSS/JS plus the form backend).
- **Visitor** — any person using the site (veteran, family member, carer, or referrer).
- **Config block** — a single editable section of site data (business name, phone, ABN,
  suburbs, hours, emails) that a non-developer can edit.

> **Compliance note:** All DVA-related wording in this document is drafted from public
> secondary sources and MUST be verified against https://dva.gov.au before launch
> (see Requirement 13). Do not treat the DVA wording here as final legal copy.

---

## Requirement 1 — Primary intake actions (the three jobs)

**User story:** As a veteran or family member, I want to immediately call, request a
callback, or send a referral, so that I can get help without creating an account.

#### Acceptance criteria

1. WHEN a Visitor loads any page THEN the System SHALL present a tap-to-call phone number in
   a sticky header that is reachable without scrolling.
2. WHEN a Visitor views the hero section THEN the System SHALL present three primary actions:
   "Call our nursing team", "Request a callback", and "Refer a patient".
3. WHEN a Visitor activates "Call our nursing team" THEN the System SHALL trigger a `tel:`
   link using the configured phone number.
4. WHEN a Visitor activates "Request a callback" THEN the System SHALL navigate to the
   callback form section.
5. WHEN a Visitor activates "Refer a patient" THEN the System SHALL navigate to the referral
   section.
6. WHERE a Visitor has not created any account THEN the System SHALL still provide full
   access to calling, callback request, and referral information (no login is ever required).

---

## Requirement 2 — Care and availability information

**User story:** As a veteran or family member, I want to see what care is offered, where,
and when, so that I can judge whether Procare can help me.

#### Acceptance criteria

1. WHEN a Visitor views the "Care we provide" section THEN the System SHALL describe wound
   care, medication assistance, and clinically required showering and dressing help.
2. WHEN a Visitor views the service area THEN the System SHALL list the Greater Sydney
   suburbs served, sourced from the Config block.
3. WHEN a Visitor views availability THEN the System SHALL state service availability and
   phone hours, sourced from the Config block.
4. IF a suburb is added to or removed from the Config block THEN the System SHALL reflect
   that change on the rendered page without code changes elsewhere.

---

## Requirement 3 — Getting care (eligibility, cost, how to start, first visit)

**User story:** As a veteran or family member, I want plain answers about eligibility, cost,
and what happens, so that I feel confident starting care.

#### Acceptance criteria

1. WHEN a Visitor views the "Getting care" section THEN the System SHALL answer four
   questions: "Can I receive care?", "Will I pay?", "How do I start?", and "What happens at
   the first visit?".
2. WHEN the System answers "Can I receive care?" THEN the System SHALL state that eligibility
   depends on the Veteran Card and assessed clinical need.
3. WHEN the System answers "Can I receive care?" THEN the System SHALL state that White Card
   coverage is confirmed with DVA before care starts.
4. WHEN the System answers "Will I pay?" THEN the System SHALL state that DVA-covered services
   have no out-of-pocket cost to eligible clients.
5. WHEN the System presents DVA eligibility or cost wording THEN the System SHALL NOT use the
   DVA logo and SHALL NOT describe Procare as a "preferred provider".

---

## Requirement 4 — How it works (visual timeline)

**User story:** As a Visitor, I want a simple step-by-step of how care begins, so that the
process feels easy and predictable.

#### Acceptance criteria

1. WHEN a Visitor views the "How it works" section THEN the System SHALL present a 3-to-4
   step visual timeline (for example: call, referral, nurse visit, care plan).
2. WHEN the timeline is displayed on a narrow viewport THEN the System SHALL render the steps
   in a single readable vertical sequence.
3. WHEN each step is displayed THEN the System SHALL label it with a short title and a
   one-line description.

---

## Requirement 5 — Meet your nurse

**User story:** As a veteran, I want to see who may care for me, so that I feel reassured
before the first visit.

#### Acceptance criteria

1. WHEN a Visitor views the "Meet your nurse" section THEN the System SHALL present a nurse
   photo placeholder, qualifications, and a short introduction.
2. WHERE real nurse details are not yet supplied THEN the System SHALL clearly mark the
   content as placeholder so it is not mistaken for final copy.
3. WHEN the nurse image is rendered THEN the System SHALL provide descriptive alt text.

---

## Requirement 6 — Refer a patient

**User story:** As a referrer (GP, hospital, family), I want a clear referral path, so that I
can send a referral quickly and know it was received.

#### Acceptance criteria

1. WHEN a Visitor views the "Refer a patient" section THEN the System SHALL display the intake
   phone number and the intake email (intake@procarenursing.com.au) from the Config block.
2. WHEN a Visitor views the referral section THEN the System SHALL describe a secure referral
   channel and state the acknowledgement time for received referrals.
3. WHEN a Visitor views the referral section THEN the System SHALL link to the official DVA
   D9389 Community Nursing referral form.
4. WHEN the System links to the D9389 form THEN the System SHALL open the link in a new tab
   with `rel="noopener noreferrer"`.

---

## Requirement 7 — Existing clients

**User story:** As an existing client, I want to change a visit or contact my nurse, so that
I can manage my care, including after hours.

#### Acceptance criteria

1. WHEN an existing client views the "Existing clients" section THEN the System SHALL explain
   how to change a visit and how to contact their nurse.
2. WHEN the "Existing clients" section is displayed THEN the System SHALL provide after-hours
   instructions.
3. WHEN after-hours instructions are displayed THEN the System SHALL direct Visitors to call
   000 for a medical emergency.

---

## Requirement 8 — Callback request form

**User story:** As a veteran or family member, I want to request a callback at a safe time,
so that a nurse can reach me without me sharing sensitive details online.

#### Acceptance criteria

1. WHEN a Visitor opens the callback form THEN the System SHALL present fields for name,
   phone, suburb, who the request is for, a safe time to call, and an optional message.
2. WHEN the callback form is displayed THEN the System SHALL include a hidden honeypot field
   for spam protection that is not visible to and not focusable by human Visitors.
3. WHEN a Visitor submits the form with the honeypot field populated THEN the System SHALL
   silently reject the submission.
4. WHEN a Visitor submits the form with a required field empty or invalid THEN the System
   SHALL block submission and show an inline, accessible validation message.
5. WHEN a Visitor submits a valid form THEN the System SHALL send the submission to the
   configured backend (Netlify Forms or Formspree) and email the owner.
6. WHEN a submission succeeds THEN the System SHALL show a clear success state.
7. IF a submission fails THEN the System SHALL show a clear error state and offer the phone
   number as a fallback.
8. WHEN the callback form is displayed THEN the System SHALL NOT request medical records or
   Veteran Card numbers.
9. WHEN the callback form is displayed THEN the System SHALL show "For a medical emergency,
   call 000."

---

## Requirement 9 — Footer, legal, and governance links

**User story:** As a Visitor, I want to find the legal business details and complaint
channels, so that I can trust and, if needed, raise concerns about the service.

#### Acceptance criteria

1. WHEN a Visitor views the footer THEN the System SHALL display the legal business name and
   ABN from the Config block.
2. WHEN a Visitor views the footer THEN the System SHALL link to the privacy policy
   (privacy.html).
3. WHEN a Visitor views the footer THEN the System SHALL display a feedback and complaints
   contact.
4. WHEN a Visitor views the footer THEN the System SHALL link to the DVA Community Nursing
   Client Charter.

---

## Requirement 10 — Privacy policy page

**User story:** As a Visitor, I want a privacy policy, so that I understand how my callback
details are handled.

#### Acceptance criteria

1. WHEN a Visitor opens privacy.html THEN the System SHALL present a privacy policy covering
   what data the callback form collects, how it is used, and how to make a privacy enquiry.
2. WHEN privacy.html is displayed THEN the System SHALL share the same header, footer,
   palette, and theme behaviour as the home page.

---

## Requirement 11 — Testimonials placeholder

**User story:** As the site owner, I want a testimonials area that contains no invented
quotes, so that we stay truthful and add real, consented quotes later.

#### Acceptance criteria

1. WHEN a Visitor views the testimonials area THEN the System SHALL display a clearly marked
   placeholder block.
2. WHEN the testimonials placeholder is displayed THEN the System SHALL NOT contain any
   invented or fabricated quotes or named individuals.

---

## Requirement 12 — Visual design, motion, and theming

**User story:** As a Visitor, I want a calm, trustworthy, and beautiful experience, so that I
feel reassured and in control.

#### Acceptance criteria

1. WHEN any page is rendered THEN the System SHALL use a fresh teal and mint palette (with
   gradient pill buttons and a radial hero glow), Fraunces for headings, Inter for body text,
   and an 18px base font size.
2. WHEN the hero is rendered THEN the System SHALL display staggered fade-in text over a
   softly floating illustrated background of a nurse caring for a patient at home at 10–15%
   opacity.
3. WHEN a section scrolls into view THEN the System SHALL apply a scroll-reveal fade.
4. IF the Visitor has `prefers-reduced-motion: reduce` set THEN the System SHALL disable or
   minimise all non-essential motion, including hero float and scroll-reveal.
5. WHEN UI components are rendered THEN the System SHALL use rounded cards, soft shadows, pill
   buttons, and generous spacing.
6. WHEN a Visitor toggles the theme THEN the System SHALL switch between light and dark mode
   and SHALL respect the Visitor's OS colour-scheme preference on first load.
7. WHEN the site is viewed on a mobile viewport THEN the System SHALL present a mobile-first
   layout with the sticky tap-to-call header.

---

## Requirement 13 — Compliance and DVA wording verification

**User story:** As the site owner, I want all DVA claims verified and compliant, so that we
avoid misrepresentation and meet DVA expectations.

#### Acceptance criteria

1. WHEN DVA-related wording is present anywhere on the site THEN the System SHALL use only
   Procare Nursing's own branding and SHALL NOT display the DVA logo.
2. WHEN describing Procare's relationship with DVA THEN the System SHALL NOT use the phrase
   "preferred provider".
3. WHEN the site is prepared for launch THEN the project SHALL include a documented step to
   verify all DVA wording against https://dva.gov.au before go-live.
4. WHEN eligibility wording is shown THEN the System SHALL state that eligibility depends on
   the Veteran Card and assessed clinical need, that White Card coverage is confirmed with
   DVA before care starts, and that DVA-covered services have no out-of-pocket cost to
   eligible clients.

---

## Requirement 14 — Editable configuration

**User story:** As the site owner, I want all changeable business details in one place, so
that I can update them without touching layout or logic.

#### Acceptance criteria

1. WHEN business details change THEN the System SHALL source company name, phone, ABN,
   suburbs, hours, and email addresses from a single Config block.
2. WHEN the Config block is edited THEN the System SHALL update every place those values
   appear (header, hero, sections, footer) from that single source.
3. WHEN the Config block is defined THEN the System SHALL keep it separate from presentation
   and clearly commented for a non-developer.

---

## Requirement 15 — Accessibility and performance quality

**User story:** As any Visitor, including those using assistive technology, I want a fast,
accessible site, so that I can use it regardless of ability or device.

#### Acceptance criteria

1. WHEN the site is evaluated THEN the System SHALL meet WCAG 2.1 AA, including colour
   contrast, keyboard operability, visible focus, and correct semantic structure.
2. WHEN images convey meaning THEN the System SHALL provide descriptive alt text, and
   decorative images SHALL be hidden from assistive technology.
3. WHEN the site is audited with Lighthouse THEN the System SHALL score 90+ for both
   performance and accessibility.
4. WHEN forms are rendered THEN the System SHALL associate every input with a visible,
   programmatic label.
5. WHEN interactive elements receive keyboard focus THEN the System SHALL show a visible focus
   indicator and support operation without a mouse.

---

## Requirement 16 — Build, hosting, and deployment

**User story:** As the site owner, I want the site hosted securely on our domain from our
GitHub repository, so that it is reliable and maintainable.

#### Acceptance criteria

1. WHEN the production site is built THEN the System SHALL use a Tailwind CSS production build
   (not the CDN) with vanilla JavaScript and static HTML.
2. WHEN the site is deployed THEN the System SHALL be hosted from the project's GitHub
   repository via GitHub Pages or Netlify.
3. WHEN the site is served THEN the System SHALL be available over HTTPS at
   procarenursing.com.au.
4. WHEN deployment is prepared THEN the project SHALL document the DNS steps required to point
   procarenursing.com.au at the host.
