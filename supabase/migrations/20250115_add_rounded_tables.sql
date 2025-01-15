-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour les appels ROUNDED
CREATE TABLE rounded_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id TEXT UNIQUE NOT NULL,
    caller_number TEXT NOT NULL,
    recipient_number TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER, -- en secondes
    recording_url TEXT,
    transcript TEXT,
    status TEXT NOT NULL, -- 'completed', 'missed', 'busy', etc.
    direction TEXT NOT NULL, -- 'inbound', 'outbound'
    laverie_id TEXT, -- ID de la laverie si identifié
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    raw_data JSONB -- données brutes de l'appel
);

-- Table pour l'analyse des appels
CREATE TABLE call_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'technique', 'information', 'urgence', etc.
    priority TEXT NOT NULL, -- 'low', 'medium', 'high'
    sentiment TEXT NOT NULL, -- 'positif', 'neutre', 'négatif'
    summary TEXT NOT NULL, -- résumé de l'appel
    keywords TEXT[], -- mots-clés extraits
    machine_id TEXT, -- ID de la machine concernée
    problem_type TEXT, -- type de problème identifié
    action_required BOOLEAN DEFAULT FALSE,
    action_type TEXT, -- type d'action nécessaire
    estimated_resolution_time TEXT, -- temps estimé de résolution
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    analyzed_by TEXT NOT NULL -- 'gpt-4', 'agent', etc.
);

-- Table pour les actions de suivi
CREATE TABLE call_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES call_analysis(id) ON DELETE CASCADE,
    action_type TEXT NOT NULL, -- 'sms_sent', 'maintenance_scheduled', etc.
    status TEXT NOT NULL, -- 'pending', 'completed', 'failed'
    description TEXT,
    scheduled_for TIMESTAMP WITH TIME ZONE,
    completed_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB -- données supplémentaires spécifiques à l'action
);

-- Index pour améliorer les performances
CREATE INDEX idx_rounded_calls_status ON rounded_calls(status);
CREATE INDEX idx_rounded_calls_laverie ON rounded_calls(laverie_id);
CREATE INDEX idx_rounded_calls_created ON rounded_calls(created_at);
CREATE INDEX idx_call_analysis_priority ON call_analysis(priority);
CREATE INDEX idx_call_actions_status ON call_actions(status);

-- Fonction pour obtenir les statistiques des appels
CREATE OR REPLACE FUNCTION get_call_statistics(
    time_period interval DEFAULT interval '24 hours'
)
RETURNS TABLE (
    total_calls BIGINT,
    missed_calls BIGINT,
    avg_duration INTEGER,
    urgent_calls BIGINT,
    resolution_needed BIGINT,
    sentiment_distribution JSONB,
    category_distribution JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(DISTINCT rc.id)::BIGINT as total_calls,
        COUNT(DISTINCT rc.id) FILTER (WHERE rc.status = 'missed')::BIGINT as missed_calls,
        AVG(rc.duration)::INTEGER as avg_duration,
        COUNT(DISTINCT ca.id) FILTER (WHERE ca.priority = 'high')::BIGINT as urgent_calls,
        COUNT(DISTINCT ca.id) FILTER (WHERE ca.action_required = true)::BIGINT as resolution_needed,
        jsonb_build_object(
            'positif', COUNT(*) FILTER (WHERE ca.sentiment = 'positif'),
            'neutre', COUNT(*) FILTER (WHERE ca.sentiment = 'neutre'),
            'négatif', COUNT(*) FILTER (WHERE ca.sentiment = 'négatif')
        ) as sentiment_distribution,
        jsonb_object_agg(
            ca.category,
            COUNT(*) FILTER (WHERE ca.category IS NOT NULL)
        ) as category_distribution
    FROM rounded_calls rc
    LEFT JOIN call_analysis ca ON rc.id = ca.call_id
    WHERE rc.created_at >= NOW() - time_period;
END;
$$;

-- Fonction pour obtenir les appels urgents non résolus
CREATE OR REPLACE FUNCTION get_pending_urgent_calls()
RETURNS TABLE (
    call_id UUID,
    caller_number TEXT,
    start_time TIMESTAMP WITH TIME ZONE,
    summary TEXT,
    priority TEXT,
    action_type TEXT,
    laverie_id TEXT
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        rc.id as call_id,
        rc.caller_number,
        rc.start_time,
        ca.summary,
        ca.priority,
        ca.action_type,
        rc.laverie_id
    FROM rounded_calls rc
    JOIN call_analysis ca ON rc.id = ca.call_id
    LEFT JOIN call_actions act ON ca.id = act.analysis_id
    WHERE 
        ca.priority = 'high' 
        AND (act.status IS NULL OR act.status = 'pending')
    ORDER BY rc.start_time DESC;
END;
$$;
