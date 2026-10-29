-- HASTKATHA Phase 2: customer checkout columns.
-- Run against the same PostgreSQL database used by backend/.env.
-- All columns are nullable to preserve existing order records.

ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_name VARCHAR(120);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_email VARCHAR(150);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_phone VARCHAR(20);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_address TEXT;
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_city VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_state VARCHAR(100);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS shipping_pincode VARCHAR(6);
ALTER TABLE orders ADD COLUMN IF NOT EXISTS payment_method VARCHAR(30) DEFAULT 'cod';
