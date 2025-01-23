-- Définir la valeur par défaut pour le pays
ALTER TABLE laundries 
ALTER COLUMN pays SET DEFAULT 'France';

-- Mettre à jour toutes les lignes existantes
UPDATE laundries 
SET pays = 'France' 
WHERE pays IS NULL OR pays = '';
