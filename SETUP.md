# Setup Google Sheets — Project Mass

## Ce que ça fait

Ton Google Sheet devient ta base de données. Chaque onglet = une table :

| Onglet | Contenu |
|---|---|
| Programs | Tes programmes PPL, Force, Sèche… |
| Workouts | Les séances de chaque programme |
| Exercises | Les exercices de chaque séance |
| WorkoutLogs | Chaque série effectuée en séance |
| Bodyweight | Ton poids journalier |
| AiConversations | Historique chat Coach IA |

---

## Étapes (15 minutes)

### 1. Créer le Google Sheet

1. Va sur [sheets.new](https://sheets.new)
2. Renomme le fichier : **"Project Mass"**
3. Copie l'ID dans l'URL :
   ```
   https://docs.google.com/spreadsheets/d/XXXXXXXXXXXXXXXX/edit
                                           ^^^^^^^^^^^^^^^^
                                           C'est ton SPREADSHEET_ID
   ```

### 2. Créer un Service Account Google

1. Va sur [console.cloud.google.com](https://console.cloud.google.com)
2. Crée un nouveau projet ou sélectes-en un existant
3. **APIs & Services → Bibliothèque** → cherche **"Google Sheets API"** → **Activer**
4. **APIs & Services → Identifiants** → **Créer des identifiants** → **Compte de service**
5. Nom : `project-mass-bot` → **Créer et continuer** → **Terminer**
6. Clique sur le compte de service créé → onglet **Clés**
7. **Ajouter une clé** → **Créer une clé** → **JSON** → télécharge le fichier

### 3. Partager le Sheet avec le Service Account

1. Ouvre le fichier JSON téléchargé
2. Copie la valeur de `"client_email"` (ressemble à `project-mass-bot@xxx.iam.gserviceaccount.com`)
3. Dans ton Google Sheet → bouton **Partager**
4. Colle l'email → rôle **Éditeur** → **Envoyer**

### 4. Configurer .env.local

Copie `.env.local.example` en `.env.local` :

```bash
cp .env.local.example .env.local
```

Remplis les valeurs :

```env
GOOGLE_SPREADSHEET_ID=ton_id_ici

# Contenu du fichier JSON sur UNE SEULE LIGNE (supprime les retours à la ligne)
GOOGLE_SERVICE_ACCOUNT_JSON={"type":"service_account","project_id":"..."}
```

> **Astuce** pour mettre le JSON sur une ligne :
> ```bash
> cat credentials.json | tr -d '\n'
> ```

### 5. Initialiser les onglets

Lance l'app puis visite :

```
http://localhost:3000/api/setup
```

→ Doit répondre `{ "configured": true }`

Ensuite fais un POST pour créer les onglets :

```bash
curl -X POST http://localhost:3000/api/setup
```

→ Doit répondre `{ "ok": true, "message": "Sheets initialized successfully" }`

Tes onglets sont créés automatiquement dans le Google Sheet ! 🎉

### 6. Lancer l'app

```bash
npm run dev
```

---

## Mode démo (sans Google Sheets)

Si `.env.local` est vide, l'app tourne avec des données fictives — parfait pour tester l'UI.

---

## Déploiement Vercel

Dans Vercel → Settings → Environment Variables, ajoute :
- `GOOGLE_SPREADSHEET_ID`
- `GOOGLE_SERVICE_ACCOUNT_JSON` (colle le JSON complet)
