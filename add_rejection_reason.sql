-- Add rejection_reason column to requisitions table if it doesn't exist
ALTER TABLE public.requisitions 
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Verify the column was added
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'requisitions' AND column_name = 'rejection_reason';
