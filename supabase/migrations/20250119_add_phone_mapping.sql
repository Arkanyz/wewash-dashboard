-- Table pour mapper les numéros de téléphone aux laveries
CREATE TABLE IF NOT EXISTS public.phone_mappings (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    phone_number text NOT NULL UNIQUE,
    laundry_id uuid REFERENCES public.laundries(id) ON DELETE CASCADE,
    account_id uuid REFERENCES auth.users(id),
    is_active boolean DEFAULT true,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_active_phone UNIQUE (phone_number, is_active)
);

-- Activer RLS
ALTER TABLE public.phone_mappings ENABLE ROW LEVEL SECURITY;

-- Créer les politiques RLS
CREATE POLICY "Enable read access for authenticated users" ON public.phone_mappings
    FOR SELECT
    USING (auth.role() = 'authenticated');

CREATE POLICY "Enable insert for authenticated users" ON public.phone_mappings
    FOR INSERT
    WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Enable update for owners" ON public.phone_mappings
    FOR UPDATE
    USING (auth.uid() = account_id);

-- Fonction pour obtenir les détails d'une laverie à partir d'un numéro de téléphone
CREATE OR REPLACE FUNCTION get_laundry_from_phone(p_phone_number text)
RETURNS TABLE (
    laundry_id uuid,
    account_id uuid,
    laundry_name text,
    laundry_address text
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        pm.laundry_id,
        pm.account_id,
        l.name as laundry_name,
        l.address as laundry_address
    FROM phone_mappings pm
    JOIN laundries l ON l.id = pm.laundry_id
    WHERE pm.phone_number = p_phone_number
    AND pm.is_active = true
    LIMIT 1;
END;
$$;
