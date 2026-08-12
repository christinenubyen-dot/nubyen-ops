import React, { useState, useMemo, useEffect } from "react";

// ====================================================================
//  THEME — replace these with your nubyen-launchpad values.
//  (Sandbox couldn't reach the site to read them automatically.)
// ====================================================================
// The shared Google Sheet where the team marks "email sent" and adds remarks.
// Paste your sheet's URL here after you create it (see APPS_SCRIPT_SETUP.md).
const WORKING_SHEET_URL = "";

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
const MOCK_ORDERS = [{"id": "SO-10004", "customer": "Camille Chen", "customerId": 1003, "customerOrders": 1, "placed": "2026-07-28", "value": 60, "gross": 60, "discounts": 0, "refunds": 0, "net": 60, "status": "Shipped", "items": 1, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 1, "revenue": 60, "type": "Clothing"}], "region": "New South Wales", "country": "AU", "courier": "Royal Mail", "tracking": "TRK10004", "delivery": "In transit", "eta": null, "ship": "2026-07-29", "fc": "Launchpad", "address": "New South Wales, AU", "email": "camille.chen@example.com"}, {"id": "SO-10108", "customer": "Leo Bergström", "customerId": 1107, "customerOrders": 1, "placed": "2026-07-25", "value": 120, "gross": 120, "discounts": 0, "refunds": 0, "net": 120, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 120, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "UPS", "tracking": "TRK10108", "delivery": "Delivered", "eta": null, "ship": "2026-07-26", "fc": "Tarlu", "address": "Metro Manila, PH", "email": "leo.bergstrom@example.com"}, {"id": "SO-10011", "customer": "Priya Haddad", "customerId": 1010, "customerOrders": 1, "placed": "2026-07-24", "value": 114, "gross": 124, "discounts": 10, "refunds": 0, "net": 114, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 60, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 64, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "USPS", "tracking": "TRK10011", "delivery": "Delivered", "eta": null, "ship": "2026-07-25", "fc": "Launchpad", "address": "Texas, US", "email": "priya.haddad@example.com"}, {"id": "SO-10066", "customer": "Amara Torres", "customerId": 1065, "customerOrders": 1, "placed": "2026-07-24", "value": 67, "gross": 72, "discounts": 5, "refunds": 0, "net": 67, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 3, "revenue": 72, "type": "Clothing"}], "region": "Florida", "country": "US", "courier": "USPS", "tracking": "TRK10066", "delivery": "Delivered", "eta": null, "ship": "2026-07-25", "fc": "Tarlu", "address": "Florida, US", "email": "amara.torres@example.com"}, {"id": "SO-10085", "customer": "Sofia Bergström", "customerId": 1084, "customerOrders": 1, "placed": "2026-07-23", "value": 32, "gross": 32, "discounts": 0, "refunds": 0, "net": 32, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "California", "country": "US", "courier": "FedEx", "tracking": "TRK10085", "delivery": "Delivered", "eta": null, "ship": "2026-07-24", "fc": "Tarlu", "address": "California, US", "email": "sofia.bergstrom@example.com"}, {"id": "SO-10120", "customer": "Olivia Marchetti", "customerId": 1119, "customerOrders": 2, "placed": "2026-07-23", "value": 31, "gross": 36, "discounts": 5, "refunds": 0, "net": 31, "status": "Shipped", "items": 2, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 36, "type": "Beauty"}], "region": "New York", "country": "US", "courier": "UPS", "tracking": "TRK10120", "delivery": "In transit", "eta": null, "ship": "2026-07-24", "fc": "Launchpad", "address": "New York, US", "email": "olivia.marchetti@example.com"}, {"id": "SO-10080", "customer": "Amara Rossi", "customerId": 1079, "customerOrders": 2, "placed": "2026-07-22", "value": 177, "gross": 177, "discounts": 0, "refunds": 0, "net": 177, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 135, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 24, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "UPS", "tracking": "TRK10080", "delivery": "Delivered", "eta": null, "ship": "2026-07-23", "fc": "Tarlu", "address": "Texas, US", "email": "amara.rossi@example.com"}, {"id": "SO-10008", "customer": "Olivia Brooks", "customerId": 1007, "customerOrders": 2, "placed": "2026-07-19", "value": 0, "gross": 109, "discounts": 0, "refunds": 109, "net": 0, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 1, "revenue": 24, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 85, "type": "Beauty"}], "region": "New York", "country": "US", "courier": "UPS", "tracking": "TRK10008", "delivery": "Delivered", "eta": null, "ship": "2026-07-20", "fc": "Tarlu", "address": "New York, US", "email": "olivia.brooks@example.com"}, {"id": "SO-10043", "customer": "Omar Marchetti", "customerId": 1042, "customerOrders": 2, "placed": "2026-07-19", "value": 120, "gross": 120, "discounts": 0, "refunds": 0, "net": 120, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 2, "revenue": 120, "type": "Clothing"}], "region": "England", "country": "GB", "courier": "UPS", "tracking": "TRK10043", "delivery": "Delivered", "eta": null, "ship": "2026-07-20", "fc": "Tarlu", "address": "England, GB", "email": "omar.marchetti@example.com"}, {"id": "SO-10071", "customer": "Yuki Chen", "customerId": 1070, "customerOrders": 2, "placed": "2026-07-19", "value": 220, "gross": 225, "discounts": 5, "refunds": 0, "net": 220, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 45, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 60, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "New South Wales, AU", "email": "yuki.chen@example.com"}, {"id": "SO-10100", "customer": "Amara Carter", "customerId": 1099, "customerOrders": 1, "placed": "2026-07-19", "value": 340, "gross": 340, "discounts": 0, "refunds": 0, "net": 340, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 170, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 170, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "New South Wales, AU", "email": "amara.carter@example.com"}, {"id": "SO-10116", "customer": "Leo Marchetti", "customerId": 1115, "customerOrders": 2, "placed": "2026-07-19", "value": 300, "gross": 300, "discounts": 0, "refunds": 0, "net": 300, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 120, "type": "Beauty"}], "region": "England", "country": "GB", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "England, GB", "email": "leo.marchetti@example.com"}, {"id": "SO-10135", "customer": "Amara Khan", "customerId": 1134, "customerOrders": 1, "placed": "2026-07-17", "value": 165, "gross": 170, "discounts": 5, "refunds": 0, "net": 165, "status": "Processing", "items": 2, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 170, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "New York, US", "email": "amara.khan@example.com"}, {"id": "SO-10060", "customer": "Yuki Tanaka", "customerId": 1059, "customerOrders": 2, "placed": "2026-07-16", "value": 109, "gross": 109, "discounts": 0, "refunds": 0, "net": 109, "status": "Unfulfilled", "items": 3, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 64, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 1, "revenue": 45, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Tarlu", "address": "New York, US", "email": "yuki.tanaka@example.com"}, {"id": "SO-10103", "customer": "Kenji Nair", "customerId": 1102, "customerOrders": 2, "placed": "2026-07-15", "value": 305, "gross": 310, "discounts": 5, "refunds": 0, "net": 305, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 45, "type": "Clothing"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 1, "revenue": 85, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": "USPS", "tracking": "TRK10103", "delivery": "Delivered", "eta": null, "ship": "2026-07-16", "fc": "Launchpad", "address": "Texas, US", "email": "kenji.nair@example.com"}, {"id": "SO-10050", "customer": "Daniel Carter", "customerId": 1049, "customerOrders": 1, "placed": "2026-07-13", "value": 18, "gross": 18, "discounts": 0, "refunds": 0, "net": 18, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 18, "type": "Clothing"}], "region": "Metro Manila", "country": "PH", "courier": "USPS", "tracking": "TRK10050", "delivery": "Delivered", "eta": null, "ship": "2026-07-14", "fc": "Tarlu", "address": "Metro Manila, PH", "email": "daniel.carter@example.com"}, {"id": "SO-10136", "customer": "Aisha Sato", "customerId": 1135, "customerOrders": 1, "placed": "2026-07-13", "value": 48, "gross": 48, "discounts": 0, "refunds": 0, "net": 48, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 2, "revenue": 48, "type": "Clothing"}], "region": "Ontario", "country": "CA", "courier": "DHL", "tracking": "TRK10136", "delivery": "Delivered", "eta": null, "ship": "2026-07-14", "fc": "Tarlu", "address": "Ontario, CA", "email": "aisha.sato@example.com"}, {"id": "SO-10118", "customer": "Sofia Haddad", "customerId": 1117, "customerOrders": 1, "placed": "2026-07-12", "value": 312, "gross": 322, "discounts": 10, "refunds": 0, "net": 312, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 64, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "FedEx", "tracking": "TRK10118", "delivery": "Delivered", "eta": null, "ship": "2026-07-13", "fc": "Launchpad", "address": "Florida, US", "email": "sofia.haddad@example.com"}, {"id": "SO-10139", "customer": "Daniel Chen", "customerId": 1138, "customerOrders": 1, "placed": "2026-07-12", "value": 170, "gross": 170, "discounts": 0, "refunds": 0, "net": 170, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 170, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "USPS", "tracking": "TRK10139", "delivery": "Delivered", "eta": null, "ship": "2026-07-13", "fc": "Tarlu", "address": "England, GB", "email": "daniel.chen@example.com"}, {"id": "SO-10137", "customer": "Freya Okafor", "customerId": 1136, "customerOrders": 4, "placed": "2026-07-11", "value": 327, "gross": 327, "discounts": 0, "refunds": 0, "net": 327, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 3, "revenue": 255, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 72, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "UPS", "tracking": "TRK10137", "delivery": "Delivered", "eta": null, "ship": "2026-07-12", "fc": "Tarlu", "address": "Florida, US", "email": "freya.okafor@example.com"}, {"id": "SO-10123", "customer": "Priya Haddad", "customerId": 1122, "customerOrders": 2, "placed": "2026-07-10", "value": 495, "gross": 495, "discounts": 0, "refunds": 0, "net": 495, "status": "Unfulfilled", "items": 5, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 240, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 255, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "New South Wales, AU", "email": "priya.haddad@example.com"}, {"id": "SO-10133", "customer": "Freya Tanaka", "customerId": 1132, "customerOrders": 1, "placed": "2026-07-10", "value": 74, "gross": 74, "discounts": 0, "refunds": 0, "net": 74, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 24, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 18, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "FedEx", "tracking": "TRK10133", "delivery": "Delivered", "eta": null, "ship": "2026-07-11", "fc": "Launchpad", "address": "New South Wales, AU", "email": "freya.tanaka@example.com"}, {"id": "SO-10073", "customer": "Yuki Whitmore", "customerId": 1072, "customerOrders": 1, "placed": "2026-07-09", "value": 420, "gross": 420, "discounts": 0, "refunds": 0, "net": 420, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 1, "revenue": 120, "type": "Clothing"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 255, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 1, "revenue": 45, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "Royal Mail", "tracking": "TRK10073", "delivery": "Delivered", "eta": null, "ship": "2026-07-10", "fc": "Launchpad", "address": "New York, US", "email": "yuki.whitmore@example.com"}, {"id": "SO-10021", "customer": "Diego Nair", "customerId": 1020, "customerOrders": 1, "placed": "2026-07-08", "value": 607, "gross": 612, "discounts": 5, "refunds": 0, "net": 607, "status": "Processing", "items": 9, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 360, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 3, "revenue": 72, "type": "Clothing"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "New York, US", "email": "diego.nair@example.com"}, {"id": "SO-10034", "customer": "Amara Marchetti", "customerId": 1033, "customerOrders": 3, "placed": "2026-07-08", "value": 255, "gross": 255, "discounts": 0, "refunds": 0, "net": 255, "status": "Processing", "items": 3, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 3, "revenue": 255, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "Texas, US", "email": "amara.marchetti@example.com"}, {"id": "SO-10039", "customer": "Leo Nilsson", "customerId": 1038, "customerOrders": 4, "placed": "2026-07-08", "value": 156, "gross": 156, "discounts": 0, "refunds": 0, "net": 156, "status": "Shipped", "items": 4, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 60, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 96, "type": "Beauty"}], "region": "New York", "country": "US", "courier": "FedEx", "tracking": "TRK10039", "delivery": "In transit", "eta": null, "ship": "2026-07-09", "fc": "Launchpad", "address": "New York, US", "email": "leo.nilsson@example.com"}, {"id": "SO-10012", "customer": "Freya Feldman", "customerId": 1011, "customerOrders": 1, "placed": "2026-07-02", "value": 240, "gross": 240, "discounts": 0, "refunds": 0, "net": 240, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 2, "revenue": 240, "type": "Clothing"}], "region": "Florida", "country": "US", "courier": "Royal Mail", "tracking": "TRK10012", "delivery": "Delivered", "eta": null, "ship": "2026-07-03", "fc": "Tarlu", "address": "Florida, US", "email": "freya.feldman@example.com"}, {"id": "SO-10127", "customer": "Aisha Brooks", "customerId": 1126, "customerOrders": 1, "placed": "2026-07-02", "value": 156, "gross": 156, "discounts": 0, "refunds": 0, "net": 156, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 60, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 2, "revenue": 64, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": "UPS", "tracking": "TRK10127", "delivery": "Delivered", "eta": null, "ship": "2026-07-03", "fc": "Launchpad", "address": "Texas, US", "email": "aisha.brooks@example.com"}, {"id": "SO-10044", "customer": "Priya Levine", "customerId": 1043, "customerOrders": 1, "placed": "2026-06-29", "value": 176, "gross": 186, "discounts": 10, "refunds": 0, "net": 176, "status": "Shipped", "items": 5, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 96, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 90, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "FedEx", "tracking": "TRK10044", "delivery": "In transit", "eta": null, "ship": "2026-06-30", "fc": "Tarlu", "address": "Metro Manila, PH", "email": "priya.levine@example.com"}, {"id": "SO-10111", "customer": "Sofia Feldman", "customerId": 1110, "customerOrders": 3, "placed": "2026-06-29", "value": 227, "gross": 237, "discounts": 10, "refunds": 0, "net": 227, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 1, "revenue": 120, "type": "Clothing"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "New York", "country": "US", "courier": "FedEx", "tracking": "TRK10111", "delivery": "Delivered", "eta": null, "ship": "2026-06-30", "fc": "Tarlu", "address": "New York, US", "email": "sofia.feldman@example.com"}, {"id": "SO-10023", "customer": "Freya Khan", "customerId": 1022, "customerOrders": 2, "placed": "2026-06-28", "value": 85, "gross": 85, "discounts": 0, "refunds": 0, "net": 85, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 85, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "USPS", "tracking": "TRK10023", "delivery": "Delivered", "eta": null, "ship": "2026-06-29", "fc": "Launchpad", "address": "Metro Manila, PH", "email": "freya.khan@example.com"}, {"id": "SO-10117", "customer": "Aisha Ali", "customerId": 1116, "customerOrders": 1, "placed": "2026-06-28", "value": 330, "gross": 330, "discounts": 0, "refunds": 0, "net": 330, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "Florida, US", "email": "aisha.ali@example.com"}, {"id": "SO-10016", "customer": "Lucas Rossi", "customerId": 1015, "customerOrders": 2, "placed": "2026-06-27", "value": 18, "gross": 18, "discounts": 0, "refunds": 0, "net": 18, "status": "Shipped", "items": 1, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 1, "revenue": 18, "type": "Clothing"}], "region": "New South Wales", "country": "AU", "courier": "DHL", "tracking": "TRK10016", "delivery": "In transit", "eta": null, "ship": "2026-06-28", "fc": "Launchpad", "address": "New South Wales, AU", "email": "lucas.rossi@example.com"}, {"id": "SO-10099", "customer": "Noah Torres", "customerId": 1098, "customerOrders": 1, "placed": "2026-06-27", "value": 160, "gross": 170, "discounts": 10, "refunds": 0, "net": 160, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 2, "revenue": 170, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "DHL", "tracking": "TRK10099", "delivery": "Delivered", "eta": null, "ship": "2026-06-28", "fc": "Launchpad", "address": "New York, US", "email": "noah.torres@example.com"}, {"id": "SO-10096", "customer": "Sofia Carter", "customerId": 1095, "customerOrders": 2, "placed": "2026-06-25", "value": 320, "gross": 325, "discounts": 5, "refunds": 0, "net": 320, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "UPS", "tracking": "TRK10096", "delivery": "Delivered", "eta": null, "ship": "2026-06-26", "fc": "Tarlu", "address": "Texas, US", "email": "sofia.carter@example.com"}, {"id": "SO-10082", "customer": "Sofia Carter", "customerId": 1081, "customerOrders": 1, "placed": "2026-06-24", "value": 18, "gross": 18, "discounts": 0, "refunds": 0, "net": 18, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 18, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "Royal Mail", "tracking": "TRK10082", "delivery": "Delivered", "eta": null, "ship": "2026-06-25", "fc": "Launchpad", "address": "England, GB", "email": "sofia.carter@example.com"}, {"id": "SO-10114", "customer": "Aisha Khan", "customerId": 1113, "customerOrders": 2, "placed": "2026-06-24", "value": 360, "gross": 360, "discounts": 0, "refunds": 0, "net": 360, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 1, "revenue": 60, "type": "Beauty"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 2, "revenue": 240, "type": "Clothing"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 60, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "Royal Mail", "tracking": "TRK10114", "delivery": "Delivered", "eta": null, "ship": "2026-06-25", "fc": "Launchpad", "address": "Florida, US", "email": "aisha.khan@example.com"}, {"id": "SO-10028", "customer": "Yuki Chen", "customerId": 1027, "customerOrders": 2, "placed": "2026-06-23", "value": 216, "gross": 216, "discounts": 0, "refunds": 0, "net": 216, "status": "Processing", "items": 5, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 36, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 180, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New South Wales, AU", "email": "yuki.chen@example.com"}, {"id": "SO-10125", "customer": "Sofia Levine", "customerId": 1124, "customerOrders": 4, "placed": "2026-06-23", "value": 100, "gross": 100, "discounts": 0, "refunds": 0, "net": 100, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 64, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 36, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "Royal Mail", "tracking": "TRK10125", "delivery": "Delivered", "eta": null, "ship": "2026-06-24", "fc": "Launchpad", "address": "Florida, US", "email": "sofia.levine@example.com"}, {"id": "SO-10022", "customer": "Noah Bergström", "customerId": 1021, "customerOrders": 1, "placed": "2026-06-22", "value": 96, "gross": 96, "discounts": 0, "refunds": 0, "net": 96, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 96, "type": "Beauty"}], "region": "New York", "country": "US", "courier": "UPS", "tracking": "TRK10022", "delivery": "Delivered", "eta": null, "ship": "2026-06-23", "fc": "Launchpad", "address": "New York, US", "email": "noah.bergstrom@example.com"}, {"id": "SO-10088", "customer": "Diego Okafor", "customerId": 1087, "customerOrders": 2, "placed": "2026-06-20", "value": 540, "gross": 540, "discounts": 0, "refunds": 0, "net": 540, "status": "Processing", "items": 6, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 360, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New York, US", "email": "diego.okafor@example.com"}, {"id": "SO-10029", "customer": "Noah Marchetti", "customerId": 1028, "customerOrders": 1, "placed": "2026-06-19", "value": 192, "gross": 192, "discounts": 0, "refunds": 0, "net": 192, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 3, "revenue": 72, "type": "Clothing"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 120, "type": "Clothing"}], "region": "Metro Manila", "country": "PH", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Tarlu", "address": "Metro Manila, PH", "email": "noah.marchetti@example.com"}, {"id": "SO-10057", "customer": "Mei Feldman", "customerId": 1056, "customerOrders": 1, "placed": "2026-06-19", "value": 312, "gross": 312, "discounts": 0, "refunds": 0, "net": 312, "status": "Shipped", "items": 5, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 240, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 72, "type": "Clothing"}], "region": "Ontario", "country": "CA", "courier": "Royal Mail", "tracking": "TRK10057", "delivery": "In transit", "eta": null, "ship": "2026-06-20", "fc": "Tarlu", "address": "Ontario, CA", "email": "mei.feldman@example.com"}, {"id": "SO-10077", "customer": "Sofia Okafor", "customerId": 1076, "customerOrders": 1, "placed": "2026-06-19", "value": 255, "gross": 255, "discounts": 0, "refunds": 0, "net": 255, "status": "Shipped", "items": 3, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 255, "type": "Beauty"}], "region": "California", "country": "US", "courier": "DHL", "tracking": "TRK10077", "delivery": "In transit", "eta": null, "ship": "2026-06-20", "fc": "Launchpad", "address": "California, US", "email": "sofia.okafor@example.com"}, {"id": "SO-10042", "customer": "Diego Okafor", "customerId": 1041, "customerOrders": 3, "placed": "2026-06-18", "value": 250, "gross": 260, "discounts": 10, "refunds": 0, "net": 250, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 170, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 2, "revenue": 90, "type": "Clothing"}], "region": "Ontario", "country": "CA", "courier": "Royal Mail", "tracking": "TRK10042", "delivery": "Delivered", "eta": null, "ship": "2026-06-19", "fc": "Launchpad", "address": "Ontario, CA", "email": "diego.okafor@example.com"}, {"id": "SO-10003", "customer": "Kenji Torres", "customerId": 1002, "customerOrders": 1, "placed": "2026-06-16", "value": 110, "gross": 110, "discounts": 0, "refunds": 0, "net": 110, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 60, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "USPS", "tracking": "TRK10003", "delivery": "Delivered", "eta": null, "ship": "2026-06-17", "fc": "Launchpad", "address": "New South Wales, AU", "email": "kenji.torres@example.com"}, {"id": "SO-10009", "customer": "Aisha Khan", "customerId": 1008, "customerOrders": 1, "placed": "2026-06-16", "value": 965, "gross": 975, "discounts": 10, "refunds": 0, "net": 965, "status": "Processing", "items": 9, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 360, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 255, "type": "Beauty"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 3, "revenue": 360, "type": "Clothing"}], "region": "Metro Manila", "country": "PH", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "Metro Manila, PH", "email": "aisha.khan@example.com"}, {"id": "SO-10095", "customer": "Hannah Carter", "customerId": 1094, "customerOrders": 2, "placed": "2026-06-16", "value": 224, "gross": 229, "discounts": 5, "refunds": 0, "net": 224, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 1, "revenue": 85, "type": "Clothing"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 54, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "USPS", "tracking": "TRK10095", "delivery": "Delivered", "eta": null, "ship": "2026-06-17", "fc": "Launchpad", "address": "Metro Manila, PH", "email": "hannah.carter@example.com"}, {"id": "SO-10105", "customer": "Sofia Bellini", "customerId": 1104, "customerOrders": 1, "placed": "2026-06-16", "value": 244, "gross": 249, "discounts": 5, "refunds": 0, "net": 244, "status": "Unfulfilled", "items": 7, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 96, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 3, "revenue": 135, "type": "Clothing"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "New York, US", "email": "sofia.bellini@example.com"}, {"id": "SO-10138", "customer": "Leo Nair", "customerId": 1137, "customerOrders": 2, "placed": "2026-06-16", "value": 300, "gross": 300, "discounts": 0, "refunds": 0, "net": 300, "status": "Shipped", "items": 4, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 120, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 180, "type": "Beauty"}], "region": "California", "country": "US", "courier": "FedEx", "tracking": "TRK10138", "delivery": "In transit", "eta": null, "ship": "2026-06-17", "fc": "Launchpad", "address": "California, US", "email": "leo.nair@example.com"}, {"id": "SO-10081", "customer": "Aisha Torres", "customerId": 1080, "customerOrders": 1, "placed": "2026-06-14", "value": 631, "gross": 636, "discounts": 5, "refunds": 0, "net": 631, "status": "Fulfilled", "items": 7, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 240, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 36, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 360, "type": "Beauty"}], "region": "California", "country": "US", "courier": "FedEx", "tracking": "TRK10081", "delivery": "Delivered", "eta": null, "ship": "2026-06-15", "fc": "Launchpad", "address": "California, US", "email": "aisha.torres@example.com"}, {"id": "SO-10033", "customer": "Freya Torres", "customerId": 1032, "customerOrders": 1, "placed": "2026-06-09", "value": 622, "gross": 632, "discounts": 10, "refunds": 0, "net": 622, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 360, "type": "Beauty"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 2, "revenue": 240, "type": "Clothing"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "California", "country": "US", "courier": "Royal Mail", "tracking": "TRK10033", "delivery": "Delivered", "eta": null, "ship": "2026-06-10", "fc": "Tarlu", "address": "California, US", "email": "freya.torres@example.com"}, {"id": "SO-10069", "customer": "Aisha Feldman", "customerId": 1068, "customerOrders": 3, "placed": "2026-06-08", "value": 0, "gross": 540, "discounts": 0, "refunds": 540, "net": 0, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 360, "type": "Clothing"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 2, "revenue": 120, "type": "Clothing"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 1, "revenue": 60, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "UPS", "tracking": "TRK10069", "delivery": "Delivered", "eta": null, "ship": "2026-06-09", "fc": "Tarlu", "address": "New York, US", "email": "aisha.feldman@example.com"}, {"id": "SO-10063", "customer": "Noah Dubois", "customerId": 1062, "customerOrders": 3, "placed": "2026-06-04", "value": 114, "gross": 114, "discounts": 0, "refunds": 0, "net": 114, "status": "Processing", "items": 4, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 96, "type": "Beauty"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "California, US", "email": "noah.dubois@example.com"}, {"id": "SO-10119", "customer": "Priya Marchetti", "customerId": 1118, "customerOrders": 1, "placed": "2026-06-04", "value": 32, "gross": 32, "discounts": 0, "refunds": 0, "net": 32, "status": "Unfulfilled", "items": 1, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Tarlu", "address": "California, US", "email": "priya.marchetti@example.com"}, {"id": "SO-10124", "customer": "Yuki Whitmore", "customerId": 1123, "customerOrders": 1, "placed": "2026-06-04", "value": 218, "gross": 218, "discounts": 0, "refunds": 0, "net": 218, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 48, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 170, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "UPS", "tracking": "TRK10124", "delivery": "Delivered", "eta": null, "ship": "2026-06-05", "fc": "Launchpad", "address": "New York, US", "email": "yuki.whitmore@example.com"}, {"id": "SO-10051", "customer": "Yuki Chen", "customerId": 1050, "customerOrders": 1, "placed": "2026-06-03", "value": 385, "gross": 385, "discounts": 0, "refunds": 0, "net": 385, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 2, "revenue": 170, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 170, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 1, "revenue": 45, "type": "Clothing"}], "region": "Florida", "country": "US", "courier": "DHL", "tracking": "TRK10051", "delivery": "Delivered", "eta": null, "ship": "2026-06-04", "fc": "Tarlu", "address": "Florida, US", "email": "yuki.chen@example.com"}, {"id": "SO-10040", "customer": "Camille Nair", "customerId": 1039, "customerOrders": 1, "placed": "2026-06-02", "value": 215, "gross": 215, "discounts": 0, "refunds": 0, "net": 215, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 45, "type": "Beauty"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 2, "revenue": 170, "type": "Clothing"}], "region": "Metro Manila", "country": "PH", "courier": "FedEx", "tracking": "TRK10040", "delivery": "Delivered", "eta": null, "ship": "2026-06-03", "fc": "Launchpad", "address": "Metro Manila, PH", "email": "camille.nair@example.com"}, {"id": "SO-10035", "customer": "Freya Sato", "customerId": 1034, "customerOrders": 1, "placed": "2026-06-01", "value": 149, "gross": 149, "discounts": 0, "refunds": 0, "net": 149, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 64, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "Royal Mail", "tracking": "TRK10035", "delivery": "Delivered", "eta": null, "ship": "2026-06-02", "fc": "Tarlu", "address": "Texas, US", "email": "freya.sato@example.com"}, {"id": "SO-10006", "customer": "Ethan Khan", "customerId": 1005, "customerOrders": 1, "placed": "2026-05-29", "value": 175, "gross": 175, "discounts": 0, "refunds": 0, "net": 175, "status": "Processing", "items": 3, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 1, "revenue": 85, "type": "Clothing"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "New South Wales, AU", "email": "ethan.khan@example.com"}, {"id": "SO-10134", "customer": "Priya Nair", "customerId": 1133, "customerOrders": 2, "placed": "2026-05-29", "value": 110, "gross": 120, "discounts": 10, "refunds": 0, "net": 110, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 2, "revenue": 120, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "UPS", "tracking": "TRK10134", "delivery": "Delivered", "eta": null, "ship": "2026-05-30", "fc": "Launchpad", "address": "Texas, US", "email": "priya.nair@example.com"}, {"id": "SO-10107", "customer": "Sofia Khan", "customerId": 1106, "customerOrders": 2, "placed": "2026-05-28", "value": 96, "gross": 96, "discounts": 0, "refunds": 0, "net": 96, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 96, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "Royal Mail", "tracking": "TRK10107", "delivery": "Delivered", "eta": null, "ship": "2026-05-29", "fc": "Launchpad", "address": "Texas, US", "email": "sofia.khan@example.com"}, {"id": "SO-10056", "customer": "Omar Chen", "customerId": 1055, "customerOrders": 1, "placed": "2026-05-26", "value": 345, "gross": 345, "discounts": 0, "refunds": 0, "net": 345, "status": "Fulfilled", "items": 8, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 255, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 36, "type": "Beauty"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 3, "revenue": 54, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": "DHL", "tracking": "TRK10056", "delivery": "Delivered", "eta": null, "ship": "2026-05-27", "fc": "Launchpad", "address": "Texas, US", "email": "omar.chen@example.com"}, {"id": "SO-10084", "customer": "Leo Ali", "customerId": 1083, "customerOrders": 1, "placed": "2026-05-24", "value": 231, "gross": 231, "discounts": 0, "refunds": 0, "net": 231, "status": "Processing", "items": 6, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 2, "revenue": 90, "type": "Clothing"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 1, "revenue": 45, "type": "Clothing"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 96, "type": "Clothing"}], "region": "Metro Manila", "country": "PH", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "Metro Manila, PH", "email": "leo.ali@example.com"}, {"id": "SO-10041", "customer": "Aisha Khan", "customerId": 1040, "customerOrders": 3, "placed": "2026-05-23", "value": 54, "gross": 54, "discounts": 0, "refunds": 0, "net": 54, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 54, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": "DHL", "tracking": "TRK10041", "delivery": "Delivered", "eta": null, "ship": "2026-05-24", "fc": "Tarlu", "address": "Texas, US", "email": "aisha.khan@example.com"}, {"id": "SO-10001", "customer": "Sofia Whitmore", "customerId": 1000, "customerOrders": 1, "placed": "2026-05-22", "value": 22, "gross": 32, "discounts": 10, "refunds": 0, "net": 22, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "USPS", "tracking": "TRK10001", "delivery": "Delivered", "eta": null, "ship": "2026-05-23", "fc": "Launchpad", "address": "Florida, US", "email": "sofia.whitmore@example.com"}, {"id": "SO-10055", "customer": "Olivia Bellini", "customerId": 1054, "customerOrders": 2, "placed": "2026-05-22", "value": 165, "gross": 165, "discounts": 0, "refunds": 0, "net": 165, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 120, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 45, "type": "Beauty"}], "region": "California", "country": "US", "courier": "Royal Mail", "tracking": "TRK10055", "delivery": "Delivered", "eta": null, "ship": "2026-05-23", "fc": "Tarlu", "address": "California, US", "email": "olivia.bellini@example.com"}, {"id": "SO-10046", "customer": "Lucas Nilsson", "customerId": 1045, "customerOrders": 1, "placed": "2026-05-21", "value": 780, "gross": 780, "discounts": 0, "refunds": 0, "net": 780, "status": "Fulfilled", "items": 8, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 360, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": "FedEx", "tracking": "TRK10046", "delivery": "Delivered", "eta": null, "ship": "2026-05-22", "fc": "Tarlu", "address": "Ontario, CA", "email": "lucas.nilsson@example.com"}, {"id": "SO-10110", "customer": "Omar Torres", "customerId": 1109, "customerOrders": 1, "placed": "2026-05-21", "value": 276, "gross": 276, "discounts": 0, "refunds": 0, "net": 276, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 2, "revenue": 36, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "FedEx", "tracking": "TRK10110", "delivery": "Delivered", "eta": null, "ship": "2026-05-22", "fc": "Tarlu", "address": "New York, US", "email": "omar.torres@example.com"}, {"id": "SO-10049", "customer": "Olivia Dubois", "customerId": 1048, "customerOrders": 2, "placed": "2026-05-17", "value": 144, "gross": 144, "discounts": 0, "refunds": 0, "net": 144, "status": "Fulfilled", "items": 7, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 72, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 54, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "USPS", "tracking": "TRK10049", "delivery": "Delivered", "eta": null, "ship": "2026-05-18", "fc": "Tarlu", "address": "New South Wales, AU", "email": "olivia.dubois@example.com"}, {"id": "SO-10052", "customer": "Leo Bergström", "customerId": 1051, "customerOrders": 4, "placed": "2026-05-15", "value": 157, "gross": 162, "discounts": 5, "refunds": 0, "net": 157, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 3, "revenue": 72, "type": "Clothing"}], "region": "California", "country": "US", "courier": "FedEx", "tracking": "TRK10052", "delivery": "Delivered", "eta": null, "ship": "2026-05-16", "fc": "Launchpad", "address": "California, US", "email": "leo.bergstrom@example.com"}, {"id": "SO-10112", "customer": "Aisha Brooks", "customerId": 1111, "customerOrders": 2, "placed": "2026-05-15", "value": 160, "gross": 170, "discounts": 10, "refunds": 0, "net": 160, "status": "Unfulfilled", "items": 2, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 85, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "Texas, US", "email": "aisha.brooks@example.com"}, {"id": "SO-10037", "customer": "Marcus Haddad", "customerId": 1036, "customerOrders": 2, "placed": "2026-05-13", "value": 173, "gross": 173, "discounts": 0, "refunds": 0, "net": 173, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 96, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 45, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "Royal Mail", "tracking": "TRK10037", "delivery": "Delivered", "eta": null, "ship": "2026-05-14", "fc": "Launchpad", "address": "Texas, US", "email": "marcus.haddad@example.com"}, {"id": "SO-10038", "customer": "Amara Brooks", "customerId": 1037, "customerOrders": 1, "placed": "2026-05-13", "value": 32, "gross": 32, "discounts": 0, "refunds": 0, "net": 32, "status": "Shipped", "items": 1, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 1, "revenue": 32, "type": "Clothing"}], "region": "New South Wales", "country": "AU", "courier": "FedEx", "tracking": "TRK10038", "delivery": "In transit", "eta": null, "ship": "2026-05-14", "fc": "Launchpad", "address": "New South Wales, AU", "email": "amara.brooks@example.com"}, {"id": "SO-10089", "customer": "Yuki Haddad", "customerId": 1088, "customerOrders": 1, "placed": "2026-05-13", "value": 165, "gross": 165, "discounts": 0, "refunds": 0, "net": 165, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 45, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 120, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "FedEx", "tracking": "TRK10089", "delivery": "Delivered", "eta": null, "ship": "2026-05-14", "fc": "Tarlu", "address": "Florida, US", "email": "yuki.haddad@example.com"}, {"id": "SO-10061", "customer": "Mei Marchetti", "customerId": 1060, "customerOrders": 1, "placed": "2026-05-12", "value": 180, "gross": 180, "discounts": 0, "refunds": 0, "net": 180, "status": "Processing", "items": 3, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 180, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "Texas, US", "email": "mei.marchetti@example.com"}, {"id": "SO-10068", "customer": "Omar Dubois", "customerId": 1067, "customerOrders": 1, "placed": "2026-05-12", "value": 32, "gross": 32, "discounts": 0, "refunds": 0, "net": 32, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "California", "country": "US", "courier": "Royal Mail", "tracking": "TRK10068", "delivery": "Delivered", "eta": null, "ship": "2026-05-13", "fc": "Tarlu", "address": "California, US", "email": "omar.dubois@example.com"}, {"id": "SO-10032", "customer": "Aisha Ali", "customerId": 1031, "customerOrders": 2, "placed": "2026-05-11", "value": 32, "gross": 32, "discounts": 0, "refunds": 0, "net": 32, "status": "Processing", "items": 1, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New York, US", "email": "aisha.ali@example.com"}, {"id": "SO-10094", "customer": "Amara Tanaka", "customerId": 1093, "customerOrders": 3, "placed": "2026-05-11", "value": 260, "gross": 260, "discounts": 0, "refunds": 0, "net": 260, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 2, "revenue": 170, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 90, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "Royal Mail", "tracking": "TRK10094", "delivery": "Delivered", "eta": null, "ship": "2026-05-12", "fc": "Launchpad", "address": "Metro Manila, PH", "email": "amara.tanaka@example.com"}, {"id": "SO-10047", "customer": "Yuki Nair", "customerId": 1046, "customerOrders": 1, "placed": "2026-05-09", "value": 374, "gross": 384, "discounts": 10, "refunds": 0, "net": 374, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 1, "revenue": 24, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "UPS", "tracking": "TRK10047", "delivery": "Delivered", "eta": null, "ship": "2026-05-10", "fc": "Tarlu", "address": "New South Wales, AU", "email": "yuki.nair@example.com"}, {"id": "SO-10031", "customer": "Camille Khan", "customerId": 1030, "customerOrders": 1, "placed": "2026-05-08", "value": 80, "gross": 80, "discounts": 0, "refunds": 0, "net": 80, "status": "Shipped", "items": 3, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 2, "revenue": 48, "type": "Clothing"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "California", "country": "US", "courier": "USPS", "tracking": "TRK10031", "delivery": "In transit", "eta": null, "ship": "2026-05-09", "fc": "Tarlu", "address": "California, US", "email": "camille.khan@example.com"}, {"id": "SO-10059", "customer": "Diego Chen", "customerId": 1058, "customerOrders": 1, "placed": "2026-05-07", "value": 48, "gross": 48, "discounts": 0, "refunds": 0, "net": 48, "status": "Processing", "items": 2, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 48, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New York, US", "email": "diego.chen@example.com"}, {"id": "SO-10083", "customer": "Hannah Dubois", "customerId": 1082, "customerOrders": 2, "placed": "2026-05-07", "value": 24, "gross": 24, "discounts": 0, "refunds": 0, "net": 24, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 24, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "USPS", "tracking": "TRK10083", "delivery": "Delivered", "eta": null, "ship": "2026-05-08", "fc": "Tarlu", "address": "Florida, US", "email": "hannah.dubois@example.com"}, {"id": "SO-10122", "customer": "Kenji Okafor", "customerId": 1121, "customerOrders": 2, "placed": "2026-05-05", "value": 201, "gross": 201, "discounts": 0, "refunds": 0, "net": 201, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 135, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 48, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 1, "revenue": 18, "type": "Clothing"}], "region": "California", "country": "US", "courier": "DHL", "tracking": "TRK10122", "delivery": "Delivered", "eta": null, "ship": "2026-05-06", "fc": "Tarlu", "address": "California, US", "email": "kenji.okafor@example.com"}, {"id": "SO-10074", "customer": "Hannah Carter", "customerId": 1073, "customerOrders": 1, "placed": "2026-05-04", "value": 124, "gross": 124, "discounts": 0, "refunds": 0, "net": 124, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 60, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "USPS", "tracking": "TRK10074", "delivery": "Delivered", "eta": null, "ship": "2026-05-05", "fc": "Launchpad", "address": "Metro Manila, PH", "email": "hannah.carter@example.com"}, {"id": "SO-10070", "customer": "Aisha Rossi", "customerId": 1069, "customerOrders": 3, "placed": "2026-05-03", "value": 54, "gross": 54, "discounts": 0, "refunds": 0, "net": 54, "status": "Unfulfilled", "items": 3, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 54, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "Texas, US", "email": "aisha.rossi@example.com"}, {"id": "SO-10101", "customer": "Daniel Ali", "customerId": 1100, "customerOrders": 1, "placed": "2026-05-02", "value": 81, "gross": 86, "discounts": 5, "refunds": 0, "net": 81, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 54, "type": "Beauty"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 32, "type": "Clothing"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "California, US", "email": "daniel.ali@example.com"}, {"id": "SO-10091", "customer": "Mei Chen", "customerId": 1090, "customerOrders": 1, "placed": "2026-04-29", "value": 306, "gross": 306, "discounts": 0, "refunds": 0, "net": 306, "status": "Shipped", "items": 9, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 3, "revenue": 54, "type": "Clothing"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 72, "type": "Beauty"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 3, "revenue": 180, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "Royal Mail", "tracking": "TRK10091", "delivery": "In transit", "eta": null, "ship": "2026-04-30", "fc": "Launchpad", "address": "New York, US", "email": "mei.chen@example.com"}, {"id": "SO-10092", "customer": "Yuki Dubois", "customerId": 1091, "customerOrders": 1, "placed": "2026-04-29", "value": 230, "gross": 240, "discounts": 10, "refunds": 0, "net": 230, "status": "Fulfilled", "items": 9, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 72, "type": "Clothing"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 72, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 96, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "DHL", "tracking": "TRK10092", "delivery": "Delivered", "eta": null, "ship": "2026-04-30", "fc": "Tarlu", "address": "New York, US", "email": "yuki.dubois@example.com"}, {"id": "SO-10104", "customer": "Ethan Chen", "customerId": 1103, "customerOrders": 1, "placed": "2026-04-29", "value": 169, "gross": 169, "discounts": 0, "refunds": 0, "net": 169, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 60, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 24, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "USPS", "tracking": "TRK10104", "delivery": "Delivered", "eta": null, "ship": "2026-04-30", "fc": "Launchpad", "address": "New South Wales, AU", "email": "ethan.chen@example.com"}, {"id": "SO-10115", "customer": "Ethan Bergström", "customerId": 1114, "customerOrders": 1, "placed": "2026-04-29", "value": 38, "gross": 48, "discounts": 10, "refunds": 0, "net": 38, "status": "Shipped", "items": 2, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 48, "type": "Beauty"}], "region": "California", "country": "US", "courier": "DHL", "tracking": "TRK10115", "delivery": "In transit", "eta": null, "ship": "2026-04-30", "fc": "Tarlu", "address": "California, US", "email": "ethan.bergstrom@example.com"}, {"id": "SO-10045", "customer": "Hannah Dubois", "customerId": 1044, "customerOrders": 3, "placed": "2026-04-23", "value": 312, "gross": 312, "discounts": 0, "refunds": 0, "net": 312, "status": "Processing", "items": 5, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 2, "revenue": 240, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 72, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "Texas, US", "email": "hannah.dubois@example.com"}, {"id": "SO-10065", "customer": "Ethan Torres", "customerId": 1064, "customerOrders": 2, "placed": "2026-04-22", "value": 250, "gross": 250, "discounts": 0, "refunds": 0, "net": 250, "status": "Fulfilled", "items": 3, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 120, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 45, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "DHL", "tracking": "TRK10065", "delivery": "Delivered", "eta": null, "ship": "2026-04-23", "fc": "Tarlu", "address": "England, GB", "email": "ethan.torres@example.com"}, {"id": "SO-10014", "customer": "Priya Tanaka", "customerId": 1013, "customerOrders": 1, "placed": "2026-04-21", "value": 250, "gross": 250, "discounts": 0, "refunds": 0, "net": 250, "status": "Processing", "items": 7, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 96, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 64, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "Florida, US", "email": "priya.tanaka@example.com"}, {"id": "SO-10097", "customer": "Freya Nair", "customerId": 1096, "customerOrders": 1, "placed": "2026-04-21", "value": 303, "gross": 303, "discounts": 0, "refunds": 0, "net": 303, "status": "Processing", "items": 7, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 135, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 48, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "Metro Manila, PH", "email": "freya.nair@example.com"}, {"id": "SO-10015", "customer": "Diego Dubois", "customerId": 1014, "customerOrders": 1, "placed": "2026-04-20", "value": 339, "gross": 339, "discounts": 0, "refunds": 0, "net": 339, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 1, "revenue": 45, "type": "Clothing"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 3, "revenue": 54, "type": "Clothing"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 240, "type": "Clothing"}], "region": "New York", "country": "US", "courier": "USPS", "tracking": "TRK10015", "delivery": "Delivered", "eta": null, "ship": "2026-04-21", "fc": "Tarlu", "address": "New York, US", "email": "diego.dubois@example.com"}, {"id": "SO-10024", "customer": "Priya Whitmore", "customerId": 1023, "customerOrders": 1, "placed": "2026-04-20", "value": 253, "gross": 253, "discounts": 0, "refunds": 0, "net": 253, "status": "Fulfilled", "items": 8, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 135, "type": "Beauty"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 64, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 54, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "DHL", "tracking": "TRK10024", "delivery": "Delivered", "eta": null, "ship": "2026-04-21", "fc": "Launchpad", "address": "Florida, US", "email": "priya.whitmore@example.com"}, {"id": "SO-10058", "customer": "Hannah Torres", "customerId": 1057, "customerOrders": 2, "placed": "2026-04-20", "value": 35, "gross": 45, "discounts": 10, "refunds": 0, "net": 35, "status": "Shipped", "items": 1, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 45, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": "FedEx", "tracking": "TRK10058", "delivery": "In transit", "eta": null, "ship": "2026-04-21", "fc": "Tarlu", "address": "Ontario, CA", "email": "hannah.torres@example.com"}, {"id": "SO-10019", "customer": "Camille Nilsson", "customerId": 1018, "customerOrders": 1, "placed": "2026-04-16", "value": 255, "gross": 255, "discounts": 0, "refunds": 0, "net": 255, "status": "Processing", "items": 3, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 3, "revenue": 255, "type": "Beauty"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "California, US", "email": "camille.nilsson@example.com"}, {"id": "SO-10026", "customer": "Amara Dubois", "customerId": 1025, "customerOrders": 3, "placed": "2026-04-16", "value": 68, "gross": 68, "discounts": 0, "refunds": 0, "net": 68, "status": "Shipped", "items": 3, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 36, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "DHL", "tracking": "TRK10026", "delivery": "In transit", "eta": null, "ship": "2026-04-17", "fc": "Launchpad", "address": "New South Wales, AU", "email": "amara.dubois@example.com"}, {"id": "SO-10121", "customer": "Leo Khan", "customerId": 1120, "customerOrders": 1, "placed": "2026-04-16", "value": 130, "gross": 135, "discounts": 5, "refunds": 0, "net": 130, "status": "Shipped", "items": 3, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 135, "type": "Beauty"}], "region": "Texas", "country": "US", "courier": "FedEx", "tracking": "TRK10121", "delivery": "In transit", "eta": null, "ship": "2026-04-17", "fc": "Tarlu", "address": "Texas, US", "email": "leo.khan@example.com"}, {"id": "SO-10072", "customer": "Sofia Bergström", "customerId": 1071, "customerOrders": 1, "placed": "2026-04-15", "value": 31, "gross": 36, "discounts": 5, "refunds": 0, "net": 31, "status": "Shipped", "items": 2, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 2, "revenue": 36, "type": "Beauty"}], "region": "California", "country": "US", "courier": "DHL", "tracking": "TRK10072", "delivery": "In transit", "eta": null, "ship": "2026-04-16", "fc": "Tarlu", "address": "California, US", "email": "sofia.bergstrom@example.com"}, {"id": "SO-10075", "customer": "Zara Bergström", "customerId": 1074, "customerOrders": 1, "placed": "2026-04-13", "value": 512, "gross": 512, "discounts": 0, "refunds": 0, "net": 512, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 3, "revenue": 360, "type": "Clothing"}], "region": "Ontario", "country": "CA", "courier": "DHL", "tracking": "TRK10075", "delivery": "Delivered", "eta": null, "ship": "2026-04-14", "fc": "Launchpad", "address": "Ontario, CA", "email": "zara.bergstrom@example.com"}, {"id": "SO-10113", "customer": "Hannah Torres", "customerId": 1112, "customerOrders": 2, "placed": "2026-04-12", "value": 255, "gross": 255, "discounts": 0, "refunds": 0, "net": 255, "status": "Shipped", "items": 4, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 135, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 120, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": "USPS", "tracking": "TRK10113", "delivery": "In transit", "eta": null, "ship": "2026-04-13", "fc": "Launchpad", "address": "Ontario, CA", "email": "hannah.torres@example.com"}, {"id": "SO-10017", "customer": "Diego Bellini", "customerId": 1016, "customerOrders": 1, "placed": "2026-04-09", "value": 44, "gross": 54, "discounts": 10, "refunds": 0, "net": 44, "status": "Processing", "items": 3, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 3, "revenue": 54, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New York, US", "email": "diego.bellini@example.com"}, {"id": "SO-10048", "customer": "Lucas Tanaka", "customerId": 1047, "customerOrders": 4, "placed": "2026-04-08", "value": 60, "gross": 60, "discounts": 0, "refunds": 0, "net": 60, "status": "Processing", "items": 1, "lineItems": [{"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 1, "revenue": 60, "type": "Clothing"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "California, US", "email": "lucas.tanaka@example.com"}, {"id": "SO-10126", "customer": "Omar Nair", "customerId": 1125, "customerOrders": 3, "placed": "2026-04-07", "value": 258, "gross": 258, "discounts": 0, "refunds": 0, "net": 258, "status": "Shipped", "items": 3, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "USPS", "tracking": "TRK10126", "delivery": "In transit", "eta": null, "ship": "2026-04-08", "fc": "Launchpad", "address": "England, GB", "email": "omar.nair@example.com"}, {"id": "SO-10102", "customer": "Lucas Bellini", "customerId": 1101, "customerOrders": 3, "placed": "2026-04-05", "value": 163, "gross": 168, "discounts": 5, "refunds": 0, "net": 163, "status": "Processing", "items": 4, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 24, "type": "Beauty"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 2, "revenue": 120, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 24, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "Ontario, CA", "email": "lucas.bellini@example.com"}, {"id": "SO-10079", "customer": "Aisha Carter", "customerId": 1078, "customerOrders": 4, "placed": "2026-04-04", "value": 18, "gross": 18, "discounts": 0, "refunds": 0, "net": 18, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 1, "revenue": 18, "type": "Clothing"}], "region": "England", "country": "GB", "courier": "FedEx", "tracking": "TRK10079", "delivery": "Delivered", "eta": null, "ship": "2026-04-05", "fc": "Tarlu", "address": "England, GB", "email": "aisha.carter@example.com"}, {"id": "SO-10027", "customer": "Ethan Nilsson", "customerId": 1026, "customerOrders": 1, "placed": "2026-04-03", "value": 36, "gross": 36, "discounts": 0, "refunds": 0, "net": 36, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 2, "revenue": 36, "type": "Clothing"}], "region": "England", "country": "GB", "courier": "DHL", "tracking": "TRK10027", "delivery": "Delivered", "eta": null, "ship": "2026-04-04", "fc": "Tarlu", "address": "England, GB", "email": "ethan.nilsson@example.com"}, {"id": "SO-10106", "customer": "Aisha Dubois", "customerId": 1105, "customerOrders": 1, "placed": "2026-04-02", "value": 324, "gross": 324, "discounts": 0, "refunds": 0, "net": 324, "status": "Fulfilled", "items": 8, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 2, "revenue": 90, "type": "Clothing"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 54, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "Royal Mail", "tracking": "TRK10106", "delivery": "Delivered", "eta": null, "ship": "2026-04-03", "fc": "Launchpad", "address": "New South Wales, AU", "email": "aisha.dubois@example.com"}, {"id": "SO-10140", "customer": "Leo Ali", "customerId": 1139, "customerOrders": 1, "placed": "2026-04-01", "value": 244, "gross": 244, "discounts": 0, "refunds": 0, "net": 244, "status": "Processing", "items": 5, "lineItems": [{"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 2, "revenue": 64, "type": "Clothing"}, {"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 180, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New South Wales, AU", "email": "leo.ali@example.com"}, {"id": "SO-10067", "customer": "Freya Levine", "customerId": 1066, "customerOrders": 1, "placed": "2026-03-30", "value": 373, "gross": 378, "discounts": 5, "refunds": 0, "net": 373, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 18, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 360, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": "DHL", "tracking": "TRK10067", "delivery": "Delivered", "eta": null, "ship": "2026-03-31", "fc": "Tarlu", "address": "Ontario, CA", "email": "freya.levine@example.com"}, {"id": "SO-10020", "customer": "Daniel Chen", "customerId": 1019, "customerOrders": 1, "placed": "2026-03-28", "value": 125, "gross": 135, "discounts": 10, "refunds": 0, "net": 125, "status": "Processing", "items": 3, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 135, "type": "Beauty"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "California, US", "email": "daniel.chen@example.com"}, {"id": "SO-10078", "customer": "Leo Haddad", "customerId": 1077, "customerOrders": 1, "placed": "2026-03-28", "value": 72, "gross": 72, "discounts": 0, "refunds": 0, "net": 72, "status": "Processing", "items": 3, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 72, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "Ontario, CA", "email": "leo.haddad@example.com"}, {"id": "SO-10010", "customer": "Leo Marchetti", "customerId": 1009, "customerOrders": 2, "placed": "2026-03-27", "value": 48, "gross": 48, "discounts": 0, "refunds": 0, "net": 48, "status": "Shipped", "items": 2, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 48, "type": "Beauty"}], "region": "Ontario", "country": "CA", "courier": "FedEx", "tracking": "TRK10010", "delivery": "In transit", "eta": null, "ship": "2026-03-28", "fc": "Tarlu", "address": "Ontario, CA", "email": "leo.marchetti@example.com"}, {"id": "SO-10093", "customer": "Olivia Bellini", "customerId": 1092, "customerOrders": 4, "placed": "2026-03-27", "value": 120, "gross": 120, "discounts": 0, "refunds": 0, "net": 120, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 120, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "FedEx", "tracking": "TRK10093", "delivery": "Delivered", "eta": null, "ship": "2026-03-28", "fc": "Tarlu", "address": "Metro Manila, PH", "email": "olivia.bellini@example.com"}, {"id": "SO-10087", "customer": "Leo Okafor", "customerId": 1086, "customerOrders": 1, "placed": "2026-03-26", "value": 384, "gross": 394, "discounts": 10, "refunds": 0, "net": 384, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 64, "type": "Beauty"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "FedEx", "tracking": "TRK10087", "delivery": "Delivered", "eta": null, "ship": "2026-03-27", "fc": "Launchpad", "address": "England, GB", "email": "leo.okafor@example.com"}, {"id": "SO-10130", "customer": "Daniel Nilsson", "customerId": 1129, "customerOrders": 2, "placed": "2026-03-23", "value": 351, "gross": 351, "discounts": 0, "refunds": 0, "net": 351, "status": "Processing", "items": 6, "lineItems": [{"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 255, "type": "Beauty"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 96, "type": "Clothing"}], "region": "California", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "California, US", "email": "daniel.nilsson@example.com"}, {"id": "SO-10054", "customer": "Marcus Feldman", "customerId": 1053, "customerOrders": 1, "placed": "2026-03-21", "value": 595, "gross": 600, "discounts": 5, "refunds": 0, "net": 595, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 3, "revenue": 360, "type": "Clothing"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "New South Wales", "country": "AU", "courier": "UPS", "tracking": "TRK10054", "delivery": "Delivered", "eta": null, "ship": "2026-03-22", "fc": "Launchpad", "address": "New South Wales, AU", "email": "marcus.feldman@example.com"}, {"id": "SO-10076", "customer": "Yuki Bergström", "customerId": 1075, "customerOrders": 1, "placed": "2026-03-21", "value": 770, "gross": 770, "discounts": 0, "refunds": 0, "net": 770, "status": "Shipped", "items": 7, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 240, "type": "Clothing"}, {"title": "Muse Skin Beautifying LED Device", "sku": "NBTLED", "qty": 3, "revenue": 360, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 170, "type": "Beauty"}], "region": "California", "country": "US", "courier": "Royal Mail", "tracking": "TRK10076", "delivery": "In transit", "eta": null, "ship": "2026-03-22", "fc": "Launchpad", "address": "California, US", "email": "yuki.bergstrom@example.com"}, {"id": "SO-10090", "customer": "Olivia Torres", "customerId": 1089, "customerOrders": 2, "placed": "2026-03-21", "value": 298, "gross": 298, "discounts": 0, "refunds": 0, "net": 298, "status": "Shipped", "items": 6, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 3, "revenue": 96, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 2, "revenue": 170, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 32, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "USPS", "tracking": "TRK10090", "delivery": "In transit", "eta": null, "ship": "2026-03-22", "fc": "Tarlu", "address": "England, GB", "email": "olivia.torres@example.com"}, {"id": "SO-10005", "customer": "Kenji Ali", "customerId": 1004, "customerOrders": 1, "placed": "2026-03-19", "value": 90, "gross": 90, "discounts": 0, "refunds": 0, "net": 90, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 2, "revenue": 90, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": "DHL", "tracking": "TRK10005", "delivery": "Delivered", "eta": null, "ship": "2026-03-20", "fc": "Launchpad", "address": "Texas, US", "email": "kenji.ali@example.com"}, {"id": "SO-10002", "customer": "Sofia Sato", "customerId": 1001, "customerOrders": 1, "placed": "2026-03-18", "value": 74, "gross": 84, "discounts": 10, "refunds": 0, "net": 74, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 24, "type": "Beauty"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 1, "revenue": 60, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": "DHL", "tracking": "TRK10002", "delivery": "Delivered", "eta": null, "ship": "2026-03-19", "fc": "Tarlu", "address": "Florida, US", "email": "sofia.sato@example.com"}, {"id": "SO-10036", "customer": "Aisha Whitmore", "customerId": 1035, "customerOrders": 2, "placed": "2026-03-17", "value": 335, "gross": 340, "discounts": 5, "refunds": 0, "net": 335, "status": "Unfulfilled", "items": 4, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 85, "type": "Clothing"}, {"title": "Oversized Knit Sweater", "sku": "CLKNIT2", "qty": 3, "revenue": 255, "type": "Clothing"}], "region": "New South Wales", "country": "AU", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "New South Wales, AU", "email": "aisha.whitmore@example.com"}, {"id": "SO-10053", "customer": "Mei Levine", "customerId": 1052, "customerOrders": 1, "placed": "2026-03-16", "value": 369, "gross": 374, "discounts": 5, "refunds": 0, "net": 369, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 1, "revenue": 24, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 3, "revenue": 180, "type": "Beauty"}, {"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 170, "type": "Clothing"}], "region": "Ontario", "country": "CA", "courier": "FedEx", "tracking": "TRK10053", "delivery": "Delivered", "eta": null, "ship": "2026-03-17", "fc": "Tarlu", "address": "Ontario, CA", "email": "mei.levine@example.com"}, {"id": "SO-10098", "customer": "Aisha Nilsson", "customerId": 1097, "customerOrders": 1, "placed": "2026-03-15", "value": 210, "gross": 210, "discounts": 0, "refunds": 0, "net": 210, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 90, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 120, "type": "Beauty"}], "region": "England", "country": "GB", "courier": "USPS", "tracking": "TRK10098", "delivery": "Delivered", "eta": null, "ship": "2026-03-16", "fc": "Tarlu", "address": "England, GB", "email": "aisha.nilsson@example.com"}, {"id": "SO-10128", "customer": "Freya Bergström", "customerId": 1127, "customerOrders": 4, "placed": "2026-03-15", "value": 230, "gross": 240, "discounts": 10, "refunds": 0, "net": 230, "status": "Unfulfilled", "items": 2, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 2, "revenue": 240, "type": "Clothing"}], "region": "Ontario", "country": "CA", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Launchpad", "address": "Ontario, CA", "email": "freya.bergstrom@example.com"}, {"id": "SO-10131", "customer": "Hannah Ali", "customerId": 1130, "customerOrders": 3, "placed": "2026-03-15", "value": 156, "gross": 156, "discounts": 0, "refunds": 0, "net": 156, "status": "Processing", "items": 3, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 2, "revenue": 36, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 120, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Launchpad", "address": "Florida, US", "email": "hannah.ali@example.com"}, {"id": "SO-10064", "customer": "Noah Levine", "customerId": 1063, "customerOrders": 4, "placed": "2026-03-12", "value": 120, "gross": 120, "discounts": 0, "refunds": 0, "net": 120, "status": "Fulfilled", "items": 1, "lineItems": [{"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 120, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "FedEx", "tracking": "TRK10064", "delivery": "Delivered", "eta": null, "ship": "2026-03-13", "fc": "Launchpad", "address": "Metro Manila, PH", "email": "noah.levine@example.com"}, {"id": "SO-10086", "customer": "Sofia Whitmore", "customerId": 1085, "customerOrders": 3, "placed": "2026-03-12", "value": 78, "gross": 78, "discounts": 0, "refunds": 0, "net": 78, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 3, "revenue": 54, "type": "Beauty"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 1, "revenue": 24, "type": "Clothing"}], "region": "California", "country": "US", "courier": "USPS", "tracking": "TRK10086", "delivery": "Delivered", "eta": null, "ship": "2026-03-13", "fc": "Launchpad", "address": "California, US", "email": "sofia.whitmore@example.com"}, {"id": "SO-10025", "customer": "Camille Whitmore", "customerId": 1024, "customerOrders": 1, "placed": "2026-03-11", "value": 38, "gross": 48, "discounts": 10, "refunds": 0, "net": 38, "status": "Fulfilled", "items": 2, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 2, "revenue": 48, "type": "Clothing"}], "region": "New South Wales", "country": "AU", "courier": "FedEx", "tracking": "TRK10025", "delivery": "Delivered", "eta": null, "ship": "2026-03-12", "fc": "Launchpad", "address": "New South Wales, AU", "email": "camille.whitmore@example.com"}, {"id": "SO-10109", "customer": "Hannah Torres", "customerId": 1108, "customerOrders": 2, "placed": "2026-03-11", "value": 277, "gross": 277, "discounts": 0, "refunds": 0, "net": 277, "status": "Unfulfilled", "items": 6, "lineItems": [{"title": "Silk Lounge Set", "sku": "CLSILK1", "qty": 3, "revenue": 72, "type": "Clothing"}, {"title": "Wide-Leg Trousers", "sku": "CLTRS4", "qty": 1, "revenue": 85, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 120, "type": "Beauty"}], "region": "England", "country": "GB", "courier": null, "tracking": null, "delivery": "Awaiting pick", "eta": null, "ship": null, "fc": "Tarlu", "address": "England, GB", "email": "hannah.torres@example.com"}, {"id": "SO-10132", "customer": "Ethan Nair", "customerId": 1131, "customerOrders": 2, "placed": "2026-03-10", "value": 373, "gross": 378, "discounts": 5, "refunds": 0, "net": 373, "status": "Fulfilled", "items": 5, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 2, "revenue": 120, "type": "Beauty"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 1, "revenue": 18, "type": "Clothing"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 2, "revenue": 240, "type": "Beauty"}], "region": "California", "country": "US", "courier": "USPS", "tracking": "TRK10132", "delivery": "Delivered", "eta": null, "ship": "2026-03-11", "fc": "Launchpad", "address": "California, US", "email": "ethan.nair@example.com"}, {"id": "SO-10018", "customer": "Kenji Bergström", "customerId": 1017, "customerOrders": 1, "placed": "2026-03-08", "value": 319, "gross": 329, "discounts": 10, "refunds": 0, "net": 319, "status": "Fulfilled", "items": 6, "lineItems": [{"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 64, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 3, "revenue": 180, "type": "Beauty"}], "region": "New York", "country": "US", "courier": "USPS", "tracking": "TRK10018", "delivery": "Delivered", "eta": null, "ship": "2026-03-09", "fc": "Tarlu", "address": "New York, US", "email": "kenji.bergstrom@example.com"}, {"id": "SO-10013", "customer": "Yuki Khan", "customerId": 1012, "customerOrders": 1, "placed": "2026-03-07", "value": 326, "gross": 326, "discounts": 0, "refunds": 0, "net": 326, "status": "Processing", "items": 6, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 3, "revenue": 96, "type": "Clothing"}, {"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 60, "type": "Clothing"}, {"title": "Cheek Fila Reversible Filler", "sku": "NCHEEK", "qty": 2, "revenue": 170, "type": "Beauty"}], "region": "Florida", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "Florida, US", "email": "yuki.khan@example.com"}, {"id": "SO-10007", "customer": "Kenji Carter", "customerId": 1006, "customerOrders": 1, "placed": "2026-03-06", "value": 184, "gross": 189, "discounts": 5, "refunds": 0, "net": 184, "status": "Shipped", "items": 3, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 120, "type": "Beauty"}, {"title": "Val-i-date Body Firming Treatment", "sku": "NFIRM", "qty": 1, "revenue": 45, "type": "Beauty"}, {"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 24, "type": "Beauty"}], "region": "Metro Manila", "country": "PH", "courier": "USPS", "tracking": "TRK10007", "delivery": "In transit", "eta": null, "ship": "2026-03-07", "fc": "Tarlu", "address": "Metro Manila, PH", "email": "kenji.carter@example.com"}, {"id": "SO-10030", "customer": "Sofia Chen", "customerId": 1029, "customerOrders": 2, "placed": "2026-03-04", "value": 171, "gross": 181, "discounts": 10, "refunds": 0, "net": 171, "status": "Fulfilled", "items": 4, "lineItems": [{"title": "Nude Lip Augmentation Plumping Gloss", "sku": "NNUDE1", "qty": 1, "revenue": 85, "type": "Beauty"}, {"title": "Ribbed Midi Dress", "sku": "CLDRS5", "qty": 3, "revenue": 96, "type": "Clothing"}], "region": "England", "country": "GB", "courier": "UPS", "tracking": "TRK10030", "delivery": "Delivered", "eta": null, "ship": "2026-03-05", "fc": "Tarlu", "address": "England, GB", "email": "sofia.chen@example.com"}, {"id": "SO-10062", "customer": "Sofia Bellini", "customerId": 1061, "customerOrders": 3, "placed": "2026-03-02", "value": 32, "gross": 32, "discounts": 0, "refunds": 0, "net": 32, "status": "Shipped", "items": 1, "lineItems": [{"title": "Tailored Blazer", "sku": "CLBLZ3", "qty": 1, "revenue": 32, "type": "Clothing"}], "region": "Texas", "country": "US", "courier": "FedEx", "tracking": "TRK10062", "delivery": "In transit", "eta": null, "ship": "2026-03-03", "fc": "Tarlu", "address": "Texas, US", "email": "sofia.bellini@example.com"}, {"id": "SO-10129", "customer": "Marcus Rossi", "customerId": 1128, "customerOrders": 1, "placed": "2026-03-01", "value": 92, "gross": 92, "discounts": 0, "refunds": 0, "net": 92, "status": "Processing", "items": 2, "lineItems": [{"title": "Powerful Lip Plumping Lip Oil", "sku": "NLPO1", "qty": 1, "revenue": 32, "type": "Beauty"}, {"title": "Plumping Lip Fila Elixir Balm", "sku": "NLIPFIL", "qty": 1, "revenue": 60, "type": "Beauty"}], "region": "New York", "country": "US", "courier": null, "tracking": null, "delivery": "Label created", "eta": null, "ship": null, "fc": "Tarlu", "address": "New York, US", "email": "marcus.rossi@example.com"}];

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

// Reference "today" for all age calculations — the actual current date,
// normalized to local midnight so day-diffs are whole numbers.
const TODAY = (() => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
})();
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

function TrendChart({ series }) {
  const W = 640, H = 180, pad = 30;
  const vals = series.map((s) => s[1]);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const span = maxV - minV || 1;
  const x = (i) => pad + (i * (W - pad * 2)) / Math.max(1, series.length - 1);
  const y = (v) => H - pad - ((v - minV) / span) * (H - pad * 2);
  const pts = series.map((s, i) => `${x(i)},${y(s[1])}`).join(" ");
  const money2 = (n) => "$" + Math.round(n).toLocaleString();
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend">
      <polyline points={pts} fill="none" stroke="#5b8bb8" strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((s, i) => (<circle key={i} cx={x(i)} cy={y(s[1])} r="3" fill="#5b8bb8" />))}
      <text x={pad} y={16} className="trend-max">{money2(maxV)}</text>
      <text x={pad} y={H - 8} className="trend-lbl">{series[0][0]}</text>
      <text x={W - pad} y={H - 8} className="trend-lbl" textAnchor="end">{series[series.length - 1][0]}</text>
    </svg>
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

// ---- Summary analytics helpers --------------------------------------------
const monthKey = (d) => (d ? d.slice(0, 7) : null); // YYYY-MM
const inRange = (dateStr, from, to) => {
  if (!dateStr) return false;
  return (!from || dateStr >= from) && (!to || dateStr <= to);
};
const sumBy = (arr, f) => arr.reduce((s, x) => s + (f(x) || 0), 0);
const money0 = (n) => "$" + Math.round(n || 0).toLocaleString();

function monthlySeries(orders, field) {
  const m = {};
  for (const o of orders) {
    const k = monthKey(o.placed);
    if (!k) continue;
    m[k] = (m[k] || 0) + (o[field] || 0);
  }
  return Object.entries(m).sort((a, b) => a[0].localeCompare(b[0]));
}

function LineChart({ series, color = "#5b8bb8", fmt = (n) => n, height = 170 }) {
  const W = 640, H = height, pad = 34;
  if (!series || series.length === 0)
    return <div className="an-empty">No data in range.</div>;
  const vals = series.map((s) => s[1]);
  const maxV = Math.max(...vals, 1);
  const minV = Math.min(...vals, 0);
  const span = maxV - minV || 1;
  const x = (i) => pad + (i * (W - pad * 2)) / Math.max(1, series.length - 1);
  const y = (v) => H - pad - ((v - minV) / span) * (H - pad * 2);
  const pts = series.map((s, i) => `${x(i)},${y(s[1])}`).join(" ");
  return (
    <svg viewBox={`0 0 ${W} ${H}`} className="trend">
      <polyline points={pts} fill="none" stroke={color} strokeWidth="2.5" strokeLinejoin="round" strokeLinecap="round" />
      {series.map((s, i) => (<circle key={i} cx={x(i)} cy={y(s[1])} r="3" fill={color} />))}
      <text x={pad} y={16} className="trend-max">{fmt(maxV)}</text>
      <text x={pad} y={H - 8} className="trend-lbl">{series[0][0]}</text>
      {series.length > 1 && <text x={W - pad} y={H - 8} className="trend-lbl" textAnchor="end">{series[series.length - 1][0]}</text>}
    </svg>
  );
}

function BarList({ rows, color = "#5b8bb8", fmt = money0 }) {
  if (!rows || rows.length === 0) return <div className="an-empty">No data in range.</div>;
  const max = Math.max(...rows.map((r) => r.value), 1);
  return (
    <div className="an-bars">
      {rows.map((r) => (
        <div className="an-row" key={r.label}>
          <div className="an-row-label" title={r.label}>{r.label}</div>
          <div className="an-row-track"><div className="an-row-fill" style={{ width: `${(r.value / max) * 100}%`, background: color }} /></div>
          <div className="an-row-val">{fmt(r.value)}</div>
        </div>
      ))}
    </div>
  );
}

function MetricCard({ label, value, delta }) {
  return (
    <div className="an-card">
      <div className="an-n">{value}</div>
      <div className="an-l">{label}</div>
      {delta != null && Number.isFinite(delta) && (
        <div className={`an-delta ${delta >= 0 ? "up" : "down"}`}>
          {delta >= 0 ? "\u25b2" : "\u25bc"} {Math.abs(delta).toFixed(1)}% MoM
        </div>
      )}
    </div>
  );
}

export default function Dashboard() {
  const [tab, setTab] = useState("summary");
  const [open, setOpen] = useState(null);
  const [stockView, setStockView] = useState("attention"); // "attention" | "all"
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");

  // Live data from hourly Shopify sync (public/data.json), with mock fallback.
  const [ORDERS, setOrders] = useState(MOCK_ORDERS);
  const [PRODUCTS, setProducts] = useState(MOCK_PRODUCTS);
  const [source, setSource] = useState("mock"); // "mock" | "live"
  const [synced, setSynced] = useState(null);
  const [insights, setInsights] = useState([]);
  const [history, setHistory] = useState([]);

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
          if (Array.isArray(d.insights)) setInsights(d.insights);
        }
      })
      .catch(() => {
        /* keep mock data — dashboard still renders */
      });

    // History for trend charts (accumulates over time).
    fetch(`${import.meta.env.BASE_URL}history.json`, { cache: "no-store" })
      .then((r) => (r.ok ? r.json() : Promise.reject(new Error("no history"))))
      .then((h) => Array.isArray(h) && setHistory(h))
      .catch(() => {});
  }, []);

  const unfulfilled = useMemo(() => ORDERS.filter((o) => o.status === "Unfulfilled").map((o) => ({ ...o, age: daysSince(o.placed), bucket: bucketOf(daysSince(o.placed)) })).sort((a, b) => b.age - a.age), [ORDERS]);
  // Enrich every product, then derive the "needs attention" subset from it.
  const allStock = useMemo(() => PRODUCTS.map((p) => ({ ...p, age: daysSince(p.lastStocked), bucket: bucketOf(daysSince(p.lastStocked)), shortfallBucket: shortfallBucketOf(p.onHand, p.reorderPt), critical: p.onHand <= 0, low: p.onHand > 0 && p.onHand < p.reorderPt, needsReorder: p.onOrder === 0 && p.onHand < p.reorderPt })).sort((a, b) => a.onHand - b.onHand), [PRODUCTS]);
  const outOfStock = useMemo(() => allStock.filter((p) => p.critical || p.low).sort((a, b) => b.age - a.age), [allStock]);

  // Analytics computed from current orders/stock (works for live and mock).
  const analytics = useMemo(() => {
    const statusBreakdown = {};
    for (const o of ORDERS) {
      const k = o.status || "Unknown";
      if (!statusBreakdown[k]) statusBreakdown[k] = { count: 0, value: 0 };
      statusBreakdown[k].count += 1;
      statusBreakdown[k].value += o.value || 0;
    }
    const revByDay = {};
    for (const o of ORDERS) {
      if (!o.placed) continue;
      revByDay[o.placed] = (revByDay[o.placed] || 0) + (o.value || 0);
    }
    const revenueSeries = Object.entries(revByDay).sort((a, b) => a[0].localeCompare(b[0]));
    return {
      totalValue: ORDERS.reduce((s, o) => s + (o.value || 0), 0),
      statusBreakdown,
      revenueSeries,
    };
  }, [ORDERS]);

  // Data date bounds (for the range picker defaults).
  const dateBounds = useMemo(() => {
    const ds = ORDERS.map((o) => o.placed).filter(Boolean).sort();
    return { min: ds[0] || "", max: ds[ds.length - 1] || "" };
  }, [ORDERS]);

  // Effective range: explicit selection, else full span.
  const fromEff = dateFrom || dateBounds.min;
  const toEff = dateTo || dateBounds.max;

  // Orders within the selected date range.
  const rangeOrders = useMemo(
    () => ORDERS.filter((o) => inRange(o.placed, fromEff, toEff)),
    [ORDERS, fromEff, toEff]
  );

  // The full Summary analytics object, all date-filtered.
  const summary = useMemo(() => {
    const os = rangeOrders;
    const gross = sumBy(os, (o) => o.gross ?? o.value);
    const discounts = sumBy(os, (o) => o.discounts ?? 0);
    const refunds = sumBy(os, (o) => o.refunds ?? 0);
    const net = sumBy(os, (o) => o.net ?? o.value);
    const orderCount = os.length;
    const aov = orderCount ? net / orderCount : 0;

    // Monthly series for charts + MoM deltas.
    const grossSeries = monthlySeries(os, "gross").map(([m, v]) => [m, v]);
    const netSeries = monthlySeries(os, "net").map(([m, v]) => [m, v]);
    const monthsCount = {};
    for (const o of os) { const k = monthKey(o.placed); if (k) monthsCount[k] = (monthsCount[k] || 0) + 1; }
    const aovSeries = Object.entries(
      os.reduce((acc, o) => {
        const k = monthKey(o.placed); if (!k) return acc;
        acc[k] = acc[k] || { net: 0, n: 0 };
        acc[k].net += o.net ?? o.value; acc[k].n += 1; return acc;
      }, {})
    ).sort((a, b) => a[0].localeCompare(b[0])).map(([m, v]) => [m, v.n ? Math.round(v.net / v.n) : 0]);

    const momDelta = (series) => {
      if (series.length < 2) return null;
      const prev = series[series.length - 2][1], cur = series[series.length - 1][1];
      return prev ? ((cur - prev) / prev) * 100 : null;
    };

    // Top 5 products by revenue, split by category.
    const prodAgg = {};
    for (const o of os) {
      for (const li of o.lineItems || []) {
        const key = li.title;
        if (!prodAgg[key]) prodAgg[key] = { label: li.title, value: 0, type: li.type || "Other" };
        prodAgg[key].value += li.revenue || 0;
      }
    }
    const allProds = Object.values(prodAgg);
    const topBeauty = allProds.filter((p) => p.type === "Beauty").sort((a, b) => b.value - a.value).slice(0, 5);
    const topClothing = allProds.filter((p) => p.type === "Clothing").sort((a, b) => b.value - a.value).slice(0, 5);

    // Sales by region (demographic view from shipping data).
    const regionAgg = {};
    for (const o of os) {
      const k = o.region || "Unknown";
      regionAgg[k] = (regionAgg[k] || 0) + (o.net ?? o.value);
    }
    const byRegion = Object.entries(regionAgg).map(([label, value]) => ({ label, value })).sort((a, b) => b.value - a.value).slice(0, 8);

    // Returning customer rate over time (share of orders from customerOrders > 1).
    const rcByMonth = {};
    for (const o of os) {
      const k = monthKey(o.placed); if (!k) continue;
      rcByMonth[k] = rcByMonth[k] || { ret: 0, total: 0 };
      rcByMonth[k].total += 1;
      if ((o.customerOrders ?? 1) > 1) rcByMonth[k].ret += 1;
    }
    const returningSeries = Object.entries(rcByMonth).sort((a, b) => a[0].localeCompare(b[0])).map(([m, v]) => [m, v.total ? Math.round((v.ret / v.total) * 100) : 0]);
    const returningRate = os.length ? Math.round((os.filter((o) => (o.customerOrders ?? 1) > 1).length / os.length) * 100) : 0;

    return {
      gross, discounts, refunds, net, orderCount, aov,
      grossSeries, netSeries, aovSeries,
      grossMoM: momDelta(grossSeries), netMoM: momDelta(netSeries), aovMoM: momDelta(aovSeries),
      topBeauty, topClothing, byRegion, returningSeries, returningRate,
    };
  }, [rangeOrders]);

  // ---- Digest: the five headline metrics, tied to the real current date ----
  // These ignore the range picker (they're always "as of today").
  const digest = useMemo(() => {
    const today = new Date();
    const iso = (d) => d.toISOString().slice(0, 10);
    const todayStr = iso(today);
    const ym = todayStr.slice(0, 7); // this month YYYY-MM
    const year = todayStr.slice(0, 4);
    const prevMonthDate = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const prevYm = iso(prevMonthDate).slice(0, 7);

    const aovOf = (list) => {
      const net = sumBy(list, (o) => o.net ?? o.value);
      return list.length ? net / list.length : 0;
    };

    const todays = ORDERS.filter((o) => o.placed === todayStr);
    const mtd = ORDERS.filter((o) => o.placed && o.placed.slice(0, 7) === ym);
    const prevMonth = ORDERS.filter((o) => o.placed && o.placed.slice(0, 7) === prevYm);
    const ytd = ORDERS.filter((o) => o.placed && o.placed.slice(0, 4) === year);

    const dailyAOV = aovOf(todays);
    const mtdAOV = aovOf(mtd);
    const prevMonthAOV = aovOf(prevMonth);
    const aovChangePct = prevMonthAOV ? ((mtdAOV - prevMonthAOV) / prevMonthAOV) * 100 : null;
    const mtdGross = sumBy(mtd, (o) => o.gross ?? o.value);
    const ytdGross = sumBy(ytd, (o) => o.gross ?? o.value);

    return {
      asOf: todayStr,
      dailyAOV, dailyCount: todays.length,
      mtdAOV, mtdCount: mtd.length,
      prevMonthAOV, aovChangePct,
      mtdGross, ytdGross,
    };
  }, [ORDERS]);

  // Build a plain-text digest body for the mailto: email.
  const shownInsights = useMemo(() => {
    if (insights.length) return insights;
    const out = [];
    const money2 = (n) => "$" + Math.round(n).toLocaleString();
    const unf = ORDERS.filter((o) => o.status === "Unfulfilled");
    if (unf.length) out.push({ kind: "orders", severity: "info", text: `${unf.length} unfulfilled orders worth ${money2(unf.reduce((s, o) => s + o.value, 0))}.` });
    const oversold = PRODUCTS.filter((p) => p.onHand < 0);
    if (oversold.length) out.push({ kind: "stock", severity: "high", text: `${oversold.length} SKU(s) oversold: ${oversold.map((p) => p.sku).join(", ")}.` });
    const oos = PRODUCTS.filter((p) => p.onHand === 0);
    if (oos.length) out.push({ kind: "stock", severity: oos.length > 3 ? "high" : "info", text: `${oos.length} product(s) out of stock.` });
    if (!out.length) out.push({ kind: "ok", severity: "ok", text: "All clear — no issues flagged." });
    return out;
  }, [insights, ORDERS, PRODUCTS]);

  const buildDigestEmail = () => {
    const d = digest;
    const pct = d.aovChangePct == null ? "n/a" : `${d.aovChangePct >= 0 ? "+" : ""}${d.aovChangePct.toFixed(1)}%`;
    const lines = [
      `Nubyén Ops — Daily Digest (as of ${d.asOf})`,
      ``,
      `METRICS`,
      `Daily AOV:              ${money0(d.dailyAOV)}  (${d.dailyCount} orders today)`,
      `MTD AOV:                ${money0(d.mtdAOV)}  (${d.mtdCount} orders this month)`,
      `AOV vs previous month:  ${pct}`,
      `MTD Gross Sales:        ${money0(d.mtdGross)}`,
      `YTD Gross Sales:        ${money0(d.ytdGross)}`,
    ];
    // Smart insights section.
    const ins = shownInsights || [];
    if (ins.length) {
      lines.push(``, `SMART INSIGHTS`);
      for (const item of ins) {
        const mark = item.severity === "high" ? "[!]" : item.severity === "ok" ? "[ok]" : "[-]";
        lines.push(`${mark} ${item.text}`);
      }
    }
    lines.push(``, `— Shopify Operations Dashboard`);
    return lines.join("\n");
  };

  const sendDigest = () => {
    // EDIT this recipient list (comma-separated) to your team.
    const recipients = "you@example.com";
    const subject = `Nubyén Ops Daily Digest — ${digest.asOf}`;
    const body = buildDigestEmail();
    const url = `mailto:${encodeURIComponent(recipients)}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    window.location.href = url;
  };

  // Use live insights if present; otherwise derive basic ones from mock.

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
          <h1>Shopify Operations Dashboard</h1>
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
        {[["summary", "Summary"], ["orders", "Orders & Delivery"], ["unfulfilled", "Unfulfilled"], ["stock", "Stock & Replenishment"], ["aging", "Aging Reports"]].map(([k, l]) => (
          <button key={k} className={tab === k ? "tab on" : "tab"} onClick={() => setTab(k)}>{l}</button>
        ))}
      </nav>

      <div className="layout">
        <div className="main-col">
          {tab === "summary" && (
            <section>
              <div className="digest">
                <div className="digest-head">
                  <div>
                    <span className="digest-title">Daily digest</span>
                    <span className="digest-asof">as of {digest.asOf}</span>
                  </div>
                  <button className="digest-btn" onClick={sendDigest}>✉ Email digest</button>
                </div>
                <div className="digest-metrics">
                  <div className="dm"><div className="dm-n">{money0(digest.dailyAOV)}</div><div className="dm-l">Daily AOV</div><div className="dm-sub">{digest.dailyCount} orders today</div></div>
                  <div className="dm"><div className="dm-n">{money0(digest.mtdAOV)}</div><div className="dm-l">MTD AOV</div><div className="dm-sub">{digest.mtdCount} orders MTD</div></div>
                  <div className="dm"><div className={`dm-n ${digest.aovChangePct >= 0 ? "pos" : "neg"}`}>{digest.aovChangePct == null ? "—" : `${digest.aovChangePct >= 0 ? "▲" : "▼"} ${Math.abs(digest.aovChangePct).toFixed(1)}%`}</div><div className="dm-l">AOV vs prev month</div><div className="dm-sub">prev {money0(digest.prevMonthAOV)}</div></div>
                  <div className="dm"><div className="dm-n">{money0(digest.mtdGross)}</div><div className="dm-l">MTD Gross Sales</div></div>
                  <div className="dm"><div className="dm-n">{money0(digest.ytdGross)}</div><div className="dm-l">YTD Gross Sales</div></div>
                </div>
              </div>

              <div className="range-bar">
                <span className="range-label">Date range</span>
                <input type="date" value={fromEff} min={dateBounds.min} max={dateBounds.max} onChange={(e) => setDateFrom(e.target.value)} className="date-in" />
                <span className="range-to">to</span>
                <input type="date" value={toEff} min={dateBounds.min} max={dateBounds.max} onChange={(e) => setDateTo(e.target.value)} className="date-in" />
                {(dateFrom || dateTo) && <button className="range-reset" onClick={() => { setDateFrom(""); setDateTo(""); }}>Reset</button>}
                <span className="range-count">{summary.orderCount} orders</span>
              </div>

              <div className="an-kpis">
                <MetricCard label="Gross sales" value={money0(summary.gross)} delta={summary.grossMoM} />
                <MetricCard label="Net sales" value={money0(summary.net)} delta={summary.netMoM} />
                <MetricCard label="Avg order value" value={money0(summary.aov)} delta={summary.aovMoM} />
                <MetricCard label="Returning rate" value={summary.returningRate + "%"} />
              </div>

              <div className="an-grid2">
                <div className="card an-block">
                  <h3 className="an-h">Gross sales (monthly)</h3>
                  <LineChart series={summary.grossSeries} color="#5b8bb8" fmt={money0} />
                </div>
                <div className="card an-block">
                  <h3 className="an-h">Net sales (monthly)</h3>
                  <LineChart series={summary.netSeries} color="#a9826a" fmt={money0} />
                </div>
              </div>

              <div className="card an-block">
                <h3 className="an-h">Average order value over time</h3>
                <LineChart series={summary.aovSeries} color="#4a8a7b" fmt={money0} />
              </div>

              <div className="an-grid2">
                <div className="card an-block">
                  <h3 className="an-h">Top 5 products — Beauty</h3>
                  <BarList rows={summary.topBeauty} color="#5b8bb8" />
                </div>
                <div className="card an-block">
                  <h3 className="an-h">Top 5 products — Clothing</h3>
                  <BarList rows={summary.topClothing} color="#a9826a" />
                </div>
              </div>

              <div className="an-grid2">
                <div className="card an-block">
                  <h3 className="an-h">Sales by region</h3>
                  <BarList rows={summary.byRegion} color="#b08968" />
                </div>
                <div className="card an-block">
                  <h3 className="an-h">Returning customer rate over time</h3>
                  <LineChart series={summary.returningSeries} color="#4a8a7b" fmt={(n) => n + "%"} />
                </div>
              </div>

              <div className="card an-block">
                <h3 className="an-h">Visitors over time</h3>
                <div className="an-empty">Visitor/traffic data isn't available through the Shopify Admin API this dashboard uses — it lives in Shopify's storefront analytics. Connecting that (or Google Analytics) is a separate integration we can add later.</div>
              </div>
            </section>
          )}

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

      {tab === "unfulfilled" && (
        <section className="card">
          <div className="unf-head">
            <div>
              <span className="unf-title">Unfulfilled orders</span>
              <span className="unf-count">{unfulfilled.length} awaiting fulfillment · oldest first</span>
            </div>
            {WORKING_SHEET_URL
              ? <a className="unf-sheet-btn" href={WORKING_SHEET_URL} target="_blank" rel="noreferrer">⤢ Open working sheet</a>
              : <span className="unf-sheet-note">Set the working-sheet link to enable team tracking</span>}
          </div>
          <table>
            <thead>
              <tr><th>Order</th><th>Ordered</th><th>Customer</th><th>Email</th><th>Details</th><th>Ship to</th><th>Age</th></tr>
            </thead>
            <tbody>
              {unfulfilled.map((o) => (
                <tr key={o.id}>
                  <td className="mono">{o.id}</td>
                  <td className="muted nowrap">{o.placed}</td>
                  <td className="nowrap">{o.customer}</td>
                  <td className="small">{o.email || <span className="muted">—</span>}</td>
                  <td className="small">{o.items} item{o.items !== 1 ? "s" : ""} · {money(o.value)}</td>
                  <td className="small">{o.address || <span className="muted">—</span>}</td>
                  <td className="r"><span className="pill" style={{ color: o.age > 7 ? "#a9826a" : "#8a8275", borderColor: o.age > 7 ? "#a9826a" : "#d8d2c8" }}>{o.age == null ? "—" : o.age + "d"}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="hint">"Email sent" checkboxes and remarks are managed in the shared working sheet, so the whole team sees the same status. The sheet updates hourly from this data and keeps your notes.</div>
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

        <aside className="side-insights">
          <div className="insights-head">
            <span className="insights-title">Smart insights</span>
            <span className="insights-sub">updated each sync</span>
          </div>
          <div className="insights-list">
            {shownInsights.map((ins, i) => (
              <div className={`insight sev-${ins.severity}`} key={i}>
                <span className="insight-dot" />
                <span className="insight-text">{ins.text}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </div>
  );
}

const css = `
.wrap{--bg:${THEME.bg};--surface:${THEME.surface};--surface-alt:${THEME.surfaceAlt};--border:${THEME.border};--text:${THEME.text};--dim:${THEME.textDim};--accent:${THEME.accent};--accent-soft:${THEME.accentSoft};--brown:${THEME.brown};
font-family:'Inter',system-ui,sans-serif;max-width:1240px;margin:0 auto;padding:28px;color:var(--text);background:var(--bg);min-height:100vh;}
.layout{display:grid;grid-template-columns:1fr 300px;gap:20px;align-items:start;}
.main-col{min-width:0;}
.side-insights{position:sticky;top:20px;background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px;}
.digest{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:16px 18px;margin-bottom:16px;}
.digest-head{display:flex;align-items:center;justify-content:space-between;margin-bottom:14px;}
.digest-title{font-size:14px;font-weight:800;color:var(--text);letter-spacing:-.01em;}
.digest-asof{font-size:11px;color:var(--dim);margin-left:10px;text-transform:uppercase;letter-spacing:.05em;}
.digest-btn{font-family:inherit;font-size:12.5px;font-weight:700;padding:8px 16px;border:none;border-radius:9px;background:var(--accent);color:#fff;cursor:pointer;transition:opacity .15s;}
.digest-btn:hover{opacity:.88;}
.digest-metrics{display:grid;grid-template-columns:repeat(5,1fr);gap:12px;}
.dm{padding:10px 0;}
.dm-n{font-size:20px;font-weight:800;letter-spacing:-.02em;color:var(--text);}
.dm-n.pos{color:#4a8a7b;}
.dm-n.neg{color:#a9826a;}
.dm-l{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.05em;margin-top:2px;font-weight:600;}
.dm-sub{font-size:11px;color:var(--dim);margin-top:1px;}
@media(max-width:760px){.digest-metrics{grid-template-columns:repeat(2,1fr);}}
.range-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:16px;padding:12px 14px;background:var(--surface);border:1px solid var(--border);border-radius:12px;}
.range-label{font-size:12px;font-weight:700;color:var(--text);text-transform:uppercase;letter-spacing:.05em;}
.range-to{font-size:12px;color:var(--dim);}
.date-in{font-family:inherit;font-size:13px;padding:6px 10px;border:1px solid var(--border);border-radius:8px;background:var(--bg);color:var(--text);}
.range-reset{font-family:inherit;font-size:12px;font-weight:600;padding:6px 12px;border:1px solid var(--border);border-radius:8px;background:var(--surface-alt);color:var(--accent);cursor:pointer;}
.range-count{margin-left:auto;font-size:12px;font-weight:600;color:var(--dim);}
.an-grid2{display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px;}
.an-delta{font-size:11px;font-weight:700;margin-top:4px;}
.an-delta.up{color:#4a8a7b;}
.an-delta.down{color:#a9826a;}
@media(max-width:980px){.layout{grid-template-columns:1fr;}.side-insights{position:static;}.an-grid2{grid-template-columns:1fr;}}
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
.unf-head{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 8px;flex-wrap:wrap;gap:10px;}
.unf-title{font-size:14px;font-weight:800;color:var(--text);}
.unf-count{font-size:12px;color:var(--dim);margin-left:10px;}
.unf-sheet-btn{font-size:12.5px;font-weight:700;text-decoration:none;padding:8px 14px;border-radius:9px;background:var(--accent);color:#fff;}
.unf-sheet-note{font-size:11.5px;color:var(--dim);font-style:italic;}
.stock-head{display:flex;justify-content:flex-start;padding:10px 8px 4px;}
.seg{display:inline-flex;background:var(--surface-alt);border:1px solid var(--border);border-radius:10px;padding:3px;gap:2px;}
.seg-btn{background:none;border:none;padding:7px 14px;font-size:12.5px;font-weight:700;color:var(--dim);cursor:pointer;border-radius:8px;transition:all .15s;}
.seg-btn.on{background:var(--surface);color:var(--accent);box-shadow:0 1px 2px rgba(0,0,0,.06);}
.insights{background:var(--surface);border:1px solid var(--border);border-radius:14px;padding:14px 16px;margin-bottom:18px;}
.insights-head{display:flex;align-items:baseline;gap:10px;margin-bottom:10px;}
.insights-title{font-size:13px;font-weight:800;color:var(--text);letter-spacing:-.01em;}
.insights-sub{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;}
.insights-list{display:flex;flex-direction:column;gap:8px;}
.insight{display:flex;align-items:flex-start;gap:10px;font-size:13.5px;color:var(--text);}
.insight-dot{width:8px;height:8px;border-radius:50%;margin-top:5px;flex-shrink:0;background:var(--dim);}
.insight.sev-high .insight-dot{background:#a9826a;}
.insight.sev-info .insight-dot{background:#5b8bb8;}
.insight.sev-ok .insight-dot{background:#4a8a7b;}
.an-kpis{display:flex;gap:12px;flex-wrap:wrap;margin-bottom:18px;}
.an-card{flex:1;min-width:140px;background:var(--surface);border:1px solid var(--border);border-radius:12px;padding:16px 18px;}
.an-n{font-size:24px;font-weight:800;letter-spacing:-.02em;color:var(--text);}
.an-l{font-size:11px;color:var(--dim);text-transform:uppercase;letter-spacing:.06em;margin-top:2px;}
.an-block{padding:18px;}
.an-h{margin:0 0 16px;font-size:14px;font-weight:700;color:var(--text);}
.an-bars{display:flex;flex-direction:column;gap:10px;}
.an-row{display:flex;align-items:center;gap:12px;}
.an-row-label{width:90px;font-size:12.5px;font-weight:600;color:var(--text);}
.an-row-track{flex:1;height:22px;background:var(--surface-alt);border-radius:6px;overflow:hidden;}
.an-row-fill{height:100%;border-radius:6px;transition:width .4s;}
.an-row-val{width:130px;text-align:right;font-size:12px;font-weight:600;color:var(--dim);}
.trend{width:100%;height:auto;}
.trend-max{fill:var(--dim);font-size:11px;font-weight:700;}
.trend-lbl{fill:var(--dim);font-size:10px;}
.an-empty{font-size:13px;color:var(--dim);padding:20px;text-align:center;line-height:1.5;}
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
