-- Ajout de la colonne has_pricing à la table laundries
ALTER TABLE laundries
ADD COLUMN has_pricing BOOLEAN DEFAULT true;

-- Mise à jour des laveries existantes
UPDATE laundries
SET has_pricing = true
WHERE has_pricing IS NULL;
