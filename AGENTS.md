# Wahoo website guardrails

- Keep website work in this repository. Never modify original CAD, engineering scripts, simulation cases or results in the parent folders.
- No background boxes, cards or panels behind images, charts, diagrams or chart annotations unless the user explicitly requests an exception. Graphics blend directly into the page.
- Preserve the actual board geometry. Never generate a replacement hull. Keep approved branding separate from rendered geometry. Use the final shaded white/black logos in `public/assets/brand/`, with supplied name-only wordmarks for restrained secondary branding. Do not use flat variants or colour-flattening filters.
- Use normal scrolling. Parallax is restrained and limited to decorative/image layers. Articles, technical labels and charts remain stable. Simplify motion on mobile; honour reduced motion fully.
- Preserve development history. Distinguish older concepts from current models and evidence types from one another. Do not invent dates, gains, partners, financial figures or test results.
- Publish only explicitly published content records into build output. Keep private source provenance and raw engineering files out of `public` and `dist`.
- Run the build and appropriate checks after edits. Use the existing independent repository and remote.
- Do not deploy or touch VPS/shared infrastructure without an approved deployment plan. Do not activate payments or invent working contact forms.

- Engine/exhaust and other CAD journal illustrations should use real transparent backgrounds. Prefer native source-geometry renders, preserve original previews, and show the currently selected layout in thumbnails. Never alter geometry to remove an image background.

- For EVERY website update request, Grace checks BOTH the journal and `/intelligence/work/` activity log for new source-backed material, compares against published records, and reports proposed additions/changes or a justified no-change finding to Leo. Read `../../Wahoo_Intelligence/GRACE_WEBSITE_UPDATE_WORKFLOW.txt` and `../../Wahoo_Intelligence/WEBSITE_DESIGN_REFERENCE.txt`. Prepare local drafts/preview first; Leo obtains Max's approval of the concrete public update before publication. Do not repeat approval already given for the same release.
- Preserve the exact current design and established scientific figure treatment. Use the existing article templates and the relevant original graph generator, numerical data and provenance; retain axes, units, sign conventions, histories, colour scales and qualifications. Preserve native transparency and inspect graphics on both themes; no opaque presentation panels, replacement geometry or unrelated restyling. Consult the `Website` chat (`01a10372-9569-7c91-87c3-3ed1da35a721`) for relevant historical decisions, applying newer owner corrections and current approved source first.
