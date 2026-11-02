# Feature Specification: Impact-led About page and cinematic transitions

**Created**: 2026-11-02 · **Status**: Implemented

**Input**: "Using all the info from these [resume, UT and A&M applications] add numerical numbers and
descriptive wording to emphasize my impact… Rayhan's portfolio looked amazing and the transitions were
very impressive, I need mine to be clean just like that." · "…the transitions between clicking things
and accessing certain parts of the webpage [should] be very futuristic and cool… I feel like I'm just
sliding through."

## Clarifications (2026-11-02)

- Sources: owner's resume and two Common App previews. **Only professional content is used**; personal
  data (address, phone, birthdate, family, income, immigration documents) is never published.
- Conflicting figures resolved by the owner: CampusConnect.AI **62% engagement lift, 200+ students**;
  Thanuja.AI **1,000+** learners; B.A.A. **37% faster client responses, 50% less manual processing**;
  add LinkedIn `linkedin.com/in/thanujarameshbaabu`, keep GitHub `ThanujaR12`.
- About structure follows the reference: Intro (giant headline, photo, impact stats) → Approach
  (Research · Build · Share) → Experience → Wins → Education → Toolkit → Let's connect, with a 01–07
  section tracker.
- Transitions (owner asked for "very futuristic"): route changes close two frosted aurora panels onto
  a glowing AI-gradient beam that shows the destination, then split open while the new page focuses in;
  in-page section links sweep the beam with the section name. All motion off under reduced motion.

## Requirements

- **FR-301** About content lives in `content/about.json` (validated by `aboutFileSchema`) and feeds the
  About page, the home "Impact in numbers" band and the AI guide's grounding corpus.
- **FR-302** Giant section words fill with the AI gradient as they scroll into view; impact numbers
  count up when first seen; screen readers always get the final values.
- **FR-303** Internal link clicks run the aperture transition (~1.2 s); back/forward keeps browser scroll
  restoration; clicked links arrive at the top unless they target a section; a 4 s failsafe reopens.
- **FR-304** Project pages for B.A.A. and CampusConnect.AI state their measured impact.

## Success criteria

- **SC-301** Lighthouse mobile ≥ 90 on all public pages (measured 96–100 / 100 / 100 / 100).
- **SC-302** Zero axe violations on `/about` (aurora-adjacent labels use solid ink for contrast).
