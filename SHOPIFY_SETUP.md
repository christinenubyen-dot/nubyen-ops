# Nubyén Ops — Shopify Integration Setup (Dev Dashboard)

Your dashboard supports **live hourly data from Shopify**. Until you add
credentials, it shows built-in sample data — nothing breaks. The header badge
reads **○ Sample data** or **● Live — Shopify**.

> **Important — what changed (Jan 1, 2026):** Shopify no longer issues
> permanent `shpat_` tokens for custom apps. Apps created in the **Dev
> Dashboard** give you a **Client ID** and **Client Secret** instead. Our sync
> script exchanges those for a short-lived token automatically on each run, so
> you never copy or store a token yourself.

## How it works

```
Hourly (GitHub Action: sync-shopify.yml)
   → fetch-shopify.mjs POSTs client ID + secret to /admin/oauth/access_token
   → Shopify returns a short-lived Admin API token (~24h)
   → script calls Orders / Products / Inventory / Locations
   → writes public/data.json → commits → redeploys
Dashboard (browser)
   → fetches data.json on load; falls back to sample data if empty/missing
```

Nothing secret ever reaches the browser. The client ID/secret live only in
GitHub Secrets and are used server-side inside the Action.

---

## One-time setup

### 1. Finish your Dev Dashboard app

You already created the app and have a **Client ID** and **Client Secret**.
Two things must be true for the token exchange to work:

- **The app must be installed on your store.** In the Dev Dashboard, open your
  app and use **Install** / **Select store** to install it on your
  `your-store.myshopify.com`. If it asks for an **App URL**, you can use
  `https://shopify.dev/apps/default-app-home` (this isn't a UI app).
- **Admin API scopes** must include these reads:
  `read_orders`, `read_products`, `read_inventory`, `read_fulfillments`,
  `read_locations`, `read_merchant_managed_fulfillment_orders`.

> The app and the store must be in the **same organization** (they are, since
> you own both). If they weren't, `client_credentials` would fail with
> `shop_not_permitted` and a full OAuth flow would be required instead.

### 2. Add three secrets to GitHub

Repo → **Settings → Secrets and variables → Actions → New repository secret**.

| Name                     | Value                               |
| ------------------------ | ----------------------------------- |
| `SHOPIFY_STORE`          | `your-store.myshopify.com`          |
| `SHOPIFY_CLIENT_ID`      | Client ID from the Dev Dashboard    |
| `SHOPIFY_CLIENT_SECRET`  | Client Secret from the Dev Dashboard |

### 3. Map locations to Tarlu / Launchpad

Edit `LOCATION_MAP` near the top of `scripts/fetch-shopify.mjs` so your exact
Shopify location names (Settings → Locations) map to your two centers:

```js
const LOCATION_MAP = {
  "Your Shopify location name": "Tarlu",
  "Another location name": "Launchpad",
};
```

### 4. Run the first sync

Repo → **Actions → Sync Shopify data → Run workflow**. It exchanges your
credentials for a token, fetches your data, and commits `public/data.json`.
That push triggers a redeploy; ~1–2 min later the site shows **● Live** with
your real orders and stock. After this it refreshes hourly automatically.

---

## Test locally (optional)

```bash
export SHOPIFY_STORE="your-store.myshopify.com"
export SHOPIFY_CLIENT_ID="..."
export SHOPIFY_CLIENT_SECRET="..."
npm run sync         # writes public/data.json
npm run dev          # http://localhost:5173/nubyen-ops/
```

## Notes & limits

- **"On order" quantities**: Shopify has no native purchase-order field, so
  `onOrder` is `0`. If you track incoming stock elsewhere, we can wire it in.
- **Reorder point** defaults to `10` (your sheet's LowStockAlertLevel). Can be
  made per-SKU via a Shopify metafield.
- **Courier / ETA**: populated once an order has a fulfillment with tracking.
  Unfulfilled orders correctly show "Awaiting pick".
- **`shop_not_permitted` error** on sync: means the app isn't installed on the
  store, or app/store are in different orgs. Re-check step 1.
- **Order volume**: pulls up to 250 recent orders per run and paginates; we can
  add date filtering for high volume.
