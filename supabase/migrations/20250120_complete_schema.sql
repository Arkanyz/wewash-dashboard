-- 1. Créer des types énumérés pour les valeurs fixes
CREATE TYPE machine_type AS ENUM ('washer', 'dryer');
CREATE TYPE machine_status AS ENUM ('operational', 'maintenance', 'out_of_order');
CREATE TYPE laundry_size AS ENUM ('small', 'medium', 'large');
CREATE TYPE payment_type AS ENUM ('card', 'cash', 'mobile');

-- 2. Table des régions/départements (pour faciliter les recherches géographiques)
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

-- 3. Table principale des laveries avec toutes les contraintes nécessaires
CREATE TABLE IF NOT EXISTS laundries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    address TEXT NOT NULL,
    address_complement TEXT,
    code_postal VARCHAR(5) NOT NULL CHECK (code_postal ~ '^\d{5}$'),
    ville VARCHAR(100) NOT NULL,
    department_id INTEGER REFERENCES departments(id),
    latitude DECIMAL(10,8),
    longitude DECIMAL(11,8),
    size laundry_size DEFAULT 'medium',
    opening_hours JSONB DEFAULT '{"monday":{"open":"08:00","close":"20:00"}}',
    accepted_payments payment_type[] DEFAULT ARRAY['card', 'cash']::payment_type[],
    features JSONB DEFAULT '{"wifi": false, "parking": false, "accessibility": false}',
    contact_phone VARCHAR(20),
    contact_email VARCHAR(255),
    website VARCHAR(255),
    owner_id UUID REFERENCES auth.users(id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_email CHECK (contact_email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$'),
    CONSTRAINT valid_phone CHECK (contact_phone ~ '^\+?[0-9\s-]{10,}$')
);

-- 4. Table des machines avec relations et contraintes
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

-- 5. Table des tarifs
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

-- 6. Triggers pour la mise à jour automatique
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_laundries_updated_at
    BEFORE UPDATE ON laundries
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON machines
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- 7. Fonction pour générer un slug unique
CREATE OR REPLACE FUNCTION generate_unique_slug(name TEXT)
RETURNS TEXT AS $$
DECLARE
    base_slug TEXT;
    new_slug TEXT;
    counter INTEGER := 1;
BEGIN
    -- Convertir en minuscules et remplacer les caractères spéciaux
    base_slug := LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g'));
    -- Supprimer les tirets en début et fin
    base_slug := TRIM(BOTH '-' FROM base_slug);
    
    new_slug := base_slug;
    -- Tant que le slug existe, ajouter un compteur
    WHILE EXISTS (SELECT 1 FROM laundries WHERE slug = new_slug) LOOP
        counter := counter + 1;
        new_slug := base_slug || '-' || counter::TEXT;
    END LOOP;
    
    RETURN new_slug;
END;
$$ LANGUAGE plpgsql;

-- 8. Trigger pour générer automatiquement le slug
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

-- 9. Vue pour les statistiques des laveries
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

-- 10. Fonction RPC sécurisée pour l'insertion de laverie
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
    -- Récupérer l'ID de l'utilisateur authentifié
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
