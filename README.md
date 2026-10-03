# Wahoo Racing

The first website: a static engineering journal built from the approved charcoal, blue and white design. No runtime framework, database, third-party CDN or production service is required.

## Run locally

Use Node.js 20 or later:

```sh
npm run build
npm test
npm start
```

Open http://127.0.0.1:4173. Set `PORT` to choose another local port. The server listens on loopback only and serves `dist`, never engineering folders or source content.

## Content and assets

- `content/site.json`: site metadata and systems. Replace `contactEmail` only when a public address is approved; the first version does not expose an invented contact route.
- `content/updates.json`: development records. Only `status: "published"` records are built. A draft example is included and excluded from output.
- `content/displacement.json`: curated numerical samples from the actual H0 R03 CSV.
- `public/assets/`: optimised presentation assets only. Do not place raw CAD, private reports, unpublished media, credentials or original datasets here.
- `docs/asset-sources.json`: internal source paths and original-file hashes; not copied to the public output.
- `scripts/build.mjs`: page templates, navigation and chart markup.
- `public/styles.css` and `public/app.js`: appearance and progressively enhanced interactions.

The original supplied `Wahoo_Gray.png` has alpha transparency. Its exact artwork is resized and shown in white using CSS; no substitute logo or brand font was invented. Replace `public/assets/logo.png` when the new approved logo is available, retaining transparency and checking its aspect ratio.

Historical board images are clearly labelled as archives; they are not presented as the current assembly. Unconfirmed archive dates remain unconfirmed. Current hull renders come from the actual R03 tessellation, with illustrative materials and studio lighting. Decorative water lines are not CFD results.

## Adding a development record

Keep a unique, stable `slug`, `title`, `date` (ISO date or null), honest `dateLabel`, `revision`, `summary`, system slugs, update `type`, `evidence`, and `status`. Add ordered `sections` with plain-text title/text, optional hero and gallery assets, `sources`, and a `changes` note. Use the existing entries as examples.

Record the investigated question, what changed and why, findings and limitations, and next steps. Retain older published entries. Link corrections and follow-up studies rather than silently rewriting the project's history. Keep design targets, calculated estimates, simulations and measured physical tests distinct. Never infer performance gains from a revision number.

The optional `chart: true` field currently embeds the specific H0 R03 displacement study. Do not reuse it for another dataset. The structured files and build filter allow a future private publishing interface without changing the public content model.

## Verification

`npm test` checks all generated local references, page landmarks and draft exclusion. `scripts/browser-check.mjs` uses Playwright with Microsoft Edge to verify view switching, journal filters, chart readouts, mobile navigation, reduced motion, transparent graphic surfaces, responsive overflow and the 404 response. Install Playwright in a development environment or supply `PLAYWRIGHT_MODULE` pointing to an existing installation; `BROWSER_CHANNEL` can select another installed Chromium channel. Run this with the local preview server active. Screenshots and results are written to ignored `.preview/`.

## Scope of this version

Includes home, image-based board exploration, 11 system pages, the Hull & Hydrodynamics study, four development articles, journal filters, history, roadmap and support information. System pages without reviewed evidence have explicit empty states. The support page does not collect money or imply a live offering. Contact details remain pending. No analytics or third-party tracking is included.

Interactive assembly 3D, detailed component disclosures, a private publishing interface and confirmed public contact channels remain future enhancements. More source documents and chat history can be curated incrementally; this version does not claim to have reviewed the full archive.

## Future Hostinger deployment

No VPS, DNS, proxy, firewall or shared service has been touched. Deploy only after a read-only review of the existing VPS and approval of the concrete plan. Prefer a dedicated release directory such as `/srv/wahoo-racing/releases/<release>` with an atomic `current` symlink and a domain-specific virtual host serving `dist`.

Reuse the existing proxy only after checking its configuration. If containers are preferred, use a uniquely named `wahoo-racing-web` service, its own network and storage, verified non-conflicting port, resource limits and separate logs. This static version needs no database or application secrets. Keep backups of content and curated assets plus previous release directories for rollback. Do not perform server-wide upgrades, restarts or cleanup. The local preview server is not the production server.
