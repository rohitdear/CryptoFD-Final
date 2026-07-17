-- Auto-create profile when user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_referral_code TEXT;
  referrer_user_id UUID;
  ref_code TEXT;
BEGIN
  -- Generate unique referral code
  new_referral_code := 'CF' || UPPER(SUBSTRING(MD5(NEW.id::text || NOW()::text) FROM 1 FOR 8));
  
  -- Check if referred by someone
  ref_code := NEW.raw_user_meta_data ->> 'referral_code';
  IF ref_code IS NOT NULL AND ref_code != '' THEN
    SELECT id INTO referrer_user_id FROM public.profiles WHERE referral_code = ref_code;
  END IF;
  
  -- Insert profile
  INSERT INTO public.profiles (
    id,
    full_name,
    phone,
    referral_code,
    referred_by
  )
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    new_referral_code,
    referrer_user_id
  )
  ON CONFLICT (id) DO NOTHING;

  -- If referred, create referral chain (up to 5 levels)
  IF referrer_user_id IS NOT NULL THEN
    -- Level 1: Direct referrer (10%)
    INSERT INTO public.referrals (referrer_id, referred_id, level, commission_rate)
    VALUES (referrer_user_id, NEW.id, 1, 10.00)
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
    
    -- Level 2-5: Upline referrers
    WITH RECURSIVE upline AS (
      SELECT referred_by as referrer, 2 as lvl
      FROM public.profiles 
      WHERE id = referrer_user_id AND referred_by IS NOT NULL
      
      UNION ALL
      
      SELECT p.referred_by, u.lvl + 1
      FROM upline u
      JOIN public.profiles p ON p.id = u.referrer
      WHERE u.lvl < 5 AND p.referred_by IS NOT NULL
    )
    INSERT INTO public.referrals (referrer_id, referred_id, level, commission_rate)
    SELECT 
      referrer, 
      NEW.id, 
      lvl,
      CASE lvl
        WHEN 2 THEN 5.00
        WHEN 3 THEN 3.00
        WHEN 4 THEN 2.00
        WHEN 5 THEN 1.00
      END
    FROM upline
    WHERE referrer IS NOT NULL
    ON CONFLICT (referrer_id, referred_id) DO NOTHING;
  END IF;

  RETURN NEW;
END;
$$;

-- Create trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
