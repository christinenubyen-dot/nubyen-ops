# Nubyén Ops — Fulfillment & Stock Control

Operations dashboard: order status, courier/delivery tracking, out-of-stock &
replenishment, and aging reports. Built with React + Vite, deploys to GitHub
Pages, and can pull **live hourly data from Shopify**.

Live URL (after deploy): `https://<your-username>.github.io/nubyen-ops/`

---

## First-time deploy

1. Create a **new empty** GitHub repo named exactly `nubyen-ops`.
2. From this folder:
   ```bash
   git init
   git add .
   git commit -m "Nubyén ops dashboard"
   git branch -M main
   git remote add origin https://github.com/<your-username>/nubyen-ops.git
   git push -u origin main
   ```
3. Repo → **Settings → Pages → Source → GitHub Actions** (one-time).
4. The deploy workflow runs automatically; site is live in ~1–2 min.

## Connect Shopify (optional, for live data)

See **[SHOPIFY_SETUP.md](./SHOPIFY_SETUP.md)** for the full walkthrough. In
short: install your Dev Dashboard app on the store, add `SHOPIFY_STORE`,
`SHOPIFY_CLIENT_ID`, and `SHOPIFY_CLIENT_SECRET` to GitHub Secrets, map your
locations to Tarlu/Launchpad, and run the **Sync Shopify data** action once.
It then refreshes hourly.

> Note: as of Jan 2026 Shopify apps use a Client ID + Secret (no permanent
> token). The sync script exchanges them for a short-lived token on each run.

Until you connect Shopify, the dashboard shows built-in **sample data** (badge
in the header), so it always renders.

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173/nubyen-ops/
npm run build    # static output in dist/
```

## Where the data lives

- `src/Dashboard.jsx` — UI + `MOCK_ORDERS` / `MOCK_PRODUCTS` fallback + `THEME`
- `scripts/fetch-shopify.mjs` — Shopify → `public/data.json` transform
- `.github/workflows/sync-shopify.yml` — hourly sync
- `.github/workflows/deploy.yml` — build + deploy to Pages

## Repo name

If you use a different repo name, update `base` in `vite.config.js` to
`/<repo-name>/` — a mismatch is the usual cause of a blank Pages screen.
