-- Mise à jour de la table machines pour ajouter le champ last_update
ALTER TABLE machines
ADD COLUMN IF NOT EXISTS last_update TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

-- Renommer last_used en last_operation pour plus de clarté
ALTER TABLE machines
RENAME COLUMN last_used TO last_operation;

-- Ajout d'un trigger pour mettre à jour automatiquement last_update
CREATE OR REPLACE FUNCTION update_machine_last_update()
RETURNS TRIGGER AS $$
BEGIN
    NEW.last_update = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_machine_status
    BEFORE UPDATE OF status ON machines
    FOR EACH ROW
    EXECUTE FUNCTION update_machine_last_update();

-- Mise à jour des données existantes
UPDATE machines
SET last_update = CURRENT_TIMESTAMP
WHERE last_update IS NULL;

-- Ajout d'un index pour améliorer les performances des requêtes de tri par last_update
CREATE INDEX IF NOT EXISTS idx_machines_last_update ON machines(last_update);

-- Mise à jour des politiques de sécurité
CREATE POLICY "Les utilisateurs peuvent voir les mises à jour de leurs machines"
    ON machines FOR SELECT
    USING (
        auth.uid() IN (
            SELECT owner_id 
            FROM laundries 
            WHERE id = machines.laundry_id
        )
    );
