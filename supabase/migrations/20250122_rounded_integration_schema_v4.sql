-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for better data consistency
DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('initiated', 'connected', 'completed', 'missed', 'failed');
    EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');
    EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE variable_type AS ENUM ('string', 'boolean', 'number', 'date');
    EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE variable_source AS ENUM ('api_call', 'csv', 'extracted');
    EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- Création des tables principales
CREATE TABLE IF NOT EXISTS rounded_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    rounded_call_id TEXT NOT NULL UNIQUE,
    caller_number TEXT NOT NULL,
    called_number TEXT NOT NULL,
    direction call_direction NOT NULL,
    status call_status NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    recording_url TEXT,
    transcript TEXT,
    intent TEXT,
    laundry_id UUID REFERENCES laundries(id) ON DELETE SET NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb
);

CREATE TABLE IF NOT EXISTS rounded_call_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    transcript TEXT,
    success BOOLEAN,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS rounded_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES rounded_call_segments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT,
    type variable_type NOT NULL,
    source variable_source NOT NULL,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(call_id, name)
);

CREATE TABLE IF NOT EXISTS rounded_tools_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES rounded_call_segments(id) ON DELETE CASCADE,
    tool_name TEXT NOT NULL,
    parameters JSONB,
    result JSONB,
    success BOOLEAN,
    error_message TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Création des index pour de meilleures performances
CREATE INDEX IF NOT EXISTS idx_rounded_calls_laundry ON rounded_calls(laundry_id);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_user ON rounded_calls(user_id);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_status ON rounded_calls(status);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_created ON rounded_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_rounded_segments_call ON rounded_call_segments(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_variables_call ON rounded_variables(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_tools_call ON rounded_tools_usage(call_id);

-- Activation de RLS sur les tables
ALTER TABLE rounded_calls ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounded_call_segments ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounded_variables ENABLE ROW LEVEL SECURITY;
ALTER TABLE rounded_tools_usage ENABLE ROW LEVEL SECURITY;

-- Création des politiques de sécurité
CREATE POLICY "Accès utilisateur aux appels" ON rounded_calls
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT owner_id 
            FROM laundries 
            WHERE id = rounded_calls.laundry_id
        )
    );

CREATE POLICY "Accès utilisateur aux segments" ON rounded_call_segments
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT l.owner_id 
            FROM laundries l
            JOIN rounded_calls rc ON rc.laundry_id = l.id
            WHERE rc.id = rounded_call_segments.call_id
        )
    );

CREATE POLICY "Accès utilisateur aux variables" ON rounded_variables
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT l.owner_id 
            FROM laundries l
            JOIN rounded_calls rc ON rc.laundry_id = l.id
            WHERE rc.id = rounded_variables.call_id
        )
    );

CREATE POLICY "Accès utilisateur aux outils" ON rounded_tools_usage
    FOR ALL USING (
        auth.uid() = user_id OR 
        auth.uid() IN (
            SELECT l.owner_id 
            FROM laundries l
            JOIN rounded_calls rc ON rc.laundry_id = l.id
            WHERE rc.id = rounded_tools_usage.call_id
        )
    );

-- Fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la mise à jour automatique
DROP TRIGGER IF EXISTS update_rounded_calls_updated_at ON rounded_calls;
CREATE TRIGGER update_rounded_calls_updated_at
    BEFORE UPDATE ON rounded_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Fonction pour les statistiques d'appels
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
    WITH filtered_calls AS (
        SELECT *
        FROM rounded_calls
        WHERE (p_laundry_id IS NULL OR laundry_id = p_laundry_id)
        AND (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
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
