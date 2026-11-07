# Project Mass
App de musculation premium : Next.js 15 (App Router), Framer Motion, Tailwind, thème violet.
Données : localStorage du navigateur (hooks/useLocal*, lib/sessions.ts). Pas de base en ligne utilisée par l'interface.

## Commandes
- `npm run dev`, `npm run build`, `npm run lint`. Pas de tests configurés (à compléter).

## Architecture
- app/ : routes ((auth), (dashboard), api, auth). components/, hooks/, lib/, services/, types/.
- middleware.ts + lib/auth.ts : sans APP_PASSWORD, /api/* = 503 en prod ; avec APP_PASSWORD, AUTH_SECRET obligatoire. Voir docs/securite.md.
- Reliquats non branchés à l'interface : lib/supabase/, supabase/schema.sql, routes app/api/{programs,workouts,setup} (Google Sheets).

## Règles du projet
- Si une base en ligne est ajoutée : RLS obligatoire sur chaque table.
- Toute lecture localStorage passe par une validation de forme (une valeur corrompue = page blanche).
- Avant d'écrire du Next.js, lire node_modules/next/dist/docs/.

## Pièges
- SETUP.md décrit l'ancienne base Google Sheets : obsolète, les données réelles sont en localStorage.

## graphify

This project has a knowledge graph at graphify-out/ with god nodes, community structure, and cross-file relationships.

Rules:
- For codebase questions, first run `graphify query "<question>"` when graphify-out/graph.json exists. Use `graphify path "<A>" "<B>"` for relationships and `graphify explain "<concept>"` for focused concepts. These return a scoped subgraph, usually much smaller than GRAPH_REPORT.md or raw grep output.
- If graphify-out/wiki/index.md exists, use it for broad navigation instead of raw source browsing.
- Read graphify-out/GRAPH_REPORT.md only for broad architecture review or when query/path/explain do not surface enough context.
- After modifying code, run `graphify update .` to keep the graph current (AST-only, no API cost).
