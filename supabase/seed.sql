-- Insertion de données de test pour les techniciens
INSERT INTO technicians (owner_id, name, phone, email, speciality)
VALUES 
    ('votre_user_id', 'Jean Dupont', '0123456789', 'jean.dupont@example.com', 'Lave-linge industriel'),
    ('votre_user_id', 'Marie Martin', '0987654321', 'marie.martin@example.com', 'Systèmes de paiement'),
    ('votre_user_id', 'Pierre Durand', '0654321987', 'pierre.durand@example.com', 'Maintenance générale');

-- Mise à jour des machines existantes avec des données de test
UPDATE machines
SET 
    last_used = CURRENT_TIMESTAMP - (random() * INTERVAL '24 hours'),
    status = CASE 
        WHEN random() < 0.7 THEN 'ok'
        WHEN random() < 0.9 THEN 'maintenance'
        ELSE 'out_of_order'
    END;
