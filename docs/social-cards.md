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


## Throttle carousel and zebra correction - 25 October 2026

Relaunch Rev05 adds five throttle concept cards and replaces only P07-04 with a transparent-background presentation derivative. Other 20 relaunch PNGs and all nine creative-trial PNGs remain unchanged. Gallery: 11 draft posts / 35 cards. Old anchors and three superseded PNG URLs remain available. Public projection contains final cards, captions, tags and alt text only; private sources and alpha-edit provenance remain local/archive. No final controller design or tested functions are claimed. No Instagram publication.

## Compact grid review — 25 October 2026

The default gallery is a three-column Instagram-style post grid. Select a cover to open its existing full artwork, carousel, per-image download and exact caption/hashtag copy in a native modal dialog. Old post anchors open the corresponding preview directly. Escape/Close restore focus to the cover; browser Back closes the preview. Mobile uses a full-screen preview, desktop a two-column dialog; themes and reduced-motion preferences are preserved. Without JavaScript/native dialog support the full accessible post list remains available below the grid. All 35 active PNGs, copy and private source bindings remain unchanged. No third-party dependencies or Instagram publishing were added.


## Engineering stories - 25 October 2026

Three new three-card carousels cover sampled geometry correspondence, the provisional internal-stinger concept and engine/exhaust packaging. Final artwork/copy only are published to the owner-review gallery; numerical source CSV, private evidence and editing files remain local/archive. Existing 35 active cards, captions, grid behavior and stable links are unchanged. Total14posts44cards. No Instagram publication.


## Horizon stories - 25 October 2026

Five new owner-review posts P12-P16 add seven cards: fictional cinematic Leo beach scene, ownership intent, saved synthetic simulator evidence, community question and follow-the-build invitation. Original artwork, captions, grid UI and all existing44 active images remain unchanged. Only final new PNGs and allowlisted copy are public; source assets, prompts and private evidence remain local/archive. No Instagram publication.


## Fresh editorial visuals - 25 October 2026

Horizon Rev02 replaces P14-01/P14-02/P15-01 with previously unused social source graphics/photo. Four other Horizon cards and the prior44 active PNGs are unchanged. First-use audit checks actual card display, aliases and source lineage rather than folder presence or altered crops/colours. New source ledger and workflow rule remain private. Original logos/fonts remain recurring brand identity. Current posts19/cards51; six old image URLs retained as explicit historical allowlist. Original batch/post IDs remain stable. No Instagram publication.


## Assignment18 carousel - 25 October 2026

P17 adds five source-backed cards for owner review. No earlier editorial graphics repeat; source-usage audit and scientific provenance remain private. Five new final PNGs only are public; source packages/data/generators excluded. Earlier51activePNG identities unchanged. Batch links now wrap on small screens as the gallery grows. Total20posts56cards. No Instagram posting. Journal and activity: NO CHANGE; the source A17/A18 milestones were already published, and this is their social presentation.
