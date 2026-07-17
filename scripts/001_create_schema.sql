-- CryptoFD Investment Platform Database Schema

-- 1. Profiles table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT,
  phone TEXT,
  avatar_url TEXT,
  referral_code TEXT UNIQUE,
  referred_by UUID REFERENCES public.profiles(id),
  wallet_balance DECIMAL(20, 8) DEFAULT 0,
  locked_balance DECIMAL(20, 8) DEFAULT 0,
  total_earnings DECIMAL(20, 8) DEFAULT 0,
  referral_earnings DECIMAL(20, 8) DEFAULT 0,
  usdt_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. FD Plans table (admin-defined investment plans)
CREATE TABLE IF NOT EXISTS public.fd_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  min_amount DECIMAL(20, 8) NOT NULL,
  max_amount DECIMAL(20, 8) NOT NULL,
  daily_roi DECIMAL(5, 2) NOT NULL, -- Daily ROI percentage
  duration_days INTEGER NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. User FDs (user investments)
CREATE TABLE IF NOT EXISTS public.user_fds (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  plan_id UUID NOT NULL REFERENCES public.fd_plans(id),
  amount DECIMAL(20, 8) NOT NULL,
  daily_earning DECIMAL(20, 8) NOT NULL,
  total_earned DECIMAL(20, 8) DEFAULT 0,
  start_date TIMESTAMPTZ DEFAULT NOW(),
  end_date TIMESTAMPTZ NOT NULL,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'completed', 'cancelled')),
  last_payout_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Transactions table
CREATE TABLE IF NOT EXISTS public.transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('deposit', 'withdrawal', 'fd_earning', 'referral_earning', 'fd_investment', 'fd_maturity')),
  amount DECIMAL(20, 8) NOT NULL,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  tx_hash TEXT,
  description TEXT,
  reference_id UUID, -- Can reference fd_id or referral
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Team/Referrals table (tracks referral hierarchy)
CREATE TABLE IF NOT EXISTS public.referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  level INTEGER NOT NULL CHECK (level BETWEEN 1 AND 5),
  commission_rate DECIMAL(5, 2) NOT NULL,
  total_earned DECIMAL(20, 8) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(referrer_id, referred_id)
);

-- 6. Referral Earnings log
CREATE TABLE IF NOT EXISTS public.referral_earnings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  referred_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  fd_id UUID REFERENCES public.user_fds(id),
  level INTEGER NOT NULL,
  amount DECIMAL(20, 8) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. Deposit addresses (for receiving crypto)
CREATE TABLE IF NOT EXISTS public.deposit_addresses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  network TEXT NOT NULL DEFAULT 'TRC20',
  address TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fd_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_fds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_earnings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.deposit_addresses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for profiles
CREATE POLICY "profiles_select_own" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles FOR UPDATE USING (auth.uid() = id);

-- RLS Policies for fd_plans (everyone can read active plans)
CREATE POLICY "fd_plans_select_all" ON public.fd_plans FOR SELECT USING (is_active = true);

-- RLS Policies for user_fds
CREATE POLICY "user_fds_select_own" ON public.user_fds FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_fds_insert_own" ON public.user_fds FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_fds_update_own" ON public.user_fds FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for transactions
CREATE POLICY "transactions_select_own" ON public.transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "transactions_insert_own" ON public.transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for referrals (can see where they are referrer)
CREATE POLICY "referrals_select_own" ON public.referrals FOR SELECT USING (auth.uid() = referrer_id);

-- RLS Policies for referral_earnings
CREATE POLICY "referral_earnings_select_own" ON public.referral_earnings FOR SELECT USING (auth.uid() = referrer_id);

-- RLS Policies for deposit_addresses
CREATE POLICY "deposit_addresses_select_own" ON public.deposit_addresses FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "deposit_addresses_insert_own" ON public.deposit_addresses FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_fds_user_id ON public.user_fds(user_id);
CREATE INDEX IF NOT EXISTS idx_user_fds_status ON public.user_fds(status);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions(type);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer_id ON public.referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred_id ON public.referrals(referred_id);
CREATE INDEX IF NOT EXISTS idx_profiles_referral_code ON public.profiles(referral_code);
