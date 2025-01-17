export type CallCategory =
  | 'technical_issue'
  | 'payment_issue'
  | 'user_experience'
  | 'environmental'
  | 'general_inquiry'
  | 'other';

export type CallSubCategory =
  // Problèmes techniques
  | 'machine_blocked'
  | 'electrical_failure'
  | 'heating_issue'
  | 'mechanical_damage'
  | 'drying_issue'
  // Problèmes de paiement
  | 'payment_rejected'
  | 'terminal_down'
  | 'credit_not_applied'
  // Problèmes d'expérience utilisateur
  | 'long_wait'
  | 'poor_quality'
  | 'display_issue'
  // Problèmes environnementaux
  | 'temperature_issue'
  | 'noise_issue'
  | 'hygiene_issue'
  // Questions générales
  | 'opening_hours'
  | 'location_info'
  | 'machine_usage'
  // Autres
  | 'lost_item'
  | 'security_incident'
  | 'other';

export interface CallCategoryDetails {
  category: CallCategory;
  subCategory: CallSubCategory;
  priority: 'low' | 'medium' | 'high' | 'critical';
  requiresTechnician: boolean;
  requiresImmediate: boolean;
}

export const CALL_CATEGORIES: Record<CallCategory, string> = {
  technical_issue: 'Problème technique',
  payment_issue: 'Problème de paiement',
  user_experience: 'Expérience utilisateur',
  environmental: 'Problème environnemental',
  general_inquiry: 'Question générale',
  other: 'Autre'
};

export const CALL_SUBCATEGORIES: Record<CallSubCategory, {
  label: string;
  category: CallCategory;
  defaultPriority: CallCategoryDetails['priority'];
  requiresTechnician: boolean;
  requiresImmediate: boolean;
}> = {
  // Problèmes techniques
  machine_blocked: {
    label: 'Machine bloquée',
    category: 'technical_issue',
    defaultPriority: 'high',
    requiresTechnician: true,
    requiresImmediate: true
  },
  electrical_failure: {
    label: 'Panne électrique',
    category: 'technical_issue',
    defaultPriority: 'critical',
    requiresTechnician: true,
    requiresImmediate: true
  },
  heating_issue: {
    label: 'Problème de chauffage',
    category: 'technical_issue',
    defaultPriority: 'high',
    requiresTechnician: true,
    requiresImmediate: false
  },
  mechanical_damage: {
    label: 'Pièce mécanique endommagée',
    category: 'technical_issue',
    defaultPriority: 'high',
    requiresTechnician: true,
    requiresImmediate: true
  },
  drying_issue: {
    label: 'Séchage insuffisant',
    category: 'technical_issue',
    defaultPriority: 'medium',
    requiresTechnician: true,
    requiresImmediate: false
  },

  // Problèmes de paiement
  payment_rejected: {
    label: 'Paiement non accepté',
    category: 'payment_issue',
    defaultPriority: 'high',
    requiresTechnician: false,
    requiresImmediate: true
  },
  terminal_down: {
    label: 'Terminal hors service',
    category: 'payment_issue',
    defaultPriority: 'critical',
    requiresTechnician: true,
    requiresImmediate: true
  },
  credit_not_applied: {
    label: 'Crédit non appliqué',
    category: 'payment_issue',
    defaultPriority: 'high',
    requiresTechnician: false,
    requiresImmediate: true
  },

  // Problèmes d'expérience utilisateur
  long_wait: {
    label: 'Temps d\'attente long',
    category: 'user_experience',
    defaultPriority: 'low',
    requiresTechnician: false,
    requiresImmediate: false
  },
  poor_quality: {
    label: 'Mauvaise qualité lavage/séchage',
    category: 'user_experience',
    defaultPriority: 'medium',
    requiresTechnician: true,
    requiresImmediate: false
  },
  display_issue: {
    label: 'Problème d\'affichage',
    category: 'user_experience',
    defaultPriority: 'medium',
    requiresTechnician: false,
    requiresImmediate: false
  },

  // Problèmes environnementaux
  temperature_issue: {
    label: 'Problème de température',
    category: 'environmental',
    defaultPriority: 'medium',
    requiresTechnician: true,
    requiresImmediate: false
  },
  noise_issue: {
    label: 'Bruit excessif',
    category: 'environmental',
    defaultPriority: 'medium',
    requiresTechnician: true,
    requiresImmediate: false
  },
  hygiene_issue: {
    label: 'Problème d\'hygiène',
    category: 'environmental',
    defaultPriority: 'high',
    requiresTechnician: false,
    requiresImmediate: true
  },

  // Questions générales
  opening_hours: {
    label: 'Horaires d\'ouverture',
    category: 'general_inquiry',
    defaultPriority: 'low',
    requiresTechnician: false,
    requiresImmediate: false
  },
  location_info: {
    label: 'Emplacement',
    category: 'general_inquiry',
    defaultPriority: 'low',
    requiresTechnician: false,
    requiresImmediate: false
  },
  machine_usage: {
    label: 'Utilisation des machines',
    category: 'general_inquiry',
    defaultPriority: 'low',
    requiresTechnician: false,
    requiresImmediate: false
  },

  // Autres
  lost_item: {
    label: 'Objet perdu',
    category: 'other',
    defaultPriority: 'medium',
    requiresTechnician: false,
    requiresImmediate: false
  },
  security_incident: {
    label: 'Incident de sécurité',
    category: 'other',
    defaultPriority: 'critical',
    requiresTechnician: false,
    requiresImmediate: true
  },
  other: {
    label: 'Autre',
    category: 'other',
    defaultPriority: 'low',
    requiresTechnician: false,
    requiresImmediate: false
  }
};
