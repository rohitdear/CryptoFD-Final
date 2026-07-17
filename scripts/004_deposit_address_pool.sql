-- Migration: Add deposit address pool system
-- Each user gets assigned a unique deposit address from a pre-loaded pool

-- Drop old deposit_addresses table if it exists
DROP TABLE IF EXISTS deposit_addresses CASCADE;

-- Create address pool table (admin adds addresses here)
CREATE TABLE IF NOT EXISTS deposit_address_pool (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  address VARCHAR(255) UNIQUE NOT NULL,
  network VARCHAR(20) NOT NULL DEFAULT 'TRC20',
  is_assigned BOOLEAN DEFAULT false,
  assigned_to UUID REFERENCES users(id) ON DELETE SET NULL,
  assigned_at TIMESTAMPTZ,
  label VARCHAR(100), -- Optional label for admin reference
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_address_pool_is_assigned ON deposit_address_pool(is_assigned);
CREATE INDEX IF NOT EXISTS idx_address_pool_assigned_to ON deposit_address_pool(assigned_to);
CREATE INDEX IF NOT EXISTS idx_address_pool_address ON deposit_address_pool(address);

-- Function to assign a deposit address to a user
CREATE OR REPLACE FUNCTION assign_deposit_address(p_user_id UUID)
RETURNS TABLE(address VARCHAR(255), network VARCHAR(20)) AS $$
DECLARE
  v_address_id UUID;
  v_address VARCHAR(255);
  v_network VARCHAR(20);
BEGIN
  -- First check if user already has an address
  SELECT dap.address, dap.network INTO v_address, v_network
  FROM deposit_address_pool dap
  WHERE dap.assigned_to = p_user_id
  LIMIT 1;
  
  IF v_address IS NOT NULL THEN
    RETURN QUERY SELECT v_address, v_network;
    RETURN;
  END IF;
  
  -- Find an unassigned address and assign it
  UPDATE deposit_address_pool
  SET is_assigned = true,
      assigned_to = p_user_id,
      assigned_at = NOW()
  WHERE id = (
    SELECT id FROM deposit_address_pool
    WHERE is_assigned = false
    ORDER BY created_at ASC
    LIMIT 1
    FOR UPDATE SKIP LOCKED
  )
  RETURNING deposit_address_pool.address, deposit_address_pool.network INTO v_address, v_network;
  
  IF v_address IS NULL THEN
    -- No available addresses, return empty
    RETURN;
  END IF;
  
  RETURN QUERY SELECT v_address, v_network;
END;
$$ LANGUAGE plpgsql;

-- Insert some sample addresses (Admin should replace these with real addresses)
-- In production, admin would add real USDT TRC20 addresses here
INSERT INTO deposit_address_pool (address, network, label) VALUES
  ('TYDzsYUEpvnYmQk4zGP9sWWcTEd2MiAtW6', 'TRC20', 'Pool Address 1'),
  ('TNPeeaaFB7K9cmo4uQpcU32zGK8G1NYqeL', 'TRC20', 'Pool Address 2'),
  ('TXkBvHGHCdFxVKXxKfAJwjWzWc4kU7d7Ym', 'TRC20', 'Pool Address 3'),
  ('TWd4WrZ9wn84f5x1hZhL4DHvk738ns5jwb', 'TRC20', 'Pool Address 4'),
  ('TPsb1UxgJMvEGYvSAMFQG8gHFCMBDV7y8K', 'TRC20', 'Pool Address 5'),
  ('TMuA6YqfCeX8EhbfYEg5y7S4ibBc6SJM4F', 'TRC20', 'Pool Address 6'),
  ('TJYeasXNNpAcXBSguyqJGTfNvLH4nGsWM7', 'TRC20', 'Pool Address 7'),
  ('TKCsXtfKfH2d6aEaQCctybDC9uaA3MSj2h', 'TRC20', 'Pool Address 8'),
  ('TRFv8TsMW4vyVnzYhU8R7C9C2Jz8c1sxhS', 'TRC20', 'Pool Address 9'),
  ('TGjgvdTWWrxKBDr9J7GVdYFpx5VjdTDJYt', 'TRC20', 'Pool Address 10')
ON CONFLICT (address) DO NOTHING;
