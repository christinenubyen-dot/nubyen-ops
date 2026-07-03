import React, { useState, useMemo, useEffect } from "react";

// ====================================================================
//  THEME — replace these with your nubyen-launchpad values.
//  (Sandbox couldn't reach the site to read them automatically.)
// ====================================================================
const THEME = {
  bg: "#ffffff",        // page background — white
  surface: "#ffffff",   // cards / tables
  surfaceAlt: "#f5f7fa", // hover / detail rows — soft blue-grey
  border: "#e3e8ef",
  text: "#2e2a26",      // warm near-black (brown-tinted)
  textDim: "#8a8275",   // muted brown-grey
  accent: "#5b8bb8",    // soft blue (primary)
  accentSoft: "#eaf1f7",
  brown: "#a9826a",     // brown secondary accent
};

// ---- Courier brand icons (inline SVG, official-ish brand colors) ----
const CourierIcon = ({ name }) => {
  const icons = {
    FedEx: (
      <svg viewBox="0 0 120 40" className="courier-svg" aria-label="FedEx">
        <text x="2" y="30" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="30" fill="#4d148c">Fed</text>
        <text x="58" y="30" fontFamily="Arial Black, sans-serif" fontWeight="900" fontSize="30" fill="#ff6600">Ex</text>
      </svg>
    ),
    UPS: (
      <svg viewBox="0 0 64 40" className="courier-svg" aria-label="UPS">
        <path d="M12 2h40c4 0 7 3 7 7v14c0 9-12 13-27 17C17 36 5 32 5 23V9c0-4 3-7 7-7z" fill="#351c15" />
        <path d="M14 6h36c2 0 4 2 4 4v13c0 7-10 10-22 13C20 33 10 30 10 23V10c0-2 2-4 4-4z" fill="#ffb500" />
        <text x="32" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#351c15">UPS</text>
      </svg>
    ),
    "UPS Freight": (
      <svg viewBox="0 0 64 40" className="courier-svg" aria-label="UPS Freight">
        <path d="M12 2h40c4 0 7 3 7 7v14c0 9-12 13-27 17C17 36 5 32 5 23V9c0-4 3-7 7-7z" fill="#351c15" />
        <path d="M14 6h36c2 0 4 2 4 4v13c0 7-10 10-22 13C20 33 10 30 10 23V10c0-2 2-4 4-4z" fill="#ffb500" />
        <text x="32" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="13" fill="#351c15">UPS</text>
      </svg>
    ),
    DHL: (
      <svg viewBox="0 0 120 40" className="courier-svg" aria-label="DHL">
        <rect x="0" y="6" width="120" height="28" rx="3" fill="#ffcc00" />
        <text x="60" y="28" textAnchor="middle" fontFamily="Arial, sans-serif" fontStyle="italic" fontWeight="900" fontSize="22" fill="#d40511">DHL</text>
      </svg>
    ),
    USPS: (
      <svg viewBox="0 0 130 40" className="courier-svg" aria-label="USPS">
        <rect x="0" y="6" width="130" height="28" rx="3" fill="#fff" stroke="#e2e8f0" />
        <path d="M6 28 L20 12 L34 28 Z" fill="#004b87" />
        <path d="M14 28 L26 14 L38 28 Z" fill="#da291c" />
        <text x="80" y="26" textAnchor="middle" fontFamily="Arial, sans-serif" fontWeight="900" fontSize="15" fill="#333366">USPS</text>
      </svg>
    ),
    "Royal Mail": (
      <svg viewBox="0 0 150 40" className="courier-svg" aria-label="Royal Mail">
        <rect x="0" y="6" width="150" height="28" rx="14" fill="#da291c" />
        <circle cx="20" cy="20" r="9" fill="#ffd700" />
        <path d="M20 13 l2 4 4 0 -3 3 1 4 -4 -2 -4 2 1 -4 -3 -3 4 0z" fill="#da291c" />
        <text x="92" y="25" textAnchor="middle" fontFamily="Georgia, serif" fontWeight="700" fontSize="13" fill="#fff">Royal Mail</text>
      </svg>
    ),
  };
  if (!name) return <span className="muted">—</span>;
  return icons[name] || <span className="courier-text">{name}</span>;
};

// ---- Sample data -----------------------------------------------------------
const MOCK_ORDERS = [
  { id: "SO-10241", customer: "Amara Okafor", placed: "2026-06-26", value: 1840, status: "Unfulfilled", items: 6, courier: null, tracking: null, delivery: "Awaiting pick", eta: null, ship: null, fc: "Tarlu", address: "Portland, OR" },
  { id: "SO-10238", customer: "Sofia Marchetti", placed: "2026-06-24", value: 920, status: "Unfulfilled", items: 3, courier: null, tracking: null, delivery: "Awaiting pick", eta: null, ship: null, fc: "Launchpad", address: "Austin, TX" },
  { id: "SO-10233", customer: "Daniel Whitmore", placed: "2026-06-21", value: 3410, status: "Unfulfilled", items: 12, courier: null, tracking: null, delivery: "Backordered", eta: null, ship: null, fc: "Tarlu", address: "Seattle, WA" },
  { id: "SO-10229", customer: "Priya Nair", placed: "2026-06-17", value: 760, status: "Unfulfilled", items: 2, courier: null, tracking: null, delivery: "Awaiting pick", eta: null, ship: null, fc: "Tarlu", address: "Denver, CO" },
  { id: "SO-10224", customer: "Lucas Bergström", placed: "2026-06-12", value: 5120, status: "Unfulfilled", items: 18, courier: null, tracking: null, delivery: "Backordered", eta: null, ship: null, fc: "Launchpad", address: "Boise, ID" },
  { id: "SO-10219", customer: "Hannah Levine", placed: "2026-06-05", value: 2240, status: "Unfulfilled", items: 9, courier: null, tracking: null, delivery: "Backordered", eta: null, ship: null, fc: "Tarlu", address: "Chicago, IL" },
  { id: "SO-10246", customer: "Marcus Bellini", placed: "2026-06-28", value: 480, status: "Fulfilled", items: 1, courier: "FedEx", tracking: "7712 8841 0023", delivery: "Delivered", eta: "2026-06-29", ship: "2026-06-28", fc: "Launchpad", address: "Sacramento, CA" },
  { id: "SO-10245", customer: "Yuki Tanaka", placed: "2026-06-27", value: 1330, status: "Fulfilled", items: 4, courier: "UPS", tracking: "1Z 999 AA1 0123", delivery: "Delivered", eta: "2026-06-29", ship: "2026-06-27", fc: "Launchpad", address: "Austin, TX" },
  { id: "SO-10240", customer: "Olivia Carter", placed: "2026-06-25", value: 690, status: "Shipped", items: 2, courier: "DHL", tracking: "JD0140 6612 9930", delivery: "Out for delivery", eta: "2026-06-30", ship: "2026-06-26", fc: "Tarlu", address: "Miami, FL" },
  { id: "SO-10236", customer: "Ethan Brooks", placed: "2026-06-23", value: 2780, status: "Shipped", items: 8, courier: "Royal Mail", tracking: "AB12 3456 7GB", delivery: "In transit", eta: "2026-07-01", ship: "2026-06-24", fc: "Launchpad", address: "London, UK" },
  { id: "SO-10231", customer: "Camille Dubois", placed: "2026-06-20", value: 1120, status: "Processing", items: 5, courier: "USPS", tracking: null, delivery: "Label created", eta: "2026-07-02", ship: null, fc: "Tarlu", address: "Phoenix, AZ" },
  { id: "SO-10227", customer: "Noah Feldman", placed: "2026-06-15", value: 3990, status: "Processing", items: 14, courier: "UPS Freight", tracking: null, delivery: "Label created", eta: "2026-07-03", ship: null, fc: "Launchpad", address: "Seattle, WA" },
];

const MOCK_PRODUCTS = [
  { sku: "NNUDE1", name: "Nude Lip Augmentation Plumping Gloss", onHand: 0, reorderPt: 10, onOrder: 240, lastStocked: "2026-06-08", supplier: "Tarlu" },
  { sku: "NLIPFIL", name: "Plumping Lip Fila Elixir Balm", onHand: 4, reorderPt: 10, onOrder: 150, lastStocked: "2026-06-19", supplier: "Tarlu" },
  { sku: "NLIPD", name: "Lip Fila Defining Cleanse Scrub", onHand: 0, reorderPt: 10, onOrder: 0, lastStocked: "2026-05-30", supplier: "Tarlu" },
  { sku: "NLIPA1", name: "Plumping Tinted Lip Fila Balm, Espresso", onHand: 7, reorderPt: 10, onOrder: 0, lastStocked: "2026-06-15", supplier: "Tarlu" },
  { sku: "NLIPA2", name: "Plumping Tinted Lip Fila Balm, Iridescent", onHand: 0, reorderPt: 10, onOrder: 120, lastStocked: "2026-06-11", supplier: "Tarlu" },
  { sku: "NLIPA3", name: "Plumping Tinted Lip Fila Balm, Nude", onHand: 32, reorderPt: 10, onOrder: 0, lastStocked: "2026-06-20", supplier: "Tarlu" },
  { sku: "NFIRM", name: "Val-i-date Lipid Freeze Body Firming Treatment", onHand: 0, reorderPt: 10, onOrder: 60, lastStocked: "2026-06-02", supplier: "Tarlu" },
  { sku: "NNUDE2", name: "Nude Lip Gloss - Nude (Black Packaging)", onHand: 45, reorderPt: 10, onOrder: 0, lastStocked: "2026-06-22", supplier: "Launchpad" },
  { sku: "NLPO1", name: "Powerful Lip Plumping Lip Oil, Clear", onHand: 0, reorderPt: 10, onOrder: 200, lastStocked: "2026-06-06", supplier: "Launchpad" },
  { sku: "NLPO3", name: "Powerful Lip Plumping Lip Oil, Tawny", onHand: 28, reorderPt: 10, onOrder: 0, lastStocked: "2026-06-18", supplier: "Launchpad" },
  { sku: "NBTLED", name: "Muse Skin Beautifying LED Device", onHand: 3, reorderPt: 10, onOrder: 25, lastStocked: "2026-06-21", supplier: "Launchpad" },
  { sku: "NCHEEK", name: "Cheek Fila - Reversible Cheek Filler Alt.", onHand: 60, reorderPt: 10, onOrder: 0, lastStocked: "2026-06-24", supplier: "Launchpad" },
];

const TODAY = new Date("2026-06-29");
const daysSince = (d) => {
  if (!d) return null;
  const t = new Date(d).getTime();
  if (Number.isNaN(t)) return null;
  return Math.round((TODAY - t) / 86400000);
};
const BUCKETS = [
  { label: "0\u20132 days", min: 0, max: 2 },
  { label: "3\u20135 days", min: 3, max: 5 },
  { label: "6\u201310 days", min: 6, max: 10 },
  { label: "11+ days", min: 11, max: Infinity },
];
const UNKNOWN_BUCKET = "Unknown";
// Severity buckets for stock: how far below the reorder point an item is.
const SHORTFALL_BUCKETS = [
  { label: "Out (\u22640)", min: -Infinity, max: 0 },
  { label: "Critical", min: 0.0001, max: 0.34 },
  { label: "Low", min: 0.34, max: 0.67 },
  { label: "Near", min: 0.67, max: 1 },
];
// ratio = onHand / reorderPt; lower = worse.
const shortfallBucketOf = (onHand, reorderPt) => {
  if (onHand <= 0) return "Out (\u22640)";
  const r = reorderPt > 0 ? onHand / reorderPt : 1;
  const b = SHORTFALL_BUCKETS.find((b) => r > b.min && r <= b.max);
  return b ? b.label : "Near";
};
const bucketOf = (age) => {
  if (age === null || age === undefined || Number.isNaN(age)) return UNKNOWN_BUCKET;
  const b = BUCKETS.find((b) => age >= b.min && age <= b.max);
  return b ? b.label : UNKNOWN_BUCKET;
};
const money = (n) => "$" + n.toLocaleString();

const STAGES = ["Awaiting pick", "Label created", "In transit", "Out for delivery", "Delivered"];
const stageIndex = (d) => (d === "Backordered" || d === "Awaiting pick" ? 0 : Math.max(0, STAGES.indexOf(d)));
const deliveryColor = (d) =>
  ({ Delivered: "#4a8a7b", "Out for delivery": "#5b8bb8", "In transit": "#6ba3c9", "Label created": "#b08968", "Awaiting pick": THEME.textDim, Backordered: "#a9826a" }[d] || "#8a8275");

function DeliveryTrack({ delivery }) {
  if (delivery === "Backordered") return <span className="track-back">Backordered \u2014 not yet shipped</span>;
  const idx = stageIndex(delivery);
  return (
    <div className="track">
      {STAGES.map((s, i) => (
        <React.Fragment key={s}>
          <div className={`dot ${i <= idx ? "done" : ""}`} title={s} />
          {i < STAGES.length - 1 && <div className={`bar ${i < idx ? "done" : ""}`} />}
        </React.Fragment>
      ))}
    </div>
  );
}

function AgingReport({ title, rows, valueKey, valueFmt, accent, buckets = BUCKETS, bucketKey = "bucket" }) {
  const summary = buckets.map((b) => {
    const inB = rows.filter((r) => r[bucketKey] === b.label);
    return { label: b.label, count: inB.length, total: inB.reduce((s, r) => s + (r[valueKey] || 0), 0) };
  });
  const max = Math.max(1, ...summary.map((s) => s.count));
  return (
    <div className="aging">
      <h3>{title}</h3>
      <div className="aging-bars">
        {summary.map((s) => (
          <div className="aging-col" key={s.label}>
            <div className="aging-track">
              <div className="aging-fill" style={{ height: `${(s.count / max) * 100}%`, background: accent }}>
                <span className="aging-count">{s.count}</span>
              </div>
            </div>
            <div className="aging-meta">
              <div className="aging-label">{s.label}</div>
              <div className="aging-total">{valueFmt(s.total)}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("orders");
  const [open, setOpen] = useState(null);
  const [stockView, setStockView] = useState("attention"); // "attention" | "all"

  // Live data from hourly Shopify sync (public/data.json), with mock fallback.
  const [ORDERS, setOrders] = useState(MOCK_ORDERS);
  const [PRODUCTS, setProducts] = useState(MOCK_PRODUCTS);
  const [source, setSource] = useState("mock"); // "mock" | "live"
  const [synced, setSynced] = useState(null);

  useEffect(() => {
    const url = `${import.meta.env.BASE_URL}data.json`;
    fetch(url, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no data.json"))))
      .then((d) => {
        if (Array.isArray(d.orders) && d.orders.length) {
          setOrders(d.orders);
          setProducts(Array.isArray(d.products) ? d.products : MOCK_PRODUCTS);
          setSource("live");
          setSynced(d.syncedAt || null);
        }
      })
      .catch(() => {
        /* keep mock data — dashboard still renders */
      });
  }, []);

  const unfulfilled = useMemo(() => ORDERS.filter((o) => o.status === "Unfulfilled").map((o) => ({ ...o, age: daysSince(o.placed), bucket: bucketOf(daysSince(o.placed)) })).sort((a, b) => b.age - a.age), [ORDERS]);
  // Enrich every product, then derive the "needs attention" subset from it.
  const allStock = useMemo(() => PRODUCTS.map((p) => ({ ...p, age: daysSince(p.lastStocked), bucket: bucketOf(daysSince(p.lastStocked)), shortfallBucket: shortfallBucketOf(p.onHand, p.reorderPt), critical: p.onHand <= 0, low: p.onHand > 0 && p.onHand < p.reorderPt, needsReorder: p.onOrder === 0 && p.onHand < p.reorderPt })).sort((a, b) => a.onHand - b.onHand), [PRODUCTS]);
  const outOfStock = useMemo(() => allStock.filter((p) => p.critical || p.low).sort((a, b) => b.age - a.age), [allStock]);

  const stats = {
    open: unfulfilled.length,
    openValue: unfulfilled.reduce((s, o) => s + o.value, 0),
    transit: ORDERS.filter((o) => ["In transit", "Out for delivery"].includes(o.delivery)).length,
    oos: outOfStock.filter((p) => p.critical).length,
  };
  const statusColor = (s) => ({ Unfulfilled: "#a9826a", Processing: "#b08968", Shipped: "#5b8bb8", Fulfilled: "#4a8a7b" }[s] || "#8a8275");

  return (
    <div className="wrap">
      <style>{css}</style>
      <header className="head">
        <div>
          <div className="eyebrow">Operations · {source === "live" ? (synced ? `synced ${new Date(synced).toLocaleString()}` : "live") : "sample data"}</div>
          <h1>Fulfillment &amp; Stock Control</h1>
          <span className={source === "live" ? "src-badge live" : "src-badge"}>{source === "live" ? "● Live — Shopify" : "○ Sample data"}</span>
        </div>
        <div className="kpis">
          <div className="kpi"><span className="kpi-n">{stats.open}</span><span className="kpi-l">Open orders</span></div>
          <div className="kpi"><span className="kpi-n">{stats.transit}</span><span className="kpi-l">In transit</span></div>
          <div className="kpi alert"><span className="kpi-n">{stats.oos}</span><span className="kpi-l">Out of stock</span></div>
          <div className="kpi"><span className="kpi-n">{money(stats.openValue)}</span><span className="kpi-l">Open value</span></div>
        </div>
      </header>

      <nav className="tabs">
        {[["orders", "Orders & Delivery"], ["stock", "Stock & Replenishment"], ["aging", "Aging Reports"]].map(([k, l]) => (
          <button key={k} className={tab === k ? "tab on" : "tab"} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>

      {tab === "orders" && (
        <section className="card">
          <table>
            <thead><tr><th>Order</th><th>Ordered</th><th>Customer</th><th>Fulfillment center</th><th>Courier</th><th>Tracking</th><th>Delivery</th><th>ETA</th><th>Status</th></tr></thead>
            <tbody>
              {ORDERS.map((o) => (
                <React.Fragment key={o.id}>
                  <tr className="row" onClick={() => setOpen(open === o.id ? null : o.id)}>
                    <td className="mono">{o.id}</td>
                    <td className="muted nowrap">{o.placed}</td>
                    <td>{o.customer}</td>
                    <td className="nowrap"><span className="fc-tag">{o.fc}</span></td>
                    <td><div className="courier-cell"><CourierIcon name={o.courier} /></div></td>
                    <td className="mono small">{o.tracking || <span className="muted">\u2014</span>}</td>
                    <td><span className="dpill" style={{ color: deliveryColor(o.delivery), borderColor: deliveryColor(o.delivery) }}>{o.delivery}</span></td>
                    <td className="muted">{o.eta || "\u2014"}</td>
                    <td><span className="pill" style={{ color: statusColor(o.status), borderColor: statusColor(o.status) }}>{o.status}</span></td>
                  </tr>
                  {open === o.id && (
                    <tr className="detail"><td colSpan={9}>
                      <div className="detail-grid">
                        <div className="dfield"><span className="dlabel">Fulfillment center</span>{o.fc}</div>
                        <div className="dfield"><span className="dlabel">Ship to</span>{o.address}</div>
                        <div className="dfield"><span className="dlabel">Placed</span>{o.placed}</div>
                        <div className="dfield"><span className="dlabel">Shipped</span>{o.ship || "Not yet"}</div>
                        <div className="dfield"><span className="dlabel">Items</span>{o.items}</div>
                        <div className="dfield"><span className="dlabel">Value</span>{money(o.value)}</div>
                      </div>
                      <DeliveryTrack delivery={o.delivery} />
                    </td></tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
          <div className="hint">Tap any order to see the delivery pipeline.</div>
        </section>
      )}

      {tab === "stock" && (
        <section className="card">
          <div className="stock-head">
            <div className="seg">
              <button className={stockView === "attention" ? "seg-btn on" : "seg-btn"} onClick={() => setStockView("attention")}>Needs attention ({outOfStock.length})</button>
              <button className={stockView === "all" ? "seg-btn on" : "seg-btn"} onClick={() => setStockView("all")}>All products ({allStock.length})</button>
            </div>
          </div>
          <table>
            <thead><tr><th>SKU</th><th>Product</th><th>Supplier</th><th className="r">On hand</th><th className="r">Reorder pt</th><th className="r">On order</th><th>Flag</th></tr></thead>
            <tbody>
              {(stockView === "all" ? allStock : outOfStock).map((p) => (
                <tr key={p.sku}>
                  <td className="mono">{p.sku}</td>
                  <td>{p.name}</td>
                  <td className="muted">{p.supplier}</td>
                  <td className="r"><strong style={{ color: p.critical ? "#a9826a" : p.low ? "#b08968" : "#4a8a7b" }}>{p.onHand}</strong></td>
                  <td className="r muted">{p.reorderPt}</td>
                  <td className="r">{p.onOrder || "\u2014"}</td>
                  <td>
                    {p.critical ? <span className="pill" style={{ color: "#a9826a", borderColor: "#a9826a" }}>Out of stock</span>
                      : p.low ? <span className="pill" style={{ color: "#b08968", borderColor: "#b08968" }}>Low</span>
                      : <span className="pill" style={{ color: "#4a8a7b", borderColor: "#4a8a7b" }}>In stock</span>}
                    {p.needsReorder && <span className="pill" style={{ color: "#5b8bb8", borderColor: "#5b8bb8", marginLeft: 6 }}>Reorder</span>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}

      {tab === "aging" && (
        <section className="aging-grid">
          <div className="card">
            <AgingReport title="Unfulfilled orders by age" rows={unfulfilled} valueKey="value" valueFmt={money} accent={THEME.brown} />
            <table className="mini">
              <thead><tr><th>Order</th><th className="r">Age</th><th className="r">Value</th></tr></thead>
              <tbody>{unfulfilled.map((o) => (<tr key={o.id}><td className="mono">{o.id}</td><td className="r">{o.age == null ? "\u2014" : o.age + "d"}</td><td className="r">{money(o.value)}</td></tr>))}</tbody>
            </table>
          </div>
          <div className="card">
            <AgingReport title="Stock shortfall by severity" rows={outOfStock} valueKey="reorderPt" valueFmt={(n) => n + " u"} accent={THEME.accent} buckets={SHORTFALL_BUCKETS} bucketKey="shortfallBucket" />
            <table className="mini">
              <thead><tr><th>SKU</th><th>Product</th><th className="r">On hand</th><th className="r">Reorder</th></tr></thead>
              <tbody>{outOfStock.map((p) => (<tr key={p.sku}><td className="mono">{p.sku}</td><td>{p.name}</td><td className="r"><strong style={{ color: p.critical ? "#a9826a" : "#b08968" }}>{p.onHand}</strong></td><td className="r muted">{p.reorderPt}</td></tr>))}</tbody>
            </table>
          </div>
        </section>
      )}
    </div>
  );
}

const css = `
.wrap{--bg:${THEME.bg};--surface:${THEME.surface};--surface-alt:${THEME.surfaceAlt};--border:${THEME.border};--text:${THEME.text};--dim:${THEME.textDim};--accent:${THEME.accent};--accent-soft:${THEME.accentSoft};--brown:${THEME.brown};
font-family:'Inter',system-ui,sans-serif;max-width:1080px;margin:0 auto;padding:28px;color:var(--text);background:var(--bg);min-height:100vh;}
.head{display:flex;justify-content:space-between;align-items:flex-end;gap:24px;flex-wrap:wrap;margin-bottom:24px;}
.eyebrow{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--accent);font-weight:600;}
.head h1{font-size:30px;margin:6px 0 0;letter-spacing:-.02em;font-weight:800;color:var(--text);}
.src-badge{display:inline-block;margin-top:8px;font-size:11px;font-weight:700;letter-spacing:.04em;color:var(--dim);background:var(--surface-alt);border:1px solid var(--border);padding:3px 10px;border-radius:99px;}
.src-badge.live{color:#2f7d5b;background:#eef7f1;border-color:#cfe8d9;}
.kpis{display:flex;gap:12px;flex-wrap:wrap;}
.kpi{background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:12px 16px;min-width:96px;}
.kpi-n{display:block;font-size:22px;font-weight:800;letter-spacing:-.02em;color:var(--text);}
.kpi-l{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;}
.kpi.alert{border-color:#e6d3c4;background:#faf4ef;}
.tabs{display:flex;gap:4px;margin-bottom:18px;border-bottom:1px solid var(--border);}
.tab{background:none;border:none;padding:10px 16px;font-size:14px;font-weight:600;color:var(--dim);cursor:pointer;border-bottom:2px solid transparent;margin-bottom:-1px;}
.tab.on{color:var(--accent);border-bottom-color:var(--accent);}
.card{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:8px 8px 4px;overflow:hidden;margin-bottom:18px;}
table{width:100%;border-collapse:collapse;font-size:13.5px;}
th{text-align:left;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);padding:12px;border-bottom:1px solid var(--border);font-weight:700;}
td{padding:12px;border-bottom:1px solid var(--border);color:var(--text);}
tr:last-child td{border-bottom:none;}
.r{text-align:right;}
.row{cursor:pointer;}
.row:hover{background:var(--surface-alt);}
.mono{font-family:'SF Mono',ui-monospace,monospace;font-size:12.5px;font-weight:600;}
.small{font-size:11.5px;font-weight:500;}
.muted{color:var(--dim);}
.pill,.dpill{display:inline-block;font-size:11px;font-weight:700;padding:3px 9px;border-radius:99px;border:1.4px solid;letter-spacing:.02em;white-space:nowrap;}
.nowrap{white-space:nowrap;}
.fc-tag{display:inline-block;font-size:11.5px;font-weight:600;color:var(--brown);background:#faf4ef;border:1px solid #ecdfd4;padding:2px 8px;border-radius:6px;}
.courier-cell{display:flex;align-items:center;height:26px;}
.courier-svg{height:22px;width:auto;max-width:84px;}
.courier-text{font-weight:700;font-size:12px;}
.detail td{background:var(--surface-alt);padding:18px;}
.detail-grid{display:flex;gap:28px;flex-wrap:wrap;margin-bottom:18px;}
.dfield{font-size:13.5px;font-weight:600;display:flex;flex-direction:column;gap:3px;color:var(--text);}
.dlabel{font-size:10.5px;text-transform:uppercase;letter-spacing:.06em;color:var(--dim);font-weight:700;}
.track{display:flex;align-items:center;max-width:520px;}
.dot{width:14px;height:14px;border-radius:50%;background:var(--border);flex-shrink:0;}
.dot.done{background:var(--accent);}
.bar{flex:1;height:3px;background:var(--border);}
.bar.done{background:var(--accent);}
.track-back{color:#a9826a;font-weight:700;font-size:13px;}
.hint{font-size:12px;color:var(--dim);padding:10px 12px;}
.stock-head{display:flex;justify-content:flex-start;padding:10px 8px 4px;}
.seg{display:inline-flex;background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:3px;gap:2px;}
.seg-btn{background:none;border:none;padding:7px 14px;font-size:12.5px;font-weight:700;color:var(--dim);cursor:pointer;border-radius:8px;transition:all .15s;}
.seg-btn.on{background:var(--surface);color:var(--accent);box-shadow:0 1px 2px rgba(0,0,0,.06);}
.aging-grid{display:grid;grid-template-columns:1fr 1fr;gap:18px;}
.aging{padding:16px 16px 8px;}
.aging h3{margin:0 0 18px;font-size:15px;font-weight:700;color:var(--text);}
.aging-bars{display:flex;gap:14px;height:150px;align-items:flex-end;}
.aging-col{flex:1;display:flex;flex-direction:column;height:100%;}
.aging-track{flex:1;display:flex;align-items:flex-end;}
.aging-fill{width:100%;border-radius:7px 7px 0 0;min-height:26px;position:relative;display:flex;justify-content:center;align-items:flex-start;padding-top:6px;transition:height .4s;}
.aging-count{color:#fff;font-weight:800;font-size:14px;}
.aging-meta{padding-top:8px;text-align:center;}
.aging-label{font-size:11px;color:var(--dim);font-weight:600;}
.aging-total{font-size:12px;font-weight:700;color:var(--text);}
.mini{margin-top:8px;}
.mini th,.mini td{padding:8px 12px;}
@media(max-width:820px){.aging-grid{grid-template-columns:1fr;}.head{flex-direction:column;align-items:flex-start;}}
`;
