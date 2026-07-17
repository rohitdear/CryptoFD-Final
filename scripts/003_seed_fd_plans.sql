-- Seed FD Plans
INSERT INTO public.fd_plans (name, min_amount, max_amount, daily_roi, duration_days, is_active) VALUES
  ('Starter', 50, 499, 1.00, 30, true),
  ('Bronze', 500, 1999, 1.20, 45, true),
  ('Silver', 2000, 4999, 1.50, 60, true),
  ('Gold', 5000, 9999, 1.80, 90, true),
  ('Platinum', 10000, 49999, 2.00, 120, true),
  ('Diamond', 50000, 1000000, 2.50, 180, true)
ON CONFLICT DO NOTHING;
