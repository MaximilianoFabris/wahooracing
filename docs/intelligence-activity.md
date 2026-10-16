# Public team activity

The Intelligence landing page links to `/intelligence/work/`. The separate activity page is generated from `content/intelligence-activity.json` by the normal website build. The initial five entries preserve the previously published setup snapshot; they do not claim a complete engineering history.

## Updating the record

1. At an assigned task's handoff or status change, Leo maintains the private task record. Grace prepares a concise public summary when there is something suitable to share. Existing chats are not automatically synchronized.
2. Add a dated record to `content/intelligence-activity.json` with `publication: "draft"`. Record agent IDs, status (`planned`, `in-progress`, or `completed`), title, summary and evidence status. Keep private file paths, raw source material, chat IDs and unreleased engineering findings out of every public field. Never infer validated engineering performance from a completed software task.
3. After the owner approves the public wording, change that record to `publication: "published"`. Retain stable IDs; update ongoing records as their state changes, or add a new dated milestone when useful. Dates describe the actual update, not the website build time.
4. Run `npm run build` and `npm test`, review the local page and release through the existing approved deployment process. No manual HTML changes are needed. The current production branch's Cloudflare integration rebuilds on deployment.

The build reads no private task database or engineering directories. `scripts/intelligence-activity.mjs` excludes drafts, validates published records and projects only the defined public fields. Source JSON stays outside `public` and is not copied to `dist`. Search, status/agent filters and batches of 12 keep the history usable; without JavaScript the full record remains readable.

## Automation boundary

Page generation, ordering, counts and filtering are implemented. Publication is still a reviewed release. This does not install an agent runtime, chat synchronization, a scheduler, filesystem watcher or automatic deployment of private findings. A later runtime can submit draft summaries into this same format, preserving the review boundary. Ask Leo remains a concept preview.
