# PolicyEngine US Improvements Since 2026-01-01

This workspace stores a reusable inventory of improvements across:

- `/Users/maxghenis/PolicyEngine/policyengine-us`
- `/Users/maxghenis/PolicyEngine/policyengine-us-data`

The source repos are treated as read-only because both have unrelated local changes.

## Workflow

1. Build a raw commit inventory from first-parent git history since `2026-01-01`.
2. Resolve GitHub PR numbers to titles and descriptions using `gh`.
3. Tag each item with broad heuristic themes for browsing and summarization.
4. Surface the results in a Next.js + Tailwind dashboard that uses PolicyEngine design tokens.
5. Generate machine-readable artifacts in `data/`.

## Artifacts

- `data/commit_inventory.json` — normalized changes with resolved PR titles when available.
- `data/theme_summary.json` — aggregated counts by repo and theme.
- `data/cache/prs/` — cached GitHub PR metadata.
- `app/` and `components/` — the interactive dashboard UI.
- `notes/` — written synthesis and repo-level notes.

## Rebuild

```bash
python scripts/build_inventory.py
```

## Run the dashboard

```bash
bun install
bun run dev
```

Then open `http://localhost:3000`.
