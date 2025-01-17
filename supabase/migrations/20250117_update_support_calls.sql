-- Créer les types d'énumération
create type call_category as enum (
  'technical_issue',
  'payment_issue',
  'user_experience',
  'environmental',
  'general_inquiry',
  'other'
);

create type call_subcategory as enum (
  'machine_blocked',
  'electrical_failure',
  'heating_issue',
  'mechanical_damage',
  'drying_issue',
  'payment_rejected',
  'terminal_down',
  'credit_not_applied',
  'long_wait',
  'poor_quality',
  'display_issue',
  'temperature_issue',
  'noise_issue',
  'hygiene_issue',
  'opening_hours',
  'location_info',
  'machine_usage',
  'lost_item',
  'security_incident',
  'other'
);

create type call_priority as enum (
  'low',
  'medium',
  'high',
  'critical'
);

-- Sauvegarder les données existantes
create table support_calls_backup as select * from support_calls;

-- Mettre à jour la table support_calls
alter table support_calls 
  -- Supprimer l'ancienne colonne type
  drop column type,
  -- Ajouter les nouvelles colonnes
  add column category call_category,
  add column subcategory call_subcategory,
  add column priority call_priority default 'medium',
  add column requires_technician boolean default false,
  add column requires_immediate boolean default false,
  add column client_info jsonb,
  add column analysis jsonb,
  add column actions_taken jsonb[] default array[]::jsonb[];

-- Migrer les anciennes données
update support_calls set
  category = case 
    when type = 'problem' then 'technical_issue'
    when type = 'payment' then 'payment_issue'
    when type = 'maintenance' then 'technical_issue'
    when type = 'information' then 'general_inquiry'
    else 'other'
  end,
  subcategory = 'other',
  requires_technician = type in ('problem', 'maintenance'),
  requires_immediate = false
from support_calls_backup
where support_calls.id = support_calls_backup.id;

-- Créer un index pour améliorer les performances des requêtes
create index if not exists support_calls_category_idx on support_calls (category);
create index if not exists support_calls_subcategory_idx on support_calls (subcategory);
create index if not exists support_calls_priority_idx on support_calls (priority);

-- Mettre à jour les contraintes
alter table support_calls
  alter column category set not null,
  alter column subcategory set not null,
  alter column priority set not null;
