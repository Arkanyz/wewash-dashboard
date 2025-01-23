-- Ajout du type d'issue
-- Ajout du type d'issue
CREATE TYPE issue_type AS ENUM (
    'start_failure',
    'stop_failure',
    'water_leak',
    'noise',
    'payment_issue',
    'door_issue',
    'heating_issue',
    'other'
);

-- Ajout des nouveaux champs à la table machines
ALTER TABLE public.machines
ADD COLUMN location text,
ADD COLUMN external_id text;

-- Ajout du type d'issue à la table interventions
ALTER TABLE public.interventions
ADD COLUMN issue_type issue_type,
ADD COLUMN issue_category text;

-- Fonction pour créer une intervention depuis un webhook
CREATE OR REPLACE FUNCTION create_intervention_from_webhook(
    p_machine_number text,
    p_issue_type text,
    p_issue_description text,
    p_laundry_name text
) RETURNS uuid AS $$
DECLARE
    v_machine_id uuid;
    v_intervention_id uuid;
BEGIN
    -- Trouver la machine
    SELECT id INTO v_machine_id
    FROM public.machines m
    JOIN public.laundries l ON m.laundry_id = l.id
    WHERE m.name = p_machine_number
    AND l.name = p_laundry_name;

    -- Créer l'intervention
    INSERT INTO public.interventions
        (machine_id, issue_type, description, status, priority)
    VALUES
        (v_machine_id, p_issue_type::issue_type, p_issue_description, 'pending', 'medium')
    RETURNING id INTO v_intervention_id;

    RETURN v_intervention_id;
END;
$$ LANGUAGE plpgsql;
