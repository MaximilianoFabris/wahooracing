# Owner-approved journal and activity update

Owner reviewed the private WI-016 previews and requested deployment on 16 October 2026.

- CFD-003 motion-envelope article: preserve the original stop and earlier snapshot; add the frozen 11:47 UTC clean numerical guard stop at 29.98 km/h, +195.12 mm heave and 14.34 degrees absolute bow-up. Extend the original transparent heave/pitch plot through all 9,379 accepted samples. The ramp and planned hold remain incomplete; physical stability is unresolved. No full final checkpoint audit or physical validation is claimed.
- Engine-simulation article: add the later roadmap-review recommendations, qualified as recommendations rather than adopted architecture, completed simulations or new measurements.
- Activity record: update the review-workflow milestone and add the consolidated website-release and CFD-review milestones. Historical engineering authorship is not inferred from specialist titles.
- Roadmap: replace the outdated running-continuation summary with the protective-stop status.

Current templates, typography, palettes and scientific figure conventions are retained. Initial CFD publication provenance is preserved separately; current frozen-source hashes are recorded in `cfd003-envelope-publication.json`. Private histories, draft records and review servers are excluded from public output. No solver, monitor, mesh, physics or CAD was changed.

Validation: build and tests pass for 68 pages, 2,262 local references and 62 navigation checks. Private preview checked at desktop/mobile widths, with day/night graph variants, image decoding, activity filters and no observed overflow. Approved release uses the existing production branch/Cloudflare integration; previous commit 7e25889 is the rollback point.
