// Convierte el Google Sheets a URL de CSV público
const SHEET_ID = "11jcr7on8kUp5V93e33QcdNUJzYFOJRx1-AfsKG4jXt4";

// Si tienes una hoja con los partidos/partidos por jugador, pon aquí su GID.
// Puedes obtenerlo desde la URL de Google Sheets: ...&gid=XXXXXXXX
export const GAMES_SHEET_GID = "1492825331";

// Construye una URL CSV a partir del sheetId y gid (forma compatible con export CSV)
function buildCsvUrl(gid) {
  // Usa la forma export para mayor compatibilidad: /spreadsheets/d/{id}/export?format=csv&gid={gid}
  return `https://docs.google.com/spreadsheets/d/${SHEET_ID}/export?format=csv&gid=${gid}`;
}

async function parseCsvUrl(url) {
  try {
    const res = await fetch(url);
    const csv = await res.text();
    const lines = csv.split("\n").filter(Boolean);
    if (lines.length === 0) return [];
    const headers = lines[0].split(",").map((h) => h.trim());
    const rows = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",");
      const obj = {};
      headers.forEach((h, idx) => {
        obj[h] = (values[idx] || "").trim();
      });
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
    // Estas URLs antiguas estaban en el repo; si funcionan deje que el autor las mantenga.
    // Sin embargo, preferimos construir desde SHEET_ID y GID si es posible.
    const maleGid = "2054985208";
    const femaleGid = "183727632";
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
