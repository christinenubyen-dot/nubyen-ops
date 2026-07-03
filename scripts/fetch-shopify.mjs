// scripts/fetch-shopify.mjs
// Pulls orders, products, and inventory from the Shopify Admin API and writes
// public/data.json in the exact shape the dashboard expects.
//
// Runs in GitHub Actions (hourly). Reads secrets from env:
//   SHOPIFY_STORE          e.g. "nubyen.myshopify.com"
//   SHOPIFY_CLIENT_ID      Dev Dashboard app client ID
//   SHOPIFY_CLIENT_SECRET  Dev Dashboard app client secret
//
// As of Jan 1, 2026 Shopify no longer issues permanent shpat_ tokens for
// custom apps. Apps made in the Dev Dashboard expose a client ID + secret,
// which we exchange for a short-lived Admin API token via the
// client_credentials grant on each run. (Requires the app and store to be in
// the same organization, and the app to be installed on the store.)
//
// Location mapping (your Shopify location name -> dashboard fulfillment center)
// is configured in LOCATION_MAP below.

import { writeFile, mkdir } from "node:fs/promises";

const STORE = process.env.SHOPIFY_STORE;
const CLIENT_ID = process.env.SHOPIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SHOPIFY_CLIENT_SECRET;
const API_VERSION = "2025-01";

// ---- EDIT THIS: map real Shopify location names to your two centers --------
const LOCATION_MAP = {
  // "Exact Shopify location name": "Tarlu" | "Launchpad"
  "Tarlu": "Tarlu",
  "Launchpad": "Launchpad",
  // Add aliases if your Shopify locations are named differently, e.g.:
  // "Nubyen Main Warehouse": "Tarlu",
  // "3PL - Launchpad Logistics": "Launchpad",
};
const DEFAULT_FC = "Tarlu"; // used when a location name isn't in the map

// Per-SKU reorder points, sourced from the inventory sheet's LowStockAlertLevel.
// Anything not listed falls back to DEFAULT_REORDER.
const REORDER_POINTS = {
  NNUDE1: 10, NLIPFIL: 10, NLIPD: 10, NLIPA2: 10, NLIPA1: 10, NLIPA3: 10,
  NLIPA4: 10, NFIRM: 10, NNUDE2: 10, NUBMB: 10, NPRO3: 10, NBTLED: 10,
  NLASHFLY: 10, NTRIR: 10, NTRIE: 10, NTRIG: 10, NDERM: 10,
  NCHEEK: 10, NLPO1: 10, NLPO2: 10, NLPO3: 10, NLPO4: 10, NLPO5: 10,
  NLIPFILBOX: 10, NADVQAQ: 1, POSTPOST: 1, NM4N1: 1, NBEAU: 1, NMHB1: 1,
  MUSEH1: 1, MUSEH2: 1, MUSEH3: 1, MUSEH4: 1, MUSEH5: 1,
  NMUS1: 1, NMUS2: 1,
};
const DEFAULT_REORDER = 10;

if (!STORE || !CLIENT_ID || !CLIENT_SECRET) {
  console.error(
    "Missing env vars. Need SHOPIFY_STORE, SHOPIFY_CLIENT_ID, SHOPIFY_CLIENT_SECRET."
  );
  process.exit(1);
}

const base = `https://${STORE}/admin/api/${API_VERSION}`;

// Exchange client ID + secret for a short-lived Admin API access token.
async function getAccessToken() {
  const res = await fetch(`https://${STORE}/admin/oauth/access_token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      grant_type: "client_credentials",
    }),
  });
  if (!res.ok) {
    const body = await res.text();
    throw new Error(
      `Token exchange failed (${res.status}). ${body}\n` +
        "Common cause: the app isn't installed on this store, or the app and " +
        "store are in different organizations (client_credentials only works " +
        "same-org)."
    );
  }
  const json = await res.json();
  if (!json.access_token) throw new Error("No access_token in token response.");
  return json.access_token;
}

// Set once getAccessToken() resolves in main().
let headers = { "Content-Type": "application/json" };

// ---- Helpers ---------------------------------------------------------------

// Follow Shopify's Link-header cursor pagination.
async function getAll(path, key) {
  let url = `${base}/${path}`;
  const out = [];
  while (url) {
    const res = await fetch(url, { headers });
    if (!res.ok) {
      throw new Error(`${path} -> ${res.status} ${await res.text()}`);
    }
    const json = await res.json();
    out.push(...(json[key] || []));
    const link = res.headers.get("link") || "";
    const next = link.split(",").find((p) => p.includes('rel="next"'));
    url = next ? next.slice(next.indexOf("<") + 1, next.indexOf(">")) : null;
  }
  return out;
}

const fmtDate = (iso) => (iso ? iso.slice(0, 10) : null);

// Map Shopify order -> dashboard order row.
function mapOrder(o, locationName) {
  const fulfillments = o.fulfillments || [];
  const f = fulfillments[0] || null;

  // Delivery stage from fulfillment + shipment status.
  let delivery = "Awaiting pick";
  if (o.cancelled_at) delivery = "Backordered";
  else if (!o.fulfillment_status && !f) delivery = "Awaiting pick";
  else if (f) {
    const st = (f.shipment_status || "").toLowerCase();
    if (st.includes("delivered")) delivery = "Delivered";
    else if (st.includes("out_for_delivery")) delivery = "Out for delivery";
    else if (st.includes("in_transit") || st.includes("confirmed")) delivery = "In transit";
    else if (f.tracking_number) delivery = "In transit";
    else delivery = "Label created";
  } else if (o.fulfillment_status === "fulfilled") {
    delivery = "Delivered";
  }

  // Top-level status column.
  let status = "Unfulfilled";
  if (o.fulfillment_status === "fulfilled") status = "Fulfilled";
  else if (o.fulfillment_status === "partial") status = "Processing";
  else if (f) status = "Shipped";

  const items = (o.line_items || []).reduce((s, li) => s + (li.quantity || 0), 0);

  const ship = o.shipping_address;
  const addr = ship ? [ship.city, ship.province_code || ship.country_code].filter(Boolean).join(", ") : "\u2014";

  return {
    id: o.name || `#${o.order_number}`,
    customer: o.customer
      ? `${o.customer.first_name || ""} ${o.customer.last_name || ""}`.trim() || "Guest"
      : "Guest",
    placed: fmtDate(o.created_at),
    value: Math.round(parseFloat(o.total_price || "0")),
    status,
    items,
    courier: f?.tracking_company || null,
    tracking: f?.tracking_number || null,
    delivery,
    eta: f?.estimated_delivery_at ? fmtDate(f.estimated_delivery_at) : null,
    ship: f?.created_at ? fmtDate(f.created_at) : null,
    fc: LOCATION_MAP[locationName] || DEFAULT_FC,
    address: addr,
  };
}

// ---- Main ------------------------------------------------------------------
async function main() {
  // 1. Get a fresh short-lived Admin API token from client credentials.
  const token = await getAccessToken();
  headers = { "X-Shopify-Access-Token": token, "Content-Type": "application/json" };
  console.log("Obtained short-lived Admin API token.");

  // Locations: id -> name, so we can label each order's fulfillment center.
  const locations = await getAll("locations.json", "locations");
  const locById = Object.fromEntries(locations.map((l) => [l.id, l.name]));

  // Orders (open + recently closed). Adjust status/limit as needed.
  const rawOrders = await getAll(
    "orders.json?status=any&limit=250&order=created_at+desc",
    "orders"
  );

  const orders = rawOrders.map((o) => {
    const locName = locById[o.location_id] || null;
    return mapOrder(o, locName);
  });

  // Products + inventory.
  const products = await getAll("products.json?limit=250", "products");
  const invItemIds = [];
  const variantMeta = {};
  for (const p of products) {
    for (const v of p.variants || []) {
      if (v.inventory_item_id) {
        invItemIds.push(v.inventory_item_id);
        variantMeta[v.inventory_item_id] = {
          sku: v.sku || p.handle,
          name: p.title,
        };
      }
    }
  }

  // Inventory levels (batched by 50 ids per Shopify limits).
  const levels = [];
  for (let i = 0; i < invItemIds.length; i += 50) {
    const batch = invItemIds.slice(i, i + 50).join(",");
    const part = await getAll(
      `inventory_levels.json?inventory_item_ids=${batch}&limit=250`,
      "inventory_levels"
    );
    levels.push(...part);
  }

  // Sum on-hand per SKU across locations; pick a representative source location.
  const bySku = {};
  for (const lvl of levels) {
    const meta = variantMeta[lvl.inventory_item_id];
    if (!meta) continue;
    const fc = LOCATION_MAP[locById[lvl.location_id]] || DEFAULT_FC;
    if (!bySku[meta.sku]) {
      bySku[meta.sku] = { sku: meta.sku, name: meta.name, onHand: 0, supplier: fc };
    }
    bySku[meta.sku].onHand += lvl.available || 0;
  }

  const productRows = Object.values(bySku).map((p) => ({
    sku: p.sku,
    name: p.name,
    onHand: p.onHand,
    reorderPt: REORDER_POINTS[p.sku] ?? DEFAULT_REORDER,
    onOrder: 0, // Shopify has no native "on order" for POs; left 0 unless you track it
    lastStocked: null,
    supplier: p.supplier,
  }));

  const data = {
    syncedAt: new Date().toISOString(),
    orders,
    products: productRows,
  };

  await mkdir("public", { recursive: true });
  await writeFile("public/data.json", JSON.stringify(data, null, 2));
  console.log(
    `Wrote public/data.json \u2014 ${orders.length} orders, ${productRows.length} products.`
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
