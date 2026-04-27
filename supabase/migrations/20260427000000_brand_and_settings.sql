-- Add brand column to perfumes
ALTER TABLE perfumes ADD COLUMN IF NOT EXISTS brand TEXT;

-- Settings table for admin-configurable global values (INR pricing, etc.)
CREATE TABLE IF NOT EXISTS settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public can read settings"
  ON settings FOR SELECT USING (true);

CREATE POLICY "Admins can manage settings"
  ON settings FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_roles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Default INR pricing values
INSERT INTO settings (key, value) VALUES
  ('inr_exchange_rate', '23'),
  ('inr_courier_charge', '250')
ON CONFLICT (key) DO NOTHING;
