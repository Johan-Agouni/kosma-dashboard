# Securite - Kosma Dashboard

## Architecture de Securite

Kosma integre une architecture de securite multi-couches conforme aux recommandations OWASP Top 10.

## Mesures implementees

### Authentification & Autorisation
- **JWT (JSON Web Tokens)** : Tokens d'acces (15 min) + tokens de rafraichissement (7 jours)
- **Bcrypt** : Hachage des mots de passe avec 12 rounds de salage
- **RBAC** : Controle d'acces base sur les roles (admin, manager, viewer)
- **Protection brute-force** : Verrouillage apres 5 tentatives echouees (30 min)
- **Refresh token rotation** : Nouveau token a chaque rafraichissement, ancien revoque

### Protection contre les injections
- **express-mongo-sanitize** : Protection contre les injections NoSQL
- **express-validator** : Validation stricte de toutes les entrees utilisateur
- **hpp** : Protection contre la pollution des parametres HTTP
- **Limitation de la taille** : Body limite a 10 Ko

### En-tetes de securite (Helmet)
- Content-Security-Policy (CSP) strict
- X-Content-Type-Options: nosniff
- X-Frame-Options: DENY
- Strict-Transport-Security (HSTS)
- Referrer-Policy: strict-origin-when-cross-origin
- Cross-Origin-Resource-Policy

### Rate Limiting
- **API globale** : 100 requetes par fenetre de 15 minutes
- **Routes auth** : 10 tentatives par fenetre de 15 minutes
- Headers standards (RateLimit-*)

### Audit & Monitoring
- **Journal d'audit** : Enregistrement de toutes les actions CRUD avec utilisateur, IP, user-agent
- **Winston logging** : Logs structures avec rotation quotidienne
- **TTL automatique** : Nettoyage automatique des logs apres 90 jours

### Securite des fichiers
- **Multer** : Validation MIME type (JPEG, PNG, WebP, GIF uniquement)
- **Noms aleatoires** : crypto.randomBytes pour les noms de fichiers
- **Limite de taille** : 5 Mo par fichier, 5 fichiers maximum

### Securite de la base de donnees
- **Soft delete** : Les produits ne sont jamais supprimes definitivement
- **TTL indexes** : Nettoyage automatique des refresh tokens expires
- **Validation Mongoose** : Schemas stricts avec types et contraintes

## Politique de divulgation

Si vous decouvrez une vulnerabilite de securite, veuillez la signaler de maniere responsable via GitHub Issues.

## Dependances

Toutes les dependances sont auditees automatiquement via GitHub Actions (`npm audit --audit-level=high`).
