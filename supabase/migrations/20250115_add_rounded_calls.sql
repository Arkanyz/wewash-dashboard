-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Table pour stocker les appels bruts de Rounded
CREATE TABLE rounded_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id TEXT UNIQUE NOT NULL,
    caller_number TEXT NOT NULL,
    recipient_number TEXT NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    end_time TIMESTAMP WITH TIME ZONE,
    duration INTEGER,
    recording_url TEXT,
    transcript TEXT,
    status TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed BOOLEAN DEFAULT FALSE,
    raw_data JSONB -- Stocke toutes les données brutes de Rounded
);

-- Table pour stocker les analyses des appels
CREATE TABLE call_analysis (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    call_id UUID REFERENCES rounded_calls(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- 'information', 'technical_issue', 'complaint', etc.
    priority TEXT NOT NULL, -- 'low', 'medium', 'high'
    sentiment TEXT, -- 'positive', 'neutral', 'negative'
    keywords TEXT[],
    summary TEXT,
    machine_id TEXT, -- Si l'appel concerne une machine spécifique
    laundry_id TEXT, -- Si l'appel concerne une laverie spécifique
    action_required BOOLEAN DEFAULT FALSE,
    action_type TEXT, -- 'maintenance', 'customer_callback', 'technical_visit', etc.
    ai_confidence FLOAT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    processed_by TEXT NOT NULL -- 'ai' ou ID de l'agent
);

-- Table pour les recommandations générées
CREATE TABLE call_recommendations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    analysis_id UUID REFERENCES call_analysis(id) ON DELETE CASCADE,
    recommendation_type TEXT NOT NULL, -- 'maintenance', 'customer_service', 'technical', etc.
    priority TEXT NOT NULL,
    description TEXT NOT NULL,
    estimated_impact TEXT,
    suggested_actions TEXT[],
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX idx_rounded_calls_status ON rounded_calls(status);
CREATE INDEX idx_rounded_calls_processed ON rounded_calls(processed);
CREATE INDEX idx_call_analysis_category ON call_analysis(category);
CREATE INDEX idx_call_analysis_priority ON call_analysis(priority);

-- Fonction pour obtenir les statistiques des appels
CREATE OR REPLACE FUNCTION get_call_statistics(
    time_period interval DEFAULT interval '24 hours'
)
RETURNS TABLE (
    total_calls BIGINT,
    avg_duration INTEGER,
    resolution_rate FLOAT,
    priority_distribution JSONB
) LANGUAGE plpgsql AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*)::BIGINT as total_calls,
        AVG(duration)::INTEGER as avg_duration,
        (COUNT(*) FILTER (WHERE ca.action_required = false)::FLOAT / COUNT(*)::FLOAT) * 100 as resolution_rate,
        jsonb_build_object(
            'high', COUNT(*) FILTER (WHERE ca.priority = 'high'),
            'medium', COUNT(*) FILTER (WHERE ca.priority = 'medium'),
            'low', COUNT(*) FILTER (WHERE ca.priority = 'low')
        ) as priority_distribution
    FROM rounded_calls rc
    LEFT JOIN call_analysis ca ON rc.id = ca.call_id
    WHERE rc.created_at >= NOW() - time_period;
END;
$$;
