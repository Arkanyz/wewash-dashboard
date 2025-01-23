-- Migration 6: Fonctions utilitaires
BEGIN;

-- Fonction: Mise à jour du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Mise à jour automatique du timestamp
DROP TRIGGER IF EXISTS update_rounded_calls_updated_at ON rounded_calls;
CREATE TRIGGER update_rounded_calls_updated_at
    BEFORE UPDATE ON rounded_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction: Statistiques des appels
CREATE OR REPLACE FUNCTION get_rounded_call_stats(
    p_laundry_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSONB
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    result JSONB;
BEGIN
    -- Vérification des permissions
    IF NOT EXISTS (
        SELECT 1 FROM laundries 
        WHERE id = p_laundry_id 
        AND (owner_id = auth.uid() OR p_laundry_id IS NULL)
    ) THEN
        RAISE EXCEPTION 'Accès non autorisé';
    END IF;

    WITH filtered_calls AS (
        SELECT *
        FROM rounded_calls
        WHERE (p_laundry_id IS NULL OR laundry_id = p_laundry_id)
        AND (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
        AND (
            user_id = auth.uid()
            OR EXISTS (
                SELECT 1 FROM laundries 
                WHERE id = rounded_calls.laundry_id 
                AND owner_id = auth.uid()
            )
        )
    ),
    daily_stats AS (
        SELECT 
            DATE_TRUNC('day', created_at) AS date,
            COUNT(*) AS total_calls,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_calls,
            COUNT(*) FILTER (WHERE status = 'missed') AS missed_calls,
            AVG(CASE WHEN status = 'completed' THEN duration ELSE NULL END)::INTEGER AS avg_duration
        FROM filtered_calls
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date DESC
        LIMIT 30
    ),
    overall_stats AS (
        SELECT
            COUNT(*) AS total_calls,
            COUNT(*) FILTER (WHERE status = 'completed') AS completed_calls,
            COUNT(*) FILTER (WHERE status = 'missed') AS missed_calls,
            AVG(CASE WHEN status = 'completed' THEN duration ELSE NULL END)::INTEGER AS avg_duration,
            MODE() WITHIN GROUP (ORDER BY intent) AS most_common_intent
        FROM filtered_calls
    )
    SELECT jsonb_build_object(
        'overall', (
            SELECT jsonb_build_object(
                'total_calls', total_calls,
                'completed_calls', completed_calls,
                'missed_calls', missed_calls,
                'avg_duration', avg_duration,
                'most_common_intent', most_common_intent
            )
            FROM overall_stats
        ),
        'daily_stats', (
            SELECT jsonb_agg(
                jsonb_build_object(
                    'date', date,
                    'total_calls', total_calls,
                    'completed_calls', completed_calls,
                    'missed_calls', missed_calls,
                    'avg_duration', avg_duration
                )
            )
            FROM daily_stats
        )
    ) INTO result;

    RETURN result;
END;
$$;

COMMIT;
