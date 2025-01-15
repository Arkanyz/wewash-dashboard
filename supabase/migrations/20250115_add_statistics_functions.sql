-- Fonction pour obtenir le total des appels
CREATE OR REPLACE FUNCTION get_total_calls(start_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP - INTERVAL '30 days'))
RETURNS TABLE (
    total_count BIGINT,
    percentage_change NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT COUNT(*) as count
        FROM support_calls
        WHERE created_at >= start_date
    ),
    previous_period AS (
        SELECT COUNT(*) as count
        FROM support_calls
        WHERE created_at >= (start_date - INTERVAL '30 days')
        AND created_at < start_date
    )
    SELECT 
        cp.count as total_count,
        CASE 
            WHEN pp.count = 0 THEN 100
            ELSE ROUND(((cp.count - pp.count)::NUMERIC / pp.count * 100), 1)
        END as percentage_change
    FROM current_period cp, previous_period pp;
END;
$$;

-- Fonction pour obtenir les demandes d'information
CREATE OR REPLACE FUNCTION get_info_requests(start_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP - INTERVAL '30 days'))
RETURNS TABLE (
    total_count BIGINT,
    percentage_change NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT COUNT(*) as count
        FROM support_calls
        WHERE type = 'information'
        AND created_at >= start_date
    ),
    previous_period AS (
        SELECT COUNT(*) as count
        FROM support_calls
        WHERE type = 'information'
        AND created_at >= (start_date - INTERVAL '30 days')
        AND created_at < start_date
    )
    SELECT 
        cp.count as total_count,
        CASE 
            WHEN pp.count = 0 THEN 100
            ELSE ROUND(((cp.count - pp.count)::NUMERIC / pp.count * 100), 1)
        END as percentage_change
    FROM current_period cp, previous_period pp;
END;
$$;

-- Fonction pour obtenir les problèmes signalés
CREATE OR REPLACE FUNCTION get_reported_issues(start_date TIMESTAMP WITH TIME ZONE DEFAULT (CURRENT_TIMESTAMP - INTERVAL '30 days'))
RETURNS TABLE (
    total_count BIGINT,
    percentage_change NUMERIC
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH current_period AS (
        SELECT COUNT(*) as count
        FROM support_calls
        WHERE type = 'problem'
        AND created_at >= start_date
    ),
    previous_period AS (
        SELECT COUNT(*) as count
        FROM support_calls
        WHERE type = 'problem'
        AND created_at >= (start_date - INTERVAL '30 days')
        AND created_at < start_date
    )
    SELECT 
        cp.count as total_count,
        CASE 
            WHEN pp.count = 0 THEN 100
            ELSE ROUND(((cp.count - pp.count)::NUMERIC / pp.count * 100), 1)
        END as percentage_change
    FROM current_period cp, previous_period pp;
END;
$$;

-- Fonction pour obtenir les machines critiques
CREATE OR REPLACE FUNCTION get_critical_machines()
RETURNS TABLE (
    total_count BIGINT,
    absolute_change BIGINT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    WITH current_critical AS (
        SELECT COUNT(DISTINCT machine_id) as count
        FROM maintenance_reports
        WHERE severity = 'high'
        AND resolved_at IS NULL
    ),
    previous_critical AS (
        SELECT COUNT(DISTINCT machine_id) as count
        FROM maintenance_reports
        WHERE severity = 'high'
        AND resolved_at IS NULL
        AND created_at <= (CURRENT_TIMESTAMP - INTERVAL '7 days')
    )
    SELECT 
        cc.count as total_count,
        (cc.count - pc.count) as absolute_change
    FROM current_critical cc, previous_critical pc;
END;
$$;
