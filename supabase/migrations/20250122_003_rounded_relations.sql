-- Migration 3: Ajout des relations et contraintes
BEGIN;

-- Ajout des colonnes de relation pour rounded_calls
ALTER TABLE rounded_calls
ADD COLUMN IF NOT EXISTS laundry_id UUID REFERENCES laundries(id) ON DELETE SET NULL,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ajout des colonnes de relation pour rounded_call_segments
ALTER TABLE rounded_call_segments
ADD COLUMN IF NOT EXISTS call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Ajout des colonnes de relation pour rounded_variables
ALTER TABLE rounded_variables
ADD COLUMN IF NOT EXISTS call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS segment_id UUID REFERENCES rounded_call_segments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
ADD CONSTRAINT rounded_variables_call_name_unique UNIQUE(call_id, name);

-- Ajout des colonnes de relation pour rounded_tools_usage
ALTER TABLE rounded_tools_usage
ADD COLUMN IF NOT EXISTS call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS segment_id UUID REFERENCES rounded_call_segments(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

COMMIT;
