# Social review gallery

The owner requested a public review gallery at `/preview/social-cards/`, linked from both existing Review Pages hub routes. It uses the shared header, footer, typography and day/night palette. All ten social posts remain `OWNER_REVIEW`; website review publication grants no Instagram posting approval. The latest relaunch Rev03 batch (seven posts, 21 cards) comes before the earlier creative trial Rev04 (three posts, nine cards).

`content/social-cards.json` is an explicit projection of public display fields only. The two source packages have different schemas; only post ID/title/format, revision/review status, card URLs/alt text, exact caption and hashtags were selected. No package, source evidence, private notes, raw source JSON or workspace path is copied into public output. The 30 PNGs are byte-identical exports under `public/preview/social-cards/images/`. The source correspondence and SHA-256 receipt live in `docs/social-cards-source-receipt.json`, outside public output. Content and docs are not copied into `dist`.

`scripts/social-cards.mjs` renders all images and full copy as static HTML. Native horizontal scrolling and scroll snap work without JavaScript; each image links to the full original and has a download link. Optional external JavaScript adds previous/next controls, position, arrow/Home/End keys when the carousel itself has focus, and an explicitly clicked clipboard button. It copies the same visible text node; if clipboard permission is unavailable, it selects that visible text and explains manual copying. There is no hidden caption version. Images after the first use lazy loading and asynchronous decoding; 1080×1440 dimensions reserve the correct space. Navigation uses no animation and respects reduced motion. No new runtime dependency is required.

The route inherits `noindex, nofollow, noarchive` metadata and `/preview/*` response headers. It is public with no authentication, as requested; search directives do not provide access control. The hub gains a small exact artwork thumbnail for this entry while retaining the Simulator V2 piston visual unchanged.

`npm run build` followed by `npm test` checks route references, unchanged simulator saved data, exact image counts/bytes/hashes/dimensions, allowlisted field schemas, exact source captions/hashtags/alt text when the source packages are present locally, full visible/copy text parity and private-field exclusion. The fixed source receipt keeps byte verification portable when the original packages are absent.

Journal decision: **NO CHANGE**. Existing published journal sources (including simulator evidence/next gates and motion correspondence records) were inspected. This gallery presents existing draft social artwork and adds navigation; it adds no source-backed engineering investigation or result.

Intelligence activity decision: **NO CHANGE**. The existing published activity register, including source-bound simulator registers and stored-study review, was inspected. Owner review access is a presentation change, with no new engineering milestone or changed evidence status. This follows the standing explicit rule that access/navigation changes alone do not create journal/activity entries. Existing journal and activity records are unchanged.

Desktop/mobile browser and theme verification belongs to the release review. Automated checks do not substitute for that inspection.

## Transparent drawing correction — 24 October 2026

Relaunch Rev04 replaces only P01-04 and P04-01 with the same concept illustration prepared as a genuine alpha layer. The full social-card backgrounds remain intentional. Other 19 relaunch exports and all captions/hashtags are unchanged. This is a concept-presentation derivative, not new CAD or qualified engineering evidence. The initial `relaunch-rev03` batch and anchor IDs remain stable for shared mobile links; displayed revision and source correspondence are Rev04. Two previous PNG URLs remain as an explicit, hash-checked historical allowlist in the private source receipt. No diagram source or private alpha-edit package is published.
