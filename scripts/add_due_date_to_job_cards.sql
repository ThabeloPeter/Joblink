-- Add due_date column to job_cards table
-- This column stores the due date for job cards

ALTER TABLE public.job_cards
ADD COLUMN IF NOT EXISTS due_date TIMESTAMP WITH TIME ZONE;

-- Add a comment to document the column
COMMENT ON COLUMN public.job_cards.due_date IS 'The due date for completing the job card';

