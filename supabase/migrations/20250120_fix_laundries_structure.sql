-- 1. Définir des valeurs par défaut pour les champs obligatoires
ALTER TABLE laundries
ALTER COLUMN ville SET DEFAULT '',
ALTER COLUMN code_postal SET DEFAULT '',
ALTER COLUMN address SET DEFAULT '',
ALTER COLUMN name SET DEFAULT '';

-- 2. Ajouter des contraintes de validation
ALTER TABLE laundries
ADD CONSTRAINT check_ville CHECK (ville != ''),
ADD CONSTRAINT check_code_postal CHECK (code_postal ~ '^\d{5}$'),
ADD CONSTRAINT check_address CHECK (address != ''),
ADD CONSTRAINT check_name CHECK (name != '');

-- 3. Créer un trigger pour normaliser les données avant insertion
CREATE OR REPLACE FUNCTION normalize_laundry_data()
RETURNS TRIGGER AS $$
BEGIN
    -- Nettoyer les espaces en début/fin
    NEW.name = TRIM(NEW.name);
    NEW.address = TRIM(NEW.address);
    NEW.ville = TRIM(NEW.ville);
    NEW.code_postal = TRIM(NEW.code_postal);
    
    -- Convertir en majuscules pour la ville
    NEW.ville = UPPER(NEW.ville);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE TRIGGER normalize_laundry_data_trigger
    BEFORE INSERT OR UPDATE ON laundries
    FOR EACH ROW
    EXECUTE FUNCTION normalize_laundry_data();

-- 4. Créer une fonction RPC pour l'insertion sécurisée
CREATE OR REPLACE FUNCTION insert_laundry(
    p_name TEXT,
    p_address TEXT,
    p_ville TEXT,
    p_code_postal TEXT,
    p_owner_id UUID
)
RETURNS TABLE (
    id UUID,
    name TEXT,
    address TEXT,
    ville TEXT,
    code_postal TEXT,
    owner_id UUID,
    created_at TIMESTAMPTZ
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO laundries (
        name,
        address,
        ville,
        code_postal,
        owner_id
    ) VALUES (
        p_name,
        p_address,
        p_ville,
        p_code_postal,
        p_owner_id
    )
    RETURNING *;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
