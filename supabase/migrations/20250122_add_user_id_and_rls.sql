-- Désactivation temporaire des contraintes de clé étrangère
SET session_replication_role = 'replica';

-- Force le rafraîchissement du cache de schéma PostgREST
NOTIFY pgrst, 'reload schema';

-- Création des tables si elles n'existent pas
CREATE TABLE IF NOT EXISTS laundries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    country TEXT NOT NULL,
    opening_hours JSONB
);

CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    laundry_id UUID REFERENCES laundries(id) ON DELETE CASCADE,
    type TEXT NOT NULL,
    capacity INTEGER NOT NULL,
    brand TEXT,
    model TEXT
);

CREATE TABLE IF NOT EXISTS rates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    laundry_id UUID REFERENCES laundries(id) ON DELETE CASCADE,
    programs JSONB NOT NULL DEFAULT '[]'
);

-- Ajout des colonnes owner_id
ALTER TABLE laundries
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE machines
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

ALTER TABLE rates
ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE;

-- Création des fonctions de trigger pour vérifier la correspondance des owner_id
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

-- Mise à jour des données existantes
DO $$
DECLARE
    first_user_id UUID;
BEGIN
    -- Récupération du premier utilisateur
    SELECT id INTO first_user_id
    FROM auth.users 
    ORDER BY created_at ASC 
    LIMIT 1;

    -- Si aucun utilisateur n'existe, on lève une exception
    IF first_user_id IS NULL THEN
        RAISE EXCEPTION 'Aucun utilisateur trouvé dans la base de données';
    END IF;

    -- Mise à jour des laveries
    UPDATE laundries
    SET owner_id = first_user_id
    WHERE owner_id IS NULL;

    -- Mise à jour des machines orphelines (sans laverie)
    UPDATE machines
    SET owner_id = first_user_id
    WHERE laundry_id IS NULL
    AND owner_id IS NULL;

    -- Mise à jour des machines avec laverie
    UPDATE machines m
    SET owner_id = l.owner_id
    FROM laundries l
    WHERE l.id = m.laundry_id
    AND m.owner_id IS NULL;

    -- Double vérification pour les machines sans owner_id
    UPDATE machines
    SET owner_id = first_user_id
    WHERE owner_id IS NULL;

    -- Mise à jour des tarifs orphelins (sans machine)
    UPDATE rates
    SET owner_id = first_user_id
    WHERE machine_id IS NULL
    AND owner_id IS NULL;

    -- Mise à jour des tarifs avec machine
    UPDATE rates r
    SET owner_id = m.owner_id
    FROM machines m
    WHERE m.id = r.machine_id
    AND r.owner_id IS NULL;

    -- Double vérification pour les tarifs sans owner_id
    UPDATE rates
    SET owner_id = first_user_id
    WHERE owner_id IS NULL;
END $$;

-- Vérification que toutes les données ont été mises à jour
DO $$
BEGIN
    -- Affichage des machines sans owner_id pour le debug
    CREATE TEMP TABLE machines_without_owner AS
    SELECT m.id, m.laundry_id, l.owner_id as laundry_owner_id
    FROM machines m
    LEFT JOIN laundries l ON m.laundry_id = l.id
    WHERE m.owner_id IS NULL;

    IF EXISTS (SELECT 1 FROM machines_without_owner) THEN
        RAISE NOTICE 'Machines sans owner_id trouvées : %', (SELECT COUNT(*) FROM machines_without_owner);
        RAISE EXCEPTION 'Il existe encore des machines sans owner_id';
    END IF;

    DROP TABLE IF EXISTS machines_without_owner;

    IF EXISTS (SELECT 1 FROM laundries WHERE owner_id IS NULL) THEN
        RAISE EXCEPTION 'Il existe encore des laveries sans owner_id';
    END IF;

    IF EXISTS (SELECT 1 FROM rates WHERE owner_id IS NULL) THEN
        RAISE EXCEPTION 'Il existe encore des tarifs sans owner_id';
    END IF;
END $$;

-- Ajout des contraintes NOT NULL maintenant que les données sont mises à jour
ALTER TABLE laundries
ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE machines
ALTER COLUMN owner_id SET NOT NULL;

ALTER TABLE rates
ALTER COLUMN owner_id SET NOT NULL;

-- Création des triggers maintenant que les données sont valides
DROP TRIGGER IF EXISTS check_machine_owner_id_trigger ON machines;
CREATE TRIGGER check_machine_owner_id_trigger
    BEFORE INSERT OR UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION check_machine_owner_id();

DROP TRIGGER IF EXISTS check_rate_owner_id_trigger ON rates;
CREATE TRIGGER check_rate_owner_id_trigger
    BEFORE INSERT OR UPDATE ON rates
    FOR EACH ROW
    EXECUTE FUNCTION check_rate_owner_id();

-- Activation de la sécurité niveau ligne (RLS)
ALTER TABLE laundries ENABLE ROW LEVEL SECURITY;
ALTER TABLE machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE rates ENABLE ROW LEVEL SECURITY;

-- Suppression des anciennes politiques si elles existent
DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres laveries" ON laundries;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres laveries" ON laundries;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres laveries" ON laundries;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres laveries" ON laundries;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres machines" ON machines;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres machines" ON machines;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres machines" ON machines;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres machines" ON machines;

DROP POLICY IF EXISTS "Les utilisateurs peuvent voir leurs propres tarifs" ON rates;
DROP POLICY IF EXISTS "Les utilisateurs peuvent créer leurs propres tarifs" ON rates;
DROP POLICY IF EXISTS "Les utilisateurs peuvent modifier leurs propres tarifs" ON rates;
DROP POLICY IF EXISTS "Les utilisateurs peuvent supprimer leurs propres tarifs" ON rates;

-- Création des nouvelles politiques pour les laveries
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

-- Création des nouvelles politiques pour les machines
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

-- Création des nouvelles politiques pour les tarifs
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

-- Ajout d'index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_laundries_owner_id ON laundries(owner_id);
CREATE INDEX IF NOT EXISTS idx_machines_owner_id ON machines(owner_id);
CREATE INDEX IF NOT EXISTS idx_rates_owner_id ON rates(owner_id);

-- Force un nouveau rafraîchissement du cache à la fin
NOTIFY pgrst, 'reload schema';

-- Réactivation des contraintes de clé étrangère
SET session_replication_role = 'origin';
