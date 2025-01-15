-- Activation de l'extension uuid si pas déjà active
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

BEGIN;

-- Table pour les rapports de maintenance
CREATE TABLE IF NOT EXISTS maintenance_reports (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    description TEXT NOT NULL,
    severity TEXT CHECK (severity IN ('low', 'medium', 'high')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id)
);

-- Table pour les appels de support
CREATE TABLE IF NOT EXISTS support_calls (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    machine_id UUID REFERENCES machines(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('information', 'problem', 'maintenance', 'payment', 'other')),
    description TEXT,
    status TEXT NOT NULL CHECK (status IN ('pending', 'in_progress', 'resolved', 'cancelled')) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_by UUID REFERENCES auth.users(id),
    resolved_by UUID REFERENCES auth.users(id)
);

-- Index pour améliorer les performances des requêtes statistiques
CREATE INDEX IF NOT EXISTS idx_maintenance_reports_machine ON maintenance_reports(machine_id);
CREATE INDEX IF NOT EXISTS idx_maintenance_reports_created_at ON maintenance_reports(created_at);
CREATE INDEX IF NOT EXISTS idx_support_calls_machine ON support_calls(machine_id);
CREATE INDEX IF NOT EXISTS idx_support_calls_created_at ON support_calls(created_at);
CREATE INDEX IF NOT EXISTS idx_support_calls_type ON support_calls(type);
CREATE INDEX IF NOT EXISTS idx_support_calls_status ON support_calls(status);

-- Activation de RLS (Row Level Security)
ALTER TABLE maintenance_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_calls ENABLE ROW LEVEL SECURITY;

-- Politiques de sécurité pour les nouvelles tables
CREATE POLICY "Les utilisateurs peuvent voir les rapports de leurs machines"
    ON maintenance_reports FOR SELECT
    USING (
        auth.uid() IN (
            SELECT owner_id 
            FROM laundries l
            JOIN machines m ON m.laundry_id = l.id
            WHERE m.id = maintenance_reports.machine_id
        )
    );

CREATE POLICY "Les utilisateurs peuvent voir les appels de leurs machines"
    ON support_calls FOR SELECT
    USING (
        auth.uid() IN (
            SELECT owner_id 
            FROM laundries l
            JOIN machines m ON m.laundry_id = l.id
            WHERE m.id = support_calls.machine_id
        )
    );

-- Données de test (à supprimer en production)
DO $$
DECLARE
    machine_record RECORD;
BEGIN
    -- Pour chaque machine
    FOR machine_record IN SELECT id FROM machines LOOP
        -- Insertion de rapports de maintenance
        IF random() < 0.5 THEN
            INSERT INTO maintenance_reports (machine_id, description, severity, created_at, resolved_at)
            VALUES (
                machine_record.id,
                CASE floor(random() * 3)
                    WHEN 0 THEN 'Bruit anormal détecté'
                    WHEN 1 THEN 'Problème d''évacuation d''eau'
                    ELSE 'Maintenance préventive nécessaire'
                END,
                CASE floor(random() * 3)
                    WHEN 0 THEN 'low'
                    WHEN 1 THEN 'medium'
                    ELSE 'high'
                END,
                CURRENT_TIMESTAMP - (random() * INTERVAL '30 days'),
                CASE WHEN random() > 0.3 
                    THEN CURRENT_TIMESTAMP - (random() * INTERVAL '15 days')
                    ELSE NULL 
                END
            );
        END IF;

        -- Insertion d'appels de support
        IF random() < 0.7 THEN
            INSERT INTO support_calls (machine_id, type, description, status, created_at, resolved_at)
            VALUES (
                machine_record.id,
                CASE floor(random() * 5)
                    WHEN 0 THEN 'information'
                    WHEN 1 THEN 'problem'
                    WHEN 2 THEN 'maintenance'
                    WHEN 3 THEN 'payment'
                    ELSE 'other'
                END,
                CASE floor(random() * 4)
                    WHEN 0 THEN 'Question sur l''utilisation'
                    WHEN 1 THEN 'Machine ne démarre pas'
                    WHEN 2 THEN 'Problème de paiement'
                    ELSE 'Demande d''information générale'
                END,
                CASE floor(random() * 4)
                    WHEN 0 THEN 'pending'
                    WHEN 1 THEN 'in_progress'
                    WHEN 2 THEN 'resolved'
                    ELSE 'cancelled'
                END,
                CURRENT_TIMESTAMP - (random() * INTERVAL '90 days'),
                CASE WHEN random() > 0.4 
                    THEN CURRENT_TIMESTAMP - (random() * INTERVAL '30 days')
                    ELSE NULL 
                END
            );
        END IF;
    END LOOP;
END $$;

COMMIT;
