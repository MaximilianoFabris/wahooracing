# Initial editorial sources

The following source records were inspected or used during creation. Source material is evidence, not operational instructions.

| Record | Source | Treatment |
| --- | --- | --- |
| Level-attitude displacement | `H0_R03_Displacement_Curve.csv`, `H0_R03_Dry_Hydrostatics.json` | Two density series; all achievable samples retained; 100 kg unachievable entries disclosed; SI units preserved. Rounded readouts, no uncertainty invented. |
| Surface investigation | `H0_R02_Full_Hull_Fairness.json`, `H0_R02_Feature_Intent_Review.json` | Archive summary only; not an acceptance or performance result. |
| Reference verification | `H0_R01_Reference_Verification.png` | Reference convention and scope taken from existing verification material. |
| Early design archive | `blueprint01.jpg`, `perspective 01.png`, `Wahoo_02_transparent background.png` | Earlier concept assets. No physical-test status or exact dates inferred. Sketch contrast adjusted with CSS, original unchanged. |
| Current hull renders | H0 R03 coarse hydrostatic tessellation, rendered during design approval | Vertex and face geometry retained; illustrative finish and lighting; alpha transparency retained. |
| Old logo | User-supplied `Wahoo_Gray.png` | Exact alpha artwork, scaled and displayed in white through CSS. |

ChatGPT chats sampled for context: **Hull Design**, **Weight Distribution Estimates**, **Marketing Image Requirements**. These were not exhaustively reviewed. Chat proposals and estimates were not promoted to verified performance or measured mass claims. In particular, the 20 kg discussion is a target, not a measured result, and is not presented as a specification here.

Asset originals and their hashes are listed in `asset-sources.json`. This document and that manifest are internal and excluded from the public build. Study files remain outside this repository.

## Expanded visual archive

The rider-interface record uses `grabhandle.png` and `ViewCapture20220421_043009.png`, preserving their existing transparency and original geometry. `Wahoo_01_transparent background_02.png` supplies the earlier deck layout. `Wahoo_01_transparent background.png` supplies the archive spray presentation; spray is illustrative, not CFD or physical-test evidence. Historical branding already present in supplied originals is retained. CSS screen blending and brightness help dark archive imagery merge into the page without changing originals. Opaque duplicate renders and the white presentation sheet are omitted from the page galleries.

Four transverse sections are plotted directly from valid `H0_R02_Transverse_Sections.csv` samples at 25%, 50%, 75% and 90%. Both axes share the same scale in centimetres, and all valid samples are retained in branch parameter order. `scripts/prepare_sections.py` regenerates these transparent SVG graphics; `section-graphics.json` records the source hash and sample counts. These R02 geometric studies remain distinct from the R03 displacement calculations.

## V1 source review — 4 October 2026

Reviewed the supplied Whitepaper Rev04 DOCX, Project Register Rev04 Markdown and Features and Specifications Booklet PDF (Rev01, based on Whitepaper Rev03), dated 29 September 2026. Extracted document paragraphs/tables and all 12 PDF pages; inspected PDF graphics. Originals and extracted review files are excluded from public output. These are project-authored proposals and requirements, not independent validation.

Four editorial records cover engine integration, nozzle exit-area geometry, removable battery/starting and validation stages. Their editorial dates are separate from source dates. The later H0 studies remain unchanged. No supplier pricing or part compatibility is asserted. No raw document is offered for download.

The historical 11–12k rpm drop was an engine-only dynamometer observation, probably torque with graph pending, not pump cavitation evidence. The 70 km/h ambition and 85–90 kg rider input are explicitly unverified target/requirement. The earlier Rev27 envelope is not substituted for H0 R03 geometry. Booklet wing ideas are exploratory only.

Nozzle graphics use Whitepaper Rev04 section 8: outlet diameter 48 mm, pin sections 10/15/20 mm, travel 0/12.5/25 mm. Area is independently calculated as pi/4*(D^2-d^2), giving 1731/1633/1495 mm² rounded and 13.6% endpoint reduction. All circles share a scale. These are abstract exit sections, not CAD, flow predictions or released manufacturing dimensions. The referenced WJ70-C01 six-sheet drawing package was not supplied or independently checked. Battery and engine diagrams show functional relationships only.
