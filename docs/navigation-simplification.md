# Navigation simplification — review preview

Prepared from deployed Rev01 commit `357320c`, in the separate `rev02/simplify-navigation` worktree. Local preview: `http://127.0.0.1:4182/`. User approved deployment on 5 October 2026. Publish through the existing Cloudflare Pages production branch; the prior revision remains recoverable at commit `357320c`.

## Visitor experience

- Home introduces the eleven systems, with one clear link to their index.
- Systems presents components. Each system has one consolidated list of connected studies; repeated study links in feature highlights are removed while their figures and explanatory text remain.
- Journal contains a single collection of 28 studies, in six subject reading sequences. Subject, system and evidence-type filters operate on this one list. Image, title and “read” links no longer repeat the same destination.
- Each study has one permanent `/journal/<slug>/` page and the same previous/next sequence wherever it is opened.
- Entry from Systems retains a return link to that system. Entry from filtered Journal results retains the filters and original record position, including after reading the next study.
- The drawing viewer still restores the exact article and expanded drawing disclosure.
- History, Roadmap, Back Wahoo and the board viewer retain their existing content and section boundaries.

## Address compatibility

There are 47 regular pages plus the error page, reduced from 122 plus the error page. All 75 former system-context article addresses have explicit permanent redirects, with and without trailing slashes. Query parameters carry a return context, not a separate article. Canonical tags identify the permanent page.

The redirect file uses [Cloudflare Pages redirect syntax](https://developers.cloudflare.com/pages/configuration/redirects/). The local server applies the same explicit rules for review. Existing Journal subject hashes remain supported.

## Verification

`scripts/simplification-check.mjs` compares with the deployed checkout: seven source files unchanged, 90 assets byte-identical, and 536 article prose/list/table/SVG/caption elements retained. Every existing article figure and download is preserved. The removed addresses resolve to retained articles; no study is deleted. The audit output is `.preview/simplification-audit.json`.

Main-content links: Home 30 → 20; Journal 103 → 28; Hull 65 → 27. Header and footer navigation are excluded from these counts.

Build and static checks validate 48 generated pages and their local references. Navigation tests cover section boundaries, one reading order, legacy redirects, email actions, filtered returns, unsafe context rejection, disclosure restoration and mobile widths. Browser screenshots are saved under `.preview/navigation/` and `.preview/rev01/`.

Source studies remain the authority. No engineering source files, numerical results or VPS configuration were changed.

