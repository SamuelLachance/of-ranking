# OF Ranking

Editorial rankings of **real** OnlyFans creators using a multi-factor algorithm with **Human Authenticity Score** as the primary differentiator.

> **Disclaimer:** Profiles use publicly available marketing information only (social bios, promo pages, press). Scores and reviews are editorial estimates — not verified audits. Not affiliated with OnlyFans. We do not scrape OnlyFans.

**Live site:** [https://samuellachance.github.io/of-ranking/](https://samuellachance.github.io/of-ranking/)

## Features

- **Human Authenticity Score (45% weight)** — estimated from behavioral signals
- **Review Score (30%)** — editorial/community estimates labeled as such
- **Sexy Score (25%)** — appeal/presentation estimate
- **Language filtering** — English, French, Spanish, Portuguese, German
- **Static export** — deploys to GitHub Pages (no server required)

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Updating Creators

1. Edit `data/seed-data.json` with new creator entries (public info only).
2. Run `npm run generate-data` to rebuild `data/creators.json`.
3. Commit and push — GitHub Actions rebuilds and deploys automatically.

## Deploy

Pushes to `main` trigger `.github/workflows/deploy-pages.yml`, which builds a static export to the `github-pages` environment.
