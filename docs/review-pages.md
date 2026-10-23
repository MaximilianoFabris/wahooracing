# Public review-page catalog

`content/review-pages.json` is the source catalog. `scripts/review-hub.mjs` exports `reviewHub({pages})` (or accepts the pages array directly) and `reviewHubStylesheet`. The renderer returns body markup for the existing shared Wahoo layout and includes the dedicated external stylesheet. The build integrator renders the same catalog at `/preview/` and `/preview/simulator-v2/`; the latter preserves the previously shared landing URL. Simulator V2 itself is `/preview/simulator-v2/app/`.

To add a page, append a catalog record with unique `id`, `title`, local `url`, `description`, `publication`, `version`, `evidence` and `scope`. Only `publication: "published"` appears; use `draft` while preparing an entry. URLs must be root-relative `/preview/.../` routes, without traversal, external domains or private locations. `visual: "piston"` identifies the current transparent schematic icon; the illustration is a native interface symbol, not a newly qualified CAD model.

Keep descriptions and counts tied to the page's actual published source evidence. Numerical verification must remain distinct from physical validation. Do not put passwords, internal paths, chat identifiers or private provenance into this catalog. Future entries require their own source and publication authorization; adding a manifest row does not itself publish a page.

This hub is public and contains no login, encryption or authentication UI. Existing production Simulator navigation and content are independent. The separate build/deployment integration owns shared footer links and route output; the hub module does not modify those files.
