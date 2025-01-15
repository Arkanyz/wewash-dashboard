-- Créer une table temporaire simplifiée pour les machines
CREATE TABLE IF NOT EXISTS public.temp_machines (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    laundry_id uuid REFERENCES public.laundries(id) ON DELETE CASCADE,
    machine_type text NOT NULL,
    machine_number text NOT NULL,
    machine_status text DEFAULT 'ok',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS
ALTER TABLE public.temp_machines ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques de sécurité
CREATE POLICY "Accès utilisateur temp_machines"
    ON public.temp_machines
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM public.laundries
            WHERE laundries.id = temp_machines.laundry_id
            AND laundries.owner_id = auth.uid()
        )
    );
