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
