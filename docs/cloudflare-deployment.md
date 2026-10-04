# Cloudflare Pages deployment

Selected hosting: Cloudflare Pages, with source in the existing GitHub repository. No VPS changes are part of this deployment.

## Git integration

- Repository: MaximilianoFabris/wahooracing
- Framework preset: None
- Build command: `npm run build && npm test`
- Build output directory: `dist`
- Root directory: repository root (leave blank)
- Environment variable: `NODE_VERSION=22`
- Select the actual uploaded release branch. Current local branch: `website/initial-prototype`.
- Scope the Cloudflare GitHub application to this repository only.

Only the generated `dist` directory is hosted. Do not upload the repository root, `.preview`, provenance documents, engineering sources or credentials as static assets. The committed WebP and SVG assets are sufficient to build; asset-preparation Python scripts are not part of the cloud build.

## Verification before domain connection

Check the assigned pages.dev URL, homepage, hull study, article galleries, journal filters, mobile navigation and a missing route. A missing route must return HTTP 404. Confirm the security headers in `public/_headers` appear on hosted responses. The root `404.html` prevents Pages from treating the site as a single-page application. Noindex headers apply to pages.dev previews, not the custom domain.

## Domain connection

First add `www.wahooracing.com` in the Pages project's Custom domains area, then use its assigned CNAME target in Hostinger DNS. Do not guess the target or change DNS before the project exists. An externally managed subdomain can retain Hostinger nameservers.

For the apex `wahooracing.com`, Cloudflare Pages requires the domain to be a Cloudflare zone. If moving nameservers, first inventory and preserve the full zone, including mail and verification records, and check DNSSEC requirements. Domain registration can remain at Hostinger. Choose the apex approach separately before DNS changes; do not assume that connecting www also connects the apex.

## Updates and rollback

Publish through commits to the chosen production branch. Preview other branches before promoting changes. Keep the previous successful deployment available for rollback in Cloudflare. GitHub authentication and Cloudflare account access are required; never store tokens in the repository.

Official references:
- https://developers.cloudflare.com/pages/configuration/git-integration/
- https://developers.cloudflare.com/pages/configuration/custom-domains/
- https://developers.cloudflare.com/pages/configuration/headers/
- https://developers.cloudflare.com/pages/configuration/serving-pages/
