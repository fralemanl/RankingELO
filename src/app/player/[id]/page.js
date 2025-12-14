"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchPlayers, fetchGames } from "@/lib/sheets";
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

  useEffect(() => {
    if (!playerId) return;
    let mounted = true;
    setLoading(true);
    fetchPlayers(gender)
      .then((players) => {
        if (!mounted) return;
        // Apoya distintos nombres de columna (NAME, Name, nombre, NOMBRE)
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

  // Carga la hoja de juegos y filtra por el jugador cuando esté disponible
  useEffect(() => {
    let mounted = true;
    if (!player) {
      setGames([]);
      setFilteredGames([]);
      return;
    }

    // fetchGames devuelve [] si no está configurado el GID en `sheets.js`
    fetchGames()
      .then((rows) => {
        if (!mounted) return;
        setGames(rows || []);

        const nameCandidates = [
          player.NAME,
          player.Name,
          player.name,
          player.NOMBRE,
          player.Nombre,
          player.nombre,
        ].filter(Boolean).map((s) => String(s).trim().toLowerCase());

        // Filtrar filas donde cualquier valor de la fila contiene el nombre del jugador
        const matches = (rows || []).filter((row) => {
          for (const v of Object.values(row)) {
            if (!v) continue;
            const txt = String(v).toLowerCase();
            for (const n of nameCandidates) {
              if (n && txt.includes(n)) return true;
            }
          }
          return false;
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
      <div style={{ padding: 16 }}>
        <p>Parámetro de jugador no proporcionado.</p>
        <Link href="/">← Volver al ranking</Link>
      </div>
    );
  }

  if (loading) {
    return <p style={{ textAlign: "center", padding: "2rem" }}>Cargando…</p>;
  }

  if (!player) {
    return (
      <div className="player-card">
        <Link href="/" className="back-button">
          ← Volver al ranking
        </Link>
        <p>Jugador no encontrado: {playerId}</p>
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

  return (
    <div className="player-card">
      <Link href="/" className="back-button">
        ← Volver al ranking
      </Link>

      <h2>{name}</h2>

      <div className="player-info">
        <div className="info-item">
          <label>Categoría</label>
          <span>
            {player.CATEGORY || player.Category || player.categoria || "-"}
          </span>
        </div>
        <div className="info-item">
          <label>Género</label>
          <span>{gender === "femenino" ? "Femenino" : "Masculino"}</span>
        </div>
        <div className="info-item">
          <label>Puntaje Histórico</label>
          <span>
            {player.SUM_OF_POINTS_HISTORICO || player.SUM_OF_POINTS_HIST || 0}
          </span>
        </div>
        <div className="info-item">
          <label>Puntaje Global (365 días)</label>
          <span>{player.SUM_OF_POINTS_GLOBAL || 0}</span>
        </div>
        <div className="info-item">
          <label>Puntaje Race</label>
          <span>{player.SUM_OF_POINTS_RACE || 0}</span>
        </div>

        <div className="info-item">
          <label>Promedio Histórico</label>
          <span>
            {parseFloat(
              player.AVERAGE_OF_POINTS_HISTORICO ||
                player.AVG_OF_POINTS_HISTORICO ||
                0
            ).toFixed(2)}
          </span>
        </div>

        <div className="info-item">
          <label>Torneos (Histórico)</label>
          <span>{player.SUM_OF_TOURNAMENTS_HISTORICO || 0}</span>
        </div>

        <div className="info-item">
          <label>Verificado</label>
          <span>
            {player.VERIFIED === "TRUE" || player.VERIFIED === "1"
              ? "✓ Sí"
              : "✗ No"}
          </span>
        </div>
      </div>

      <section style={{ marginTop: 24, textAlign: "center" }}>
        <h3>Estadísticas</h3>
        <PlayerRadar player={player} />
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Resultados</h3>
        {filteredGames.length === 0 ? (
          <p>Sin resultados registrados para este jugador (o configurar `GAMES_SHEET_GID`).</p>
        ) : (
          <div className="games-table" style={{ overflowX: "auto" }}>
            <table style={{ fontSize: "0.85rem" }}>
              <thead>
                <tr>
                  <th>Fecha</th>
                  <th>Torneo</th>
                  <th>Categoría</th>
                  <th>Pareja</th>
                  <th>Posición</th>
                  <th>Puntos</th>
                </tr>
              </thead>
              <tbody>
                {filteredGames.map((r, idx) => (
                  <tr key={idx}>
                    <td>{r.DATE || r.Date || r.date || r.FECHA || r.Fecha || r.fecha || "-"}</td>
                    <td>{r.TOURNAMENT || r.Tournament || r.tournament || r.TORNEO || r.Torneo || r.torneo || r.TOURNAMENT_NAME || r.NAME || "-"}</td>
                    <td>{r.CATEGORY || r.Category || r.category || r.CATEGORIA || r.Categoria || r.categoria || "-"}</td>
                    <td>{r.COUPLE_NAME || r.Couple_Name || r.couple_name || r.PARTNER || r.Partner || r.partner || r.PAREJA || r.Pareja || r.pareja || r.PARTNER_NAME || "-"}</td>
                    <td>{r.POSITION || r.Position || r.position || r.POSICION || r.Posicion || r.posicion || "-"}</td>
                    <td>{r.POINTS || r.Points || r.points || r.PUNTOS || r.Puntos || r.puntos || "-"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
