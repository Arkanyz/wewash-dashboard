-- Création de l'enum pour les statuts de maintenance
CREATE TYPE maintenance_status AS ENUM ('pending', 'in_progress', 'completed');
CREATE TYPE maintenance_priority AS ENUM ('urgent', 'medium', 'low');
CREATE TYPE maintenance_type AS ENUM ('preventive', 'corrective');

-- Table des événements de maintenance (optimisée avec partitionnement par mois)
CREATE TABLE maintenance_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    laundry_id UUID NOT NULL REFERENCES laundries(id) ON DELETE CASCADE,
    type maintenance_type NOT NULL,
    status maintenance_status NOT NULL DEFAULT 'pending',
    priority maintenance_priority NOT NULL,
    description TEXT NOT NULL,
    predicted_issue TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    scheduled_for TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    technician_notes TEXT,
    cost DECIMAL(10,2),
    -- Index optimisés
    CONSTRAINT maintenance_events_date_check CHECK (
        created_at >= DATE_TRUNC('month', created_at) 
        AND created_at < DATE_TRUNC('month', created_at) + INTERVAL '1 month'
    )
) PARTITION BY RANGE (created_at);

-- Création des partitions pour les 12 prochains mois
DO $$
BEGIN
    FOR i IN 0..11 LOOP
        EXECUTE format(
            'CREATE TABLE maintenance_events_%s PARTITION OF maintenance_events
            FOR VALUES FROM (%L) TO (%L)',
            TO_CHAR(CURRENT_DATE + (interval '1 month' * i), 'YYYYMM'),
            DATE_TRUNC('month', CURRENT_DATE + (interval '1 month' * i)),
            DATE_TRUNC('month', CURRENT_DATE + (interval '1 month' * (i + 1)))
        );
    END LOOP;
END $$;

-- Table de santé des machines (mise à jour quotidienne)
CREATE TABLE machine_health (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    last_maintenance TIMESTAMPTZ,
    failure_frequency DECIMAL(5,2),
    health_score INTEGER CHECK (health_score BETWEEN 0 AND 100),
    predicted_issues JSONB DEFAULT '[]',
    last_updated TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    UNIQUE (machine_id)
);

-- Table des alertes (avec TTL de 30 jours)
CREATE TABLE maintenance_alerts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID NOT NULL REFERENCES machines(id) ON DELETE CASCADE,
    laundry_id UUID NOT NULL REFERENCES laundries(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('breakdown', 'prediction')),
    priority maintenance_priority NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    resolved_at TIMESTAMPTZ,
    -- Index pour la suppression automatique après 30 jours
    CONSTRAINT alerts_ttl CHECK (
        created_at > NOW() - INTERVAL '30 days'
    )
);

-- Index optimisés
CREATE INDEX idx_maintenance_events_laundry ON maintenance_events(laundry_id, created_at);
CREATE INDEX idx_maintenance_events_machine ON maintenance_events(machine_id, created_at);
CREATE INDEX idx_maintenance_events_status ON maintenance_events(status, created_at);
CREATE INDEX idx_maintenance_alerts_active ON maintenance_alerts(laundry_id) WHERE resolved_at IS NULL;

-- Fonction pour nettoyer les anciennes alertes
CREATE OR REPLACE FUNCTION cleanup_old_alerts()
RETURNS void AS $$
BEGIN
    DELETE FROM maintenance_alerts
    WHERE created_at <= NOW() - INTERVAL '30 days'
    OR resolved_at IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- Planification du nettoyage quotidien
SELECT cron.schedule(
    'cleanup_maintenance_alerts',
    '0 0 * * *',  -- Tous les jours à minuit
    $$SELECT cleanup_old_alerts()$$
);
