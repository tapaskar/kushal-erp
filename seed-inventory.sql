-- RWA ERP Demo Inventory Seed Data — Demo Society
-- Society ID: a0000000-0000-0000-0000-000000000001
-- Admin user: 47751e2b-522b-41db-a519-d2f2756473d1

BEGIN;

-- ============================================================
-- 1. INVENTORY ITEMS (28 items across all categories)
-- ============================================================

-- === FIRE SAFETY ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'INV-FE-A001', 'ABC Fire Extinguisher 4kg', 'fire_safety', 'ABC type dry chemical powder, ISI certified, 4kg capacity', '2024-03-15', 2850.00, 'SafeGuard Fire Solutions', '2027-03-15', 'Block A — Ground Floor Lobby', 'good', 4, 2, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'INV-FE-B001', 'CO2 Fire Extinguisher 2kg', 'fire_safety', 'Carbon dioxide type, suitable for electrical fires', '2024-03-15', 3200.00, 'SafeGuard Fire Solutions', '2027-03-15', 'Block B — Electrical Panel Room', 'good', 3, 2, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'INV-FE-C001', 'Fire Hose Reel 30m', 'fire_safety', '30 meter canvas hose reel with nozzle, wall-mounted', '2023-06-10', 8500.00, 'SafeGuard Fire Solutions', '2028-06-10', 'Block C — Staircase Landing (2nd Floor)', 'good', 3, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'INV-SMK-001', 'Smoke Detector (Agni)', 'fire_safety', 'Photoelectric smoke detector, battery-operated, ceiling mount', '2024-01-20', 650.00, 'Agni Fire Systems', '2029-01-20', 'Common areas — All Floors', 'good', 18, 5, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === ELECTRONICS ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'INV-CCTV-001', 'Hikvision 2MP Bullet Camera', 'electronics', 'DS-2CE1AD0T-IRP, night vision, IP66 weatherproof', '2024-06-01', 3500.00, 'SecureVision Technologies', '2026-06-01', 'Main Gate / Parking / Lobby', 'good', 12, 2, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'INV-DVR-001', 'Hikvision 16CH DVR', 'electronics', 'DS-7216HGHI-K1, 16-channel, 2TB HDD, H.265+ compression', '2024-06-01', 12500.00, 'SecureVision Technologies', '2026-06-01', 'Security Room — Ground Floor', 'good', 1, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'INV-INTCOM-001', 'Video Intercom System', 'electronics', 'Zicom 7-inch color video door phone, main gate unit', '2023-11-15', 18000.00, 'Zicom Electronics', '2025-11-15', 'Main Gate / Guard Room', 'good', 1, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'INV-UPS-001', 'Luminous 2KVA UPS', 'electronics', 'Cruze+ 2KVA sine wave UPS for common area lighting', '2024-08-10', 14500.00, 'Luminous Power Technologies', '2026-08-10', 'Block A — Electrical Room', 'good', 3, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === DG PARTS ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'INV-DG-001', 'Kirloskar 62.5 KVA DG Set', 'dg_parts', 'Silent diesel generator, 62.5 KVA, water cooled, with AMF panel', '2022-04-20', 650000.00, 'Kirloskar Oil Engines Ltd', '2025-04-20', 'DG Room — Basement', 'good', 1, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'INV-DG-OIL01', 'Engine Oil (Servo 15W40)', 'dg_parts', '15W40 diesel engine oil, 5 litre can for DG servicing', '2025-09-01', 1200.00, 'IndianOil Distributor', null, 'Store Room — Basement', 'good', 8, 3, true, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'INV-DG-FILT1', 'Oil Filter (Kirloskar)', 'dg_parts', 'Genuine Kirloskar oil filter for 62.5 KVA DG', '2025-09-01', 450.00, 'Kirloskar Oil Engines Ltd', null, 'Store Room — Basement', 'good', 4, 2, true, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'INV-DG-BAT01', 'Exide 12V 150Ah Battery', 'dg_parts', 'Tubular battery for DG set starting, 150Ah', '2024-12-01', 14800.00, 'Exide Dealer (Andheri)', '2027-12-01', 'DG Room — Basement', 'good', 2, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === FURNITURE ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'INV-CHAIR-01', 'Folding Steel Chair', 'furniture', 'Cushioned folding chair, powder-coated steel frame', '2023-08-15', 1800.00, 'Nilkamal Furniture', null, 'Community Hall / Store Room', 'good', 40, 10, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'INV-TABLE-01', 'Rectangular Banquet Table 6ft', 'furniture', 'Plywood top, folding legs, 6x2.5 ft', '2023-08-15', 4500.00, 'Nilkamal Furniture', null, 'Community Hall / Store Room', 'good', 8, 2, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'INV-SOFA-01', 'Lobby Sofa Set (3+1+1)', 'furniture', '5-seater leatherette sofa set, grey colour', '2023-05-10', 35000.00, 'Durian Furniture', '2025-05-10', 'Block A — Ground Floor Lobby', 'fair', 1, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'INV-BENCH-01', 'Garden Bench (Cast Iron)', 'furniture', '3-seater garden bench, cast iron frame, wooden slats', '2023-05-10', 6500.00, 'Garden Decor India', null, 'Garden / Children Play Area', 'good', 4, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === CLEANING (Consumables) ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'INV-CLN-PHEN', 'Phenyl (5L Can)', 'cleaning', 'Black phenyl concentrate for floor mopping, 5L can', '2025-12-01', 280.00, 'Laxmi Chemicals', null, 'Store Room — Ground Floor', 'good', 3, 2, true, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'INV-CLN-GARB', 'Garbage Bags (Pack of 30)', 'cleaning', 'Large black garbage bags, 25x30 inch, biodegradable', '2025-12-15', 180.00, 'EcoGreen Supplies', null, 'Store Room — Ground Floor', 'good', 6, 4, true, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'INV-CLN-BROOM', 'Hard Broom (Grass)', 'cleaning', 'Heavy duty grass broom for outdoor sweeping', '2025-11-01', 120.00, 'Local Supplier', null, 'Store Room — Ground Floor', 'good', 6, 3, true, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'INV-CLN-DUSTB', 'Wheeled Dustbin 120L', 'cleaning', 'Green HDPE wheeled dustbin, 120 litre capacity', '2024-02-10', 2200.00, 'Swachh Bharat Supplies', null, 'Parking Area / Garden', 'good', 6, 2, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === PLUMBING ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'INV-PLB-PUMP1', 'Crompton 1.5HP Water Pump', 'plumbing', 'Centrifugal monoblock pump for overhead tank filling', '2024-01-15', 8500.00, 'Crompton Greaves Dealer', '2026-01-15', 'Pump Room — Basement', 'good', 2, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'INV-PLB-TANK1', 'Sintex 5000L Water Tank', 'plumbing', 'Triple layer overhead water storage tank, UV resistant', '2022-09-01', 22000.00, 'Sintex Industries', '2027-09-01', 'Terrace — Block A', 'good', 3, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === ELECTRICAL ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'INV-ELC-LED01', 'LED Tube Light 20W', 'electrical', 'Philips 4ft LED tube light, cool daylight, 20W', '2025-10-01', 320.00, 'Philips Dealer (Malad)', null, 'Store Room — Ground Floor', 'good', 15, 5, true, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'INV-ELC-FLOOD', 'LED Flood Light 50W', 'electrical', 'Havells 50W LED flood light, IP65, for parking & garden', '2024-11-01', 1800.00, 'Havells Dealer', '2026-11-01', 'Parking / Garden / Main Gate', 'good', 8, 2, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === GARDEN ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'INV-GRD-MOWER', 'Honda HRJ196 Lawn Mower', 'garden', 'Petrol push lawn mower, 21-inch cutting width', '2023-10-01', 32000.00, 'Honda Power Products Dealer', '2025-10-01', 'Store Room — Basement', 'good', 1, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000001', 'INV-GRD-FERT1', 'NPK Fertilizer 10kg', 'garden', 'NPK 19:19:19 water soluble fertilizer for garden', '2025-11-01', 350.00, 'Krishibazar', null, 'Store Room — Basement', 'good', 3, 2, true, true, '47751e2b-522b-41db-a519-d2f2756473d1');

-- === SPORTS ===
INSERT INTO inventory_items (id, society_id, barcode, name, category, description, purchase_date, purchase_price, vendor, warranty_expiry, location, condition, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000001', 'INV-SPT-TT01', 'Stag Championship TT Table', 'sports', 'Full-size table tennis table, 19mm top, foldable, with net', '2023-07-20', 28000.00, 'Stag International', '2025-07-20', 'Clubhouse / Recreation Room', 'good', 1, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('d1000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'INV-SPT-CARM', 'Carrom Board (Full Size)', 'sports', 'Precise International carrom board with coins & striker', '2023-07-20', 3500.00, 'Sports Corner', null, 'Clubhouse / Recreation Room', 'fair', 2, 1, false, true, '47751e2b-522b-41db-a519-d2f2756473d1');


-- ============================================================
-- 2. STOCK MOVEMENTS (purchase history + usage/consumption)
-- ============================================================

-- Initial stock-in (purchases) for all items
INSERT INTO stock_movements (id, society_id, inventory_item_id, movement_type, reason, quantity, date, notes, performed_by) VALUES
  -- Fire Safety purchases
  ('e1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'stock_in', 'purchase', 4, '2024-03-15', 'Initial purchase — 4 ABC fire extinguishers for all blocks', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'stock_in', 'purchase', 3, '2024-03-15', 'Initial purchase — CO2 extinguishers for electrical panels', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000003', 'stock_in', 'purchase', 3, '2023-06-10', 'Fire hose reels installed in all blocks', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'stock_in', 'purchase', 20, '2024-01-20', 'Smoke detectors for all common areas', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Electronics purchases
  ('e1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'stock_in', 'purchase', 12, '2024-06-01', 'CCTV camera installation — 12 cameras across society', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000006', 'stock_in', 'purchase', 1, '2024-06-01', 'DVR for CCTV system', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000007', 'stock_in', 'purchase', 1, '2023-11-15', 'Video intercom system for main gate', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000008', 'stock_in', 'purchase', 3, '2024-08-10', 'UPS units for common area lighting backup', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- DG Parts
  ('e1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000009', 'stock_in', 'purchase', 1, '2022-04-20', 'DG set installation at society', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000010', 'stock_in', 'purchase', 10, '2025-09-01', 'Engine oil stock for DG servicing', 'f0000000-0000-0000-0000-000000000005'),
  ('e1000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000011', 'stock_in', 'purchase', 6, '2025-09-01', 'Oil filters stock for DG servicing', 'f0000000-0000-0000-0000-000000000005'),
  ('e1000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000012', 'stock_in', 'purchase', 2, '2024-12-01', 'New batteries for DG set', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Furniture
  ('e1000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000013', 'stock_in', 'purchase', 40, '2023-08-15', 'Folding chairs for community hall and events', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000014', 'stock_in', 'purchase', 8, '2023-08-15', 'Banquet tables for community hall', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000015', 'stock_in', 'purchase', 1, '2023-05-10', 'Sofa set for Block A lobby', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000016', 'stock_in', 'purchase', 4, '2023-05-10', 'Garden benches for seating area', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Cleaning supplies
  ('e1000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000017', 'stock_in', 'purchase', 6, '2025-12-01', 'Monthly phenyl stock replenishment', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000018', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000018', 'stock_in', 'purchase', 10, '2025-12-15', 'Garbage bags bulk purchase', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000019', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000019', 'stock_in', 'purchase', 10, '2025-11-01', 'Broom stock replenishment', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000020', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000020', 'stock_in', 'purchase', 6, '2024-02-10', 'Dustbins for parking and garden areas', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Plumbing
  ('e1000000-0000-0000-0000-000000000021', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000021', 'stock_in', 'purchase', 2, '2024-01-15', 'Water pumps — one primary, one spare', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000022', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000022', 'stock_in', 'purchase', 3, '2022-09-01', 'Overhead water tanks for all blocks', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Electrical
  ('e1000000-0000-0000-0000-000000000023', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000023', 'stock_in', 'purchase', 20, '2025-10-01', 'LED tube lights for corridor replacements', 'f0000000-0000-0000-0000-000000000005'),
  ('e1000000-0000-0000-0000-000000000024', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000024', 'stock_in', 'purchase', 8, '2024-11-01', 'Flood lights for outdoor areas', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Garden
  ('e1000000-0000-0000-0000-000000000025', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000025', 'stock_in', 'purchase', 1, '2023-10-01', 'Lawn mower for garden maintenance', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000026', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000026', 'stock_in', 'purchase', 5, '2025-11-01', 'Fertilizer for winter garden season', 'f0000000-0000-0000-0000-000000000003'),

  -- Sports
  ('e1000000-0000-0000-0000-000000000027', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000027', 'stock_in', 'purchase', 1, '2023-07-20', 'Table tennis table for recreation room', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('e1000000-0000-0000-0000-000000000028', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000028', 'stock_in', 'purchase', 2, '2023-07-20', 'Carrom boards for recreation room', '47751e2b-522b-41db-a519-d2f2756473d1');

-- Consumption / Usage movements (realistic ongoing usage)
INSERT INTO stock_movements (id, society_id, inventory_item_id, movement_type, reason, quantity, date, notes, performed_by) VALUES
  -- Smoke detectors — 2 damaged in monsoon
  ('e1000000-0000-0000-0000-000000000029', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000004', 'stock_out', 'damaged', 2, '2025-07-20', 'Water damage during heavy rains — Block B 3rd floor', 'f0000000-0000-0000-0000-000000000005'),

  -- Engine oil consumed during DG servicing
  ('e1000000-0000-0000-0000-000000000030', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000010', 'stock_out', 'consumed', 2, '2025-12-15', 'DG quarterly servicing — oil change', 'f0000000-0000-0000-0000-000000000005'),

  -- Oil filters used
  ('e1000000-0000-0000-0000-000000000031', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000011', 'stock_out', 'consumed', 2, '2025-12-15', 'Oil filter replaced during DG servicing', 'f0000000-0000-0000-0000-000000000005'),

  -- Cleaning supplies consumed
  ('e1000000-0000-0000-0000-000000000032', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000017', 'stock_out', 'consumed', 2, '2026-01-05', 'December cleaning supply — 2 cans used', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000033', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000017', 'stock_out', 'consumed', 1, '2026-02-01', 'January cleaning supply — 1 can used', 'f0000000-0000-0000-0000-000000000003'),

  -- Garbage bags consumed
  ('e1000000-0000-0000-0000-000000000034', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000018', 'stock_out', 'consumed', 2, '2026-01-10', 'Garbage bags used — January first half', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000035', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000018', 'stock_out', 'consumed', 2, '2026-01-25', 'Garbage bags used — January second half', 'f0000000-0000-0000-0000-000000000003'),

  -- Brooms worn out
  ('e1000000-0000-0000-0000-000000000036', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000019', 'stock_out', 'consumed', 2, '2025-12-15', 'Old brooms replaced — worn out', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000037', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000019', 'stock_out', 'consumed', 2, '2026-01-30', 'Brooms replaced — Block A and B', 'f0000000-0000-0000-0000-000000000003'),

  -- LED tube lights replaced
  ('e1000000-0000-0000-0000-000000000038', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000023', 'stock_out', 'consumed', 3, '2025-11-15', 'Replaced fused tube lights — Block A corridors', 'f0000000-0000-0000-0000-000000000005'),
  ('e1000000-0000-0000-0000-000000000039', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000023', 'stock_out', 'consumed', 2, '2026-01-10', 'Replaced tube lights — Block B staircase', 'f0000000-0000-0000-0000-000000000005'),

  -- Fertilizer used
  ('e1000000-0000-0000-0000-000000000040', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000026', 'stock_out', 'consumed', 1, '2025-12-01', 'Winter garden fertilizer application — round 1', 'f0000000-0000-0000-0000-000000000003'),
  ('e1000000-0000-0000-0000-000000000041', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000026', 'stock_out', 'consumed', 1, '2026-01-15', 'Winter garden fertilizer application — round 2', 'f0000000-0000-0000-0000-000000000003'),

  -- Chairs issued for Ganpati event
  ('e1000000-0000-0000-0000-000000000042', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000013', 'stock_out', 'issued', 30, '2025-09-05', 'Chairs issued for Ganpati Visarjan event in society', 'f0000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000043', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000013', 'stock_in', 'return', 30, '2025-09-08', 'Chairs returned after Ganpati event', 'f0000000-0000-0000-0000-000000000001'),

  -- Tables issued for Republic Day celebration
  ('e1000000-0000-0000-0000-000000000044', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000014', 'stock_out', 'issued', 4, '2026-01-26', 'Tables for Republic Day celebration setup', 'f0000000-0000-0000-0000-000000000001'),
  ('e1000000-0000-0000-0000-000000000045', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000014', 'stock_in', 'return', 4, '2026-01-27', 'Tables returned after Republic Day event', 'f0000000-0000-0000-0000-000000000001');


-- ============================================================
-- 3. MAINTENANCE SCHEDULES
-- ============================================================

INSERT INTO asset_maintenance_schedules (id, society_id, inventory_item_id, maintenance_type, frequency_days, scheduled_date, completed_date, status, cost, vendor, notes, created_by) VALUES
  -- DG Set — Quarterly servicing (every 90 days)
  ('f1000000-0000-0000-0000-000000000001', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000009', 'Quarterly Servicing (Oil + Filter Change)', 90, '2025-06-15', '2025-06-18', 'completed', 4500.00, 'Kirloskar Authorized Service', 'Oil change + oil filter + air filter cleaned', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000002', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000009', 'Quarterly Servicing (Oil + Filter Change)', 90, '2025-09-15', '2025-09-16', 'completed', 4500.00, 'Kirloskar Authorized Service', 'Routine quarterly servicing completed', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000003', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000009', 'Quarterly Servicing (Oil + Filter Change)', 90, '2025-12-15', '2025-12-15', 'completed', 5200.00, 'Kirloskar Authorized Service', 'Oil change + coolant top-up + belt tension checked', 'f0000000-0000-0000-0000-000000000005'),
  ('f1000000-0000-0000-0000-000000000004', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000009', 'Quarterly Servicing (Oil + Filter Change)', 90, '2026-03-15', null, 'scheduled', null, 'Kirloskar Authorized Service', 'Next scheduled DG servicing', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Fire Extinguisher — Annual refilling (every 365 days)
  ('f1000000-0000-0000-0000-000000000005', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Annual Refilling & Pressure Test', 365, '2025-03-15', '2025-03-20', 'completed', 1200.00, 'SafeGuard Fire Solutions', 'All 4 ABC extinguishers refilled and pressure tested', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000006', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000001', 'Annual Refilling & Pressure Test', 365, '2026-03-15', null, 'scheduled', null, 'SafeGuard Fire Solutions', 'Due for annual refilling', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- CO2 Extinguisher refilling
  ('f1000000-0000-0000-0000-000000000007', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Annual Refilling & Pressure Test', 365, '2025-03-15', '2025-03-20', 'completed', 1500.00, 'SafeGuard Fire Solutions', 'CO2 extinguishers refilled', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000008', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000002', 'Annual Refilling & Pressure Test', 365, '2026-03-15', null, 'scheduled', null, 'SafeGuard Fire Solutions', 'Due for annual CO2 refilling', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Water Pump — Half-yearly servicing (every 180 days)
  ('f1000000-0000-0000-0000-000000000009', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000021', 'Half-Yearly Servicing (Bearing + Seal Check)', 180, '2025-07-15', '2025-07-17', 'completed', 3200.00, 'Crompton Service Center', 'Bearing replaced, mechanical seal checked, motor winding tested', 'f0000000-0000-0000-0000-000000000005'),
  ('f1000000-0000-0000-0000-000000000010', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000021', 'Half-Yearly Servicing (Bearing + Seal Check)', 180, '2026-01-15', null, 'overdue', null, 'Crompton Service Center', 'Overdue — needs scheduling', 'f0000000-0000-0000-0000-000000000005'),

  -- Lawn Mower — Seasonal servicing (every 180 days)
  ('f1000000-0000-0000-0000-000000000011', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000025', 'Seasonal Servicing (Blade + Oil)', 180, '2025-10-01', '2025-10-05', 'completed', 1800.00, 'Honda Service Center', 'Blade sharpened, engine oil changed, air filter cleaned', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000012', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000025', 'Seasonal Servicing (Blade + Oil)', 180, '2026-04-01', null, 'scheduled', null, 'Honda Service Center', 'Pre-monsoon servicing', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- CCTV System — Annual maintenance contract
  ('f1000000-0000-0000-0000-000000000013', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'AMC Visit (Cleaning + Alignment + HDD Check)', 180, '2025-12-01', '2025-12-03', 'completed', 5000.00, 'SecureVision Technologies', 'All 12 cameras cleaned, 2 realigned, DVR HDD health checked — 85%', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000014', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000005', 'AMC Visit (Cleaning + Alignment + HDD Check)', 180, '2026-06-01', null, 'scheduled', null, 'SecureVision Technologies', 'Next AMC visit', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- Water Tank — Annual cleaning
  ('f1000000-0000-0000-0000-000000000015', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000022', 'Annual Tank Cleaning & Disinfection', 365, '2025-11-01', '2025-11-02', 'completed', 6000.00, 'AquaPure Tank Services', 'All 3 overhead tanks cleaned and chlorinated', '47751e2b-522b-41db-a519-d2f2756473d1'),
  ('f1000000-0000-0000-0000-000000000016', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000022', 'Annual Tank Cleaning & Disinfection', 365, '2026-11-01', null, 'scheduled', null, 'AquaPure Tank Services', 'Next annual cleaning', '47751e2b-522b-41db-a519-d2f2756473d1'),

  -- UPS Battery check
  ('f1000000-0000-0000-0000-000000000017', 'a0000000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000008', 'Battery Health Check & Water Top-up', 90, '2026-02-10', null, 'overdue', null, 'Luminous Service Center', 'UPS battery check overdue — needs attention', 'f0000000-0000-0000-0000-000000000005');

COMMIT;
