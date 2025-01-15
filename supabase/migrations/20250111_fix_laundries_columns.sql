-- Vérifier si les colonnes existent et les renommer si nécessaire
DO $$ 
BEGIN 
    -- Renommer city en ville si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'laundries' AND column_name = 'city') THEN
        ALTER TABLE laundries RENAME COLUMN city TO ville;
    END IF;

    -- Renommer postal_code en code_postal si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'laundries' AND column_name = 'postal_code') THEN
        ALTER TABLE laundries RENAME COLUMN postal_code TO code_postal;
    END IF;

    -- Renommer manager_id en owner_id si elle existe
    IF EXISTS (SELECT 1 FROM information_schema.columns 
               WHERE table_name = 'laundries' AND column_name = 'manager_id') THEN
        ALTER TABLE laundries RENAME COLUMN manager_id TO owner_id;
    END IF;

    -- Ajouter les colonnes si elles n'existent pas
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'laundries' AND column_name = 'ville') THEN
        ALTER TABLE laundries ADD COLUMN ville text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'laundries' AND column_name = 'code_postal') THEN
        ALTER TABLE laundries ADD COLUMN code_postal text;
    END IF;

    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name = 'laundries' AND column_name = 'owner_id') THEN
        ALTER TABLE laundries ADD COLUMN owner_id uuid references public.profiles(id);
    END IF;

END $$;
