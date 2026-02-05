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
  CATEGORY: 4, // E
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
  const [leftCategorySearch, setLeftCategorySearch] = useState("");
  const [rightCategorySearch, setRightCategorySearch] = useState("");
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
            const categoryValue = getColumnValue(row, COLUMN_INDEX.CATEGORY);
            const photoValue = getColumnValue(row, COLUMN_INDEX.PHOTO);
            return {
              NAME: name,
              ELO: parseEloValue(eloValue),
              ELO_DISPLAY: eloValue,
              CATEGORY: categoryValue,
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
        setLeftCategorySearch("");
        setRightCategorySearch("");
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
    const nameTerm = leftSearch.trim().toLowerCase();
    const categoryTerm = leftCategorySearch.trim().toLowerCase();
    if (!nameTerm && !categoryTerm) return players;
    return players.filter((p) => {
      const nameMatch = nameTerm
        ? (p.NAME || "").toLowerCase().includes(nameTerm)
        : true;
      const categoryMatch = categoryTerm
        ? (p.CATEGORY || "").toLowerCase().includes(categoryTerm)
        : true;
      return nameMatch && categoryMatch;
    });
  }, [players, leftSearch, leftCategorySearch]);

  const filteredRightPlayers = useMemo(() => {
    const nameTerm = rightSearch.trim().toLowerCase();
    const categoryTerm = rightCategorySearch.trim().toLowerCase();
    if (!nameTerm && !categoryTerm) return players;
    return players.filter((p) => {
      const nameMatch = nameTerm
        ? (p.NAME || "").toLowerCase().includes(nameTerm)
        : true;
      const categoryMatch = categoryTerm
        ? (p.CATEGORY || "").toLowerCase().includes(categoryTerm)
        : true;
      return nameMatch && categoryMatch;
    });
  }, [players, rightSearch, rightCategorySearch]);

  useEffect(() => {
    if (!filteredLeftPlayers.length) return;
    const exists = filteredLeftPlayers.some((p) => p.NAME === leftPlayerName);
    if (!exists) {
      setLeftPlayerName(filteredLeftPlayers[0].NAME);
    }
  }, [filteredLeftPlayers, leftPlayerName]);

  useEffect(() => {
    if (!filteredRightPlayers.length) return;
    const exists = filteredRightPlayers.some((p) => p.NAME === rightPlayerName);
    if (!exists) {
      setRightPlayerName(filteredRightPlayers[0].NAME);
    }
  }, [filteredRightPlayers, rightPlayerName]);

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

  const globalRankMap = useMemo(() => {
    const sorted = [...players].sort((a, b) => (b.ELO || 0) - (a.ELO || 0));
    const map = new Map();
    sorted.forEach((p, index) => map.set(p.NAME, index + 1));
    return map;
  }, [players]);

  const categoryRankMap = useMemo(() => {
    const map = new Map();
    const grouped = new Map();
    players.forEach((p) => {
      const key = (p.CATEGORY || "").trim();
      if (!grouped.has(key)) grouped.set(key, []);
      grouped.get(key).push(p);
    });

    grouped.forEach((group) => {
      group.sort((a, b) => (b.ELO || 0) - (a.ELO || 0));
      group.forEach((p, index) => map.set(p.NAME, index + 1));
    });

    return map;
  }, [players]);

  const renderPlayerCard = (player, positionLabel) => {
    if (!player) {
      return (
        <div style={{
          backgroundColor: "#f0f0f0",
          borderRadius: "0.5rem",
          padding: "1.5rem",
          textAlign: "center",
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
      <div>
        <div
          style={{
            backgroundColor: "#4a6cf7",
            borderRadius: "0.75rem",
            padding: "0.75rem",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            marginBottom: "0.75rem",
          }}
        >
          {fotoSrc ? (
            <img
              src={fotoSrc}
              alt={player.NAME}
              style={{
                width: "180px",
                height: "220px",
                objectFit: "cover",
                borderRadius: "0.75rem",
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
          ) : (
            <div style={{ color: "white", fontWeight: "600" }}>FOTO</div>
          )}
        </div>

        <div
          style={{
            backgroundColor: "#4a6cf7",
            color: "white",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            textAlign: "center",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          ELO: {player.ELO_DISPLAY || player.ELO || 0}
        </div>

        <div
          style={{
            backgroundColor: "#4a6cf7",
            color: "white",
            padding: "0.5rem",
            borderRadius: "0.5rem",
            textAlign: "center",
            fontWeight: "600",
            marginBottom: "0.5rem",
          }}
        >
          CATEGORIA: {player.CATEGORY || "—"}
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
            gap: "0.5rem",
          }}
        >
          <div
            style={{
              backgroundColor: "#4a6cf7",
              color: "white",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              textAlign: "center",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            POSICION GLOBAL
            <div style={{ fontSize: "1rem", marginTop: "0.25rem" }}>
              #{globalRankMap.get(player.NAME) || "—"}
            </div>
          </div>
          <div
            style={{
              backgroundColor: "#4a6cf7",
              color: "white",
              padding: "0.5rem",
              borderRadius: "0.5rem",
              textAlign: "center",
              fontWeight: "600",
              fontSize: "0.85rem",
            }}
          >
            POSICION CATEGORIA
            <div style={{ fontSize: "1rem", marginTop: "0.25rem" }}>
              #{categoryRankMap.get(player.NAME) || "—"}
            </div>
          </div>
        </div>
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
        <div style={{ display: "flex", justifyContent: "center", marginBottom: "1.5rem" }}>
          <button
            type="button"
            style={{
              padding: "0.5rem 1.5rem",
              backgroundColor: "#e2e2e2",
              borderRadius: "0.25rem",
              border: "1px solid #cfcfcf",
              fontWeight: "700",
              letterSpacing: "0.08em",
            }}
          >
            GENERO
          </button>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: "2rem",
          }}
        >
          <div style={{ minWidth: "220px" }}>
            <select
              value={gender}
              onChange={(e) => setGender(e.target.value)}
              style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem" }}
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#e2e2e2",
                      textAlign: "center",
                      padding: "0.4rem",
                      fontWeight: "700",
                    }}
                  >
                    NOMBRE
                  </div>
                  <div
                    style={{
                      backgroundColor: "#e2e2e2",
                      textAlign: "center",
                      padding: "0.4rem",
                      fontWeight: "700",
                    }}
                  >
                    CATEGORIA
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    value={leftSearch}
                    onChange={(e) => setLeftSearch(e.target.value)}
                    placeholder="Buscar nombre"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #cfcfcf" }}
                  />
                  <input
                    type="text"
                    value={leftCategorySearch}
                    onChange={(e) => setLeftCategorySearch(e.target.value)}
                    placeholder="Buscar categoría"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #cfcfcf" }}
                  />
                </div>

                <select
                  value={leftPlayerName}
                  onChange={(e) => setLeftPlayerName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", marginBottom: "1rem" }}
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
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <div
                    style={{
                      backgroundColor: "#e2e2e2",
                      textAlign: "center",
                      padding: "0.4rem",
                      fontWeight: "700",
                    }}
                  >
                    NOMBRE
                  </div>
                  <div
                    style={{
                      backgroundColor: "#e2e2e2",
                      textAlign: "center",
                      padding: "0.4rem",
                      fontWeight: "700",
                    }}
                  >
                    CATEGORIA
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                    gap: "0.5rem",
                    marginBottom: "0.5rem",
                  }}
                >
                  <input
                    type="text"
                    value={rightSearch}
                    onChange={(e) => setRightSearch(e.target.value)}
                    placeholder="Buscar nombre"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #cfcfcf" }}
                  />
                  <input
                    type="text"
                    value={rightCategorySearch}
                    onChange={(e) => setRightCategorySearch(e.target.value)}
                    placeholder="Buscar categoría"
                    style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", border: "1px solid #cfcfcf" }}
                  />
                </div>

                <select
                  value={rightPlayerName}
                  onChange={(e) => setRightPlayerName(e.target.value)}
                  style={{ width: "100%", padding: "0.5rem", borderRadius: "0.25rem", marginBottom: "1rem" }}
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
                display: "grid",
                gap: "1rem",
                marginTop: "2rem",
              }}
            >
              <div
                style={{
                  backgroundColor: "#e2e2e2",
                  borderRadius: "0.25rem",
                  padding: "1rem",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                ELO PROMEDIO: {averageElo !== null ? averageElo : "—"}
              </div>
              <div
                style={{
                  backgroundColor: "#e2e2e2",
                  borderRadius: "0.25rem",
                  padding: "1rem",
                  textAlign: "center",
                  fontWeight: "700",
                }}
              >
                CATEGORIA SUGERIDA: {tableLoading ? "Cargando..." : averageCategory}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
