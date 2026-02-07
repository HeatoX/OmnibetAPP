-- OmniBet AI - Premium Features Database Schema
-- Run this migration in your Supabase SQL Editor

-- ============================================
-- Prediction History Table (Transparency)
-- ============================================
CREATE TABLE IF NOT EXISTS prediction_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    match_id TEXT NOT NULL UNIQUE,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    league TEXT,
    sport TEXT,
    start_date TIMESTAMPTZ NOT NULL,
    
    -- Prediction data
    predicted_winner TEXT NOT NULL, -- 'home' | 'away' | 'draw'
    confidence INTEGER NOT NULL,
    prediction_text TEXT,
    
    -- Odds at time of prediction
    home_odds DECIMAL(5,2),
    away_odds DECIMAL(5,2),
    draw_odds DECIMAL(5,2),
    
    -- Resolution
    status TEXT DEFAULT 'pending', -- 'pending' | 'won' | 'lost' | 'void'
    actual_result TEXT,
    final_score JSONB,
    profit_loss DECIMAL(10,2),
    
    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    resolved_at TIMESTAMPTZ
);

-- Index for faster queries
CREATE INDEX IF NOT EXISTS idx_prediction_history_status ON prediction_history(status);
CREATE INDEX IF NOT EXISTS idx_prediction_history_resolved ON prediction_history(resolved_at);
CREATE INDEX IF NOT EXISTS idx_prediction_history_sport ON prediction_history(sport);

-- ============================================
-- Community Votes Table
-- ============================================
CREATE TABLE IF NOT EXISTS prediction_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    match_id TEXT NOT NULL,
    vote TEXT NOT NULL CHECK (vote IN ('agree', 'disagree')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    
    -- Unique constraint: one vote per user per match
    UNIQUE(user_id, match_id)
);

-- Index for counting votes
CREATE INDEX IF NOT EXISTS idx_prediction_votes_match ON prediction_votes(match_id);

-- ============================================
-- Telegram Subscribers Table
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_subscribers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id TEXT NOT NULL UNIQUE,
    username TEXT,
    omnibet_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    status TEXT DEFAULT 'active', -- 'active' | 'paused' | 'blocked'
    preferences JSONB DEFAULT '{"diamonds": true, "banker": true, "dailySummary": true}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_status ON telegram_subscribers(status);
CREATE INDEX IF NOT EXISTS idx_telegram_subscribers_user ON telegram_subscribers(omnibet_user_id);

-- ============================================
-- Telegram Link Codes (for account linking)
-- ============================================
CREATE TABLE IF NOT EXISTS telegram_link_codes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    code TEXT NOT NULL UNIQUE,
    used BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_telegram_link_codes_code ON telegram_link_codes(code);

-- ============================================
-- RLS Policies (Row Level Security)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE prediction_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE prediction_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_subscribers ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_link_codes ENABLE ROW LEVEL SECURITY;

-- Prediction History: Public read, admin write
CREATE POLICY "Anyone can view prediction history" 
    ON prediction_history FOR SELECT 
    USING (true);

CREATE POLICY "Only service role can insert/update predictions" 
    ON prediction_history FOR ALL 
    USING (auth.role() = 'service_role');

-- Prediction Votes: Users can manage their own votes
CREATE POLICY "Users can view all votes" 
    ON prediction_votes FOR SELECT 
    USING (true);

CREATE POLICY "Users can insert their own votes" 
    ON prediction_votes FOR INSERT 
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own votes" 
    ON prediction_votes FOR UPDATE 
    USING (auth.uid() = user_id);

-- Telegram Subscribers: Users can view/manage their own
CREATE POLICY "Users can view their own telegram subscription" 
    ON telegram_subscribers FOR SELECT 
    USING (omnibet_user_id = auth.uid() OR auth.role() = 'service_role');

CREATE POLICY "Service role can manage all subscriptions" 
    ON telegram_subscribers FOR ALL 
    USING (auth.role() = 'service_role');

-- Telegram Link Codes: Users can view their own
CREATE POLICY "Users can view their own link codes" 
    ON telegram_link_codes FOR SELECT 
    USING (user_id = auth.uid());

CREATE POLICY "Users can create link codes" 
    ON telegram_link_codes FOR INSERT 
    WITH CHECK (user_id = auth.uid());

-- ============================================
-- Functions
-- ============================================

-- Function to clean expired link codes
CREATE OR REPLACE FUNCTION clean_expired_link_codes()
RETURNS void AS $$
BEGIN
    DELETE FROM telegram_link_codes 
    WHERE expires_at < NOW() OR used = true;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule cleanup (run every hour via Supabase cron or external scheduler)
-- SELECT cron.schedule('clean-link-codes', '0 * * * *', 'SELECT clean_expired_link_codes();');
