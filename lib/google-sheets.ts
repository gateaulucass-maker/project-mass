import { google } from "googleapis";

// Column indices for each sheet tab
export const SHEETS = {
  PROGRAMS: "Programs",
  WORKOUTS: "Workouts",
  EXERCISES: "Exercises",
  WORKOUT_LOGS: "WorkoutLogs",
  BODYWEIGHT: "Bodyweight",
  AI_CONVERSATIONS: "AiConversations",
} as const;

export const HEADERS = {
  Programs: ["id", "title", "type", "start_date", "end_date", "start_weight", "target_weight", "calories_target", "weekly_frequency", "goal", "is_active", "created_at"],
  Workouts: ["id", "program_id", "title", "workout_type", "created_at"],
  Exercises: ["id", "workout_id", "name", "muscle_group", "sets", "reps", "weight", "rest_time", "order_index", "notes"],
  WorkoutLogs: ["id", "workout_id", "exercise_name", "performed_weight", "performed_reps", "set_number", "completed", "created_at"],
  Bodyweight: ["id", "weight", "created_at"],
  AiConversations: ["id", "role", "message", "created_at"],
} as const;

function getAuth() {
  const creds = process.env.GOOGLE_SERVICE_ACCOUNT_JSON;
  if (!creds) throw new Error("GOOGLE_SERVICE_ACCOUNT_JSON not set");
  const key = JSON.parse(creds);
  return new google.auth.GoogleAuth({
    credentials: key,
    scopes: ["https://www.googleapis.com/auth/spreadsheets"],
  });
}

export function getSheetsClient() {
  const auth = getAuth();
  return google.sheets({ version: "v4", auth });
}

export function getSpreadsheetId(): string {
  const id = process.env.GOOGLE_SPREADSHEET_ID;
  if (!id) throw new Error("GOOGLE_SPREADSHEET_ID not set");
  return id;
}

// Check if sheets are configured
export function isSheetsConfigured(): boolean {
  return !!(process.env.GOOGLE_SERVICE_ACCOUNT_JSON && process.env.GOOGLE_SPREADSHEET_ID);
}

// Read all rows from a sheet tab, returns array of objects
export async function readSheet<T extends Record<string, string>>(sheetName: string): Promise<T[]> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:Z`,
  });

  const rows = res.data.values ?? [];
  if (rows.length < 2) return [];

  const headers = rows[0] as string[];
  return rows.slice(1).map(row => {
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => { obj[h] = row[i] ?? ""; });
    return obj as T;
  });
}

// Append a new row to a sheet
export async function appendRow(sheetName: string, values: string[]): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  await sheets.spreadsheets.values.append({
    spreadsheetId,
    range: `${sheetName}!A:A`,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

// Update a row by matching on column A (id)
export async function updateRow(sheetName: string, id: string, values: string[]): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Find the row index
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex < 0) throw new Error(`Row ${id} not found in ${sheetName}`);

  const range = `${sheetName}!A${rowIndex + 1}`;
  await sheets.spreadsheets.values.update({
    spreadsheetId,
    range,
    valueInputOption: "RAW",
    requestBody: { values: [values] },
  });
}

// Delete a row by id (replaces with empty, then batchUpdate to delete)
export async function deleteRow(sheetName: string, id: string): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  // Get sheet ID
  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const sheet = meta.data.sheets?.find(s => s.properties?.title === sheetName);
  if (!sheet?.properties?.sheetId) throw new Error(`Sheet ${sheetName} not found`);

  // Find row index
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: `${sheetName}!A:A`,
  });

  const rows = res.data.values ?? [];
  const rowIndex = rows.findIndex(r => r[0] === id);
  if (rowIndex < 0) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: {
            sheetId: sheet.properties.sheetId,
            dimension: "ROWS",
            startIndex: rowIndex,
            endIndex: rowIndex + 1,
          },
        },
      }],
    },
  });
}

// Initialize all sheet tabs with headers (idempotent)
export async function initializeSheets(): Promise<void> {
  const sheets = getSheetsClient();
  const spreadsheetId = getSpreadsheetId();

  const meta = await sheets.spreadsheets.get({ spreadsheetId });
  const existingTitles = meta.data.sheets?.map(s => s.properties?.title ?? "") ?? [];

  const addSheetRequests = Object.values(SHEETS)
    .filter(name => !existingTitles.includes(name))
    .map(title => ({ addSheet: { properties: { title } } }));

  if (addSheetRequests.length > 0) {
    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: { requests: addSheetRequests },
    });
  }

  // Write headers for each sheet
  for (const [sheetName, headers] of Object.entries(HEADERS)) {
    const headerRes = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${sheetName}!A1:Z1`,
    });

    if (!headerRes.data.values?.[0]?.length) {
      await sheets.spreadsheets.values.update({
        spreadsheetId,
        range: `${sheetName}!A1`,
        valueInputOption: "RAW",
        requestBody: { values: [headers as unknown as string[]] },
      });
    }
  }
}
