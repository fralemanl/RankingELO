"use client";

import { useEffect, useMemo, useState } from "react";
import {
  fetchPlayers,
  fetchCategoryTable,
  buildGoogleDriveImageUrl,
  buildGoogleDriveThumbnailUrl,
} from "@/lib/sheets";

const COLUMN_INDEX = {
  NAME: 1, // B
  ELO: 3, // D
  PHOTO: 17, // R
};

const getColumnValue = (row, index) => {
  if (!row) return "";
  if (Array.isArray(row)) return row[index] || "";
  if (row.__values) return row.__values[index] || "";
  return "";
};

const parseEloValue = (value) => {
  if (value === null || value === undefined) return 0;
  const digitsOnly = String(value).replace(/[^0-9]/g, "");
  const parsed = parseInt(digitsOnly, 10);
  return Number.isNaN(parsed) ? 0 : parsed;
};

export default function ComparePage() {
  const [gender, setGender] = useState("masculino");
  const [players, setPlayers] = useState([]);
  const [leftPlayerName, setLeftPlayerName] = useState("");
  const [rightPlayerName, setRightPlayerName] = useState("");
  const [leftSearch, setLeftSearch] = useState("");
  const [rightSearch, setRightSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [categoryTable, setCategoryTable] = useState([]);
  const [tableLoading, setTableLoading] = useState(true);

  const CATEGORY_TABLE_GID = "639425194";

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPlayers(gender)
      .then((data) => {
        if (!mounted) return;
        const mapped = data
          .filter(Boolean)
          .map((row) => {
            const name = getColumnValue(row, COLUMN_INDEX.NAME);
            const eloValue = getColumnValue(row, COLUMN_INDEX.ELO);
            const photoValue = getColumnValue(row, COLUMN_INDEX.PHOTO);
            return {
              NAME: name,
              ELO: parseEloValue(eloValue),
              ELO_DISPLAY: eloValue,
              FOTO: photoValue,
              _raw: row,
            };
          })
          .filter((p) => p.NAME && p.NAME.trim() !== "");

        const uniqueByName = new Map();
        mapped.forEach((p) => {
          const key = p.NAME.trim();
          if (!uniqueByName.has(key)) {
            uniqueByName.set(key, p);
          }
        });

        const uniquePlayers = Array.from(uniqueByName.values()).sort((a, b) =>
          a.NAME.localeCompare(b.NAME)
        );

        setPlayers(uniquePlayers);
        setLeftPlayerName(uniquePlayers[0]?.NAME || "");
        setRightPlayerName(uniquePlayers[1]?.NAME || "");
        setLeftSearch("");
        setRightSearch("");
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setPlayers([]);
        setLoading(false);
      });
    return () => (mounted = false);
  }, [gender]);

  useEffect(() => {
    let mounted = true;
    setTableLoading(true);
    fetchCategoryTable(CATEGORY_TABLE_GID)
      .then((rows) => {
        if (!mounted) return;
        setCategoryTable(rows || []);
        setTableLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setCategoryTable([]);
        setTableLoading(false);
      });
    return () => (mounted = false);
  }, []);

  const leftPlayer = useMemo(
    () => players.find((p) => p.NAME === leftPlayerName) || null,
    [players, leftPlayerName]
  );
  const rightPlayer = useMemo(
    () => players.find((p) => p.NAME === rightPlayerName) || null,
    [players, rightPlayerName]
  );

  const filteredLeftPlayers = useMemo(() => {
    if (!leftSearch.trim()) return players;
    const term = leftSearch.trim().toLowerCase();
    return players.filter((p) => (p.NAME || "").toLowerCase().includes(term));
  }, [players, leftSearch]);

  const filteredRightPlayers = useMemo(() => {
    if (!rightSearch.trim()) return players;
    const term = rightSearch.trim().toLowerCase();
    return players.filter((p) => (p.NAME || "").toLowerCase().includes(term));
  }, [players, rightSearch]);

  const averageElo = useMemo(() => {
    if (!leftPlayer || !rightPlayer) return null;
    const left = parseFloat(leftPlayer.ELO) || 0;
    const right = parseFloat(rightPlayer.ELO) || 0;
    return (left + right) / 2;
  }, [leftPlayer, rightPlayer]);

  const resolveCategory = (elo) => {
    if (elo === null || Number.isNaN(elo)) return "—";

    if (elo >= 2200) return "1ra";
    if (elo >= 2000) return "2da";
    if (elo >= 1800) return "3ra";
    if (elo >= 1600) return "4ta";
    if (elo >= 1400) return "5ta";
    if (elo >= 1200) return "6ta";
    if (elo >= 1000) return "7ma";

    return "—";
  };

  const averageCategory = useMemo(() => resolveCategory(averageElo), [averageElo, categoryTable]);

  const renderPlayerCard = (player, positionLabel) => {
    if (!player) {
      return (
        <div style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: "1rem",
          padding: "2rem",
          textAlign: "center",
          boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)",
        }}>
          <p style={{ color: "rgb(100, 116, 139)" }}>Selecciona un jugador</p>
        </div>
      );
    }

    const fotoValue = (player.FOTO || "").trim();
    const fotoSrc =
      buildGoogleDriveImageUrl(fotoValue) ||
      buildGoogleDriveThumbnailUrl(fotoValue, 400);

    return (
      <div
        style={{
          flex: 1,
          backgroundColor: "white",
          borderRadius: "1rem",
          padding: "2rem",
          textAlign: "center",
          boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)",
        }}
      >
        <p style={{
          margin: 0,
          color: "rgb(100, 116, 139)",
          fontSize: "0.85rem",
          fontWeight: "600",
          textTransform: "uppercase",
          letterSpacing: "0.08em",
        }}>
          {positionLabel}
        </p>
        {fotoSrc && (
          <img
            src={fotoSrc}
            alt={player.NAME}
            style={{
              width: "220px",
              height: "300px",
              objectFit: "cover",
              borderRadius: "0.75rem",
              border: "3px solid rgb(6, 182, 212)",
              boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.3)",
              marginTop: "1.5rem",
            }}
            referrerPolicy="no-referrer"
            onError={(e) => {
              const thumb = buildGoogleDriveThumbnailUrl(fotoValue, 400);
              if (thumb && e.currentTarget.src !== thumb) {
                e.currentTarget.src = thumb;
                return;
              }
              e.currentTarget.onerror = null;
              e.currentTarget.style.display = "none";
            }}
          />
        )}
        <h3 style={{ marginTop: "1.5rem", marginBottom: "0.5rem", fontSize: "1.5rem" }}>
          {player.NAME}
        </h3>
        <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: "600", color: "rgb(6, 182, 212)" }}>
          ELO: {player.ELO_DISPLAY || player.ELO || 0}
        </p>
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, rgb(241, 245, 249) 0%, rgb(219, 234, 254) 50%, rgb(226, 232, 240) 100%)",
        padding: "2.5rem 1rem",
      }}
    >
      <div style={{ maxWidth: "80rem", margin: "0 auto" }}>
        <h1 style={{ fontSize: "2rem", fontWeight: "700", marginBottom: "1.5rem" }}>
          Comparar Jugadores
        </h1>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ minWidth: "220px" }}>
            <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "rgb(51, 65, 85)" }}>
              Género
            </label>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem" }}
            >
              <option value="masculino">Masculino ♂</option>
              <option value="femenino">Femenino ♀</option>
            </select>
          </div>
        </div>

        {loading ? (
          <div style={{ textAlign: "center", padding: "2rem" }}>
            Cargando jugadores...
          </div>
        ) : (
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
                gap: "2rem",
              }}
            >
              <div>
                <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "rgb(51, 65, 85)" }}>
                  Jugador izquierda
                </label>
                <input
                  type="text"
                  value={leftSearch}
                  onChange={(e) => setLeftSearch(e.target.value)}
                  placeholder="Buscar jugador..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", marginBottom: "0.5rem", border: "1px solid rgb(226, 232, 240)" }}
                />
                <select
                  value={leftPlayerName}
                  onChange={(e) => setLeftPlayerName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", marginBottom: "1rem" }}
                >
                  {filteredLeftPlayers.map((p) => (
                    <option key={p.NAME} value={p.NAME}>
                      {p.NAME}
                    </option>
                  ))}
                </select>
                {renderPlayerCard(leftPlayer, "Jugador izquierdo")}
              </div>
              <div>
                <label style={{ fontSize: "0.9rem", fontWeight: "600", color: "rgb(51, 65, 85)" }}>
                  Jugador derecha
                </label>
                <input
                  type="text"
                  value={rightSearch}
                  onChange={(e) => setRightSearch(e.target.value)}
                  placeholder="Buscar jugador..."
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", marginBottom: "0.5rem", border: "1px solid rgb(226, 232, 240)" }}
                />
                <select
                  value={rightPlayerName}
                  onChange={(e) => setRightPlayerName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.5rem", marginBottom: "1rem" }}
                >
                  {filteredRightPlayers.map((p) => (
                    <option key={p.NAME} value={p.NAME}>
                      {p.NAME}
                    </option>
                  ))}
                </select>
                {renderPlayerCard(rightPlayer, "Jugador derecho")}
              </div>
            </div>

            <div
              style={{
                backgroundColor: "white",
                borderRadius: "1rem",
                padding: "1.5rem",
                boxShadow: "0 10px 20px -5px rgba(0, 0, 0, 0.1)",
                textAlign: "center",
                marginTop: "2rem",
              }}
            >
              <p style={{ margin: 0, color: "rgb(100, 116, 139)", fontWeight: "600" }}>
                Promedio de ELO
              </p>
              <p style={{ margin: "0.5rem 0", fontSize: "2rem", fontWeight: "700", color: "rgb(6, 182, 212)" }}>
                {averageElo !== null ? averageElo : "—"}
              </p>
              <p style={{ margin: 0, color: "rgb(51, 65, 85)", fontWeight: "600" }}>
                Categoría: {tableLoading ? "Cargando..." : averageCategory}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
