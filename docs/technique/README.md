# Documentation Technique

## Architecture

### Frontend
- **Framework** : React avec Vite
- **State Management** : React Context + Hooks
- **UI Components** : Mantine UI
- **Styling** : Tailwind CSS

### Backend
- **Base de données** : Supabase (PostgreSQL)
- **Authentication** : Supabase Auth
- **API** : RESTful + Supabase Client

## Structure du Projet

```
src/
├── components/     # Composants React
├── services/      # Services (API, analytics, etc.)
├── hooks/         # Custom hooks
├── contexts/      # Contextes React
├── types/         # Types TypeScript
└── utils/         # Utilitaires

```

## Services Principaux

### Service de Rapports
```typescript
// Génération de rapports PDF
reportService.generateReport(data)
// Export CSV
reportService.exportToCSV(data)
```

### Service Analytics
```typescript
// Métriques des machines
analyticsService.getMachineMetrics()
// Analyse des interventions
analyticsService.getInterventionAnalytics()
```

### Service de Notifications
```typescript
// Envoi de notifications
notificationService.send(message)
// Configuration des alertes
notificationService.configureAlerts(settings)
```

## Sécurité

- Authentification via Supabase
- Row Level Security (RLS) dans Supabase
- Validation des données côté client et serveur
- Protection CSRF
- Rate Limiting

## Performance

- Lazy Loading des composants
- Mise en cache des requêtes
- Optimisation des images
- Code Splitting
