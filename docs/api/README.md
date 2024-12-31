# Documentation API

## Introduction

L'API WeWash permet d'interagir avec le système de gestion des laveries. Elle utilise Supabase comme backend et suit les principes REST.

## Authentication

Toutes les requêtes doivent inclure un token JWT valide obtenu via Supabase Auth.

```typescript
const { data, error } = await supabase.auth.signInWithPassword({
  email: 'user@example.com',
  password: 'password123'
})
```

## Endpoints

### Laveries

#### Liste des Laveries
```typescript
GET /laundries
```

#### Détails d'une Laverie
```typescript
GET /laundries/{id}
```

#### Créer une Laverie
```typescript
POST /laundries
```

### Machines

#### Liste des Machines
```typescript
GET /machines
```

#### État d'une Machine
```typescript
GET /machines/{id}/status
```

### Interventions

#### Créer une Intervention
```typescript
POST /interventions
```

#### Liste des Interventions
```typescript
GET /interventions
```

### Rapports

#### Générer un Rapport
```typescript
POST /reports/generate
```

#### Exporter des Données
```typescript
GET /reports/export
```

## Modèles de Données

### Laverie
```typescript
interface Laundry {
  id: string
  name: string
  address: string
  machines: Machine[]
  status: 'active' | 'inactive'
}
```

### Machine
```typescript
interface Machine {
  id: string
  type: 'washer' | 'dryer'
  status: 'available' | 'in_use' | 'maintenance'
  laundryId: string
}
```

### Intervention
```typescript
interface Intervention {
  id: string
  machineId: string
  description: string
  status: 'pending' | 'in_progress' | 'completed'
  technicianId: string
}
```

## Gestion des Erreurs

Les erreurs suivent un format standard :

```typescript
{
  error: {
    code: string
    message: string
    details?: any
  }
}
```

## Limites et Quotas

- Rate Limit : 100 requêtes/minute
- Taille maximale des fichiers : 10MB
- Limite de pagination : 100 items/page
