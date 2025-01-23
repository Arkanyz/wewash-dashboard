é-- Début de la transaction
BEGIN;

-- 1. Sauvegarde
\i migrations/20250120_backup_before_schema.sql

-- 2. Migration du schéma complet
\i migrations/20250120_complete_schema.sql

-- 3. Migration des données existantes
INSERT INTO laundries (
    id,
    name,
    address,
    ville,
    code_postal,
    owner_id,
    created_at,
    updated_at
)
SELECT 
    id,
    name,
    address,
    UPPER(TRIM(ville)),
    code_postal,
    owner_id,
    created_at,
    COALESCE(updated_at, NOW())
FROM laundries_backup
ON CONFLICT (id) DO UPDATE 
SET 
    updated_at = EXCLUDED.updated_at,
    ville = UPPER(TRIM(EXCLUDED.ville));

-- 4. Vérification
DO $$ 
BEGIN 
    RAISE NOTICE 'Vérification des données migrées...';
    
    -- Vérifier le nombre de laveries
    RAISE NOTICE 'Nombre de laveries avant: %', (SELECT COUNT(*) FROM laundries_backup);
    RAISE NOTICE 'Nombre de laveries après: %', (SELECT COUNT(*) FROM laundries);
    
    -- Vérifier les contraintes
    RAISE NOTICE 'Vérification des contraintes...';
    PERFORM * FROM laundries WHERE code_postal !~ '^\d{5}$';
    RAISE NOTICE 'Codes postaux valides';
    
    PERFORM * FROM laundries WHERE ville = '';
    RAISE NOTICE 'Villes non vides';
END $$;

-- 5. Sauvegarde des données existantes
CREATE TABLE IF NOT EXISTS laundries_backup AS 
SELECT * FROM laundries;

-- 6. Sauvegarde des politiques RLS existantes
DO $$ 
DECLARE 
    pol record;
BEGIN
    FOR pol IN 
        SELECT 
            schemaname, 
            tablename, 
            policyname, 
            permissive,
            roles,
            cmd,
            qual,
            with_check
        FROM 
            pg_policies 
        WHERE 
            schemaname = 'public' 
            AND tablename = 'laundries'
    LOOP
        RAISE NOTICE 'Policy: %', pol;
    END LOOP;
END $$;

-- 7. Création des types énumérés
DO $$ BEGIN
    CREATE TYPE machine_type AS ENUM ('washer', 'dryer');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE machine_status AS ENUM ('operational', 'maintenance', 'out_of_order');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE laundry_size AS ENUM ('small', 'medium', 'large');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE payment_type AS ENUM ('card', 'cash', 'mobile');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 8. Création des tables de base
CREATE TABLE IF NOT EXISTS regions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS departments (
    id SERIAL PRIMARY KEY,
    region_id INTEGER REFERENCES regions(id),
    name VARCHAR(100) NOT NULL,
    code VARCHAR(3) NOT NULL UNIQUE,
    UNIQUE(region_id, code)
);

-- 9. Modification de la table laundries
ALTER TABLE laundries 
    ADD COLUMN IF NOT EXISTS slug VARCHAR(100) UNIQUE,
    ADD COLUMN IF NOT EXISTS address_complement TEXT,
    ADD COLUMN IF NOT EXISTS department_id INTEGER REFERENCES departments(id),
    ADD COLUMN IF NOT EXISTS latitude DECIMAL(10,8),
    ADD COLUMN IF NOT EXISTS longitude DECIMAL(11,8),
    ADD COLUMN IF NOT EXISTS size laundry_size DEFAULT 'medium',
    ADD COLUMN IF NOT EXISTS opening_hours JSONB DEFAULT '{"monday":{"open":"08:00","close":"20:00"}}'::jsonb,
    ADD COLUMN IF NOT EXISTS accepted_payments payment_type[] DEFAULT ARRAY['card', 'cash']::payment_type[],
    ADD COLUMN IF NOT EXISTS features JSONB DEFAULT '{"wifi": false, "parking": false, "accessibility": false}'::jsonb,
    ADD COLUMN IF NOT EXISTS contact_phone VARCHAR(20),
    ADD COLUMN IF NOT EXISTS contact_email VARCHAR(255),
    ADD COLUMN IF NOT EXISTS website VARCHAR(255),
    ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true,
    ALTER COLUMN updated_at SET DEFAULT NOW();

-- 10. Ajout des contraintes
ALTER TABLE laundries
    DROP CONSTRAINT IF EXISTS valid_email,
    DROP CONSTRAINT IF EXISTS valid_phone,
    DROP CONSTRAINT IF EXISTS check_code_postal,
    ADD CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    ADD CONSTRAINT valid_phone CHECK (contact_phone ~ '^\+?[0-9\s-]{10,}$'),
    ADD CONSTRAINT check_code_postal CHECK (code_postal ~ '^\d{5}$');

-- 11. Création de la table machines
CREATE TABLE IF NOT EXISTS machines (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laundry_id UUID REFERENCES laundries(id) ON DELETE CASCADE,
    machine_number VARCHAR(20) NOT NULL,
    machine_type machine_type NOT NULL,
    status machine_status DEFAULT 'operational',
    capacity INTEGER CHECK (capacity > 0),
    brand VARCHAR(100),
    model VARCHAR(100),
    installation_date DATE,
    last_maintenance DATE,
    next_maintenance DATE,
    location_in_store TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(laundry_id, machine_number)
);

-- 12. Création de la table pricing
CREATE TABLE IF NOT EXISTS pricing (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    laundry_id UUID REFERENCES laundries(id) ON DELETE CASCADE,
    machine_type machine_type NOT NULL,
    program_name VARCHAR(100) NOT NULL,
    duration_minutes INTEGER NOT NULL CHECK (duration_minutes > 0),
    price DECIMAL(10,2) NOT NULL CHECK (price >= 0),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(laundry_id, machine_type, program_name)
);

-- 13. Création des triggers
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_laundries_updated_at ON laundries;
CREATE TRIGGER update_laundries_updated_at
    BEFORE UPDATE ON laundries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

DROP TRIGGER IF EXISTS update_machines_updated_at ON machines;
CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 14. Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    base_slug := LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    new_slug := base_slug;
    WHILE EXISTS (SELECT 1 FROM laundries WHERE slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- 15. Trigger pour le slug
DROP TRIGGER IF EXISTS set_laundry_slug_trigger ON laundries;
CREATE OR REPLACE FUNCTION set_laundry_slug()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.slug IS NULL THEN
        NEW.slug := generate_unique_slug(NEW.name);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_laundry_slug_trigger
    BEFORE INSERT ON laundries
    FOR EACH ROW
    EXECUTE FUNCTION set_laundry_slug();

-- 16. Vue pour les statistiques
CREATE OR REPLACE VIEW laundry_statistics AS
SELECT 
    l.id,
    l.name,
    l.ville,
    l.code_postal,
    COUNT(m.*) as total_machines,
    COUNT(m.*) FILTER (WHERE m.machine_type = 'washer') as total_washers,
    COUNT(m.*) FILTER (WHERE m.machine_type = 'dryer') as total_dryers,
    COUNT(m.*) FILTER (WHERE m.status = 'operational') as operational_machines,
    COUNT(m.*) FILTER (WHERE m.status = 'maintenance') as maintenance_machines,
    COUNT(m.*) FILTER (WHERE m.status = 'out_of_order') as broken_machines
FROM laundries l
LEFT JOIN machines m ON m.laundry_id = l.id
GROUP BY l.id;

-- 17. Migration des données existantes
UPDATE laundries 
SET 
    ville = UPPER(TRIM(ville)),
    updated_at = NOW()
WHERE TRUE;

-- 18. Fonction RPC sécurisée
CREATE OR REPLACE FUNCTION insert_laundry(
    p_name TEXT,
    p_address TEXT,
    p_ville TEXT,
    p_code_postal TEXT,
    p_size laundry_size DEFAULT 'medium',
    p_features JSONB DEFAULT NULL
) RETURNS TABLE (
    id UUID,
    name TEXT,
    slug TEXT,
    address TEXT,
    ville TEXT,
    code_postal TEXT,
    size laundry_size,
    features JSONB,
    created_at TIMESTAMPTZ
) AS $$
DECLARE
    v_user_id UUID;
BEGIN
    v_user_id := auth.uid();
    
    IF v_user_id IS NULL THEN
        RAISE EXCEPTION 'Non authentifié';
    END IF;

    RETURN QUERY
    INSERT INTO laundries (
        name,
        address,
        ville,
        code_postal,
        size,
        features,
        owner_id
    ) VALUES (
        TRIM(p_name),
        TRIM(p_address),
        UPPER(TRIM(p_ville)),
        TRIM(p_code_postal),
        p_size,
        COALESCE(p_features, '{"wifi": false, "parking": false, "accessibility": false}'::JSONB),
        v_user_id
    )
    RETURNING 
        id,
        name,
        slug,
        address,
        ville,
        code_postal,
        size,
        features,
        created_at;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 19. Vérification finale
DO $$ 
BEGIN 
    RAISE NOTICE 'Vérification des données migrées...';
    
    RAISE NOTICE 'Nombre de laveries: %', (SELECT COUNT(*) FROM laundries);
    
    RAISE NOTICE 'Vérification des contraintes...';
    PERFORM * FROM laundries WHERE code_postal !~ '^\d{5}$';
    RAISE NOTICE 'Codes postaux valides';
    
    PERFORM * FROM laundries WHERE ville = '';
    RAISE NOTICE 'Villes non vides';
END $$;

-- Si tout va bien, valider la transaction
COMMIT;

-- En cas d'erreur, un ROLLBACK automatique sera effectué
