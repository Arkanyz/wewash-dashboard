-- Sauvegarde des données existantes
CREATE TEMP TABLE laundries_backup AS
SELECT * FROM laundries;

-- Suppression des contraintes et tables dépendantes
DROP TABLE IF EXISTS rates CASCADE;
DROP TABLE IF EXISTS machines CASCADE;
DROP TABLE IF EXISTS laundries CASCADE;

-- Recréation de la table laundries avec la bonne structure
CREATE TABLE laundries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    opening_hours JSONB,
    has_pricing BOOLEAN DEFAULT false,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Création de la table machines
CREATE TABLE machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    laundry_id UUID REFERENCES laundries(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    brand TEXT,
    model TEXT,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Création de la table rates
CREATE TABLE rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    laundry_id UUID REFERENCES laundries(id) ON DELETE CASCADE,
    programs JSONB NOT NULL DEFAULT '[]',
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL
);

-- Restauration des données
INSERT INTO laundries (id, created_at, name, address, city, postal_code, country, opening_hours, has_pricing, owner_id)
SELECT id, created_at, name, address, city, postal_code, country, opening_hours, COALESCE(has_pricing, false), owner_id
FROM laundries_backup;

-- Activation RLS
ALTER TABLE laundries ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

-- Politiques pour laundries
CREATE POLICY "Les utilisateurs peuvent voir leurs propres laveries"
ON laundries FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres laveries"
ON laundries FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres laveries"
ON laundries FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres laveries"
ON laundries FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Politiques pour machines
CREATE POLICY "Les utilisateurs peuvent voir leurs propres machines"
ON machines FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres machines"
ON machines FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres machines"
ON machines FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres machines"
ON machines FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Politiques pour rates
CREATE POLICY "Les utilisateurs peuvent voir leurs propres tarifs"
ON rates FOR SELECT
TO authenticated
USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent créer leurs propres tarifs"
ON rates FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent modifier leurs propres tarifs"
ON rates FOR UPDATE
TO authenticated
USING (auth.uid() = owner_id)
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent supprimer leurs propres tarifs"
ON rates FOR DELETE
TO authenticated
USING (auth.uid() = owner_id);

-- Création des triggers
CREATE OR REPLACE FUNCTION check_machine_owner_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.owner_id != (SELECT owner_id FROM laundries WHERE id = NEW.laundry_id) THEN
        RAISE EXCEPTION 'Le owner_id de la machine doit correspondre au owner_id de la laverie';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION check_rate_owner_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.owner_id != (SELECT owner_id FROM machines WHERE id = NEW.machine_id) THEN
        RAISE EXCEPTION 'Le owner_id du tarif doit correspondre au owner_id de la machine';
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_machine_owner_id_trigger
    BEFORE INSERT OR UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION check_machine_owner_id();

CREATE TRIGGER check_rate_owner_id_trigger
    BEFORE INSERT OR UPDATE ON rates
    FOR EACH ROW
    EXECUTE FUNCTION check_rate_owner_id();

-- Index pour les performances
CREATE INDEX IF NOT EXISTS idx_laundries_owner_id ON laundries(owner_id);
CREATE INDEX IF NOT EXISTS idx_machines_owner_id ON machines(owner_id);
CREATE INDEX IF NOT EXISTS idx_rates_owner_id ON rates(owner_id);

-- Force le rafraîchissement du cache
NOTIFY pgrst, 'reload schema';
