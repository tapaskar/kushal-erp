// Demo data seeder (CJS format — run from /tmp with NODE_PATH=/app/node_modules)
// node /tmp/seed.cjs  OR  node seed-demo.cjs  from /app

"use strict";

const postgres = require("postgres");

const sql = postgres(process.env.DATABASE_URL, {
  max: 1,
  ssl: process.env.NODE_ENV === "production" ? "require" : false,
});

function log(msg) { console.log(`[seed] ${msg}`); }

async function upsertVendor(societyId, data, categories) {
  const existing = await sql`SELECT id FROM vendors WHERE society_id = ${societyId} AND name = ${data.name} LIMIT 1`;
  if (existing.length) { log(`  vendor exists: ${data.name}`); return existing[0].id; }
  const [v] = await sql`
    INSERT INTO vendors (society_id, name, contact_person, email, phone, city, vendor_type, status, notes)
    VALUES (${societyId}, ${data.name}, ${data.contactPerson ?? null}, ${data.email}, ${data.phone},
            ${data.city ?? null}, ${data.vendorType}, ${data.status}, ${data.notes ?? null})
    RETURNING id`;
  for (const cat of categories) {
    await sql`INSERT INTO vendor_categories (vendor_id, category) VALUES (${v.id}, ${cat})`;
  }
  log(`  created vendor: ${data.name} (${v.id})`);
  return v.id;
}

async function upsertPR(societyId, data, items) {
  const existing = await sql`SELECT id FROM purchase_requests WHERE society_id = ${societyId} AND reference_no = ${data.referenceNo} LIMIT 1`;
  if (existing.length) {
    log(`  PR exists: ${data.referenceNo}`);
    const prItems = await sql`SELECT id FROM purchase_request_items WHERE purchase_request_id = ${existing[0].id} ORDER BY created_at`;
    return { id: existing[0].id, itemIds: prItems.map(r => r.id) };
  }
  const [pr] = await sql`
    INSERT INTO purchase_requests (society_id, reference_no, title, description, category, priority, status, required_by_date)
    VALUES (${societyId}, ${data.referenceNo}, ${data.title}, ${data.description ?? null},
            ${data.category}, ${data.priority ?? "normal"}, ${data.status ?? "open"}, ${data.requiredByDate ?? null})
    RETURNING id`;
  const itemIds = [];
  for (const item of items) {
    const [pi] = await sql`
      INSERT INTO purchase_request_items (purchase_request_id, item_name, specification, quantity, unit, estimated_unit_price)
      VALUES (${pr.id}, ${item.name}, ${item.spec ?? null}, ${item.qty}, ${item.unit}, ${item.estPrice ?? null})
      RETURNING id`;
    itemIds.push(pi.id);
  }
  log(`  created PR: ${data.referenceNo} (${pr.id}) with ${items.length} items`);
  return { id: pr.id, itemIds };
}

async function upsertRFQ(societyId, prId, data) {
  const existing = await sql`SELECT id FROM rfqs WHERE society_id = ${societyId} AND reference_no = ${data.referenceNo} LIMIT 1`;
  if (existing.length) { log(`  RFQ exists: ${data.referenceNo}`); return existing[0].id; }
  const sentAt = data.status === "sent" ? new Date().toISOString() : null;
  const [rfq] = await sql`
    INSERT INTO rfqs (society_id, purchase_request_id, reference_no, deadline, terms, status, sent_at)
    VALUES (${societyId}, ${prId}, ${data.referenceNo}, ${data.deadline}, ${data.terms ?? null},
            ${data.status ?? "sent"}, ${sentAt})
    RETURNING id`;
  log(`  created RFQ: ${data.referenceNo} (${rfq.id})`);
  return rfq.id;
}

async function inviteVendor(rfqId, vendorId) {
  const existing = await sql`SELECT vendor_token FROM rfq_vendors WHERE rfq_id = ${rfqId} AND vendor_id = ${vendorId} LIMIT 1`;
  if (existing.length) return existing[0].vendor_token;
  const [rv] = await sql`
    INSERT INTO rfq_vendors (rfq_id, vendor_id, invited_at, email_sent_at)
    VALUES (${rfqId}, ${vendorId}, now(), now())
    RETURNING vendor_token`;
  return rv.vendor_token;
}

async function upsertQuotation(societyId, rfqId, vendorId, data, prItemIds) {
  const existing = await sql`SELECT id FROM quotations WHERE society_id = ${societyId} AND reference_no = ${data.referenceNo} LIMIT 1`;
  if (existing.length) { log(`  quotation exists: ${data.referenceNo}`); return existing[0].id; }

  let subtotal = 0, gstAmount = 0;
  for (const item of data.items) {
    const line = item.unitPrice * item.qty;
    subtotal += line;
    gstAmount += (line * item.gstPct) / 100;
  }
  const totalAmount = subtotal + gstAmount;

  const [q] = await sql`
    INSERT INTO quotations (society_id, rfq_id, vendor_id, reference_no, status, valid_until,
                            delivery_days, payment_terms, subtotal, gst_amount, total_amount, rank, submitted_at)
    VALUES (${societyId}, ${rfqId}, ${vendorId}, ${data.referenceNo}, ${data.status ?? "submitted"},
            ${data.validUntil ?? null}, ${data.deliveryDays ?? null}, ${data.paymentTerms ?? "Net 30"},
            ${subtotal.toFixed(2)}, ${gstAmount.toFixed(2)}, ${totalAmount.toFixed(2)},
            ${data.rank ?? null}, now())
    RETURNING id`;

  for (let i = 0; i < data.items.length; i++) {
    const item = data.items[i];
    const lineTotal = item.unitPrice * item.qty;
    await sql`
      INSERT INTO quotation_items (quotation_id, pr_item_id, item_name, quantity, unit, unit_price, gst_percent, line_total)
      VALUES (${q.id}, ${prItemIds[i] ?? null}, ${item.name}, ${item.qty}, ${item.unit},
              ${item.unitPrice.toFixed(2)}, ${item.gstPct.toFixed(2)}, ${lineTotal.toFixed(2)})`;
  }
  log(`  created quotation: ${data.referenceNo} ₹${totalAmount.toFixed(0)} rank=${data.rank ?? "-"}`);
  return q.id;
}

// ──────────────────────────────────────────────────────────────────────────────
async function main() {
  // 1. Find society
  const societies = await sql`SELECT id, name FROM societies WHERE is_active = true LIMIT 1`;
  if (!societies.length) throw new Error("No active society found.");
  const societyId = societies[0].id;
  log(`Society: ${societies[0].name} (${societyId})\n`);

  // ── VENDORS ────────────────────────────────────────────────────────────────
  log("── Vendors ──");
  const v1 = await upsertVendor(societyId, {
    name: "CleanPro Supplies Pvt Ltd", contactPerson: "Ramesh Nair",
    email: "ramesh@cleanpro.in", phone: "+91 98201 11001", city: "Mumbai",
    vendorType: "product", status: "approved",
    notes: "Regular supplier since 2022. On-time delivery record 96%.",
  }, ["housekeeping", "garden"]);

  const v2 = await upsertVendor(societyId, {
    name: "GreenMop India", contactPerson: "Sunita Sharma",
    email: "sunita@greenmop.co.in", phone: "+91 99302 22002", city: "Pune",
    vendorType: "product", status: "approved",
    notes: "Eco-friendly products. ISO 9001 certified.",
  }, ["housekeeping", "fire_safety"]);

  const v3 = await upsertVendor(societyId, {
    name: "BrightHome Essentials", contactPerson: "Kiran Rao",
    email: "kiran@brighthome.in", phone: "+91 91503 33003", city: "Mumbai",
    vendorType: "product", status: "approved",
    notes: "Bulk discounts available. Min order ₹5,000.",
  }, ["housekeeping", "electronics"]);

  const v4 = await upsertVendor(societyId, {
    name: "QuickFix Pest Solutions", contactPerson: "Abdul Rahman",
    email: "abdul@quickfixpest.in", phone: "+91 87604 44004", city: "Mumbai",
    vendorType: "service", status: "approved",
    notes: "Licensed pest control operator. Covers 500+ RWAs in Mumbai.",
  }, ["pest_control", "civil"]);

  await upsertVendor(societyId, {
    name: "SparkElec Systems", contactPerson: "Priya Menon",
    email: "priya@sparkelec.com", phone: "+91 76705 55005", city: "Mumbai",
    vendorType: "service", status: "pending",
    notes: "New vendor. Awaiting committee approval.",
  }, ["electrical", "it_amc"]);

  // ── PR-1: Housekeeping Supplies — full quote + PO ──────────────────────────
  log("\n── PR-1: Housekeeping Supplies (quotes received + PO pending L1) ──");
  const pr1 = await upsertPR(societyId, {
    referenceNo: "PR-2026-001",
    title: "Monthly Housekeeping Supplies — March 2026",
    description: "Routine monthly procurement of housekeeping consumables for all common areas.",
    category: "housekeeping", priority: "normal",
    status: "po_created", requiredByDate: "2026-03-05",
  }, [
    { name: "Broom (Soft Bristle)", spec: "Standard 300mm width", qty: 30, unit: "pcs", estPrice: 120 },
    { name: "Phenyl Disinfectant 5L", spec: "Pine fragrance, commercial grade", qty: 20, unit: "can", estPrice: 280 },
    { name: "Garbage Bags 120L (pack of 25)", spec: "Black, heavy-duty LDPE", qty: 50, unit: "pack", estPrice: 95 },
    { name: "Mop Head (Cotton)", spec: "400g Kentucky mop", qty: 15, unit: "pcs", estPrice: 180 },
    { name: "Floor Cleaning Liquid 5L", spec: "Suitable for marble/granite", qty: 20, unit: "can", estPrice: 350 },
  ]);

  const rfq1 = await upsertRFQ(societyId, pr1.id, {
    referenceNo: "RFQ-2026-001", deadline: "2026-02-25", status: "sent",
    terms: "Delivery within 5 working days of PO. Payment Net 30. Items must meet ISI standards.",
  });

  const token1 = await inviteVendor(rfq1, v1);
  const token2 = await inviteVendor(rfq1, v2);
  const token3 = await inviteVendor(rfq1, v3);

  const qItems = (prices) => [
    { name: "Broom (Soft Bristle)",        qty: 30, unit: "pcs",  unitPrice: prices[0], gstPct: 18 },
    { name: "Phenyl Disinfectant 5L",       qty: 20, unit: "can",  unitPrice: prices[1], gstPct: 18 },
    { name: "Garbage Bags 120L (pack of 25)", qty: 50, unit: "pack", unitPrice: prices[2], gstPct: 18 },
    { name: "Mop Head (Cotton)",            qty: 15, unit: "pcs",  unitPrice: prices[3], gstPct: 12 },
    { name: "Floor Cleaning Liquid 5L",     qty: 20, unit: "can",  unitPrice: prices[4], gstPct: 18 },
  ];

  // L1 CleanPro (cheapest), L2 GreenMop, L3 BrightHome
  const q1 = await upsertQuotation(societyId, rfq1, v1, {
    referenceNo: "QUO-2026-001", status: "accepted", validUntil: "2026-03-15",
    deliveryDays: 4, paymentTerms: "Net 30 from delivery", rank: 1,
    items: qItems([108, 260, 85, 165, 320]),
  }, pr1.itemIds);

  await upsertQuotation(societyId, rfq1, v2, {
    referenceNo: "QUO-2026-002", status: "shortlisted", validUntil: "2026-03-15",
    deliveryDays: 6, paymentTerms: "Net 30", rank: 2,
    items: qItems([115, 270, 90, 175, 340]),
  }, pr1.itemIds);

  await upsertQuotation(societyId, rfq1, v3, {
    referenceNo: "QUO-2026-003", status: "submitted", validUntil: "2026-03-15",
    deliveryDays: 3, paymentTerms: "50% advance, balance on delivery", rank: 3,
    items: qItems([125, 290, 98, 190, 365]),
  }, pr1.itemIds);

  // PO at pending_l1
  const poExists = await sql`SELECT id FROM purchase_orders WHERE society_id = ${societyId} AND reference_no = 'PO-2026-001' LIMIT 1`;
  if (!poExists.length) {
    const [po] = await sql`
      INSERT INTO purchase_orders (society_id, rfq_id, quotation_id, vendor_id, reference_no, status,
                                   total_amount, delivery_days, payment_terms)
      VALUES (${societyId}, ${rfq1}, ${q1}, ${v1}, 'PO-2026-001', 'pending_l1',
              8427.10, 4, 'Net 30 from delivery')
      RETURNING id`;
    log(`  created PO: PO-2026-001 (${po.id}) — pending L1 approval`);
  } else {
    log(`  PO exists: PO-2026-001`);
  }

  // ── PR-2: Pest Control — RFQ sent, awaiting quotes ─────────────────────────
  log("\n── PR-2: Pest Control Treatment (RFQ sent, awaiting quotes) ──");
  const pr2 = await upsertPR(societyId, {
    referenceNo: "PR-2026-002",
    title: "Quarterly Pest Control Treatment — Q1 2026",
    description: "Cockroach, rodent, and mosquito treatment for common areas, basement, and garden.",
    category: "pest_control", priority: "urgent",
    status: "rfq_sent", requiredByDate: "2026-03-10",
  }, [
    { name: "General Pest Control", spec: "Common areas + basement, 2-hour treatment", qty: 1, unit: "service", estPrice: 8000 },
    { name: "Mosquito Fogging — Garden + Parking", spec: "Thermal fogging, 500ml solution per session", qty: 2, unit: "session", estPrice: 2500 },
    { name: "Rat Bait Stations", spec: "Tamper-proof plastic stations, refillable", qty: 6, unit: "pcs", estPrice: 400 },
  ]);

  const rfq2 = await upsertRFQ(societyId, pr2.id, {
    referenceNo: "RFQ-2026-002", deadline: "2026-02-28", status: "sent",
    terms: "Valid pest control license required. Treatment on Sunday 7am–12pm. 3-month follow-up guarantee.",
  });

  const token4 = await inviteVendor(rfq2, v4);

  // ── PR-3: LED Upgrade — open, ready to RFQ ────────────────────────────────
  log("\n── PR-3: LED Lighting Upgrade (open, ready to create RFQ) ──");
  await upsertPR(societyId, {
    referenceNo: "PR-2026-003",
    title: "Common Area LED Lighting Upgrade",
    description: "Replace 80 fluorescent tubes with LED panels in corridors, stairwells, and parking. Includes installation.",
    category: "electrical", priority: "normal",
    status: "open", requiredByDate: "2026-03-31",
  }, [
    { name: "LED Panel 18W (Cool White)", spec: "600×600mm, 4000K, IP44 rated", qty: 60, unit: "pcs", estPrice: 950 },
    { name: "LED Strip Light 5m roll", spec: "24V DC, 14.4W/m, IP65", qty: 20, unit: "roll", estPrice: 1200 },
    { name: "LED Driver 60W", spec: "Constant current, PF>0.95", qty: 60, unit: "pcs", estPrice: 450 },
    { name: "Installation Labour", spec: "Wiring, fitting, testing all fixtures", qty: 1, unit: "lumpsum", estPrice: 15000 },
  ]);

  // ── PR-4: Furniture — draft ────────────────────────────────────────────────
  log("\n── PR-4: Clubhouse Furniture (draft) ──");
  await upsertPR(societyId, {
    referenceNo: "PR-2026-004",
    title: "Clubhouse Furniture Replacement",
    description: "Replace worn-out chairs and tables in the clubhouse lounge.",
    category: "furniture", priority: "low",
    status: "draft", requiredByDate: null,
  }, [
    { name: "Plastic Stackable Chairs", spec: "UV-resistant, 150kg capacity, white", qty: 40, unit: "pcs", estPrice: 700 },
    { name: "Folding Table 6ft", spec: "HDPE top, steel frame, foldable", qty: 10, unit: "pcs", estPrice: 2800 },
  ]);

  // ── Summary ────────────────────────────────────────────────────────────────
  log("\n╔══════════════════════════════════════════════════════╗");
  log("║        DEMO SEED COMPLETE                            ║");
  log("╠══════════════════════════════════════════════════════╣");
  log("║  5 vendors (4 approved, 1 pending review)            ║");
  log("║  PR-2026-001  po_created  → PO-2026-001 pending L1  ║");
  log("║  PR-2026-002  rfq_sent   → awaiting vendor quotes   ║");
  log("║  PR-2026-003  open       → ready to create RFQ      ║");
  log("║  PR-2026-004  draft                                  ║");
  log("╠══════════════════════════════════════════════════════╣");
  log("║  VENDOR QUOTE PORTAL URLs (share with vendors):     ║");
  log(`║  CleanPro  /quote/${token1}  ║`);
  log(`║  GreenMop  /quote/${token2}  ║`);
  log(`║  BrightHome/quote/${token3}  ║`);
  log(`║  QuickFix  /quote/${token4}  ║`);
  log("╚══════════════════════════════════════════════════════╝");
}

main()
  .then(() => sql.end().then(() => process.exit(0)))
  .catch(err => { console.error("[seed] FAILED:", err); process.exit(1); });
