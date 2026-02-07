-- =========================================
-- OmniBet AI - Database Schema for Supabase
-- =========================================
-- Run this in Supabase SQL Editor

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS public.users (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT UNIQUE NOT NULL,
    name TEXT,
    avatar_url TEXT,
    subscription_tier TEXT DEFAULT 'free' CHECK (subscription_tier IN ('free', 'gold', 'diamond')),
    subscription_end TIMESTAMP WITH TIME ZONE,
    predictions_used_this_month INT DEFAULT 0,
    predictions_reset_date DATE DEFAULT CURRENT_DATE,
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can view own data" ON public.users
    FOR SELECT USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data" ON public.users
    FOR UPDATE USING (auth.uid() = id);

-- =========================================
-- Predictions History (public record)
-- =========================================
CREATE TABLE IF NOT EXISTS public.predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT NOT NULL,
    sport TEXT NOT NULL,
    league TEXT,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_logo TEXT,
    away_logo TEXT,
    predicted_winner TEXT CHECK (predicted_winner IN ('home', 'away', 'draw')),
    predicted_market TEXT,
    prediction_text TEXT,
    confidence INT NOT NULL CHECK (confidence >= 0 AND confidence <= 100),
    odds DECIMAL(10, 2),
    actual_result TEXT,
    was_correct BOOLEAN,
    match_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.predictions ENABLE ROW LEVEL SECURITY;

-- Anyone can read predictions (public record)
CREATE POLICY "Predictions are public" ON public.predictions
    FOR SELECT USING (true);

-- Only service role can insert/update predictions
CREATE POLICY "Service can manage predictions" ON public.predictions
    FOR ALL USING (auth.role() = 'service_role');

-- =========================================
-- User Predictions (track which user viewed which prediction)
-- =========================================
CREATE TABLE IF NOT EXISTS public.user_predictions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
    prediction_id UUID REFERENCES public.predictions(id) ON DELETE CASCADE,
    viewed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, prediction_id)
);

-- Enable RLS
ALTER TABLE public.user_predictions ENABLE ROW LEVEL SECURITY;

-- Users can see their own views
CREATE POLICY "Users can view own prediction views" ON public.user_predictions
    FOR SELECT USING (auth.uid() = user_id);

-- Users can insert their own views
CREATE POLICY "Users can insert own prediction views" ON public.user_predictions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =========================================
-- Indexes for performance
-- =========================================
CREATE INDEX IF NOT EXISTS idx_predictions_match_date ON public.predictions(match_date DESC);
CREATE INDEX IF NOT EXISTS idx_predictions_sport ON public.predictions(sport);
CREATE INDEX IF NOT EXISTS idx_predictions_was_correct ON public.predictions(was_correct);
CREATE INDEX IF NOT EXISTS idx_user_predictions_user ON public.user_predictions(user_id);

-- =========================================
-- Function to auto-create user profile on signup
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.users (id, email, name)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', NEW.email)
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new auth user
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- Function to reset monthly prediction count
-- =========================================
CREATE OR REPLACE FUNCTION public.reset_monthly_predictions()
RETURNS void AS $$
BEGIN
    UPDATE public.users
    SET 
        predictions_used_this_month = 0,
        predictions_reset_date = CURRENT_DATE
    WHERE predictions_reset_date < date_trunc('month', CURRENT_DATE);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- View for accuracy statistics
-- =========================================
CREATE OR REPLACE VIEW public.prediction_stats AS
SELECT
    sport,
    COUNT(*) as total_predictions,
    COUNT(*) FILTER (WHERE was_correct = true) as correct_predictions,
    COUNT(*) FILTER (WHERE was_correct = false) as incorrect_predictions,
    COUNT(*) FILTER (WHERE was_correct IS NULL) as pending_predictions,
    ROUND(
        (COUNT(*) FILTER (WHERE was_correct = true)::DECIMAL / 
         NULLIF(COUNT(*) FILTER (WHERE was_correct IS NOT NULL), 0)) * 100, 
        1
    ) as accuracy_percentage
FROM public.predictions
GROUP BY sport;

-- Grant access to authenticated users
GRANT SELECT ON public.prediction_stats TO authenticated;
GRANT SELECT ON public.prediction_stats TO anon;
