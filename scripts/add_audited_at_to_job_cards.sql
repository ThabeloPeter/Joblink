-- Add audited_at column to job_cards table if it doesn't exist
-- This column tracks when a completed job card was audited by the company

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'job_cards' 
        AND column_name = 'audited_at'
    ) THEN
        ALTER TABLE public.job_cards
        ADD COLUMN audited_at TIMESTAMP WITH TIME ZONE;
        
        COMMENT ON COLUMN public.job_cards.audited_at IS 'Timestamp when the completed job card was audited and approved by the company';
    END IF;
END $$;

