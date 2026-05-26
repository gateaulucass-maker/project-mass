// Script de setup automatique — crée le Google Sheet et configure .env.local
import { google } from "googleapis";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { fileURLToPath } from "url";
import path from "path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, "..");

const SA_KEY_PATH = process.env.SA_KEY_PATH || "/tmp/project-mass-sa-key.json";
const USER_EMAIL  = process.env.USER_EMAIL  || "gateau.lucass@gmail.com";

const HEADERS = {
  Programs:         ["id","title","type","start_date","end_date","start_weight","target_weight","calories_target","weekly_frequency","goal","is_active","created_at"],
  Workouts:         ["id","program_id","title","workout_type","created_at"],
  Exercises:        ["id","workout_id","name","muscle_group","sets","reps","weight","rest_time","order_index","notes"],
  WorkoutLogs:      ["id","workout_id","exercise_name","performed_weight","performed_reps","set_number","completed","created_at"],
  Bodyweight:       ["id","weight","created_at"],
  AiConversations:  ["id","role","message","created_at"],
};

async function main() {
  console.log("🔑  Authentification service account...");
  const key = JSON.parse(readFileSync(SA_KEY_PATH, "utf8"));

  const auth = new google.auth.GoogleAuth({
    credentials: key,
    scopes: [
      "https://www.googleapis.com/auth/spreadsheets",
      "https://www.googleapis.com/auth/drive",
    ],
  });

  const sheetsApi = google.sheets({ version: "v4", auth });
  const driveApi  = google.drive({ version: "v3", auth });

  // 1. Créer le spreadsheet
  console.log("📊  Création du Google Sheet...");
  const created = await sheetsApi.spreadsheets.create({
    requestBody: {
      properties: { title: "Project Mass — Base de données" },
      sheets: Object.keys(HEADERS).map(title => ({ properties: { title } })),
    },
  });

  const spreadsheetId = created.data.spreadsheetId;
  const spreadsheetUrl = created.data.spreadsheetUrl;
  console.log(`✅  Sheet créé : ${spreadsheetUrl}`);

  // 2. Écrire les headers dans chaque onglet
  console.log("📝  Écriture des headers...");
  const data = Object.entries(HEADERS).map(([sheet, headers]) => ({
    range: `${sheet}!A1`,
    values: [headers],
  }));

  await sheetsApi.spreadsheets.values.batchUpdate({
    spreadsheetId,
    requestBody: { valueInputOption: "RAW", data },
  });

  // 3. Formater les headers (gras + fond violet)
  console.log("🎨  Formatage des headers...");
  const sheetIds = created.data.sheets.reduce((acc, s) => {
    acc[s.properties.title] = s.properties.sheetId;
    return acc;
  }, {});

  await sheetsApi.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: Object.entries(sheetIds).map(([, sheetId]) => ({
        repeatCell: {
          range: { sheetId, startRowIndex: 0, endRowIndex: 1 },
          cell: {
            userEnteredFormat: {
              backgroundColor: { red: 0.486, green: 0.227, blue: 0.929 },
              textFormat: { bold: true, foregroundColor: { red: 1, green: 1, blue: 1 } },
            },
          },
          fields: "userEnteredFormat(backgroundColor,textFormat)",
        },
      })),
    },
  });

  // 4. Partager avec l'utilisateur
  console.log(`🔗  Partage avec ${USER_EMAIL}...`);
  await driveApi.permissions.create({
    fileId: spreadsheetId,
    requestBody: { type: "user", role: "writer", emailAddress: USER_EMAIL },
    sendNotificationEmail: false,
  });

  // 5. Écrire le .env.local
  console.log("⚙️   Configuration .env.local...");
  const saJson = JSON.stringify(JSON.parse(readFileSync(SA_KEY_PATH, "utf8")));

  const envPath = path.join(ROOT, ".env.local");
  const envContent = `# Project Mass — Google Sheets Backend
# Généré automatiquement le ${new Date().toLocaleDateString("fr-FR")}

GOOGLE_SPREADSHEET_ID=${spreadsheetId}
GOOGLE_SERVICE_ACCOUNT_JSON=${saJson}

# Optionnel : protection par mot de passe
# APP_PASSWORD=

# Optionnel : Coach IA
# OPENAI_API_KEY=
# ANTHROPIC_API_KEY=
`;

  writeFileSync(envPath, envContent);

  console.log("\n✨  SETUP TERMINÉ !\n");
  console.log(`   📊 Google Sheet  : ${spreadsheetUrl}`);
  console.log(`   📁 Spreadsheet ID: ${spreadsheetId}`);
  console.log(`   ✅ .env.local     : configuré`);
  console.log("\n   Lance l'app avec : npm run dev");
}

main().catch(err => {
  console.error("❌ Erreur:", err.message);
  process.exit(1);
});
