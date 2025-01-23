-- Vérification des prérequis
DO $$ 
BEGIN
    -- Vérifier si la colonne owner_id existe dans la table laundries
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'laundries'
        AND column_name = 'owner_id'
    ) THEN
        RAISE EXCEPTION 'La colonne owner_id doit exister dans la table laundries avant d''exécuter cette migration';
    END IF;
END $$;

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types for better data consistency
DO $$ BEGIN
    CREATE TYPE call_status AS ENUM ('initiated', 'connected', 'completed', 'missed', 'failed');
    CREATE TYPE call_direction AS ENUM ('inbound', 'outbound');
    CREATE TYPE variable_type AS ENUM ('string', 'boolean', 'number', 'date');
    CREATE TYPE variable_source AS ENUM ('api_call', 'csv', 'extracted');
EXCEPTION 
    WHEN duplicate_object THEN null;
END $$;

-- Table: rounded_calls
-- Stores main call information
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
    duration INTEGER, -- in seconds
    recording_url TEXT,
    transcript TEXT,
    intent TEXT,
    laundry_id UUID REFERENCES laundries(id) ON DELETE SET NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Table: rounded_call_segments
-- Stores different parts/tasks of the call
CREATE TABLE IF NOT EXISTS rounded_call_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    task_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- in seconds
    transcript TEXT,
    success BOOLEAN,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Table: rounded_variables
-- Stores variables extracted during calls
CREATE TABLE IF NOT EXISTS rounded_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    segment_id UUID REFERENCES rounded_call_segments(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    value TEXT,
    type variable_type NOT NULL,
    source variable_source NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    UNIQUE(call_id, name)
);

-- Table: rounded_tools_usage
-- Stores information about tools used during calls
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
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Add indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_rounded_calls_laundry ON rounded_calls(laundry_id);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_owner ON rounded_calls(owner_id);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_status ON rounded_calls(status);
CREATE INDEX IF NOT EXISTS idx_rounded_calls_created ON rounded_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_rounded_segments_call ON rounded_call_segments(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_variables_call ON rounded_variables(call_id);
CREATE INDEX IF NOT EXISTS idx_rounded_tools_call ON rounded_tools_usage(call_id);

-- Function: Update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger: Auto-update updated_at
CREATE TRIGGER update_rounded_calls_updated_at
    BEFORE UPDATE ON rounded_calls
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function: Get call statistics
CREATE OR REPLACE FUNCTION get_rounded_call_stats(
    p_laundry_id UUID DEFAULT NULL,
    p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS TABLE (
    total_calls BIGINT,
    completed_calls BIGINT,
    missed_calls BIGINT,
    avg_duration INTEGER,
    most_common_intent TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    RETURN QUERY
    WITH filtered_calls AS (
        SELECT *
        FROM rounded_calls
        WHERE (p_laundry_id IS NULL OR laundry_id = p_laundry_id)
        AND (p_start_date IS NULL OR created_at >= p_start_date)
        AND (p_end_date IS NULL OR created_at <= p_end_date)
    )
    SELECT
        COUNT(*)::BIGINT AS total_calls,
        COUNT(*) FILTER (WHERE status = 'completed')::BIGINT AS completed_calls,
        COUNT(*) FILTER (WHERE status = 'missed')::BIGINT AS missed_calls,
        AVG(CASE WHEN status = 'completed' THEN duration ELSE NULL END)::INTEGER AS avg_duration,
        MODE() WITHIN GROUP (ORDER BY intent) AS most_common_intent
    FROM filtered_calls;
END;
$$;
