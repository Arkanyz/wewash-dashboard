-- Fonction pour calculer les statistiques des appels
CREATE OR REPLACE FUNCTION get_rounded_stats(
    p_laundry_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSON;
BEGIN
    WITH filtered_calls AS (
        SELECT *
        FROM phone_calls
        WHERE (p_laundry_id IS NULL OR laundry_id = p_laundry_id)
        AND (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
    ),
    daily_calls AS (
        SELECT 
            DATE_TRUNC('day', created_at) AS date,
            COUNT(*) AS count
        FROM filtered_calls
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
        LIMIT 30
    ),
    stats AS (
        SELECT
            COUNT(*) AS total_calls,
            COUNT(*) FILTER (WHERE status = 'missed') AS missed_calls,
            ROUND(AVG(duration)::numeric, 2) AS average_duration,
            (
                SELECT intent
                FROM (
                    SELECT intent, COUNT(*) as cnt
                    FROM filtered_calls
                    WHERE intent IS NOT NULL
                    GROUP BY intent
                    ORDER BY cnt DESC
                    LIMIT 1
                ) AS top_intent
            ) AS most_common_intent
        FROM filtered_calls
    )
    SELECT json_build_object(
        'total_calls', s.total_calls,
        'missed_calls', s.missed_calls,
        'average_duration', s.average_duration,
        'most_common_intent', s.most_common_intent,
        'calls_by_day', (
            SELECT json_agg(
                json_build_object(
                    'date', TO_CHAR(date, 'YYYY-MM-DD'),
                    'count', count
                )
            )
            FROM daily_calls
        )
    ) INTO result
    FROM stats s;

    RETURN result;
END;
$$;
