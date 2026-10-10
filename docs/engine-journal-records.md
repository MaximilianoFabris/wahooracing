# Engine and exhaust journal records

The engineering authority is the revision-controlled package under
`W:\_Wahoo Racing\Engineering\_Engine + Exhaust Systems`.
The website is a published record of that work, not an engineering release.
Never change source engineering files as part of website publishing.

## Initial motion-model edition

- Published study: `content/engine-first-moving-model.json`.
- Dated public specification/decision snapshot: `public/assets/engineering/engine-motion-decisions-rev01.json`.
- Source snapshots and SHA-256 manifest: `provenance/engine-motion-rev01/` (not served).
- Interactive website adaptation: `scripts/engine-motion-fragment.html`, `public/engine-motion.js`, `public/engine-motion.css`.
- Thumbnail: `public/assets/engineering/engine-motion-rev01.svg`, plotted from the stored reference cycle.

## Record future decisions

For every changed choice, preserve a stable decision ID, recorded date, previous
choice, new choice, reason, source/revision, evidence status, and affected interfaces.
Use separate labels for project selection, supplier-reported specification,
measurement, calculation, illustrative assumption and unresolved item.
Part records should identify supplier/part/revision, quantity, kit inclusion,
dimensions and units, exact datum, procurement status, and outstanding checks.
Do not infer availability, purchase completion, compatibility or qualification.

Create a new dated snapshot for substantive changes; retain earlier snapshots
and link them from the follow-up. An editorial correction should identify its
reason and source. Do not silently replace historical decisions or manufacturing
specifications. Interface verification, port timing, exhaust geometry, thermal
and gas-dynamics inputs, and validation results need their own evidence records.
The 4 October dates in the initial register mean recorded in that report as of
that date, not independently verified dates of the original decisions.
