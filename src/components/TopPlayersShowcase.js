"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  buildGoogleDriveImageUrl,
  buildGoogleDriveThumbnailUrl,
} from "@/lib/sheets";

export default function TopPlayersShowcase({ players, gender, scoreType }) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const getFoto = (p) => (p?.FOTO || p?.Foto || p?.foto || "").trim();

  const sortedPlayers = [...players].sort((a, b) => {
    const scoreA = parseFloat(a[scoreType]) || 0;
    const scoreB = parseFloat(b[scoreType]) || 0;
    return scoreB - scoreA;
  });

  const topPlayers = sortedPlayers.slice(0, 10);

  // Auto-rotate cada 4 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % topPlayers.length);
    }, 4000);
    return () => clearInterval(interval);
  }, [topPlayers.length]);

  const getMedalEmoji = (index) => {
    if (index === 0) return "🥇";
    if (index === 1) return "🥈";
    if (index === 2) return "🥉";
    return null;
  };

  const getMedalColor = (index) => {
    if (index === 0) return "rgb(234, 179, 8)";
    if (index === 1) return "rgb(156, 163, 175)";
    if (index === 2) return "rgb(205, 92, 92)";
    return "rgb(6, 182, 212)";
  };

  const getPlayerName = (p) => {
    return p.NAME || p.Name || p.name || p.NOMBRE || p.Nombre || p.nombre || "Jugador";
  };

  if (topPlayers.length === 0) return null;

  const player = topPlayers[currentIndex];
  const foto = getFoto(player);
  const fotoSrc =
    buildGoogleDriveImageUrl(foto) ||
    buildGoogleDriveThumbnailUrl(foto);
  const medal = getMedalEmoji(currentIndex);
  const medalColor = getMedalColor(currentIndex);
  const playerName = getPlayerName(player);
  const score = parseFloat(player[scoreType]) || 0;

  return (
    <section
      style={{
        marginBottom: "3rem",
        animation: "fadeIn 0.6s ease-in-out",
        width: "80%",
        margin: "0 auto 3rem auto",
      }}
    >
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "2rem",
        }}
      >
        {/* Carrusel */}
        <div
          style={{
            padding: "2rem",
            backgroundColor: "transparent",
            backgroundImage: "url('/bgcarrousel.png')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
            borderRadius: "0",
            boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            minHeight: "252px",
            position: "relative",
            gap: "3rem",
          }}
        >
          {/* Botones de navegación */}
          <button
            onClick={() => setCurrentIndex((prev) => (prev - 1 + topPlayers.length) % topPlayers.length)}
            style={{
              position: "absolute",
              left: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: medalColor,
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "2.5rem",
              height: "2.5rem",
              cursor: "pointer",
              fontSize: "1.25rem",
              fontWeight: "bold",
              transition: "all 0.3s ease-in-out",
              zIndex: 10,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              e.currentTarget.style.boxShadow = `0 8px 16px -2px ${medalColor}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(-50%)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ◀
          </button>

          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % topPlayers.length)}
            style={{
              position: "absolute",
              right: "1rem",
              top: "50%",
              transform: "translateY(-50%)",
              backgroundColor: medalColor,
              color: "white",
              border: "none",
              borderRadius: "50%",
              width: "2.5rem",
              height: "2.5rem",
              cursor: "pointer",
              fontSize: "1.25rem",
              fontWeight: "bold",
              transition: "all 0.3s ease-in-out",
              zIndex: 10,
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.transform = "translateY(-50%) scale(1.1)";
              e.currentTarget.style.boxShadow = `0 8px 16px -2px ${medalColor}`;
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.transform = "translateY(-50%)";
              e.currentTarget.style.boxShadow = "none";
            }}
          >
            ▶
          </button>

          {/* Contenido del jugador con animación */}
          <Link
            key={currentIndex}
            href={`/player/${encodeURIComponent(playerName)}?gender=${gender}`}
            style={{ textDecoration: "none", flex: 1, display: "flex", justifyContent: "center" }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "0.25rem",
                width: "100%",
                maxWidth: "800px",
                animation: "slideIn 0.5s ease-out",
                cursor: "pointer",
              }}
            >
              {/* Posición Grande a la Izquierda */}
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: "120px",
                  height: "120px",
                  borderRadius: "50%",
                  backgroundColor: medalColor,
                  color: "white",
                  fontWeight: "bold",
                  fontSize: "3rem",
                  boxShadow: `0 8px 24px -4px ${medalColor}`,
                  flexShrink: 0,
                }}
              >
                {medal || currentIndex + 1}
              </div>

              {/* Contenido Centro */}
              <div
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  gap: "0.75rem",
                  paddingLeft: "1rem",
                }}
              >
                {/* Nombre */}
                <div>
                  <h3
                    style={{
                      fontSize: "2.5rem",
                      fontWeight: "300",
                      color: "white",
                      margin: "0",
                      fontFamily: "'Segoe UI', 'Roboto', 'Helvetica Neue', sans-serif",
                      letterSpacing: "0.5px",
                    }}
                  >
                    {playerName}
                  </h3>
                </div>

                {/* Categoría */}
                <span
                  style={{
                    display: "inline-block",
                    backgroundColor: "rgb(165, 243, 252)",
                    color: "rgb(8, 145, 178)",
                    padding: "0.4rem 0.8rem",
                    borderRadius: "9999px",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    width: "fit-content",
                  }}
                >
                  {player.CATEGORY || player.Category || player.categoria || "-"}
                </span>

                {/* Puntaje */}
                <div
                  style={{
                    padding: "0.75rem 1.25rem",
                    backgroundColor: medalColor,
                    borderRadius: "0.75rem",
                    color: "white",
                    display: "flex",
                    alignItems: "center",
                    gap: "0.75rem",
                    width: "fit-content",
                  }}
                >
                  <div>
                    <p
                      style={{
                        fontSize: "0.75rem",
                        fontWeight: "600",
                        opacity: "0.95",
                        margin: "0 0 0.2rem 0",
                      }}
                    >
                      Puntos
                    </p>
                    <p style={{ fontSize: "1.5rem", fontWeight: "bold", margin: "0" }}>
                      {score}
                    </p>
                  </div>
                </div>
              </div>

              {/* Foto Derecha */}
              <div
                style={{
                  flexShrink: 0,
                }}
              >
                {/* Foto */}
                {fotoSrc && (
                  <div
                    style={{
                      width: "200px",
                      height: "320px",
                      borderRadius: "0",
                      overflow: "hidden",
                      backgroundColor: "transparent",
                      boxShadow: `0 12px 24px -4px ${medalColor}80`,
                    }}
                  >
                    <img
                      src={fotoSrc}
                      alt={playerName}
                      style={{
                        width: "100%",
                        height: "100%",
                        objectFit: "cover",
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
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        {/* Indicadores de posición - Abajo y Centrado */}
        <div
          style={{
            display: "flex",
            gap: "0.5rem",
            justifyContent: "center",
            flexWrap: "wrap",
          }}
        >
          {topPlayers.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              style={{
                width: idx === currentIndex ? "2rem" : "0.75rem",
                height: "0.75rem",
                borderRadius: "9999px",
                backgroundColor:
                  idx === currentIndex
                    ? medalColor
                    : "rgb(226, 232, 240)",
                border: "none",
                cursor: "pointer",
                transition: "all 0.3s ease-in-out",
              }}
              onMouseOver={(e) => {
                if (idx !== currentIndex) {
                  e.currentTarget.style.backgroundColor = "rgb(203, 213, 225)";
                }
              }}
              onMouseOut={(e) => {
                if (idx !== currentIndex) {
                  e.currentTarget.style.backgroundColor = "rgb(226, 232, 240)";
                }
              }}
            />
          ))}
        </div>
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideIn {
          from { 
            opacity: 0;
            transform: translateY(20px);
          }
          to { 
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </section>
  );
}
