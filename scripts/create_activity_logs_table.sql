-- Create activity_logs table for notification center
-- This table stores all activity logs and notifications

CREATE TABLE IF NOT EXISTS public.activity_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    type TEXT NOT NULL CHECK (type IN ('job_card', 'company', 'provider', 'system', 'approval')),
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    entity_type TEXT,
    entity_id UUID,
    actor_type TEXT NOT NULL CHECK (actor_type IN ('admin', 'company', 'provider')),
    actor_id UUID NOT NULL REFERENCES auth.users(id),
    actor_name TEXT NOT NULL,
    company_id UUID REFERENCES public.companies(id),
    metadata JSONB DEFAULT '{}',
    read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_activity_logs_company_id ON public.activity_logs(company_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_actor_id ON public.activity_logs(actor_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_entity ON public.activity_logs(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_read ON public.activity_logs(read);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_logs_type ON public.activity_logs(type);

-- Enable Row Level Security
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- Admins can see all activity logs
CREATE POLICY "Admins can view all activity logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'admin'
        )
    );

-- Company users can see logs related to their company
CREATE POLICY "Company users can view their company logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'company'
            AND (
                activity_logs.company_id = users.company_id
                OR activity_logs.actor_type = 'company'
            )
        )
    );

-- Providers can see logs related to them
CREATE POLICY "Providers can view related logs"
    ON public.activity_logs FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
            AND users.role = 'provider'
            AND (
                activity_logs.actor_type = 'provider'
                OR activity_logs.entity_type = 'job_card'
            )
        )
    );

-- Only service role can insert (done via API with service role key)
CREATE POLICY "Service role can insert activity logs"
    ON public.activity_logs FOR INSERT
    WITH CHECK (true);

-- Users can update their own read status
CREATE POLICY "Users can update read status"
    ON public.activity_logs FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.users
            WHERE users.id = auth.uid()
        )
    )
    WITH CHECK (
        -- Only allow updating the read field
        OLD.id = NEW.id
        AND OLD.type = NEW.type
        AND OLD.title = NEW.title
        AND OLD.message = NEW.message
        AND OLD.entity_type = NEW.entity_type
        AND OLD.entity_id = NEW.entity_id
        AND OLD.actor_type = NEW.actor_type
        AND OLD.actor_id = NEW.actor_id
        AND OLD.actor_name = NEW.actor_name
        AND OLD.company_id = NEW.company_id
    );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_activity_logs_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_activity_logs_updated_at
    BEFORE UPDATE ON public.activity_logs
    FOR EACH ROW
    EXECUTE FUNCTION update_activity_logs_updated_at();

