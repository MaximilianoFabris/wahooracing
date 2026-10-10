# Image manager

Double-click `Start Image Manager.cmd` in the website repository. Keep its window running while editing. It opens http://127.0.0.1:4176/admin/ on this computer, without a login.

1. Images are grouped by page, with Landing page first. Every placement is shown separately, including repeated placeholders. Each shows pixel dimensions, aspect ratio and file size.
2. Drop a JPG, PNG or WebP onto a placement, or choose a file. It saves automatically, refreshes the preview and metadata, and updates the local website. Only that placement changes.
3. The editor converts the upload to WebP and preserves the prior file under `.image-admin-backups/`. Responsive versions update together. Landscape/portrait crops follow the existing page layout; inspect the linked section before publishing. Original marketing and history source images are preserved; replacements live under `public/assets/managed/`.
4. Click **Publish saved images**. The editor builds and checks the site, commits the changed photo files and pushes the production branch. Cloudflare then builds the live site. Existing Git authentication is used; credentials are not exposed in the page.

The public `/admin/` page lists the library. Saving and publishing run only through the local manager on `127.0.0.1`. It rejects requests from other origins and only accepts the catalogued photo paths. No public upload endpoint exists. The catalog includes all marketing and history photo placements, including Investors. Scientific evidence diagrams and approved logo files are maintained separately.

Backups remain local and excluded from Git and hosting. Preserve these alongside the website source when archiving it.
