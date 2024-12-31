# Guide d'Installation

## Prérequis

- Node.js (version 18 ou supérieure)
- npm (version 8 ou supérieure)
- Un compte Supabase
- Un compte Vercel (pour le déploiement)

## Installation Locale

1. **Cloner le projet**
```bash
git clone https://github.com/Arkanyz/wewash-dashboard.git
cd wewash-dashboard
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configuration des variables d'environnement**
- Copier le fichier `.env.template` vers `.env`
- Remplir les variables suivantes :
  ```
  VITE_SUPABASE_URL=votre_url_supabase
  VITE_SUPABASE_ANON_KEY=votre_clé_supabase
  ```

4. **Lancer l'application en développement**
```bash
npm run dev
```

## Déploiement

1. **Configuration Vercel**
- Connecter votre compte GitHub à Vercel
- Importer le projet
- Configurer les variables d'environnement dans Vercel

2. **Déploiement Automatique**
- Chaque push sur la branche `master` déclenche un déploiement
- Les déploiements sont gérés par GitHub Actions

## Dépannage

### Problèmes Courants

1. **Erreur de build**
   - Vérifier les versions de Node.js et npm
   - Nettoyer le cache : `npm run clean`

2. **Erreurs de connexion Supabase**
   - Vérifier les variables d'environnement
   - Vérifier les permissions dans Supabase
