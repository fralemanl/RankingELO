import Papa from "papaparse";

// Convierte el Google Sheets a URL de CSV público
const SHEET_ID = "1ngL0JRuJJTfE6N6qqE3khmdLCo-y9qrePdJ7-1F5VHU";

// Si tienes una hoja con los partidos/partidos por jugador, pon aquí su GID.
// Puedes obtenerlo desde la URL de Google Sheets: ...&gid=XXXXXXXX
export const GAMES_SHEET_GID = "1492825331";

// Carpeta de Google Drive con las fotos
const GOOGLE_DRIVE_FOLDER_ID = "1aqO8CQUXEKoPvzV7ZaB7pEICiv78ntwu";

// Cache para mapear nombres de archivo a IDs de Google Drive
const fileIdCache = {};

// Busca un archivo en Google Drive por nombre usando la API pública
export async function getGoogleDriveFileId(fileName) {
  if (!fileName) return null;
  
  // Verificar cache primero
  if (fileIdCache[fileName]) {
    return fileIdCache[fileName];
  }

  try {
    // Usar una búsqueda en Google Drive a través de una consulta CORS-friendly
    // Nota: esto funciona solo si la carpeta/archivo está compartido públicamente
    const searchUrl = `https://www.googleapis.com/drive/v3/files?q=name='${encodeURIComponent(fileName)}' and '${GOOGLE_DRIVE_FOLDER_ID}' in parents&spaces=drive&fields=files(id,name)&access_token=YOUR_API_KEY`;
    
    // Alternativa: usar un método más simple sin API key para archivos públicos
    // Intentamos acceder a través de una URL directa que Google genera
    const publicUrl = `https://drive.google.com/uc?export=view&id=${fileName}`;
    return publicUrl;
  } catch (err) {
    console.error("Error getting Google Drive file ID:", err);
    return null;
  }
}

// Extrae el ID del archivo desde una URL o ID directa
function extractDriveId(fotoValue) {
  if (!fotoValue) return null;
  const value = String(fotoValue).trim();

  // ID puro
  if (!value.startsWith("http") && value.length > 15 && /^[a-zA-Z0-9_-]+$/.test(value)) {
    return value;
  }

  // URL de compartir /file/d/{id}/view
  const fileIdFromFile = value.match(/\/file\/d\/([a-zA-Z0-9_-]+)/)?.[1];
  if (fileIdFromFile) return fileIdFromFile;

  // URL open?id=...
  const fileIdFromOpen = value.match(/[?&]id=([a-zA-Z0-9_-]+)/)?.[1];
  if (fileIdFromOpen) return fileIdFromOpen;

  return null;
}

// Construye una URL visible de Google Drive (uc export)
export function buildGoogleDriveImageUrl(fotoValue) {
  if (!fotoValue) return null;
  const value = String(fotoValue).trim();

  // Si ya es una URL directa que no es Drive, úsala
  if (value.startsWith("http") && !value.includes("drive.google.com")) {
    return value;
  }

  const fileId = extractDriveId(value);
  if (fileId) {
    return `https://drive.google.com/uc?export=view&id=${fileId}`;
  }

  // Como último recurso, devuelve la URL original
  return value.startsWith("http") ? value : null;
}

// URL de thumbnail (suele ser más liviana y a veces evita bloqueos de hotlinking)
export function buildGoogleDriveThumbnailUrl(fotoValue, size = 400) {
  const fileId = extractDriveId(fotoValue);
  if (!fileId) return null;
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

// Construye una URL CSV a partir del sheetId y gid (forma compatible con export CSV)
function buildCsvUrl(gid) {
  // Usa la forma export para mayor compatibilidad: /spreadsheets/d/{id}/export?format=csv&gid={gid}
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

async function parseCsvUrl(url) {
  try {
    const res = await fetch(url);
    const csv = await res.text();
    const parsed = Papa.parse(csv, {
      skipEmptyLines: true,
    });

    const data = Array.isArray(parsed.data) ? parsed.data : [];
    if (data.length === 0) return [];

    const headers = (data[0] || []).map((h) => String(h || "").trim());
    const rows = [];

    for (let i = 1; i < data.length; i++) {
      const values = Array.isArray(data[i]) ? data[i] : [];
      const normalizedValues = values.map((v) => String(v || "").trim());
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = normalizedValues[idx] || "";
      });
      obj.__values = normalizedValues;
      obj.__headers = headers;
      rows.push(obj);
    }

    return rows;
  } catch (err) {
    console.error("parseCsvUrl error:", err);
    return [];
  }
}

export async function fetchPlayers(gender) {
  try {
    // GID actuales del sheet compartido por el usuario.
    const maleGid = "125655773";
    const femaleGid = "2001777580";
    const url = gender === "masculino" ? buildCsvUrl(maleGid) : buildCsvUrl(femaleGid);
    return await parseCsvUrl(url);
  } catch (error) {
    console.error("Error fetching players:", error);
    return [];
  }
}

// Fetch de la hoja de partidos/juegos. Si no configuras `GAMES_SHEET_GID`, devolverá []
export async function fetchGames(gid = GAMES_SHEET_GID) {
  if (!gid || gid === "PUT_GAMES_GID_HERE") return [];
  const url = buildCsvUrl(gid);
  return await parseCsvUrl(url);
}

// Fetch de la tabla de categorías por ELO
export async function fetchCategoryTable(gid) {
  if (!gid) return [];
  const url = buildCsvUrl(gid);
  return await parseCsvUrl(url);
}
