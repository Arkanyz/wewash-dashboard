-- Sauvegarde des données existantes
CREATE TABLE IF NOT EXISTS laundries_backup AS 
SELECT * FROM laundries;

-- Sauvegarde des politiques RLS existantes
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
