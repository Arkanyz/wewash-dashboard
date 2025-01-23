-- Migration 2: Création des tables de base sans contraintes
BEGIN;

-- Table: rounded_calls (version de base)
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
    metadata JSONB DEFAULT '{}'::jsonb
);

-- Table: rounded_call_segments (version de base)
CREATE TABLE IF NOT EXISTS rounded_call_segments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    task_name TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    transcript TEXT,
    success BOOLEAN
);

-- Table: rounded_variables (version de base)
CREATE TABLE IF NOT EXISTS rounded_variables (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    name TEXT NOT NULL,
    value TEXT,
    type variable_type NOT NULL,
    source variable_source NOT NULL
);

-- Table: rounded_tools_usage (version de base)
CREATE TABLE IF NOT EXISTS rounded_tools_usage (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    tool_name TEXT NOT NULL,
    parameters JSONB,
    result JSONB,
    success BOOLEAN,
    error_message TEXT
);

COMMIT;
