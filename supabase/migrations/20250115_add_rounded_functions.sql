-- Fonction pour insérer un nouvel appel avec son analyse
CREATE OR REPLACE FUNCTION insert_rounded_call(
    call_data JSONB,
    analysis_data JSONB
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    new_call_id UUID;
    new_analysis_id UUID;
BEGIN
    -- Insérer l'appel
    INSERT INTO rounded_calls (
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
        laverie_id,
        raw_data
    ) VALUES (
        call_data->>'call_id',
        call_data->>'caller_number',
        call_data->>'recipient_number',
        (call_data->>'start_time')::TIMESTAMP WITH TIME ZONE,
        (call_data->>'end_time')::TIMESTAMP WITH TIME ZONE,
        (call_data->>'duration')::INTEGER,
        call_data->>'recording_url',
        call_data->>'transcript',
        call_data->>'status',
        call_data->>'direction',
        call_data->>'laverie_id',
        call_data
    ) RETURNING id INTO new_call_id;

    -- Insérer l'analyse
    INSERT INTO call_analysis (
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
        new_call_id,
        analysis_data->>'category',
        analysis_data->>'priority',
        analysis_data->>'sentiment',
        analysis_data->>'summary',
        ARRAY(SELECT jsonb_array_elements_text(analysis_data->'keywords')),
        analysis_data->>'machine_id',
        analysis_data->>'problem_type',
        (analysis_data->>'action_required')::BOOLEAN,
        analysis_data->>'action_type',
        analysis_data->>'estimated_resolution_time',
        analysis_data->>'analyzed_by'
    ) RETURNING id INTO new_analysis_id;

    RETURN new_call_id;
END;
$$;

-- Fonction pour récupérer les détails complets d'un appel
CREATE OR REPLACE FUNCTION get_call_details(p_call_id UUID)
RETURNS TABLE (
    call_details JSONB,
    analysis_details JSONB,
    actions_details JSONB[]
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        to_jsonb(rc.*) as call_details,
        to_jsonb(ca.*) as analysis_details,
        COALESCE(
            array_agg(to_jsonb(act.*)) FILTER (WHERE act.id IS NOT NULL),
            ARRAY[]::jsonb[]
        ) as actions_details
    FROM rounded_calls rc
    LEFT JOIN call_analysis ca ON rc.id = ca.call_id
    LEFT JOIN call_actions act ON ca.id = act.analysis_id
    WHERE rc.id = p_call_id
    GROUP BY rc.id, ca.id;
END;
$$;

-- Fonction pour récupérer les appels récents avec filtres
CREATE OR REPLACE FUNCTION get_recent_calls(
    p_limit INTEGER DEFAULT 10,
    p_offset INTEGER DEFAULT 0,
    p_status TEXT DEFAULT NULL,
    p_priority TEXT DEFAULT NULL,
    p_laverie_id TEXT DEFAULT NULL
) RETURNS TABLE (
    call_id UUID,
    caller_number TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    status TEXT,
    priority TEXT,
    summary TEXT,
    action_required BOOLEAN,
    laverie_id TEXT
) LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id,
        rc.caller_number,
        rc.start_time,
        rc.duration,
        rc.status,
        ca.priority,
        ca.summary,
        ca.action_required,
        rc.laverie_id
    FROM rounded_calls rc
    LEFT JOIN call_analysis ca ON rc.id = ca.call_id
    WHERE 
        (p_status IS NULL OR rc.status = p_status) AND
        (p_priority IS NULL OR ca.priority = p_priority) AND
        (p_laverie_id IS NULL OR rc.laverie_id = p_laverie_id)
    ORDER BY rc.start_time DESC
    LIMIT p_limit
    OFFSET p_offset;
END;
$$;

-- Fonction pour ajouter une action de suivi
CREATE OR REPLACE FUNCTION add_call_action(
    p_analysis_id UUID,
    p_action_type TEXT,
    p_description TEXT,
    p_scheduled_for TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_metadata JSONB DEFAULT '{}'::JSONB
) RETURNS UUID LANGUAGE plpgsql SECURITY DEFINER AS $$
DECLARE
    new_action_id UUID;
BEGIN
    INSERT INTO call_actions (
        analysis_id,
        action_type,
        status,
        description,
        scheduled_for,
        metadata
    ) VALUES (
        p_analysis_id,
        p_action_type,
        'pending',
        p_description,
        p_scheduled_for,
        p_metadata
    ) RETURNING id INTO new_action_id;

    RETURN new_action_id;
END;
$$;

-- Fonction pour mettre à jour le statut d'une action
CREATE OR REPLACE FUNCTION update_action_status(
    p_action_id UUID,
    p_status TEXT,
    p_metadata JSONB DEFAULT NULL
) RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
    UPDATE call_actions
    SET 
        status = p_status,
        completed_at = CASE WHEN p_status = 'completed' THEN CURRENT_TIMESTAMP ELSE completed_at END,
        metadata = CASE WHEN p_metadata IS NOT NULL THEN p_metadata ELSE metadata END
    WHERE id = p_action_id;
END;
$$;
