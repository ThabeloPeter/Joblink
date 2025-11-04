-- Create providers table
CREATE TABLE IF NOT EXISTS public.providers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  phone VARCHAR(50),
  company_id UUID NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  code VARCHAR(8) UNIQUE NOT NULL,
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
  rating DECIMAL(3, 2) DEFAULT 0 CHECK (rating >= 0 AND rating <= 5),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index on company_id for faster queries
CREATE INDEX IF NOT EXISTS idx_providers_company_id ON public.providers(company_id);

-- Create index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_providers_email ON public.providers(email);

-- Create index on code for faster lookups
CREATE INDEX IF NOT EXISTS idx_providers_code ON public.providers(code);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_providers_status ON public.providers(status);

-- Enable Row Level Security
ALTER TABLE public.providers ENABLE ROW LEVEL SECURITY;

-- Create policy for companies to view their own providers
CREATE POLICY "Companies can view their own providers"
ON public.providers
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.company_id = providers.company_id
  )
);

-- Create policy for companies to insert their own providers
CREATE POLICY "Companies can insert their own providers"
ON public.providers
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.company_id = providers.company_id
    AND users.role = 'company'
  )
);

-- Create policy for companies to update their own providers
CREATE POLICY "Companies can update their own providers"
ON public.providers
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.users
    WHERE users.id = auth.uid()
    AND users.company_id = providers.company_id
    AND users.role = 'company'
  )
);

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_providers_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER set_providers_updated_at
BEFORE UPDATE ON public.providers
FOR EACH ROW
EXECUTE FUNCTION update_providers_updated_at();

-- Add comment to table
COMMENT ON TABLE public.providers IS 'Service providers that work for companies and handle job cards';

