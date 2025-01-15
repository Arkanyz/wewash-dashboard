-- Créer l'énumération pour les types de machines
CREATE TYPE machine_type AS ENUM ('washer', 'dryer', 'terminal');

-- Créer l'énumération pour les statuts
CREATE TYPE machine_status AS ENUM ('ok', 'maintenance', 'out_of_order');

-- Créer la table machines
CREATE TABLE IF NOT EXISTS public.machines (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    laundry_id uuid REFERENCES public.laundries(id) ON DELETE CASCADE,
    type machine_type NOT NULL,
    brand text NOT NULL,
    model text NOT NULL,
    capacity text,
    number integer NOT NULL,
    status machine_status DEFAULT 'ok',
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques de sécurité
CREATE POLICY "Les utilisateurs peuvent voir les machines de leurs laveries"
    ON public.machines
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.laundries
            WHERE laundries.id = machines.laundry_id
            AND laundries.owner_id = auth.uid()
        )
    );

CREATE POLICY "Les utilisateurs peuvent ajouter des machines à leurs laveries"
    ON public.machines
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.laundries
            WHERE laundries.id = machines.laundry_id
            AND laundries.owner_id = auth.uid()
        )
    );

CREATE POLICY "Les utilisateurs peuvent modifier les machines de leurs laveries"
    ON public.machines
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.laundries
            WHERE laundries.id = machines.laundry_id
            AND laundries.owner_id = auth.uid()
        )
    );

CREATE POLICY "Les utilisateurs peuvent supprimer les machines de leurs laveries"
    ON public.machines
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.laundries
            WHERE laundries.id = machines.laundry_id
            AND laundries.owner_id = auth.uid()
        )
    );

-- Ajouter le trigger pour la mise à jour automatique
DROP TRIGGER IF EXISTS handle_updated_at ON public.machines;
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.machines
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
