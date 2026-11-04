# Interactive hull explorer · Rev01

Public review route: `/preview/board-3d/`, linked from `/preview/`. The main Board page is unchanged. Uses the existing historical H0 R03 display tessellation, not the pending complete-board model. No footstraps, snorkel, throttle, internal components or functional claims are invented.

The downloadable `hull.bin` is a display-only, centered, uniformly normalized Float32 surface: header (three little-endian uint32: magic 0x57424831, vertex count, index count), contiguous positions, contiguous area-weighted display normals, then uint32 triangle indices. Original CAD, engineering units, source paths, transform provenance, simulation data and source package remain private. This surface is public and recoverable, as any interactive web model must be; noindex is not access control. The owner requested this public basic-model explorer. Keep future unapproved/private parts out of the asset directory.

No new dependencies or external requests. WebGL1 plus OES_element_index_uint is required; unsupported/failed/context-lost graphics show the existing static alpha render. Source geometry is immutable; the private conversion receipt verifies all triangles and inverse-transform Float32 precision. No simulation or mesh simplification runs in the browser.

Controls: pointer orbit; two-touch pinch zoom; focused-canvas wheel zoom; keyboard arrows, plus/minus and Home; named views; range zoom; reset; opt-in automatic rotation. No animation starts by default. Reduced-motion prevents automatic rotation. Hidden tabs pause it. Rendering occurs only on input/resize/theme changes, apart from explicitly enabled rotation. Device pixel ratio is capped at two. Camera fitting adapts to portrait aspect ratio.

Appearance is an approximation of the approved glossy carbon look, not a Blender path-traced render or released material specification. Texture coordinates mirror at the native centerline; source geometry remains deck-up. Display normals, lighting and shader parameters are presentation choices.

To replace the model, prepare a new versioned public-safe display projection locally, record source correspondence privately, review disclosure and materials, update the loader/versioned assets and hash checks, then verify actual desktop/mobile interactions before release. Do not copy complete engineering/CAD archives into `public`.

Validation: `node scripts/board-viewer-check.mjs` plus the existing build/test suite. Private browser reports and screenshots record actual tested states and engine; mobile viewport tests do not establish physical iOS/Safari acceptance.
