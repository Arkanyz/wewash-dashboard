-- Supprimer la table existante
DROP TABLE IF EXISTS public.laundries CASCADE;

-- Recréer la table avec la bonne structure
CREATE TABLE public.laundries (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    name text NOT NULL,
    address text NOT NULL,
    ville text NOT NULL,
    code_postal text NOT NULL,
    owner_id uuid REFERENCES public.profiles(id),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Activer RLS
ALTER TABLE public.laundries ENABLE ROW LEVEL SECURITY;

-- Ajouter les politiques de sécurité
CREATE POLICY "Les utilisateurs peuvent voir leurs propres laveries"
    ON public.laundries
    FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent ajouter leurs propres laveries"
    ON public.laundries
    FOR INSERT
    WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres laveries"
    ON public.laundries
    FOR UPDATE
    USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres laveries"
    ON public.laundries
    FOR DELETE
    USING (auth.uid() = owner_id);

-- Ajouter les triggers pour la mise à jour automatique
CREATE TRIGGER handle_updated_at
    BEFORE UPDATE ON public.laundries
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();
