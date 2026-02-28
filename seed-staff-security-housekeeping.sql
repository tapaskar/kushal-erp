-- RWA ERP Seed: Full demo data including society, users, staff, and all modules
-- Creates everything from scratch for a fresh production database

BEGIN;

-- ============================================================
-- 0a. PREREQUISITE: Society, Users, Roles
-- ============================================================

-- Demo Society
INSERT INTO societies (id, name, registration_number, address, city, state, pincode, phone, email)
VALUES (
  '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a',
  'Kushal Heights Cooperative Housing Society',
  'MH/HSG/2024/001234',
  'Plot No. 45, Sector 7, Kharghar',
  'Navi Mumbai',
  'Maharashtra',
  '410210',
  '+912227740001',
  'admin@kushalheights.in'
) ON CONFLICT DO NOTHING;

-- Admin user (login: phone +919999900001, password via dev-mode "admin123")
INSERT INTO users (id, phone, name, email)
VALUES (
  'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c',
  '+919999900001',
  'Rajesh Kumar',
  'rajesh@kushalheights.in'
) ON CONFLICT DO NOTHING;

-- Assign as society_admin
INSERT INTO user_society_roles (id, user_id, society_id, role, is_default)
VALUES (
  'f0000000-0000-0000-0000-000000000001',
  'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c',
  '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a',
  'society_admin',
  true
) ON CONFLICT DO NOTHING;

-- A few resident users
INSERT INTO users (id, phone, name) VALUES
  ('ec25a4c3-c4e4-493c-9deb-e4deef50ec5c', '+919999900001', 'Rajesh Kumar'),
  ('ec25a4c3-c4e4-493c-9deb-e4deef50ec5e', '+919999900002', 'Anita Sharma'),
  ('ec25a4c3-c4e4-493c-9deb-e4deef50ec5f', '+919999900003', 'Vikram Patel')
ON CONFLICT DO NOTHING;

INSERT INTO user_society_roles (id, user_id, society_id, role, is_default) VALUES
  ('f0000000-0000-0000-0000-000000000002', 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5e', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'resident', true),
  ('f0000000-0000-0000-0000-000000000003', 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5f', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'resident', true)
ON CONFLICT DO NOTHING;

-- Original 5 staff members
INSERT INTO staff (id, society_id, employee_code, name, phone, role, department, is_active, created_by) VALUES
  ('a1000000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'SEC-001', 'Ramesh Kumar', '+919876500001', 'security', 'Security', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('a1000000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'HK-001', 'Sunita Devi', '+919876500002', 'housekeeping', 'Housekeeping', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('a1000000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'MT-001', 'Suresh Yadav', '+919876500003', 'maintenance', 'Maintenance', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('a1000000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'GRD-001', 'Mohan Lal', '+919876500004', 'gardener', 'Garden', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('a1000000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'ELC-001', 'Raju Electrician', '+919876500005', 'electrician', 'Maintenance', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c')
ON CONFLICT DO NOTHING;

-- ============================================================
-- 0b. PREREQUISITE: Blocks, Units, Inventory (needed for FKs)
-- ============================================================

-- Blocks
INSERT INTO blocks (id, society_id, name, code, total_floors, sort_order) VALUES
  ('c0000000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing A', 'A', 5, 1),
  ('c0000000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing B', 'B', 5, 2),
  ('c0000000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing C', 'C', 4, 3)
ON CONFLICT DO NOTHING;

-- Floors
INSERT INTO floors (id, block_id, society_id, floor_number, name) VALUES
  ('d0000000-0000-0000-0000-0000000001a0', 'c0000000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 0, 'Ground Floor'),
  ('d0000000-0000-0000-0000-0000000001a1', 'c0000000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 1, '1st Floor'),
  ('d0000000-0000-0000-0000-0000000001a2', 'c0000000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 2, '2nd Floor'),
  ('d0000000-0000-0000-0000-0000000002b0', 'c0000000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 0, 'Ground Floor'),
  ('d0000000-0000-0000-0000-0000000002b1', 'c0000000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 1, '1st Floor'),
  ('d0000000-0000-0000-0000-0000000003c0', 'c0000000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 0, 'Ground Floor')
ON CONFLICT DO NOTHING;

-- Units (subset for visitor log FKs)
INSERT INTO units (id, society_id, block_id, floor_id, unit_number, unit_type, area_sqft, occupancy_status, is_billable) VALUES
  ('e0000000-0000-0000-0000-00000000a001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-0000000001a0', 'A-001', 'apartment', 850.00, 'owner_occupied', true),
  ('e0000000-0000-0000-0000-00000000a101', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-0000000001a1', 'A-101', 'apartment', 850.00, 'owner_occupied', true),
  ('e0000000-0000-0000-0000-00000000a201', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'c0000000-0000-0000-0000-000000000001', 'd0000000-0000-0000-0000-0000000001a2', 'A-201', 'apartment', 850.00, 'owner_occupied', true),
  ('e0000000-0000-0000-0000-00000000b001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-0000000002b0', 'B-001', 'apartment', 900.00, 'owner_occupied', true),
  ('e0000000-0000-0000-0000-00000000b201', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'c0000000-0000-0000-0000-000000000002', 'd0000000-0000-0000-0000-0000000002b1', 'B-201', 'apartment', 900.00, 'owner_occupied', true)
ON CONFLICT DO NOTHING;

-- A few inventory items (for supply requests and material usage FKs)
INSERT INTO inventory_items (id, society_id, barcode, name, category, quantity, min_stock_level, is_consumable, is_active, created_by) VALUES
  ('d1000000-0000-0000-0000-000000000017', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'INV-CLN-PHEN', 'Phenyl (5L Can)', 'cleaning', 3, 2, true, true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('d1000000-0000-0000-0000-000000000018', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'INV-CLN-GARB', 'Garbage Bags (Pack of 30)', 'cleaning', 6, 4, true, true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('d1000000-0000-0000-0000-000000000023', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'INV-ELC-LED01', 'LED Tube Light 20W', 'electrical', 15, 5, true, true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('d1000000-0000-0000-0000-000000000021', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'INV-PLB-PUMP1', 'Crompton 1.5HP Water Pump', 'plumbing', 2, 1, false, true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c')
ON CONFLICT DO NOTHING;

-- Additional staff: second security guard + supervisor
INSERT INTO staff (id, society_id, employee_code, name, phone, role, department, is_active, created_by) VALUES
  ('a1000000-0000-0000-0000-000000000006', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'SEC-002', 'Babulal Yadav', '+919876500006', 'security', 'Security', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c'),
  ('a1000000-0000-0000-0000-000000000007', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'SUP-001', 'Dinesh Chauhan', '+919876500007', 'supervisor', 'Administration', true, 'ec25a4c3-c4e4-493c-9deb-e4deef50ec5c')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 1. SHIFTS (today + yesterday)
-- ============================================================
INSERT INTO shifts (id, society_id, staff_id, date, scheduled_start, scheduled_end, actual_check_in, actual_check_out, status, notes) VALUES
  -- Today: security day shift
  ('55100000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', CURRENT_DATE, CURRENT_DATE + TIME '06:00', CURRENT_DATE + TIME '18:00', CURRENT_DATE + TIME '05:55', null, 'checked_in', 'Day shift — Main Gate'),
  -- Today: security night shift
  ('55100000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000006', CURRENT_DATE, CURRENT_DATE + TIME '18:00', CURRENT_DATE + INTERVAL '1 day' + TIME '06:00', null, null, 'scheduled', 'Night shift — Main Gate'),
  -- Today: housekeeping morning
  ('55100000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', CURRENT_DATE, CURRENT_DATE + TIME '07:00', CURRENT_DATE + TIME '15:00', CURRENT_DATE + TIME '07:02', null, 'checked_in', 'Morning cleaning shift'),
  -- Today: maintenance
  ('55100000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000003', CURRENT_DATE, CURRENT_DATE + TIME '08:00', CURRENT_DATE + TIME '17:00', CURRENT_DATE + TIME '08:05', null, 'checked_in', 'General maintenance duty'),
  -- Today: electrician
  ('55100000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000005', CURRENT_DATE, CURRENT_DATE + TIME '08:00', CURRENT_DATE + TIME '17:00', CURRENT_DATE + TIME '08:12', null, 'checked_in', 'Electrical maintenance'),
  -- Today: supervisor
  ('55100000-0000-0000-0000-000000000006', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000007', CURRENT_DATE, CURRENT_DATE + TIME '09:00', CURRENT_DATE + TIME '18:00', CURRENT_DATE + TIME '08:50', null, 'checked_in', 'Supervisor oversight'),
  -- Yesterday: completed shifts
  ('55100000-0000-0000-0000-000000000007', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', CURRENT_DATE - 1, (CURRENT_DATE - 1) + TIME '06:00', (CURRENT_DATE - 1) + TIME '18:00', (CURRENT_DATE - 1) + TIME '05:58', (CURRENT_DATE - 1) + TIME '18:05', 'checked_out', 'Completed day shift'),
  ('55100000-0000-0000-0000-000000000008', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', CURRENT_DATE - 1, (CURRENT_DATE - 1) + TIME '07:00', (CURRENT_DATE - 1) + TIME '15:00', (CURRENT_DATE - 1) + TIME '07:05', (CURRENT_DATE - 1) + TIME '15:00', 'checked_out', 'Completed cleaning shift')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 2. STAFF TASKS
-- ============================================================
INSERT INTO staff_tasks (id, society_id, staff_id, task_type, status, title, description, priority, location, due_by, started_at, completed_at, resolution, assigned_by) VALUES
  -- Active
  ('55200000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000003', 'maintenance', 'in_progress', 'Fix leaking tap in B-001', 'Resident reported dripping kitchen tap. Washer replacement needed.', 'medium', 'Wing B — Unit B-001', CURRENT_DATE + TIME '17:00', CURRENT_DATE + TIME '09:30', null, null, 'a1000000-0000-0000-0000-000000000007'),
  ('55200000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000005', 'maintenance', 'accepted', 'Replace corridor lights — Wing A 2nd floor', 'Two LED tube lights fused.', 'low', 'Wing A — 2nd Floor Corridor', CURRENT_DATE + TIME '17:00', null, null, null, 'a1000000-0000-0000-0000-000000000007'),
  ('55200000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000003', 'ad_hoc', 'pending', 'Check DG oil level', 'Monthly DG oil level inspection due.', 'medium', 'Basement — DG Room', CURRENT_DATE + INTERVAL '2 days', null, null, null, 'a1000000-0000-0000-0000-000000000007'),
  -- Completed (for reports)
  ('55200000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000003', 'maintenance', 'completed', 'Repair garden bench — broken slat', 'One wooden slat on garden bench was cracked.', 'low', 'Garden Area', (CURRENT_DATE - 2) + TIME '17:00', (CURRENT_DATE - 2) + TIME '10:00', (CURRENT_DATE - 2) + TIME '11:30', 'Replaced broken slat with new teak wood piece.', 'a1000000-0000-0000-0000-000000000007'),
  ('55200000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000005', 'maintenance', 'completed', 'MCB trip — Wing C ground floor', 'MCB tripping repeatedly.', 'high', 'Wing C — Ground Floor DB', (CURRENT_DATE - 1) + TIME '12:00', (CURRENT_DATE - 1) + TIME '09:00', (CURRENT_DATE - 1) + TIME '10:15', 'Found loose neutral connection. Re-terminated and tightened.', 'a1000000-0000-0000-0000-000000000007')
ON CONFLICT DO NOTHING;


-- ============================================================
-- 3. VISITOR LOGS (10 entries)
-- ============================================================
INSERT INTO visitor_logs (id, society_id, staff_id, visitor_name, visitor_phone, visitor_type, unit_id, purpose, vehicle_number, status, check_in_at, check_out_at, check_in_gate, check_out_gate, notes, created_at) VALUES
  -- Checked out
  ('55300000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Amit Verma', '+919812345601', 'guest', 'e0000000-0000-0000-0000-00000000a101', 'Family visit', 'MH-02-AB-1234', 'checked_out', (CURRENT_DATE - 1) + TIME '10:00', (CURRENT_DATE - 1) + TIME '14:30', 'Main Gate', 'Main Gate', null, (CURRENT_DATE - 1) + TIME '10:00'),
  ('55300000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Zomato Delivery', '+919812345602', 'delivery', 'e0000000-0000-0000-0000-00000000b001', 'Food delivery', null, 'checked_out', CURRENT_DATE + TIME '08:15', CURRENT_DATE + TIME '08:25', 'Main Gate', 'Main Gate', 'Zomato order', CURRENT_DATE + TIME '08:15'),
  ('55300000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Amazon Delivery', '+919812345603', 'delivery', 'e0000000-0000-0000-0000-00000000a201', 'Package delivery', null, 'checked_out', CURRENT_DATE + TIME '09:00', CURRENT_DATE + TIME '09:10', 'Main Gate', 'Main Gate', 'Large box', CURRENT_DATE + TIME '09:00'),

  -- Currently checked in
  ('55300000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Suresh Plumber', '+919812345604', 'service', 'e0000000-0000-0000-0000-00000000a001', 'Plumbing repair', null, 'checked_in', CURRENT_DATE + TIME '09:30', null, 'Main Gate', null, 'Called by resident A-001', CURRENT_DATE + TIME '09:30'),
  ('55300000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Priya Mehta', '+919812345605', 'guest', 'e0000000-0000-0000-0000-00000000b201', 'Personal visit', 'MH-04-CD-5678', 'checked_in', CURRENT_DATE + TIME '10:00', null, 'Main Gate', null, null, CURRENT_DATE + TIME '10:00'),
  ('55300000-0000-0000-0000-000000000006', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Ola Cab Driver', '+919812345606', 'cab', 'e0000000-0000-0000-0000-00000000a101', 'Cab pickup', 'MH-01-XY-9012', 'checked_in', CURRENT_DATE + TIME '10:15', null, 'Main Gate', null, 'Waiting at parking', CURRENT_DATE + TIME '10:15'),
  ('55300000-0000-0000-0000-000000000007', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Rakesh Hardware', '+919812345607', 'vendor', null, 'Quotation for plumbing supplies', null, 'checked_in', CURRENT_DATE + TIME '10:30', null, 'Main Gate', null, 'Meeting with supervisor', CURRENT_DATE + TIME '10:30'),

  -- Expected
  ('55300000-0000-0000-0000-000000000008', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', null, 'Dr. Neha Gupta', '+919812345608', 'guest', 'e0000000-0000-0000-0000-00000000b001', 'Medical visit', null, 'expected', null, null, null, null, 'Doctor visit for resident B-001', CURRENT_DATE + TIME '08:00'),
  ('55300000-0000-0000-0000-000000000009', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', null, 'BigBasket Delivery', '+919812345609', 'delivery', 'e0000000-0000-0000-0000-00000000a001', 'Grocery delivery', null, 'expected', null, null, null, null, 'Expected around 2 PM', CURRENT_DATE + TIME '08:30'),

  -- Rejected
  ('55300000-0000-0000-0000-000000000010', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'Unknown Person', '+919812345610', 'other', null, 'Door-to-door sales', null, 'rejected', null, null, 'Main Gate', null, 'Unauthorized solicitor — turned away', CURRENT_DATE + TIME '09:45');


-- ============================================================
-- 4. INCIDENTS (3 entries)
-- ============================================================
INSERT INTO incidents (id, society_id, reported_by, severity, title, description, location, latitude, longitude, photo_urls, status, resolved_at, resolved_by, resolution, created_at, updated_at) VALUES
  -- Resolved
  ('55400000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'medium', 'Broken glass near parking', 'Shattered glass found near Parking Slot 12. Appears to be from a stray cricket ball.', 'Parking Area — Slot 12', 19.0178000, 72.8478000, '[]', 'resolved', (CURRENT_DATE - 3) + TIME '16:00', 'a1000000-0000-0000-0000-000000000007', 'Glass cleaned up. CCTV footage reviewed — stray cricket ball. No security breach.', (CURRENT_DATE - 3) + TIME '07:30', (CURRENT_DATE - 3) + TIME '16:00'),

  -- Investigating
  ('55400000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000006', 'high', 'Unauthorized entry attempt — rear wall', 'During night patrol, noticed marks on rear compound wall suggesting climbing attempt.', 'Rear Compound Wall — Near Wing C', 19.0175000, 72.8482000, '[]', 'investigating', null, null, null, (CURRENT_DATE - 1) + TIME '02:30', (CURRENT_DATE - 1) + TIME '08:00'),

  -- Reported
  ('55400000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 'low', 'Stray dog in compound', 'Stray dog entered through main gate. Currently in garden area, appears calm.', 'Garden Area', 19.0180000, 72.8476000, '[]', 'reported', null, null, null, CURRENT_DATE + TIME '08:45', CURRENT_DATE + TIME '08:45');


-- ============================================================
-- 5. SOS ALERTS (1 resolved, 1 active)
-- ============================================================
INSERT INTO sos_alerts (id, society_id, staff_id, latitude, longitude, message, is_resolved, resolved_at, resolved_by, created_at) VALUES
  ('55500000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000006', 19.0176000, 72.8480000, 'Suspicious person near basement parking. Need backup immediately.', true, (CURRENT_DATE - 5) + TIME '23:30', 'a1000000-0000-0000-0000-000000000007', (CURRENT_DATE - 5) + TIME '23:15'),
  ('55500000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000001', 19.0179000, 72.8477000, 'Medical emergency — resident collapsed near lobby. Need ambulance.', false, null, null, CURRENT_DATE + TIME '10:45');


-- ============================================================
-- 6. CLEANING ZONES (8 zones)
-- ============================================================
INSERT INTO cleaning_zones (id, society_id, name, floor, block_id, zone_type, frequency, description, is_active) VALUES
  ('55600000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing A — Lobby', 0, 'c0000000-0000-0000-0000-000000000001', 'lobby', 'daily', 'Ground floor lobby, reception area, and entrance', true),
  ('55600000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing A — Staircase', null, 'c0000000-0000-0000-0000-000000000001', 'staircase', 'daily', 'All staircases and landings Ground to 2nd floor', true),
  ('55600000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing B — Lobby', 0, 'c0000000-0000-0000-0000-000000000002', 'lobby', 'daily', 'Ground floor lobby and entrance', true),
  ('55600000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing B — Staircase', null, 'c0000000-0000-0000-0000-000000000002', 'staircase', 'daily', 'All staircases Ground to 1st floor', true),
  ('55600000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Wing C — Lobby', 0, 'c0000000-0000-0000-0000-000000000003', 'lobby', 'daily', 'Ground floor lobby', true),
  ('55600000-0000-0000-0000-000000000006', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Parking Area', null, null, 'parking', 'daily', 'Basement and open parking — sweeping and mopping', true),
  ('55600000-0000-0000-0000-000000000007', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Garden & Pathways', null, null, 'garden', 'daily', 'Garden area, walking paths, children play area', true),
  ('55600000-0000-0000-0000-000000000008', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Gym & Clubhouse', null, null, 'gym', 'daily', 'Gym room, recreation room, community hall', true);


-- ============================================================
-- 7. CLEANING LOGS (today + yesterday)
-- ============================================================

-- Today's schedule (assigned to Sunita — housekeeping staff)
INSERT INTO cleaning_logs (id, society_id, zone_id, staff_id, shift_id, scheduled_date, status, started_at, completed_at, notes, rating, rating_comment) VALUES
  ('55700000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'completed', CURRENT_DATE + TIME '07:10', CURRENT_DATE + TIME '07:50', 'Regular mopping done.', 4, 'Good job, lobby is sparkling'),
  ('55700000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'completed', CURRENT_DATE + TIME '08:00', CURRENT_DATE + TIME '09:15', 'All floors swept and mopped.', null, null),
  ('55700000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000003', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'completed', CURRENT_DATE + TIME '09:20', CURRENT_DATE + TIME '09:55', 'Wing B lobby cleaned.', 5, 'Very clean, thank you!'),
  ('55700000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000004', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'in_progress', CURRENT_DATE + TIME '10:05', null, 'Starting from ground floor up.', null, null),
  ('55700000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000005', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'pending', null, null, null, null, null),
  ('55700000-0000-0000-0000-000000000006', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'pending', null, null, null, null, null),
  ('55700000-0000-0000-0000-000000000007', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'pending', null, null, null, null, null),
  ('55700000-0000-0000-0000-000000000008', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000008', 'a1000000-0000-0000-0000-000000000002', '55100000-0000-0000-0000-000000000003', CURRENT_DATE, 'pending', null, null, null, null, null);

-- Yesterday's completed cleaning (for reports) — use existing shift or NULL
INSERT INTO cleaning_logs (id, society_id, zone_id, staff_id, shift_id, scheduled_date, status, started_at, completed_at, notes, verified_by, verified_at, rating, rating_comment) VALUES
  ('55700000-0000-0000-0000-000000000009', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000002', (SELECT id FROM shifts WHERE staff_id = 'a1000000-0000-0000-0000-000000000002' AND date = CURRENT_DATE - 1 LIMIT 1), CURRENT_DATE - 1, 'verified', (CURRENT_DATE - 1) + TIME '07:15', (CURRENT_DATE - 1) + TIME '07:50', 'Thorough mopping done.', 'a1000000-0000-0000-0000-000000000007', (CURRENT_DATE - 1) + TIME '08:00', 5, 'Excellent work!'),
  ('55700000-0000-0000-0000-000000000010', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000002', 'a1000000-0000-0000-0000-000000000002', (SELECT id FROM shifts WHERE staff_id = 'a1000000-0000-0000-0000-000000000002' AND date = CURRENT_DATE - 1 LIMIT 1), CURRENT_DATE - 1, 'completed', (CURRENT_DATE - 1) + TIME '08:00', (CURRENT_DATE - 1) + TIME '09:10', 'All staircases done.', null, null, 3, 'Cobwebs still on upper landing'),
  ('55700000-0000-0000-0000-000000000011', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000006', 'a1000000-0000-0000-0000-000000000002', (SELECT id FROM shifts WHERE staff_id = 'a1000000-0000-0000-0000-000000000002' AND date = CURRENT_DATE - 1 LIMIT 1), CURRENT_DATE - 1, 'completed', (CURRENT_DATE - 1) + TIME '09:30', (CURRENT_DATE - 1) + TIME '10:45', 'Parking swept.', null, null, 4, null),
  ('55700000-0000-0000-0000-000000000012', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55600000-0000-0000-0000-000000000007', 'a1000000-0000-0000-0000-000000000002', (SELECT id FROM shifts WHERE staff_id = 'a1000000-0000-0000-0000-000000000002' AND date = CURRENT_DATE - 1 LIMIT 1), CURRENT_DATE - 1, 'completed', (CURRENT_DATE - 1) + TIME '11:00', (CURRENT_DATE - 1) + TIME '12:00', 'Garden paths swept, play area cleaned.', null, null, null, null);


-- ============================================================
-- 8. SUPPLY REQUESTS
-- ============================================================
INSERT INTO supply_requests (id, society_id, staff_id, item_name, quantity, urgency, reason, status, approved_by, fulfilled_at, inventory_item_id, notes) VALUES
  -- Fulfilled
  ('55800000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', 'Phenyl 5L Can', 2, 'normal', 'Running low on floor cleaning solution.', 'fulfilled', 'a1000000-0000-0000-0000-000000000007', (CURRENT_DATE - 3) + TIME '14:00', 'd1000000-0000-0000-0000-000000000017', 'Issued from store room'),
  -- Approved
  ('55800000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', 'Garbage Bags (Pack of 30)', 3, 'normal', 'Need garbage bags for Wing C bins.', 'approved', 'a1000000-0000-0000-0000-000000000007', null, 'd1000000-0000-0000-0000-000000000018', null),
  -- Pending
  ('55800000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', 'Glass Cleaner Spray', 4, 'normal', 'Need glass cleaner for lobby doors and windows.', 'pending', null, null, null, null),
  ('55800000-0000-0000-0000-000000000004', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', 'Toilet Cleaner (Harpic)', 6, 'urgent', 'Common toilet cleaner exhausted. Urgent need.', 'pending', null, null, null, null),
  -- Rejected
  ('55800000-0000-0000-0000-000000000005', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000002', 'Automatic Floor Scrubber', 1, 'low', 'Requesting automatic floor scrubber for faster lobby cleaning.', 'rejected', 'a1000000-0000-0000-0000-000000000007', null, null, 'Budget constraint. Will reconsider next quarter.');


-- ============================================================
-- 9. MATERIAL USAGE LOGS
-- ============================================================
INSERT INTO material_usage_logs (id, society_id, staff_id, task_id, inventory_item_id, quantity_used, notes) VALUES
  ('55900000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000005', '55200000-0000-0000-0000-000000000005', 'd1000000-0000-0000-0000-000000000023', 1, 'Used 1 LED tube light to test repaired circuit on Wing C'),
  ('55900000-0000-0000-0000-000000000002', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000005', '55200000-0000-0000-0000-000000000002', 'd1000000-0000-0000-0000-000000000023', 2, 'Two 20W LED tube lights for Wing A 2nd floor corridor'),
  ('55900000-0000-0000-0000-000000000003', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'a1000000-0000-0000-0000-000000000003', '55200000-0000-0000-0000-000000000001', 'd1000000-0000-0000-0000-000000000021', 0, 'Used personal toolkit washer. No society stock consumed.');


-- ============================================================
-- 10. PATROL ROUTE + LOG
-- ============================================================
INSERT INTO patrol_routes (id, society_id, name, description, estimated_duration_min, checkpoints, is_active) VALUES
  ('55a00000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', 'Night Patrol Route', 'Standard night patrol covering all blocks, parking, and perimeter', 45,
   '[{"order":1,"label":"Main Gate","latitude":19.018,"longitude":72.8475},{"order":2,"label":"Wing A Lobby","latitude":19.0179,"longitude":72.8477},{"order":3,"label":"Wing B Lobby","latitude":19.0178,"longitude":72.8479},{"order":4,"label":"Basement Parking","latitude":19.0176,"longitude":72.8478},{"order":5,"label":"Wing C Lobby","latitude":19.0177,"longitude":72.8481},{"order":6,"label":"Garden Area","latitude":19.0181,"longitude":72.8476},{"order":7,"label":"Rear Gate","latitude":19.0175,"longitude":72.8482},{"order":8,"label":"Main Gate (Return)","latitude":19.018,"longitude":72.8475}]',
   true)
ON CONFLICT DO NOTHING;

INSERT INTO patrol_logs (id, society_id, patrol_route_id, staff_id, shift_id, status, started_at, completed_at, checkpoint_results, total_checkpoints, visited_checkpoints, notes) VALUES
  ('55b00000-0000-0000-0000-000000000001', '9ef20c27-bf8d-4c4d-95a4-ec0802e6b63a', '55a00000-0000-0000-0000-000000000001', 'a1000000-0000-0000-0000-000000000006', (SELECT id FROM shifts WHERE staff_id = 'a1000000-0000-0000-0000-000000000001' AND date = CURRENT_DATE - 1 LIMIT 1), 'completed', (CURRENT_DATE - 1) + TIME '22:00', (CURRENT_DATE - 1) + TIME '22:42',
   '[{"checkpointIndex":0,"label":"Main Gate","visitedAt":"22:00","notes":"All clear"},{"checkpointIndex":1,"label":"Wing A Lobby","visitedAt":"22:05","notes":"Lights OK"},{"checkpointIndex":2,"label":"Wing B Lobby","visitedAt":"22:10","notes":"All clear"},{"checkpointIndex":3,"label":"Basement Parking","visitedAt":"22:18","notes":"Checked all vehicles"},{"checkpointIndex":4,"label":"Wing C Lobby","visitedAt":"22:24","notes":"All clear"},{"checkpointIndex":5,"label":"Garden Area","visitedAt":"22:30","notes":"Gate locked"},{"checkpointIndex":6,"label":"Rear Gate","visitedAt":"22:35","notes":"Noticed marks on wall"},{"checkpointIndex":7,"label":"Main Gate (Return)","visitedAt":"22:42","notes":"Patrol complete"}]',
   8, 8, 'Full patrol completed. Noted suspicious marks on rear wall — incident filed.')
ON CONFLICT DO NOTHING;

COMMIT;
