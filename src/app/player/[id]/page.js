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

export default function PlayerPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const playerId = params?.id ? decodeURIComponent(params.id) : "";
  const gender = searchParams?.get("gender") || "masculino";

  const [player, setPlayer] = useState(null);
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
        const found = players.find((p) => {
          const name = (
            p.NAME ||
            p.Name ||
            p.name ||
            p.NOMBRE ||
            p.Nombre ||
            p.nombre ||
            ""
          ).trim();
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

  const name =
    player.NAME ||
    player.Name ||
    player.name ||
    player.NOMBRE ||
    player.Nombre ||
    player.nombre ||
    playerId;

  const foto = getFoto(player);
  const fotoSrc =
    buildGoogleDriveImageUrl(foto) || buildGoogleDriveThumbnailUrl(foto);

  const historico = parseFloat(
    player.SUM_OF_POINTS_HISTORICO || player.SUM_OF_POINTS_HIST || 0,
  );
  const global = parseFloat(player.SUM_OF_POINTS_GLOBAL || 0);
  const race = parseFloat(player.SUM_OF_POINTS_RACE || 0);
  const avgHistorico = parseFloat(
    player.AVERAGE_OF_POINTS_HISTORICO || player.AVG_OF_POINTS_HISTORICO || 0,
  ).toFixed(2);
  const torneos = parseInt(player.SUM_OF_TOURNAMENTS_HISTORICO || 0);
  const verified = player.VERIFIED === "TRUE" || player.VERIFIED === "1";

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
        {/* Botón Volver */}
        <Link
          href="/"
          style={{
            display: "inline-block",
            marginBottom: "2rem",
            color: "rgb(6, 182, 212)",
            textDecoration: "none",
            fontWeight: "600",
            transition: "all 0.3s ease-in-out",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.color = "rgb(8, 145, 178)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.color = "rgb(6, 182, 212)";
          }}
        >
          ← Volver al ranking
        </Link>

        {/* Hero Card con Foto y Nombre */}
        <div
          style={{
            backgroundColor: "white",
            borderRadius: "1.5rem",
            padding: "3rem 2rem",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            textAlign: "center",
            marginBottom: "2rem",
            animation: "slideUp 0.5s ease-out",
          }}
        >
          {fotoSrc && (
            <div style={{ marginBottom: "2rem" }}>
              <div
                style={{
                  width: "180px",
                  height: "180px",
                  borderRadius: "50%",
                  overflow: "hidden",
                  backgroundColor: "rgb(226, 232, 240)",
                  margin: "0 auto",
                  border: "6px solid rgb(6, 182, 212)",
                  boxShadow: "0 10px 25px -5px rgba(6, 182, 212, 0.3)",
                }}
              >
                <img
                  src={fotoSrc}
                  alt={name}
                  style={{ width: "100%", height: "100%", objectFit: "cover" }}
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
              </div>
            </div>
          )}

          <h1
            style={{
              fontSize: "2.5rem",
              fontWeight: "bold",
              color: "rgb(15, 23, 42)",
              marginBottom: "0.5rem",
            }}
          >
            {name}
          </h1>
          <p
            style={{
              fontSize: "1.125rem",
              color: "rgb(100, 116, 139)",
              marginBottom: "1.5rem",
            }}
          >
            {gender === "femenino" ? "👩 Femenino" : "👨 Masculino"} •{" "}
            {player.CATEGORY ||
              player.Category ||
              player.categoria ||
              "Sin categoría"}
          </p>
          {verified && (
            <span
              style={{
                display: "inline-block",
                backgroundColor: "rgb(34, 197, 94)",
                color: "white",
                padding: "0.5rem 1rem",
                borderRadius: "9999px",
                fontSize: "0.875rem",
                fontWeight: "600",
              }}
            >
              ✓ Jugador Verificado
            </span>
          )}
        </div>

        {/* Tarjetas de Estadísticas */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
            gap: "1.5rem",
            marginBottom: "2rem",
          }}
        >
          {/* Puntaje Histórico */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              borderLeft: "6px solid rgb(6, 182, 212)",
              animation: "slideUp 0.5s ease-out 0.1s both",
            }}
          >
            <p
              style={{
                color: "rgb(100, 116, 139)",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Puntaje Histórico
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "rgb(6, 182, 212)",
              }}
            >
              {historico}
            </p>
          </div>

          {/* Puntaje Global */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              borderLeft: "6px solid rgb(139, 92, 246)",
              animation: "slideUp 0.5s ease-out 0.2s both",
            }}
          >
            <p
              style={{
                color: "rgb(100, 116, 139)",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Puntaje Global (365d)
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "rgb(139, 92, 246)",
              }}
            >
              {global}
            </p>
          </div>

          {/* Puntaje Race */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              borderLeft: "6px solid rgb(234, 88, 12)",
              animation: "slideUp 0.5s ease-out 0.3s both",
            }}
          >
            <p
              style={{
                color: "rgb(100, 116, 139)",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Puntaje Race
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "rgb(234, 88, 12)",
              }}
            >
              {race}
            </p>
          </div>

          {/* Promedio */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              borderLeft: "6px solid rgb(34, 197, 94)",
              animation: "slideUp 0.5s ease-out 0.4s both",
            }}
          >
            <p
              style={{
                color: "rgb(100, 116, 139)",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Promedio
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "rgb(34, 197, 94)",
              }}
            >
              {avgHistorico}
            </p>
          </div>

          {/* Torneos */}
          <div
            style={{
              backgroundColor: "white",
              borderRadius: "1rem",
              padding: "1.5rem",
              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
              borderLeft: "6px solid rgb(14, 165, 233)",
              animation: "slideUp 0.5s ease-out 0.5s both",
            }}
          >
            <p
              style={{
                color: "rgb(100, 116, 139)",
                fontSize: "0.875rem",
                fontWeight: "500",
                marginBottom: "0.5rem",
              }}
            >
              Torneos
            </p>
            <p
              style={{
                fontSize: "2rem",
                fontWeight: "bold",
                color: "rgb(14, 165, 233)",
              }}
            >
              {torneos}
            </p>
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
