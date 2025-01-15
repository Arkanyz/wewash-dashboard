-- Create technicians table
CREATE TABLE IF NOT EXISTS public.technicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    owner_id UUID REFERENCES auth.users(id),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    phone TEXT,
    type TEXT,
    company_name TEXT,
    service_area TEXT,
    speciality TEXT
);

-- Enable Row Level Security
ALTER TABLE public.technicians ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Les utilisateurs peuvent voir tous les techniciens"
    ON public.technicians FOR SELECT
    USING (true);

CREATE POLICY "Les utilisateurs authentifiés peuvent ajouter des techniciens"
    ON public.technicians FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres techniciens"
    ON public.technicians FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres techniciens"
    ON public.technicians FOR DELETE
    USING (auth.uid() = owner_id);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_technicians_owner ON public.technicians(owner_id);
CREATE INDEX IF NOT EXISTS idx_technicians_email ON public.technicians(email);
CREATE INDEX IF NOT EXISTS idx_technicians_service_area ON public.technicians(service_area);

-- Grant permissions
GRANT ALL ON public.technicians TO authenticated;
GRANT USAGE ON SEQUENCE public.technicians_id_seq TO authenticated;
