-- Mise à jour de la table machines
ALTER TABLE machines
ADD COLUMN IF NOT EXISTS last_used TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'ok' CHECK (status IN ('ok', 'maintenance', 'out_of_order'));

-- Création de la table des techniciens
CREATE TABLE IF NOT EXISTS technicians (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    phone VARCHAR(20),
    email VARCHAR(255),
    speciality VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Index pour améliorer les performances
CREATE INDEX IF NOT EXISTS idx_technicians_owner ON technicians(owner_id);
CREATE INDEX IF NOT EXISTS idx_machines_status ON machines(status);

-- Fonction de mise à jour du timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger pour la mise à jour automatique
CREATE TRIGGER update_technicians_updated_at
    BEFORE UPDATE ON technicians
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Politiques de sécurité pour les techniciens
ALTER TABLE technicians ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Les utilisateurs peuvent voir leurs propres techniciens"
    ON technicians FOR SELECT
    USING (auth.uid() = owner_id);

CREATE POLICY "Les utilisateurs peuvent gérer leurs propres techniciens"
    ON technicians FOR ALL
    USING (auth.uid() = owner_id);
