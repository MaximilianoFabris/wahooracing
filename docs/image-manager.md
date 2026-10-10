# Image manager

Double-click `Start Image Manager.cmd` in the website repository. Keep its window running while editing. It opens http://127.0.0.1:4176/admin/ on this computer, without a login.

1. Find an image by its name or section. The page shows its current pixel dimensions, aspect ratio, file size and every page or section that shares it.
2. Choose a JPG, PNG or WebP and check the preview and replacement dimensions.
3. Click **Save replacement**. The editor converts the upload to WebP, updates the local website and preserves the prior file under `.image-admin-backups/`. History images update both responsive versions together. Landscape/portrait crops follow the existing page layout; inspect the linked section before publishing.
4. Click **Publish saved images**. The editor builds and checks the site, commits the changed photo files and pushes the production branch. Cloudflare then builds the live site. Existing Git authentication is used; credentials are not exposed in the page.

The public `/admin/` page lists the library and links to the local editor. Saving and publishing run only through the server on `127.0.0.1`. It rejects requests from other origins and only accepts the catalogued photo paths. No public upload endpoint exists. The catalog includes current landing and history photos, including photos shared with Investors. Scientific evidence diagrams and approved logo files are maintained separately.

Backups remain local and excluded from Git and hosting. Preserve these alongside the website source when archiving it.
