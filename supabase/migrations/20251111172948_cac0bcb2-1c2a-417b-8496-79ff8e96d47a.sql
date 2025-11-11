-- Add credits column to profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits INTEGER NOT NULL DEFAULT 5;

-- Add credits_updated_at column for tracking
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS credits_updated_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create credits_transactions table for audit trail
CREATE TABLE IF NOT EXISTS public.credits_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('purchase', 'deduction', 'refund')),
  description TEXT NOT NULL,
  balance_after INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on credits_transactions
ALTER TABLE public.credits_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for credits_transactions
CREATE POLICY "Users can view own transactions"
ON public.credits_transactions
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Service role can insert transactions"
ON public.credits_transactions
FOR INSERT
WITH CHECK (true);

-- Create function to deduct credits
CREATE OR REPLACE FUNCTION public.deduct_credits(
  _user_id UUID,
  _amount INTEGER,
  _description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_credits INTEGER;
  _new_balance INTEGER;
BEGIN
  -- Get current credits with row lock
  SELECT credits INTO _current_credits
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  -- Check if user exists
  IF _current_credits IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Check if sufficient credits
  IF _current_credits < _amount THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'Insufficient credits',
      'current_credits', _current_credits,
      'required_credits', _amount
    );
  END IF;

  -- Deduct credits
  _new_balance := _current_credits - _amount;
  
  UPDATE public.profiles
  SET credits = _new_balance,
      credits_updated_at = now()
  WHERE id = _user_id;

  -- Log transaction
  INSERT INTO public.credits_transactions (user_id, amount, type, description, balance_after)
  VALUES (_user_id, -_amount, 'deduction', _description, _new_balance);

  RETURN jsonb_build_object(
    'success', true,
    'previous_balance', _current_credits,
    'new_balance', _new_balance,
    'low_credits', _new_balance <= 10
  );
END;
$$;

-- Create function to add credits (for purchases)
CREATE OR REPLACE FUNCTION public.add_credits(
  _user_id UUID,
  _amount INTEGER,
  _description TEXT
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _current_credits INTEGER;
  _new_balance INTEGER;
BEGIN
  -- Get current credits
  SELECT credits INTO _current_credits
  FROM public.profiles
  WHERE id = _user_id
  FOR UPDATE;

  IF _current_credits IS NULL THEN
    RETURN jsonb_build_object(
      'success', false,
      'error', 'User not found'
    );
  END IF;

  -- Add credits
  _new_balance := _current_credits + _amount;
  
  UPDATE public.profiles
  SET credits = _new_balance,
      credits_updated_at = now()
  WHERE id = _user_id;

  -- Log transaction
  INSERT INTO public.credits_transactions (user_id, amount, type, description, balance_after)
  VALUES (_user_id, _amount, 'purchase', _description, _new_balance);

  RETURN jsonb_build_object(
    'success', true,
    'previous_balance', _current_credits,
    'new_balance', _new_balance
  );
END;
$$;