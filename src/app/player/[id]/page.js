"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  fetchPlayers,
  fetchGames,
  buildGoogleDriveImageUrl,
  buildGoogleDriveThumbnailUrl,
} from "@/lib/sheets";
import PlayerRadar from "@/components/PlayerRadar";

const COLUMN_INDEX = {
  NAME: 1, // B
  POINTS: 2, // C
  ELO: 3, // D
  CATEGORY: 4, // E
  TOURNAMENTS: 5, // F
  MATCHES: 6, // G
  WINS: 7, // H
  EFFECTIVENESS: 8, // I
  VERIFIED: 9, // J
  RADAR_START: 10, // K
  RADAR_END: 16, // Q
  PHOTO: 17, // R
  NATIONALITY: 18, // S
  POINTS_AVG: 19, // T
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

const RADAR_FALLBACK_LABELS = ["K", "L", "M", "N", "O", "P", "Q"];

const normalizeText = (value) =>
  String(value || "")
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

const getFlagImagePath = (nationality) => {
  const key = normalizeText(nationality);
  if (!key) return "";
  if (key === "panama") return "/flags/pa.png";
  if (key === "colombia") return "/flags/co.png";
  if (key === "argentina") return "/flags/ar.png";
  if (key === "espana") return "/flags/es.png";
  if (key === "paraguay") return "/flags/py.png";
  if (key === "venezuela") return "/flags/ve.png";
  if (key === "chile" || key.startsWith("chil")) return "/flags/cl.png";
  return "";
};

export default function PlayerPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const playerId = params?.id ? decodeURIComponent(params.id) : "";
  const gender = searchParams?.get("gender") || "masculino";
  const category = searchParams?.get("category") || "all";

  const [player, setPlayer] = useState(null);
  const [allPlayers, setAllPlayers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [games, setGames] = useState([]);
  const [filteredGames, setFilteredGames] = useState([]);

  const getFoto = (p) => (p?.FOTO || p?.Foto || p?.foto || "").trim();

  useEffect(() => {
    if (!playerId) return;
    let mounted = true;
    setLoading(true);
    fetchPlayers(gender)
      .then((players) => {
        if (!mounted) return;
        const normalized = (players || []).map((row) => {
          const name = getColumnValue(row, COLUMN_INDEX.NAME);
          const pointsValue = getColumnValue(row, COLUMN_INDEX.POINTS);
          const pointsAvgValue = getColumnValue(row, COLUMN_INDEX.POINTS_AVG);
          const categoryValue = getColumnValue(row, COLUMN_INDEX.CATEGORY);
          const eloValue = getColumnValue(row, COLUMN_INDEX.ELO);
          const photoValue = getColumnValue(row, COLUMN_INDEX.PHOTO);
          const nationalityValue = getColumnValue(
            row,
            COLUMN_INDEX.NATIONALITY,
          );
          const tournaments = getColumnValue(row, COLUMN_INDEX.TOURNAMENTS);
          const matches = getColumnValue(row, COLUMN_INDEX.MATCHES);
          const wins = getColumnValue(row, COLUMN_INDEX.WINS);
          const effectiveness = getColumnValue(row, COLUMN_INDEX.EFFECTIVENESS);
          const verified = getColumnValue(row, COLUMN_INDEX.VERIFIED);
          const headers = row?.__headers || [];
          const radarStats = [];
          for (
            let idx = COLUMN_INDEX.RADAR_START;
            idx <= COLUMN_INDEX.RADAR_END;
            idx += 1
          ) {
            const label =
              headers[idx] ||
              RADAR_FALLBACK_LABELS[idx - COLUMN_INDEX.RADAR_START];
            radarStats.push({
              stat: label || `Col ${idx + 1}`,
              value: parseFloat(getColumnValue(row, idx)) || 0,
            });
          }
          return {
            NAME: name,
            POINTS: pointsValue,
            POINTS_AVG: pointsAvgValue,
            CATEGORY: categoryValue,
            ELO: parseEloValue(eloValue),
            ELO_DISPLAY: eloValue,
            FOTO: photoValue,
            TOURNAMENTS: tournaments,
            MATCHES: matches,
            WINS: wins,
            EFFECTIVENESS: effectiveness,
            VERIFIED: verified,
            NATIONALITY: nationalityValue,
            RADAR_STATS: radarStats,
            gender,
            _raw: row,
          };
        });
        setAllPlayers(normalized);
        const found = normalized.find((p) => {
          const name = (p.NAME || "").trim();
          return name && name === playerId;
        });
        setPlayer(found || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching player:", err);
        if (!mounted) return;
        setPlayer(null);
        setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [playerId, gender]);

  useEffect(() => {
    let mounted = true;
    if (!player) {
      setGames([]);
      setFilteredGames([]);
      return;
    }

    fetchGames()
      .then((rows) => {
        if (!mounted) return;
        setGames(rows || []);

        const playerName =
          [
            player.NAME,
            player.Name,
            player.name,
            player.NOMBRE,
            player.Nombre,
            player.nombre,
          ].filter(Boolean)[0] || "";

        const matches = (rows || []).filter((row) => {
          const playerNameColumn = (
            row.PLAYER_NAME ||
            row.Player_Name ||
            row.player_name ||
            ""
          ).trim();
          return (
            playerNameColumn &&
            playerNameColumn.toLowerCase() === playerName.toLowerCase()
          );
        });

        matches.sort((a, b) => {
          const dateA =
            a.DATE || a.Date || a.date || a.FECHA || a.Fecha || a.fecha || "";
          const dateB =
            b.DATE || b.Date || b.date || b.FECHA || b.Fecha || b.fecha || "";
          return new Date(dateA) - new Date(dateB);
        });

        setFilteredGames(matches);
      })
      .catch((err) => {
        console.error("Error fetching games:", err);
        if (!mounted) return;
        setGames([]);
        setFilteredGames([]);
      });

    return () => {
      mounted = false;
    };
  }, [player]);

  if (!playerId) {
    return (
      <div style={{ padding: "2rem", textAlign: "center" }}>
        <p>Parámetro de jugador no proporcionado.</p>
        <Link
          href="/"
          style={{
            color: "rgb(6, 182, 212)",
            textDecoration: "none",
            fontWeight: "600",
          }}
        >
          ← Volver al ranking
        </Link>
      </div>
    );
  }

  if (loading) {
    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          minHeight: "80vh",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
          }}
        >
          <div
            style={{
              animation: "spin 1s linear infinite",
              borderRadius: "50%",
              height: "3rem",
              width: "3rem",
              borderBottom: "2px solid rgb(6, 182, 212)",
              marginBottom: "1rem",
            }}
          ></div>
          <p style={{ color: "rgb(71, 85, 105)", fontWeight: "500" }}>
            Cargando…
          </p>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div
        style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1rem" }}
      >
        <Link
          href={`/?gender=${encodeURIComponent(
            gender,
          )}&category=${encodeURIComponent(category)}`}
          style={{
            color: "rgb(6, 182, 212)",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-block",
            marginBottom: "2rem",
          }}
        >
          ← Volver al ranking
        </Link>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1rem",
            padding: "2rem",
            textAlign: "center",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
          }}
        >
          <p style={{ color: "rgb(71, 85, 105)", fontSize: "1.125rem" }}>
            Jugador no encontrado: {playerId}
          </p>
        </div>
      </div>
    );
  }

  const name = player.NAME || playerId;

  const foto = getFoto(player);
  const fotoSrc =
    buildGoogleDriveImageUrl(foto) || buildGoogleDriveThumbnailUrl(foto);

  const eloDisplay = player.ELO_DISPLAY || player.ELO || 0;
  const points = player.POINTS || 0;
  const pointsAvg = player.POINTS_AVG || 0;
  const torneos = player.TOURNAMENTS || 0;
  const partidos = player.MATCHES || 0;
  const ganados = player.WINS || 0;
  const efectividad = player.EFFECTIVENESS || 0;
  const verified =
    String(player.VERIFIED || "").toLowerCase() === "true" ||
    String(player.VERIFIED || "").toLowerCase() === "1" ||
    String(player.VERIFIED || "").toLowerCase() === "si";
  const nationality = player.NATIONALITY || "";
  const flagImagePath = getFlagImagePath(nationality);

  const globalRank = (() => {
    if (!allPlayers.length) return "—";
    const sorted = [...allPlayers].sort((a, b) => {
      const scoreA = parseFloat(a.ELO) || 0;
      const scoreB = parseFloat(b.ELO) || 0;
      return scoreB - scoreA;
    });
    const index = sorted.findIndex((p) => p.NAME === player.NAME);
    return index >= 0 ? index + 1 : "—";
  })();

  return (
    <div
      style={{
        background:
          "linear-gradient(to bottom, rgb(241, 245, 249), rgb(226, 232, 240))",
        minHeight: "100vh",
        paddingBottom: "3rem",
      }}
    >
      <div
        style={{ maxWidth: "80rem", margin: "0 auto", padding: "2rem 1rem" }}
      >
        <Link
          href="/"
          style={{
            color: "rgb(6, 182, 212)",
            textDecoration: "none",
            fontWeight: "600",
            display: "inline-block",
            marginBottom: "2rem",
          }}
        >
          ← Volver al ranking
        </Link>
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            padding: "2.5rem",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            marginBottom: "2rem",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "2rem",
              alignItems: "center",
            }}
          >
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1.5rem",
                alignItems: "center",
              }}
            >
              {fotoSrc && (
                <img
                  src={fotoSrc}
                  alt={name}
                  style={{
                    width: "200px",
                    height: "260px",
                    borderRadius: "1rem",
                    objectFit: "cover",
                    border: "4px solid rgb(6, 182, 212)",
                    boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.3)",
                  }}
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const thumb = buildGoogleDriveThumbnailUrl(foto);
                    if (thumb && e.currentTarget.src !== thumb) {
                      e.currentTarget.src = thumb;
                      return;
                    }
                    e.currentTarget.onerror = null;
                    e.currentTarget.style.display = "none";
                  }}
                />
              )}
              <div style={{ textAlign: "center" }}>
                <h1
                  style={{
                    fontSize: "2.5rem",
                    fontWeight: "700",
                    margin: 0,
                    color: "rgb(15, 23, 42)",
                  }}
                >
                  {name}
                </h1>
                <p
                  style={{
                    margin: "0.5rem 0 0",
                    color: "rgb(71, 85, 105)",
                    fontSize: "1.125rem",
                  }}
                >
                  Categoría: {player.CATEGORY || "—"}
                </p>
                <p
                  style={{
                    margin: "0.35rem 0 0",
                    color: "rgb(71, 85, 105)",
                    fontSize: "1.05rem",
                    display: "flex",
                    alignItems: "flex-start",
                    justifyContent: "center",
                    gap: "0.5rem",
                    flexWrap: "wrap",
                  }}
                >
                  <span>Nacionalidad: {player.NATIONALITY || "—"}</span>
                  {flagImagePath ? (
                    <img
                      src={flagImagePath}
                      alt={nationality ? `Bandera ${nationality}` : "Bandera"}
                      style={{
                        width: "60px",
                        height: "30px",
                        objectFit: "cover",
                        borderRadius: "6px",
                        boxShadow: "0 2px 6px rgba(0, 0, 0, 0.2)",
                      }}
                      onError={(e) => {
                        e.currentTarget.style.display = "none";
                      }}
                    />
                  ) : null}
                </p>
              </div>
            </div>

            <div
              style={{
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
              }}
            >
              <div
                style={{
                  background:
                    "linear-gradient(135deg, rgb(6, 182, 212), rgb(14, 116, 144))",
                  color: "white",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  boxShadow: "0 10px 20px -5px rgba(6, 182, 212, 0.35)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: "1rem",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "2.5rem",
                  }}
                >
                  <div>
                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                      ELO
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "2.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {eloDisplay}
                    </p>
                  </div>
                  <div>
                    <p style={{ margin: 0, fontSize: "0.9rem", opacity: 0.9 }}>
                      Puntos
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "2.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {points}
                    </p>
                  </div>
                </div>
                <div
                  style={{
                    textAlign: "right",
                    backgroundColor: "rgba(255, 255, 255, 0.2)",
                    borderRadius: "0.75rem",
                    padding: "0.5rem 0.75rem",
                  }}
                >
                  <p style={{ margin: 0, fontSize: "0.75rem", opacity: 0.9 }}>
                    Ranking Global
                  </p>
                  <p
                    style={{ margin: 0, fontSize: "1.4rem", fontWeight: "700" }}
                  >
                    #{globalRank}
                  </p>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "rgb(248, 250, 252)",
                  borderRadius: "1rem",
                  padding: "1.5rem",
                  border: "1px solid rgb(226, 232, 240)",
                }}
              >
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
                    gap: "1rem",
                  }}
                >
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgb(100, 116, 139)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Torneos jugados
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {torneos}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgb(100, 116, 139)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Partidos jugados
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {partidos}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgb(100, 116, 139)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Partidos ganados
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {ganados}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgb(100, 116, 139)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Efectividad
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {efectividad}
                    </p>
                  </div>
                  <div>
                    <p
                      style={{
                        margin: 0,
                        color: "rgb(100, 116, 139)",
                        fontSize: "0.8rem",
                      }}
                    >
                      Puntos promedio
                    </p>
                    <p
                      style={{
                        margin: 0,
                        fontSize: "1.5rem",
                        fontWeight: "700",
                      }}
                    >
                      {pointsAvg}
                    </p>
                  </div>
                </div>
              </div>

              <div
                style={{
                  backgroundColor: "white",
                  borderRadius: "1rem",
                  padding: "1rem 1.25rem",
                  border: "1px solid rgb(226, 232, 240)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <p
                  style={{
                    margin: 0,
                    fontWeight: "600",
                    color: "rgb(51, 65, 85)",
                  }}
                >
                  Verificado
                </p>
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "0.5rem",
                    color: verified ? "rgb(34, 197, 94)" : "rgb(148, 163, 184)",
                    fontWeight: "600",
                  }}
                >
                  {verified ? (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg
                      width="20"
                      height="20"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <span>{verified ? "Verificado" : "No verificado"}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Características (Radar) */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            marginBottom: "2rem",
            animation: "slideUp 0.5s ease-out 0.6s both",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "rgb(15, 23, 42)",
              marginBottom: "1.5rem",
              textAlign: "center",
            }}
          >
            📊 Características
          </h2>
          <PlayerRadar player={player} />
        </div>

        {/* Resultados */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            padding: "2rem",
            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
            animation: "slideUp 0.5s ease-out 0.7s both",
          }}
        >
          <h2
            style={{
              fontSize: "1.5rem",
              fontWeight: "bold",
              color: "rgb(15, 23, 42)",
              marginBottom: "1.5rem",
            }}
          >
            🏆 Resultados
          </h2>

          {filteredGames.length === 0 ? (
            <div
              style={{
                textAlign: "center",
                padding: "2rem",
                backgroundColor: "rgb(241, 245, 249)",
                borderRadius: "1rem",
              }}
            >
              <p style={{ color: "rgb(100, 116, 139)", fontSize: "1rem" }}>
                Sin resultados registrados para este jugador
              </p>
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table
                style={{
                  width: "100%",
                  borderCollapse: "collapse",
                  fontSize: "0.95rem",
                }}
              >
                <thead>
                  <tr
                    style={{
                      background:
                        "linear-gradient(to right, rgb(6, 182, 212), rgb(139, 92, 246))",
                      color: "white",
                      borderBottom: "3px solid rgb(8, 145, 178)",
                    }}
                  >
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      📅 Fecha
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      🏅 Torneo
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      📂 Categoría
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "left",
                        fontWeight: "600",
                      }}
                    >
                      👥 Pareja
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      🥇 Posición
                    </th>
                    <th
                      style={{
                        padding: "1rem",
                        textAlign: "center",
                        fontWeight: "600",
                      }}
                    >
                      ⭐ Puntos
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {filteredGames.map((r, idx) => (
                    <tr
                      key={idx}
                      style={{
                        borderBottom: "1px solid rgb(226, 232, 240)",
                        transition: "background-color 0.3s ease-in-out",
                      }}
                      onMouseOver={(e) =>
                        (e.currentTarget.style.backgroundColor =
                          "rgb(241, 245, 249)")
                      }
                      onMouseOut={(e) =>
                        (e.currentTarget.style.backgroundColor = "transparent")
                      }
                    >
                      <td style={{ padding: "1rem" }}>
                        {r.DATE ||
                          r.Date ||
                          r.date ||
                          r.FECHA ||
                          r.Fecha ||
                          r.fecha ||
                          "-"}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          fontWeight: "600",
                          color: "rgb(15, 23, 42)",
                        }}
                      >
                        {r.TOURNAMENT ||
                          r.Tournament ||
                          r.tournament ||
                          r.TORNEO ||
                          r.Torneo ||
                          r.torneo ||
                          r.TOURNAMENT_NAME ||
                          r.NAME ||
                          "-"}
                      </td>
                      <td style={{ padding: "1rem" }}>
                        <span
                          style={{
                            backgroundColor: "rgb(165, 243, 252)",
                            color: "rgb(8, 145, 178)",
                            padding: "0.25rem 0.75rem",
                            borderRadius: "9999px",
                            fontSize: "0.875rem",
                            fontWeight: "600",
                          }}
                        >
                          {r.CATEGORY ||
                            r.Category ||
                            r.category ||
                            r.CATEGORIA ||
                            r.Categoria ||
                            r.categoria ||
                            "-"}
                        </span>
                      </td>
                      <td style={{ padding: "1rem" }}>
                        {r.COUPLE_NAME ||
                          r.Couple_Name ||
                          r.couple_name ||
                          r.PARTNER ||
                          r.Partner ||
                          r.partner ||
                          r.PAREJA ||
                          r.Pareja ||
                          r.pareja ||
                          r.PARTNER_NAME ||
                          "-"}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "rgb(234, 88, 12)",
                        }}
                      >
                        {r.POSITION ||
                          r.Position ||
                          r.position ||
                          r.POSICION ||
                          r.Posicion ||
                          r.posicion ||
                          "-"}
                      </td>
                      <td
                        style={{
                          padding: "1rem",
                          textAlign: "center",
                          fontWeight: "bold",
                          color: "rgb(139, 92, 246)",
                          fontSize: "1.1rem",
                        }}
                      >
                        +
                        {r.POINTS ||
                          r.Points ||
                          r.points ||
                          r.PUNTOS ||
                          r.Puntos ||
                          r.puntos ||
                          "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
