# Sécurité : variables d'environnement

- Aucune variable : pages ouvertes (données en localStorage), routes /api/* fermées en production (503).
- APP_PASSWORD + AUTH_SECRET : /login demande le mot de passe, tout est fermé sans session (30 jours).
- APP_PASSWORD sans AUTH_SECRET : tout est fermé (échec sûr).
- AUTH_SECRET : 32 caractères minimum, générer avec `openssl rand -hex 32`.
- Changer APP_PASSWORD ou AUTH_SECRET déconnecte toutes les sessions.
- .env.local.example décrit encore l'ancien comportement (fichier bloqué par le hook guard-bash).
