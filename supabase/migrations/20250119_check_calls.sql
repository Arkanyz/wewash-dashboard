-- Vérifier les derniers appels
WITH latest_calls AS (
    SELECT 
        rc.id,
        rc.call_id,
        rc.transcript,
        rc.created_at,
        rc.caller_number,
        rc.status,
        ca.category,
        ca.priority,
        ca.sentiment,
        ca.summary,
        act.description as action_needed
    FROM rounded_calls rc
    LEFT JOIN call_analysis ca ON ca.call_id = rc.id
    LEFT JOIN call_actions act ON act.analysis_id = ca.id
    ORDER BY rc.created_at DESC
    LIMIT 5
)
SELECT * FROM latest_calls;
