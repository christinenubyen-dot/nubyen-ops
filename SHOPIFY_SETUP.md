# Nubyén Ops — Shopify Integration Setup

Your dashboard now supports **live hourly data from Shopify**. Until you add
your Shopify credentials, it keeps showing the built-in sample data — so
nothing breaks in the meantime. The header shows a badge: **○ Sample data** or
**● Live — Shopify**.

## How it works

```
Hourly (GitHub Action: sync-shopify.yml)
   → scripts/fetch-shopify.mjs calls the Shopify Admin API
   → writes public/data.json (orders + products, in the dashboard's shape)
   → commits it → triggers a redeploy
Dashboard (in the browser)
   → fetches data.json on load; falls back to sample data if empty/missing
```

No token is ever exposed in the browser — it lives only in GitHub Secrets and
is used server-side inside the Action.

---

## One-time setup

### 1. Create a Shopify custom app

1. Shopify admin → **Settings → Apps and sales channels → Develop apps**.
2. **Allow custom app development** (one-time), then **Create an app**
   (name it e.g. "Ops Dashboard").
3. **Configuration → Admin API integration → Configure**, grant these read
   scopes:
   - `read_orders`
   - `read_products`
   - `read_inventory`
   - `read_fulfillments`
   - `read_locations`
   - `read_merchant_managed_fulfillment_orders`
4. **Save**, then **Install app**.
5. Under **API credentials**, reveal and copy the **Admin API access token**
   (starts with `shpat_`). You only see it once — copy it now.

### 2. Add secrets to GitHub

In your repo → **Settings → Secrets and variables → Actions → New repository
secret**. Add two:

| Name             | Value                                   |
| ---------------- | --------------------------------------- |
| `SHOPIFY_STORE`  | `your-store.myshopify.com`              |
| `SHOPIFY_TOKEN`  | `shpat_...` (the token from step 1)     |

### 3. Map your locations to Tarlu / Launchpad

Open `scripts/fetch-shopify.mjs` and edit `LOCATION_MAP` near the top so the
**exact** Shopify location names (Settings → Locations) map to your two
centers:

```js
const LOCATION_MAP = {
  "Your Shopify location name": "Tarlu",
  "Another location name": "Launchpad",
};
```

### 4. Run the first sync

Repo → **Actions → Sync Shopify data → Run workflow** (the manual trigger).
It fetches from Shopify and commits `public/data.json`. That push triggers the
deploy workflow, and ~1–2 minutes later the live site shows the **● Live**
badge with your real orders and stock.

After this, it refreshes automatically every hour.

---

## Notes & limits (honest caveats)

- **"On order" quantities**: Shopify has no native purchase-order field, so
  `onOrder` is set to `0`. If you track incoming stock (e.g. in a metafield or
  a separate sheet), tell me and we'll wire it in.
- **Reorder point** defaults to `10` (your sheet's LowStockAlertLevel). To make
  it per-SKU, store it in a Shopify metafield and we'll read it.
- **Courier name / ETA**: only populated once an order has a fulfillment with
  tracking. Unfulfilled orders correctly show "Awaiting pick".
- **Order volume**: the script pulls up to 250 recent orders per run and
  paginates. For very high volume we can add date filtering (e.g. last 30 days).
- **Cron timing**: GitHub's scheduled Actions can lag a few minutes under load;
  "hourly" is approximate, which is fine for ops reporting.

## Test the fetch locally (optional)

```bash
export SHOPIFY_STORE="your-store.myshopify.com"
export SHOPIFY_TOKEN="shpat_..."
npm run sync         # writes public/data.json
npm run dev          # view at http://localhost:5173/nubyen-ops/
```
