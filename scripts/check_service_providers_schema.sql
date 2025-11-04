-- Check service_providers table structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'service_providers'
ORDER BY ordinal_position;

-- Check if code column exists
SELECT EXISTS (
  SELECT 1
  FROM information_schema.columns
  WHERE table_schema = 'public'
    AND table_name = 'service_providers'
    AND column_name = 'code'
) AS code_column_exists;

