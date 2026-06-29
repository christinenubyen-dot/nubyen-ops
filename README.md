# Nubyén Ops — Fulfillment & Stock Control

An operations dashboard showing order status, courier/delivery tracking,
out-of-stock & replenishment, and aging reports for unfulfilled orders and
out-of-stock items.

Built with React + Vite. Deploys to GitHub Pages at:

```
https://<your-username>.github.io/nubyen-ops/
```

---

## Deploy in 4 steps

### 1. Create the repo
On GitHub, create a **new empty repository** named exactly `nubyen-ops`
(no README, no .gitignore — keep it empty).

### 2. Push this project
From this folder:

```bash
git init
git add .
git commit -m "Nubyén ops dashboard"
git branch -M main
git remote add origin https://github.com/<your-username>/nubyen-ops.git
git push -u origin main
```

### 3. Turn on Pages
In the repo: **Settings → Pages → Build and deployment → Source**, choose
**GitHub Actions**. (You only do this once.)

### 4. Done
The included workflow (`.github/workflows/deploy.yml`) builds and publishes
automatically on every push to `main`. Watch progress under the **Actions**
tab. First deploy takes ~1–2 minutes, then your site is live at the URL above.

---

## Run locally

```bash
npm install
npm run dev      # http://localhost:5173/nubyen-ops/
```

```bash
npm run build    # outputs static site to dist/
npm run preview  # preview the production build
```

---

## Changing the repo name

If you name the repo something other than `nubyen-ops`, update the `base`
value in `vite.config.js` to `/<your-repo-name>/` so asset paths resolve
correctly. This is the most common cause of a blank page on Pages.

## Editing the data

All mock data lives at the top of `src/Dashboard.jsx`:
- `ORDERS` — orders, customers, couriers, delivery state, fulfillment center
- `PRODUCTS` — SKUs, stock levels, reorder points, supplier/source
- `THEME` — colors (white / soft blue / brown)

Edit those arrays and push; the workflow redeploys automatically.
