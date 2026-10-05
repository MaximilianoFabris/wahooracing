# Rev01 — Claude Design integration

Status: user approved deployment of this revision on 5 October 2026. Further visual refinement toward the Claude reference remains future work.

## Recovery and separation

- Production branch: `website/initial-prototype`, baseline `3aa9a29240bbb5c68bbd4905b8004f3f1f894afa`.
- Separate working branch: `rev01/claude-redesign`, in the sibling `wahooracing-rev01` checkout.
- Pre-redesign backup: `../_Website_Backups/pre-rev01-20261005-183501/`. Includes a verified Git bundle, source archive, built website, previous landing preview, checksums and restoration instructions.
- Local preview: `http://127.0.0.1:4181`. The existing production checkout and Cloudflare deployment are unchanged.

## Design adaptation

Reference package: `Wahoo Racing website pages.zip`, supplied by the user. Its extracted design reference remains in ignored `.preview/claude-source/`; it is not deployed.

The redesign uses Claude's Barlow/Barlow Condensed typography, shaded brand opening, steel-blue palette, large uppercase headings, system grid, editorial articles, numbered sections, evidence metadata, contents navigation and open ruled layouts. Fonts are self-hosted under their included SIL Open Font License.

General overview pages use the light palette. Journal, engineering system pages, articles and the drawing viewer use Claude's night palette across the whole page. This preserves the legibility of existing transparent figures without adding background panels or altering scientific colours. Theme switching is not included in this first revision.

The homepage section selector is rebuilt from all branches of the existing four SVG section exports. The numerical displacement control uses the existing source JSON. No geometry, force result, date or validation claim has been invented.

Claude's prototype placeholders and older journal snapshot are not used as the content source. The current static generator and all its engineering visual modules remain authoritative. The pages do not depend on Claude's prototype runtime, React, a CDN or an external font request.

## Preservation audit

`node scripts/rev01-content-check.mjs ../wahooracing` compares Rev01 with the original checkout and built site:

- 123 prior routes retained.
- 28 published records retained across 103 journal and system-context article routes.
- Seven source content files unchanged after normalizing Git checkout line endings.
- 90 existing assets retained byte for byte.
- 1,991 article prose, table, caption, list and generated-SVG elements retained exactly.
- 363 article image occurrences and 1,801 article links retained.
- One draft remains excluded.

The generated report is `.preview/rev01-content-audit.json`. These checks concern the existing published website; private source engineering files are not copied into the public website.

## Verification

- Static build, local references, page landmarks and draft exclusion.
- Section boundaries, reading order and three real email contact actions.
- Existing browser regression suite at 320, 390, 768 and 1440 pixels, including filters, reduced motion, diagrams and viewer zoom.
- Navigation browser suite: exact drawing return, disclosure restoration and unsafe-return fallback.
- Rev01 browser checks: ten page families on desktop/mobile, images and self-hosted fonts, original section coordinates, numerical chart control, article contents and hull subsection navigation.
- Screenshots and browser report in `.preview/rev01/`.

Use `CHECK_BASE=http://127.0.0.1:4181` for browser checks. `PLAYWRIGHT_MODULE` can point to the installed Playwright package. To serve, build first and run `scripts/serve.mjs` with `PORT=4181`.

The user approved this revision for production on 5 October 2026. Publish through the existing Cloudflare Pages production branch. No VPS changes are part of this work.

