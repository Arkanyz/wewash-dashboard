-- Types d'énumération
CREATE TYPE call_category AS ENUM ('technique', 'information', 'urgence');
CREATE TYPE call_priority AS ENUM ('low', 'medium', 'high');
CREATE TYPE call_sentiment AS ENUM ('positif', 'neutre', 'négatif');
CREATE TYPE problem_type AS ENUM (
    'start_failure',
    'stop_failure',
    'water_leak',
    'payment_issue',
    'door_issue',
    'heating_issue',
    'other'
);

-- Table des appels
CREATE TABLE public.rounded_calls (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    call_id text UNIQUE NOT NULL,
    caller_number text NOT NULL,
    recipient_number text NOT NULL,
    start_time timestamp with time zone NOT NULL,
    end_time timestamp with time zone,
    duration integer,
    recording_url text,
    transcript text,
    status text NOT NULL,
    direction text NOT NULL,
    raw_data jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table d'analyse des appels
CREATE TABLE public.call_analysis (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    call_id uuid REFERENCES public.rounded_calls(id) ON DELETE CASCADE,
    category call_category NOT NULL,
    priority call_priority NOT NULL,
    sentiment call_sentiment NOT NULL,
    summary text NOT NULL,
    keywords text[],
    machine_id uuid REFERENCES public.machines(id),
    problem_type problem_type,
    action_required boolean DEFAULT false,
    action_type text,
    estimated_resolution_time interval,
    analyzed_by text NOT NULL,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Table des actions de suivi
CREATE TABLE public.call_actions (
    id uuid DEFAULT uuid_generate_v4() PRIMARY KEY,
    analysis_id uuid REFERENCES public.call_analysis(id) ON DELETE CASCADE,
    action_type text NOT NULL,
    description text NOT NULL,
    metadata jsonb,
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL,
    completed_at timestamp with time zone
);

-- Fonction pour insérer un appel et son analyse
CREATE OR REPLACE FUNCTION public.insert_rounded_call(
    call_data jsonb,
    analysis_data jsonb
) RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    v_call_id uuid;
    v_analysis_id uuid;
BEGIN
    -- Insérer l'appel
    INSERT INTO public.rounded_calls (
        call_id,
        caller_number,
        recipient_number,
        start_time,
        end_time,
        duration,
        recording_url,
        transcript,
        status,
        direction,
        raw_data
    ) VALUES (
        (call_data->>'call_id')::text,
        (call_data->>'caller_number')::text,
        (call_data->>'recipient_number')::text,
        (call_data->>'start_time')::timestamp with time zone,
        (call_data->>'end_time')::timestamp with time zone,
        (call_data->>'duration')::integer,
        (call_data->>'recording_url')::text,
        (call_data->>'transcript')::text,
        (call_data->>'status')::text,
        (call_data->>'direction')::text,
        call_data
    )
    RETURNING id INTO v_call_id;

    -- Si nous avons des données d'analyse, les insérer
    IF analysis_data IS NOT NULL THEN
        INSERT INTO public.call_analysis (
            call_id,
            category,
            priority,
            sentiment,
            summary,
            keywords,
            machine_id,
            problem_type,
            action_required,
            action_type,
            estimated_resolution_time,
            analyzed_by
        ) VALUES (
            v_call_id,
            (analysis_data->>'category')::call_category,
            (analysis_data->>'priority')::call_priority,
            (analysis_data->>'sentiment')::call_sentiment,
            (analysis_data->>'summary')::text,
            (analysis_data->>'keywords')::text[],
            (analysis_data->>'machine_id')::uuid,
            (analysis_data->>'problem_type')::problem_type,
            (analysis_data->>'action_required')::boolean,
            (analysis_data->>'action_type')::text,
            (analysis_data->>'estimated_resolution_time')::interval,
            (analysis_data->>'analyzed_by')::text
        )
        RETURNING id INTO v_analysis_id;
    END IF;

    RETURN v_call_id;
END;
$$;
