"use client";

import Link from "next/link";
import {
  buildGoogleDriveImageUrl,
  buildGoogleDriveThumbnailUrl,
} from "@/lib/sheets";

export default function RankingTable({ players, scoreType, allPlayers = [] }) {
  const scoreLabel = {
    SUM_OF_POINTS_HISTORICO: "Histórico",
    SUM_OF_POINTS_GLOBAL: "Global",
    SUM_OF_POINTS_RACE: "Race",
  }[scoreType];

  const getFoto = (p) => (p?.FOTO || p?.Foto || p?.foto || "").trim();

  const tournamentKey = scoreType.replace(
    "SUM_OF_POINTS",
    "SUM_OF_TOURNAMENTS"
  );

  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = parseFloat(a[scoreType]) || 0;
    const scoreB = parseFloat(b[scoreType]) || 0;
    return scoreB - scoreA;
  });

  // Calcular el ranking global
  const globalSortedPlayers = [
    ...(allPlayers.length > 0 ? allPlayers : players),
  ].sort((a, b) => {
    const scoreA = parseFloat(a[scoreType]) || 0;
    const scoreB = parseFloat(b[scoreType]) || 0;
    return scoreB - scoreA;
  });

  const getGlobalRank = (player) => {
    return (
      globalSortedPlayers.findIndex((p) => p.NAME === player.NAME) + 1 || "—"
    );
  };

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const tableStyles = {
    wrapper: {
      overflowX: "auto",
    },
    table: {
      width: "100%",
      borderCollapse: "collapse",
    },
    thead: {
      background:
        "linear-gradient(to right, rgb(6, 182, 212), rgb(139, 92, 246))",
      color: "white",
      borderBottom: "4px solid rgb(8, 145, 178)",
    },
    th: {
      padding: "1.5rem 1.5rem",
      textAlign: "left",
      fontSize: "0.875rem",
      fontWeight: "600",
    },
    tbody: {
      borderSpacing: "0",
    },
    tr: {
      borderBottom: "1px solid rgb(226, 232, 240)",
      transition: "background-color 0.3s ease-in-out",
    },
    trHover: {
      backgroundColor: "rgb(219, 234, 254)",
    },
    td: {
      padding: "1.5rem 1.5rem",
    },
    rankCell: {
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
      fontSize: "1.125rem",
      fontWeight: "bold",
    },
    playerCell: {
      display: "flex",
      alignItems: "center",
      gap: "0.75rem",
    },
    playerImage: {
      width: "2.5rem",
      height: "2.5rem",
      borderRadius: "50%",
      objectFit: "cover",
      border: "2px solid rgb(186, 225, 247)",
    },
    playerLink: {
      fontWeight: "600",
      color: "rgb(6, 182, 212)",
      textDecoration: "none",
      transition: "color 0.3s ease-in-out",
    },
    playerLinkHover: {
      color: "rgb(8, 145, 178)",
      textDecoration: "underline",
    },
    badge: {
      display: "inline-block",
      backgroundColor: "rgb(165, 243, 252)",
      color: "rgb(8, 145, 178)",
      fontSize: "0.75rem",
      fontWeight: "600",
      padding: "0.25rem 0.75rem",
      borderRadius: "9999px",
    },
    scoreCell: {
      textAlign: "center",
      fontWeight: "bold",
      fontSize: "1.125rem",
      color: "rgb(15, 23, 42)",
    },
    averageCell: {
      textAlign: "center",
      color: "rgb(71, 85, 105)",
      fontWeight: "500",
    },
    tournamentsCell: {
      textAlign: "center",
      display: "inline-flex",
      alignItems: "center",
      gap: "0.25rem",
      backgroundColor: "rgb(221, 214, 254)",
      color: "rgb(88, 28, 135)",
      padding: "0.25rem 0.75rem",
      borderRadius: "0.5rem",
      fontWeight: "600",
    },
  };

  return (
    <div style={tableStyles.wrapper}>
      <table style={tableStyles.table}>
        <thead style={tableStyles.thead}>
          <tr>
            <th style={tableStyles.th}>#</th>
            <th style={tableStyles.th}>Jugador</th>
            <th style={tableStyles.th}>Categoría</th>
            <th style={{ ...tableStyles.th, textAlign: "center" }}>
              Global 🌍
            </th>
            <th style={{ ...tableStyles.th, textAlign: "center" }}>Puntos</th>
            <th style={{ ...tableStyles.th, textAlign: "center" }}>Promedio</th>
            <th style={{ ...tableStyles.th, textAlign: "center" }}>Torneos</th>
          </tr>
        </thead>
        <tbody style={tableStyles.tbody}>
          {sortedPlayers.map((player, index) => {
            const averageKey = scoreType.replace(
              "SUM_OF_POINTS",
              "AVERAGE_OF_POINTS"
            );
            const fotoValue = getFoto(player);
            const fotoSrc =
              buildGoogleDriveImageUrl(fotoValue) ||
              buildGoogleDriveThumbnailUrl(fotoValue, 120);
            const medal = getMedalEmoji(index);

            return (
              <tr
                key={player.INDEX || index}
                style={tableStyles.tr}
                onMouseOver={(e) =>
                  (e.currentTarget.style.backgroundColor = "rgb(219, 234, 254)")
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.backgroundColor = "transparent")
                }
              >
                <td style={tableStyles.td}>
                  <div style={tableStyles.rankCell}>
                    {medal ? (
                      <span style={{ fontSize: "1.5rem" }}>{medal}</span>
                    ) : (
                      <span style={{ color: "rgb(100, 116, 139)" }}>
                        {index + 1}
                      </span>
                    )}
                  </div>
                </td>
                <td style={tableStyles.td}>
                  <div style={tableStyles.playerCell}>
                    {fotoSrc && (
                      <img
                        src={fotoSrc}
                        alt={player.NAME}
                        style={tableStyles.playerImage}
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const thumb = buildGoogleDriveThumbnailUrl(
                            fotoValue,
                            120
                          );
                          if (thumb && e.currentTarget.src !== thumb) {
                            e.currentTarget.src = thumb;
                            return;
                          }
                          e.currentTarget.onerror = null;
                          e.currentTarget.style.display = "none";
                        }}
                      />
                    )}
                    <Link
                      href={`/player/${encodeURIComponent(
                        player.NAME
                      )}?gender=${player.gender}`}
                      style={tableStyles.playerLink}
                      onMouseOver={(e) => {
                        e.currentTarget.style.color = "rgb(8, 145, 178)";
                        e.currentTarget.style.textDecoration = "underline";
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.color = "rgb(6, 182, 212)";
                        e.currentTarget.style.textDecoration = "none";
                      }}
                    >
                      {player.NAME}
                    </Link>
                  </div>
                </td>
                <td style={tableStyles.td}>
                  <span style={tableStyles.badge}>
                    {player.CATEGORY || "—"}
                  </span>
                </td>
                <td style={tableStyles.scoreCell}>
                  <span
                    style={{
                      backgroundColor: "rgb(34, 197, 94)",
                      color: "white",
                      padding: "0.25rem 0.75rem",
                      borderRadius: "0.5rem",
                      fontSize: "0.95rem",
                      fontWeight: "bold",
                    }}
                  >
                    #{getGlobalRank(player)}
                  </span>
                </td>
                <td style={tableStyles.scoreCell}>{player[scoreType] || 0}</td>
                <td style={tableStyles.averageCell}>
                  {parseFloat(player[averageKey] || 0).toFixed(2)}
                </td>
                <td style={tableStyles.td}>
                  <div style={tableStyles.tournamentsCell}>
                    {player[tournamentKey] || 0}
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
