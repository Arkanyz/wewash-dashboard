-- Migration 5: Configuration RLS
BEGIN;

-- Activation RLS
ALTER TABLE rounded_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounded_call_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounded_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounded_tools_usage ENABLE ROW LEVEL SECURITY;

-- Politiques pour rounded_calls
CREATE POLICY "Lecture des appels par propriétaire"
    ON rounded_calls FOR SELECT
    USING (
        auth.uid() = owner_id 
        OR EXISTS (
            SELECT 1 FROM laundries 
            WHERE id = rounded_calls.laundry_id 
            AND owner_id = auth.uid()
        )
    );

CREATE POLICY "Insertion des appels par Edge Function"
    ON rounded_calls FOR INSERT
    WITH CHECK (true);

-- Politiques pour rounded_call_segments
CREATE POLICY "Lecture des segments par propriétaire"
    ON rounded_call_segments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rounded_calls rc
            JOIN laundries l ON l.id = rc.laundry_id
            WHERE rc.id = rounded_call_segments.call_id
            AND (rc.owner_id = auth.uid() OR l.owner_id = auth.uid())
        )
    );

CREATE POLICY "Insertion des segments par Edge Function"
    ON rounded_call_segments FOR INSERT
    WITH CHECK (true);

-- Politiques pour rounded_variables
CREATE POLICY "Lecture des variables par propriétaire"
    ON rounded_variables FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rounded_calls rc
            JOIN laundries l ON l.id = rc.laundry_id
            WHERE rc.id = rounded_variables.call_id
            AND (rc.owner_id = auth.uid() OR l.owner_id = auth.uid())
        )
    );

CREATE POLICY "Insertion des variables par Edge Function"
    ON rounded_variables FOR INSERT
    WITH CHECK (true);

-- Politiques pour rounded_tools_usage
CREATE POLICY "Lecture des outils par propriétaire"
    ON rounded_tools_usage FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM rounded_calls rc
            JOIN laundries l ON l.id = rc.laundry_id
            WHERE rc.id = rounded_tools_usage.call_id
            AND (rc.owner_id = auth.uid() OR l.owner_id = auth.uid())
        )
    );

CREATE POLICY "Insertion des outils par Edge Function"
    ON rounded_tools_usage FOR INSERT
    WITH CHECK (true);

COMMIT;
