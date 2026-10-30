# Feature Specification: Developer Portfolio

**Feature Branch**: `001-developer-portfolio`

**Created**: 2026-10-30

**Status**: Draft

**Input**: User description: "Personal developer portfolio for Thanuja (GitHub ThanujaR12) that showcases GitHub projects to recruiters and companies, with owner curation and a grounded AI "Ask me" chatbot. Use all decisions in docs/decisions.md (deep-space glass theme, single-page home + project case-study pages, featured spotlight + filterable grid, hero prompt + floating chat panel, GitHub sync with pending-review for new repos, admin via GitHub sign-in allowlisted to ThanujaR12, free-only services, resume page, contact)."

## User Scenarios & Testing *(mandatory)*

Actors:
- **Visitor** — a recruiter, hiring manager, or engineer evaluating Thanuja. Anonymous, often on a phone, often short on time.
- **Owner** — Thanuja, the only person who can curate content.

### User Story 1 - Recruiter scans the portfolio and finds the best work (Priority: P1)

A recruiter opens the portfolio link from a resume or message. Within seconds they see who Thanuja is, a one-line positioning statement, and the 2–3 featured projects presented as large spotlight cards. They scroll through a single page — featured work, all projects, skills, about, contact — using a sticky navigation bar to jump between sections. They filter the full project grid by technology (e.g. "React", "AI") and sort it (most recent, featured first).

**Why this priority**: This is the core reason the site exists. Without it there is no portfolio; every other story builds on it.

**Independent Test**: Load the home page with seeded project data; confirm a first-time viewer can name Thanuja's focus and open a featured project in under 10 seconds, and that filtering the grid by a technology shows only matching projects.

**Acceptance Scenarios**:

1. **Given** a visitor lands on the home page, **When** the page finishes loading, **Then** the hero shows Thanuja's name, positioning line, primary "Explore work" action, and an "Ask me anything" prompt, all above the fold on desktop and on a 375px-wide phone.
2. **Given** published projects exist, **When** the visitor scrolls to Featured, **Then** the owner's featured projects (max 3) appear as spotlight cards with screenshot, title, one-line summary, and top technologies.
3. **Given** the full project grid, **When** the visitor selects a technology chip, **Then** only projects using that technology remain, the active filter is visible, and clearing it restores all projects.
4. **Given** any section of the home page, **When** the visitor clicks a nav item, **Then** the page scrolls smoothly to that section (instantly if reduced motion is preferred) and the nav item shows as active.

---

### User Story 2 - Visitor reads a project case study (Priority: P1)

From any project card the visitor opens a dedicated project page with its own shareable link. The page tells the project's story: the problem, what was built, Thanuja's role, key features/highlights, technologies, screenshots, and links to the live demo and source code. They can move to the previous/next project or back to the grid without losing their place.

**Why this priority**: Recruiters and engineers judge depth on the case study, and a shareable link lets them forward a specific project to colleagues.

**Independent Test**: Open `/projects/<slug>` directly for a seeded project and confirm all case-study sections render, links work, and the page has a correct shareable title and preview image.

**Acceptance Scenarios**:

1. **Given** a published project, **When** the visitor opens its page, **Then** they see the summary, problem, role, highlights, technologies, screenshots (if any), source link, and live-demo link (if any).
2. **Given** a project with no curated extras yet, **When** its page is opened, **Then** it falls back to GitHub data (description, languages, README excerpt) and still looks complete.
3. **Given** a project page link is shared in a chat or social app, **When** the link previews, **Then** it shows the project title, summary, and an image.
4. **Given** a hidden or unknown project slug, **When** opened, **Then** a styled "not found" page offers a route back to all projects.

---

### User Story 3 - Visitor asks the AI about Thanuja's experience (Priority: P2)

The visitor types a question into the hero prompt or opens the floating "Ask AI" button available on every page, which slides out a chat panel with suggested starter questions (e.g. "What's the strongest project?", "Has Thanuja used React?"). The assistant answers in a few sentences using only portfolio content, links the projects it drew from, and says plainly when it does not know.

**Why this priority**: It is the differentiator that makes the portfolio memorable and saves recruiters time, but the portfolio is still valuable without it.

**Independent Test**: With seeded content, ask a covered question and an uncovered one; confirm the first is answered with at least one project link and the second gets an honest "I don't have information on that" plus a suggestion to use the contact section.

**Acceptance Scenarios**:

1. **Given** the hero prompt, **When** the visitor submits a question, **Then** the chat panel opens and streams an answer that cites at least one relevant project as a clickable link.
2. **Given** a question outside the portfolio content (e.g. salary expectations, unrelated trivia), **When** asked, **Then** the assistant declines politely and points to the contact section, without inventing facts.
3. **Given** the AI service is unavailable or the visitor hits the usage limit, **When** they ask, **Then** they see a friendly message and the contact option, and the rest of the site keeps working.
4. **Given** the panel is open, **When** the visitor presses Escape or the close control, **Then** it closes and focus returns to where it was.

---

### User Story 4 - Owner curates projects synced from GitHub (Priority: P2)

The owner signs in to the admin area with their GitHub account. They see every public repository from GitHub, grouped as Published, Hidden, and Pending review. New repositories appear in Pending review and are never public until approved. For each project the owner can publish/hide it, mark up to 3 as featured, reorder projects, and add curated extras: display title, one-line summary, problem, role, highlights, screenshots, live-demo link, and technology tags. Changes appear on the public site within a minute.

**Why this priority**: Keeps the portfolio current as new projects are added, which was a core goal, but the initial launch can run on seeded content.

**Independent Test**: Sign in as the owner, approve a pending repository and mark it featured; confirm it appears in Featured on the public site. Sign in as any other GitHub account; confirm access is refused.

**Acceptance Scenarios**:

1. **Given** a new public repository is created on GitHub, **When** the next sync runs (automatic at least daily, or on-demand via a "Sync now" action), **Then** it appears in Pending review and not on the public site.
2. **Given** the owner publishes a project and adds a summary and screenshot, **When** a visitor reloads the site, **Then** the project appears with that content within 60 seconds.
3. **Given** someone other than `ThanujaR12` attempts to sign in or call admin actions, **When** they try, **Then** access is refused and no change is made.
4. **Given** a repository is deleted or made private on GitHub, **When** sync runs, **Then** it is removed from the public site and flagged to the owner.

---

### User Story 5 - Visitor views the resume and gets in touch (Priority: P3)

The visitor views the resume on its own page (readable in-browser) and downloads it as a PDF. In the contact section they find email, GitHub, and LinkedIn links, and can send a short message through a contact form that reaches the owner's inbox.

**Why this priority**: Converts interest into contact; simple to deliver once the rest exists.

**Independent Test**: Open `/resume`, download the PDF; submit the contact form with valid input and confirm the owner receives it; submit invalid input and confirm helpful errors.

**Acceptance Scenarios**:

1. **Given** the resume page, **When** the visitor clicks Download, **Then** the current resume PDF downloads.
2. **Given** the contact form, **When** the visitor submits name, email, and message, **Then** they see a confirmation and the owner receives the message.
3. **Given** missing or invalid fields, **When** submitted, **Then** each problem is described next to its field and nothing is sent.
4. **Given** repeated automated submissions, **When** they exceed the limit, **Then** further submissions are blocked without bothering legitimate visitors.

---

### Edge Cases

- GitHub is unreachable or rate-limited during sync: the public site keeps serving the last good data; admin shows when the last successful sync happened.
- A repository has no description, no README, or no languages: the card and case study still render with sensible placeholders, and admin flags it as "needs content".
- Zero published projects: the home page shows a tasteful "Projects coming soon" state instead of empty sections.
- Fewer than 3 featured projects: the Featured section adapts its layout to 1 or 2 cards; with none, it is hidden.
- Forked repositories: synced but defaulted to Hidden in Pending review so the owner decides.
- Very long titles/summaries: truncated gracefully on cards, shown in full on the case study.
- Visitor uses keyboard only, a screen reader, or prefers reduced motion: all features remain usable; animated grid and glow effects are disabled or reduced.
- Visitor on a slow connection: content is readable before decorative effects and images load.
- Prompt-injection attempts in chat (e.g. "ignore your instructions"): the assistant stays within portfolio content.
- Owner's session expires mid-edit: unsaved changes are not silently lost; the owner is asked to sign in again.

## Requirements *(mandatory)*

### Functional Requirements

**Public site & navigation**
- **FR-001**: The site MUST provide a single scrolling home page with sections in this order: Hero, Featured, All Projects, Skills, About, Contact.
- **FR-002**: The site MUST show a sticky navigation bar with links to each home section plus Resume and Ask AI, highlighting the section currently in view, and collapsing to a menu on narrow screens.
- **FR-003**: The visual design MUST follow the "deep-space glass" theme: deep navy-black background, faint animated grid, frosted-glass cards, cyan-to-violet gradient accents and hover glow, generous spacing.
- **FR-004**: Decorative motion MUST be disabled or minimized when the visitor prefers reduced motion, and MUST never block reading or interaction.

**Projects**
- **FR-005**: The Featured section MUST show up to 3 owner-selected projects as large spotlight cards with screenshot, title, one-line summary, and top technologies.
- **FR-006**: The All Projects grid MUST list every published project with filter chips by technology (multi-select) and sort options (featured first, most recent, alphabetical).
- **FR-007**: Each published project MUST have its own case-study page at a stable, human-readable, shareable URL.
- **FR-008**: A case-study page MUST show: title, summary, problem, Thanuja's role, highlights, technologies, screenshots, source link, live-demo link (when provided), and last-updated date; with previous/next project navigation.
- **FR-009**: Where curated content is missing, the site MUST fall back to GitHub data (description, languages, README excerpt, topics).
- **FR-010**: Each page MUST provide accurate title, description, and preview image metadata for link sharing and search engines.

**Skills & About**
- **FR-011**: The Skills section MUST group technologies (e.g. Languages, Frontend, Backend, AI/Data, Tools) and selecting a skill MUST filter the project grid to projects that use it.
- **FR-012**: The About section MUST present a short bio, photo, current focus, and education/experience highlights, editable by the owner.

**AI assistant**
- **FR-013**: The site MUST offer an "Ask me anything" prompt in the hero and a floating Ask AI button on every page that opens a chat side panel with 3–4 suggested questions.
- **FR-014**: The assistant MUST answer only from portfolio content (published projects, their READMEs, About, resume) and MUST link the projects it used.
- **FR-015**: The assistant MUST state when the content does not cover a question and suggest the contact section, rather than guessing.
- **FR-016**: The assistant MUST limit usage per visitor (default 20 questions per hour) and show a friendly message when the limit or service availability prevents an answer.
- **FR-017**: Chat conversations MUST NOT require visitor sign-in and MUST NOT store personal data beyond what is needed for rate-limiting.

**Owner curation**
- **FR-018**: The admin area MUST be accessible only after GitHub sign-in by the account `ThanujaR12`; every admin action MUST verify this on the server.
- **FR-019**: The system MUST sync public repositories of `ThanujaR12` automatically at least once a day and on demand via "Sync now".
- **FR-020**: Newly discovered repositories MUST enter "Pending review" and MUST NOT be public until the owner publishes them; forks default to hidden.
- **FR-021**: The owner MUST be able to publish/hide, feature (max 3), reorder, and edit curated fields (display title, summary, problem, role, highlights, technology tags, live-demo link) for each project.
- **FR-022**: The owner MUST be able to upload and reorder screenshots per project, and choose a cover image.
- **FR-023**: The owner MUST be able to edit About content and replace the resume PDF.
- **FR-024**: Published changes MUST appear on the public site within 60 seconds.
- **FR-025**: The admin area MUST show last sync time, sync errors, and projects flagged as "needs content" or "removed from GitHub".

**Resume & contact**
- **FR-026**: The site MUST provide a resume page that displays the resume in-browser and offers a PDF download.
- **FR-027**: The Contact section MUST show email, GitHub, and LinkedIn links and a contact form (name, email, message) that delivers messages to the owner's inbox.
- **FR-028**: The contact form MUST validate input, confirm success, and block abusive or automated submissions without a CAPTCHA puzzle for normal visitors.

**Quality**
- **FR-029**: All features MUST be fully usable by keyboard and screen reader and meet WCAG 2.2 AA.
- **FR-030**: Layouts MUST work from 320px width up with no horizontal scrolling.
- **FR-031**: The site MUST operate on free service tiers only, with no recurring cost.

### Key Entities

- **Project**: A portfolio entry linked to one GitHub repository. GitHub-sourced: repository name, description, languages, topics, stars, last updated, README, URL, fork flag. Curated: slug, display title, summary, problem, role, highlights, technology tags, live-demo link, screenshots (ordered, with cover), status (pending / published / hidden), featured flag, display order, flags (needs content, removed from GitHub).
- **Screenshot**: An image belonging to a project, with alt text and position.
- **Skill**: A technology name with a category; linked to the projects that use it (derived from languages/topics plus owner tags).
- **Profile**: Owner's name, positioning line, bio, photo, current focus, education/experience highlights, social links, resume file.
- **Sync Run**: Time, outcome, counts of new/updated/removed repositories, error message if any.
- **Contact Message**: Sender name, email, message, time received (delivered to the owner; not displayed publicly).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: In a test with 5 people unfamiliar with Thanuja, at least 4 can state Thanuja's focus and open a featured project within 10 seconds of the page loading.
- **SC-002**: Any project case study is reachable within 2 clicks from the home page.
- **SC-003**: The home page shows meaningful content within 2 seconds on a typical mobile connection, and every public page scores 90+ in standard automated performance, accessibility, best-practice, and search-engine audits on mobile.
- **SC-004**: At least 90% of assistant answers to a test set of 20 portfolio questions are factually consistent with portfolio content and cite a relevant project; 100% of 10 out-of-scope questions are declined without invented facts.
- **SC-005**: A new GitHub repository appears in the owner's Pending review within 24 hours automatically, or within 1 minute after "Sync now".
- **SC-006**: The owner can publish and feature a newly synced project, including summary and screenshot, in under 5 minutes.
- **SC-007**: Zero unauthorized admin changes: 100% of admin actions by non-owner accounts are refused in testing.
- **SC-008**: Monthly operating cost is $0.

## Assumptions

- Only public repositories of `ThanujaR12` are synced; private repositories are out of scope.
- Initial content (bio, positioning line, resume PDF, photo, project summaries) will be provided by the owner; placeholder copy is used until then.
- Light mode is out of scope for v1; the site is dark-themed only.
- English only; no multi-language support in v1.
- Visitor analytics are limited to privacy-friendly, cookie-free page counts (if any); no tracking cookies, so no consent banner is needed.
- The assistant has no memory between visits; each chat session starts fresh.
- Contact messages are delivered by email to the owner; no in-app inbox in v1.
- The portfolio will be deployed to a free hosting tier with a free subdomain; a custom domain can be added later.
- Blog/articles, testimonials, and multiple admin users are out of scope for v1.
