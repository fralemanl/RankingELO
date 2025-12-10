"use client";

import { useEffect, useState } from "react";
import { useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { fetchPlayers } from "@/lib/sheets";

export default function PlayerPageClient() {
  const params = useParams();
  const searchParams = useSearchParams();

  const playerId = params?.id ? decodeURIComponent(params.id) : "";
  const gender = searchParams?.get("gender") || "masculino";

  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);

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
    </div>
  );
}
