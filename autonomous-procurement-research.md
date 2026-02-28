# Autonomous Procurement & Inventory Management for RWA Societies

## Research Report — February 2026

---

## 1. Current State of Your RWA ERP

Your system already has a solid foundation with these modules in place:

**Procurement (778 lines of service logic):** Purchase requests with priority levels, RFQ workflow with vendor token-based access, multi-vendor quotation comparison (L1/L2/L3 ranking), 3-level PO approval chain, and reference number auto-generation.

**Inventory (465 lines):** Barcode and QR-code-based asset tracking, stock movement tracking (in/out with reasons), maintenance scheduling, min-stock-level alerts, and 10 item categories with condition tracking.

**Vendor Management (333 lines):** Self-registration portal at `/vendor-register/[societyId]`, 16 vendor categories across products and services, KYC capture (GSTIN, PAN, bank details), status lifecycle (pending → approved → suspended → blacklisted), and token-based quotation submission at `/quote/[token]`.

**What's missing for "autonomous" operation:** The current system is workflow-driven but still requires human initiation at every step — someone must create a PR, someone must send an RFQ, someone must compare quotes and approve POs. True autonomous procurement means the system itself detects needs, initiates purchases, and only escalates to humans for exceptions or high-value decisions.

---

## 2. What "Autonomous" Looks Like for an RWA

Autonomous procurement in a housing society context doesn't mean zero human involvement — it means the system handles the routine 80% automatically while surfacing only exceptions and strategic decisions to committee members.

### The Autonomous Procurement Loop

```
Inventory drops below threshold
        ↓
System generates Purchase Request automatically
        ↓
System selects preferred vendor (based on history, rating, price)
        ↓
Auto-sends RFQ or places PO with pre-approved vendor
        ↓
Vendor confirms via WhatsApp / SMS / Portal
        ↓
Goods received → stock updated → payment triggered
        ↓
System learns from the cycle (better forecasts next time)
```

### What This Means Practically

For **consumables** (cleaning supplies, garbage bags, light bulbs, toilet paper, garden supplies): The system tracks consumption patterns, predicts when stock will run out, and auto-reorders from preferred vendors without any committee member lifting a finger. A monthly maintenance spend of ₹50K–₹2L on consumables can run almost entirely on autopilot.

For **services** (plumbing, electrical, pest control, lift maintenance): The system schedules preventive maintenance automatically based on asset age and maintenance history, and dispatches the assigned vendor with a work order. Only unscheduled repairs need human triage.

For **capital purchases** (furniture, electronics, heavy machinery): These remain human-approved but the system can auto-generate PRs based on asset condition tracking, pre-populate vendor shortlists, and streamline the approval chain.

---

## 3. Required Modifications to Your Current System

### 3.1 Auto-Reorder Engine (New Module)

Your `inventory.service.ts` already tracks `minStockLevel` per item. The missing piece is a scheduler that acts on it.

**What to build:**
- A cron job (or Next.js scheduled function) that runs daily, checking all inventory items where `currentQuantity <= minStockLevel`
- For items below threshold, auto-generate a Purchase Request with `priority: "urgent"` if stock is critically low, or `priority: "normal"` otherwise
- Link each auto-PR to the item's preferred vendor (new field needed on `inventory_items` table)
- Configurable rules per category: some items auto-approve up to ₹X, others always require manual approval

**Schema changes needed:**
- Add `preferredVendorId`, `avgMonthlyConsumption`, `lastReorderDate`, and `autoReorderEnabled` fields to the `inventory_items` table
- New `reorder_rules` table: category-level rules defining auto-approval thresholds, preferred vendors, and reorder quantities
- New `auto_procurement_log` table: audit trail of every autonomous action the system takes

### 3.2 Vendor Scoring & Auto-Selection

Your vendor module tracks status but not performance. To auto-select vendors, the system needs a scoring model.

**What to build:**
- Track delivery timeliness (promised vs. actual delivery date on each PO)
- Track quality score (post-delivery rating by the person who received goods)
- Track price competitiveness (vendor's price vs. average across all vendors for that category)
- Composite score: weighted average of timeliness (30%), quality (30%), price (30%), responsiveness (10%)
- Auto-select the highest-scoring approved vendor for routine reorders
- Fall back to RFQ if no vendor scores above threshold or if spend exceeds auto-approval limit

**Schema changes needed:**
- New `vendor_ratings` table with per-PO ratings for delivery, quality, and overall score
- Add `overallScore` and `totalOrders` to the `vendors` table as cached aggregates
- New `vendor_category_preference` table linking categories to ranked vendor preferences

### 3.3 Smart Approval Thresholds

Your 3-level approval (L1/L2/L3) currently applies uniformly. For autonomous operation, you need tiered thresholds.

**Suggested tiers for RWA context:**
- **Auto-approved** (no human needed): Routine consumable reorders under ₹5,000 from pre-approved vendors
- **L1 only** (manager/secretary): Purchases ₹5,000–₹25,000 or non-routine items
- **L1 + L2** (manager + treasurer): Purchases ₹25,000–₹1,00,000
- **L1 + L2 + L3** (full committee): Purchases above ₹1,00,000 or new vendors

These thresholds should be configurable per society since a 50-unit society and a 2,000-unit society have very different scales.

**Schema changes needed:**
- New `approval_thresholds` table with societyId, category, minAmount, maxAmount, and requiredApprovalLevel
- Modify `procurement.service.ts` to check thresholds before routing to approval chain

### 3.4 Consumption Forecasting

Move from reactive (reorder when low) to predictive (reorder before you run low).

**What to build:**
- Track historical stock movements per item (you already record these in `stock_movements`)
- Calculate rolling average consumption rate (last 30/60/90 days)
- Factor in seasonality: garden supplies spike in monsoon, pest control in summer, generator fuel in winter
- Predict days-until-stockout and trigger reorder with enough lead time buffer
- Simple approach first: exponential moving average. AI/ML later if needed.

**Schema changes needed:**
- Add `leadTimeDays` to `inventory_items` (how long the vendor typically takes to deliver)
- New `consumption_forecast` table caching predictions per item per month
- Modify the auto-reorder engine to use predicted stockout date instead of just current level

### 3.5 Preventive Maintenance Automation

Your `asset_maintenance_schedules` table exists but isn't connected to procurement.

**What to build:**
- When a maintenance schedule triggers, auto-generate a work order
- If the maintenance type requires parts (e.g., DG servicing needs filters and oil), auto-create a PR for those parts
- Auto-assign to the vendor linked to that maintenance category
- Track maintenance compliance rate (scheduled vs. completed on time)

### 3.6 Dashboard & Exception Alerts

Autonomous doesn't mean invisible. Committee members need visibility.

**What to build:**
- Real-time dashboard showing: auto-approved orders this month (count + total spend), items on auto-reorder, vendor performance trends, upcoming maintenance schedules, and exceptions requiring attention
- Push notifications (email via AWS SES, WhatsApp, or app) for: spend anomalies (this month's auto-spend 20%+ higher than average), vendor delivery delays, stock items with no preferred vendor assigned, and POs awaiting manual approval

---

## 4. Connecting with Non-Tech-Savvy Vendors

This is arguably the hardest problem. Your typical RWA vendor is a local electrician, plumber, or cleaning supply shop owner who may use a smartphone but isn't comfortable with web portals or digital workflows.

### 4.1 WhatsApp-First Vendor Interface

WhatsApp has 500M+ users in India and is the default communication tool for small businesses. Instead of asking vendors to use your web portal, bring the portal to WhatsApp.

**How it works:**
- When the system generates an RFQ or PO, send it to the vendor's WhatsApp number via WhatsApp Business API
- The vendor receives a message like: *"New order from [Society Name]: 10 packs Harpic, 5 kg Vim Bar, 20 garbage bag rolls. Can you deliver by Thursday? Reply YES to confirm or QUOTE to send your price."*
- Vendor replies with simple text — no app downloads, no portal logins
- For quotation submission: send an interactive WhatsApp Flow form (Meta now supports these) where the vendor just fills in prices against line items
- Confirmation, delivery updates, and payment notifications all happen over WhatsApp

**Implementation approach:**
- Use a WhatsApp Business API provider like Gupshup, WATI, Interakt, or AiSensy (all have good India presence and start at ₹0.25–₹0.60 per message)
- Build a `whatsapp.service.ts` that maps your procurement events to WhatsApp message templates
- Store vendor WhatsApp number (you already have phone in vendor records)
- Handle incoming vendor replies via webhook → parse and update procurement status

**Estimated cost:** ₹500–₹2,000/month for a typical society's volume of vendor communications.

### 4.2 SMS Fallback

For vendors without smartphones or unreliable data connections, SMS works as a simpler fallback. The interaction is more limited (no forms or images) but covers the basics: order notifications, confirmation via reply codes, and payment alerts.

AWS SNS (which integrates with your existing AWS stack) or local providers like MSG91 can handle this.

### 4.3 IVR / Voice Call Integration

For vendors who are truly not comfortable with text-based interfaces, an IVR (Interactive Voice Response) system in the local language lets them confirm orders by pressing keys on a phone call. This is a longer-term enhancement but worth considering for inclusive access.

### 4.4 Simplified Vendor Portal (What You Already Have, Improved)

Your existing portal at `/vendor-register/[societyId]` and `/quote/[token]` is token-based (no login required), which is great. To make it more accessible:

- Ensure it works perfectly on low-end Android phones and slow 2G/3G connections
- Add multi-language support (Hindi, Marathi, Tamil, etc. depending on your society's region)
- Use large tap targets, minimal form fields, and simple language
- Pre-fill whatever you can (item names, quantities, previous prices)
- Add voice input option for price fields (speech-to-text is well-supported on Android)

### 4.5 Assisted Onboarding

Technology alone won't solve the adoption problem. Pair it with human touchpoints.

- Have the society's facility manager personally walk each vendor through the system once
- Create a 2-minute WhatsApp video tutorial in the local language
- For the first few orders, run the digital and manual process in parallel so the vendor builds confidence
- Assign a "vendor buddy" from the committee who vendors can call if they're stuck
- Keep the paper/call option available as a last resort — the society office staff can enter data on the vendor's behalf

### 4.6 Vendor Incentives

Give vendors a reason to adopt the digital process:

- Faster payments: vendors who confirm digitally get paid within 7 days vs. 30 days for manual processes
- Payment transparency: vendors can check payment status anytime via WhatsApp ("Send PAYMENT to check your pending payments")
- More business: digitally active vendors get priority for auto-reorders
- Simplified GST: auto-generated invoices and TDS certificates reduce their compliance burden

---

## 5. Recommended Implementation Roadmap

### Phase 1 — Foundation (Weeks 1–4)

- Add `preferredVendorId`, `autoReorderEnabled`, `avgMonthlyConsumption`, and `leadTimeDays` to inventory items
- Build the daily auto-reorder cron job with configurable thresholds
- Create the `approval_thresholds` table and modify procurement service
- Set up WhatsApp Business API integration (choose a provider, get templates approved)
- Build basic vendor notification over WhatsApp (PO sent, payment made)

### Phase 2 — Intelligence (Weeks 5–8)

- Implement vendor scoring based on delivery and quality history
- Build consumption forecasting using historical stock movement data
- Auto-vendor-selection for routine reorders
- WhatsApp-based RFQ and quotation submission flow
- Exception alerting system via email and WhatsApp

### Phase 3 — Full Autonomy (Weeks 9–12)

- Connect maintenance schedules to auto-procurement
- Build the autonomous procurement dashboard
- Implement spend anomaly detection
- Add SMS fallback for non-WhatsApp vendors
- Multi-language support for vendor portal
- Vendor self-service payment status via WhatsApp

### Phase 4 — Optimization (Ongoing)

- ML-based demand forecasting (replace rolling average with seasonal models)
- Vendor marketplace: let new vendors discover and bid for society work
- Cross-society vendor insights (if managing multiple societies)
- IoT integration for real-time consumable tracking (smart dispensers, weight sensors)

---

## 6. Technology Choices Summary

| Need | Recommendation | Why |
|------|---------------|-----|
| WhatsApp API | Gupshup or WATI | Strong India presence, good pricing, WhatsApp Flows support |
| Scheduling | Node-cron or BullMQ | Fits your Node.js/Next.js stack |
| SMS fallback | AWS SNS or MSG91 | SNS integrates with your existing AWS setup |
| Forecasting (v1) | Simple moving average in TypeScript | No new dependencies, good enough for consumables |
| Forecasting (v2) | Python microservice with Prophet or statsmodels | Better seasonal handling, deploy as separate container |
| Real-time alerts | AWS SES (email) + WhatsApp API | Already have SES; WhatsApp covers mobile |

---

## 7. Key Risks and Mitigations

**Vendor adoption resistance:** Start with the 2–3 most tech-comfortable vendors. Success stories spread organically. Keep manual fallbacks available indefinitely.

**Over-ordering by automation:** Set conservative auto-approval limits initially. All auto-orders should be visible on the dashboard with easy one-click cancellation. Weekly spend caps per category.

**Data quality:** Autonomous systems are only as good as their data. If min-stock levels are wrong or consumption isn't tracked accurately, the system will make bad decisions. Invest in getting the baseline data right before enabling auto-reorder.

**Committee trust:** Some committee members may be uncomfortable with automated spending. Transparency is key — weekly email digests of all autonomous actions, full audit trail, and the ability to pause automation for any category at any time.

---

## Sources

- [Mygate ERP — Society Management Apps in India](https://mygate.com/blog/housing-society/top-society-management-apps-india/)
- [RWA Digital Transformation — Mygate](https://mygate.com/blog/housing-society/rwa-digital-transformation/)
- [2025 ERP Guide for Housing Associations — Arribatec](https://www.arribatec.com/2025-erp-guide-for-housing-associations/)
- [Procurement Through Digital Platforms — CIS India](https://cis-india.org/raw/procurement-through-digital-platforms)
- [AI for Inventory Management — Knack](https://www.knack.com/blog/ai-for-inventory-management/)
- [Inventory AI Agents — Prediko](https://www.prediko.io/blog/inventory-ai-agent)
- [Low Stock Alerts Automation — Forthcast](https://www.forthcast.io/blog/low-stock-alerts-automation-prevents-stockouts/)
- [AI Reorder Optimization — Nunariq](https://www.nunariq.com/blogs/ai-reorder-optimization/)
- [WhatsApp Business API Pricing India 2026 — MessageBot](https://messagebot.in/blog/whatsapp-business-api-pricing-in-india/)
- [WhatsApp Business API Setup Guide — Infobip](https://www.infobip.com/blog/whatsapp-business-api-setup)
