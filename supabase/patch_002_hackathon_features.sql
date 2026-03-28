-- Add new columns for extended hackathon features
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS organizer TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prize_pool TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS min_team_size INT DEFAULT 1;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS max_team_size INT DEFAULT 4;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS participant_count INT DEFAULT 0;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS team_count INT DEFAULT 0;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS registration_deadline TIMESTAMPTZ;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS rules TEXT[] DEFAULT '{}';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS prizes JSONB DEFAULT '[]';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS timeline JSONB DEFAULT '[]';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS manager_id UUID REFERENCES profiles(id);
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS allow_solo BOOLEAN DEFAULT TRUE;

-- NEW: Submission & payment columns
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS submission_types TEXT[] DEFAULT '{}';
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS has_custom_form BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS custom_form_url TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS has_fees BOOLEAN DEFAULT FALSE;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS fees_amount TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS upi_id TEXT;
ALTER TABLE hackathons ADD COLUMN IF NOT EXISTS payment_qr_url TEXT;

-- NEW: Add team_id to registrations for team grouping
ALTER TABLE registrations ADD COLUMN IF NOT EXISTS team_id UUID;

-- Create Supabase Storage bucket for hackathon assets (run separately if bucket doesn't exist)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('hackathon-assets', 'hackathon-assets', true) ON CONFLICT DO NOTHING;
