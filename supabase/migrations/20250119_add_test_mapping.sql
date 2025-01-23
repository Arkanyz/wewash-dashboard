-- Récupérer l'ID utilisateur
DO $$ 
DECLARE
    v_user_id uuid;
    v_laundry_id uuid;
BEGIN
    -- Obtenir l'ID utilisateur
    SELECT id INTO v_user_id
    FROM auth.users
    WHERE email = 'arkathleticspro@gmail.com';

    -- Obtenir l'ID de la laverie
    SELECT id INTO v_laundry_id
    FROM public.laundries
    WHERE owner_id = v_user_id
    LIMIT 1;

    -- Créer l'association
    INSERT INTO public.phone_mappings (
        phone_number,
        laundry_id,
        account_id,
        is_active
    ) VALUES (
        '+33644651337',  -- Remplacez par le vrai numéro ROUNDED
        v_laundry_id,
        v_user_id,
        true
    )
    ON CONFLICT (phone_number) DO NOTHING;

END $$;
