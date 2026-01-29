"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPlayers } from "@/lib/sheets";
import Filters from "@/components/Filters";
import RankingTable from "@/components/RankingTable";
import TopPlayersShowcase from "@/components/TopPlayersShowcase";

export default function HomePage() {
  const [gender, setGender] = useState("masculino");
  const [category, setCategory] = useState("all");
  const [scoreType, setScoreType] = useState("SUM_OF_POINTS_GLOBAL");
  const [verified, setVerified] = useState("all");
  const [players, setPlayers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    fetchPlayers(gender)
      .then((data) => {
        if (!mounted) return;
        const mapped = data
          .filter(Boolean)
          .map((p) => ({ ...p, gender }))
          .filter((p) => p.NAME && p.NAME.trim() !== "");
        setPlayers(mapped);
        setLoading(false);
      })
      .catch(() => {
        if (!mounted) return;
        setPlayers([]);
        setLoading(false);
      });
    return () => (mounted = false);
  }, [gender]);

  const categories = useMemo(() => {
    const set = new Set();
    players.forEach((p) => {
      if (p.CATEGORY) set.add(p.CATEGORY);
    });
    return ["all", ...Array.from(set).sort()];
  }, [players]);

  const visiblePlayers = useMemo(() => {
    let filtered = players;

    if (category !== "all") {
      filtered = filtered.filter((p) => (p.CATEGORY || "") === category);
    }

    if (verified !== "all") {
      const isVerified = verified === "true";
      filtered = filtered.filter((p) => {
        const playerVerified =
          p.VERIFIED === "TRUE" || p.VERIFIED === "1" || p.VERIFIED === true;
        return playerVerified === isVerified;
      });
    }

    return filtered;
  }, [players, category, verified]);

  return (
    <div
      style={{
        minHeight: "100vh",
        background:
          "linear-gradient(to bottom, rgb(241, 245, 249) 0%, rgb(219, 234, 254) 50%, rgb(226, 232, 240) 100%)",
      }}
    >
      <div
        style={{ maxWidth: "80rem", margin: "0 auto", padding: "3rem 1rem" }}
      >


        {/* Top Players Showcase */}
        {!loading && players.length > 0 && (
          <TopPlayersShowcase
            players={visiblePlayers}
            gender={gender}
            scoreType={scoreType}
          />
        )}

        {/* Filters Section */}
        <section
          style={{ marginBottom: "2rem", animation: "slideUp 0.5s ease-out" }}
        >
          <Filters
            gender={gender}
            onChangeGender={(g) => setGender(g)}
            categories={categories}
            category={category}
            onChangeCategory={(c) => setCategory(c)}
            scoreType={scoreType}
            onChangeScoreType={(s) => setScoreType(s)}
            verified={verified}
            onChangeVerified={(v) => setVerified(v)}
          />
        </section>

        {/* Stats Cards */}
        {!loading && (
          <section
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "1.5rem",
              marginBottom: "2rem",
            }}
          >
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s ease-in-out",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "rgb(100, 116, 139)",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Total de Jugadores
                  </p>
                  <p
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: "bold",
                      color: "rgb(6, 182, 212)",
                    }}
                  >
                    {players.length}
                  </p>
                </div>
                <svg
                  style={{
                    width: "3rem",
                    height: "3rem",
                    color: "rgb(165, 243, 252)",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
              </div>
            </div>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s ease-in-out",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "rgb(100, 116, 139)",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Categorías
                  </p>
                  <p
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: "bold",
                      color: "rgb(139, 92, 246)",
                    }}
                  >
                    {categories.length - 1}
                  </p>
                </div>
                <svg
                  style={{
                    width: "3rem",
                    height: "3rem",
                    color: "rgb(221, 214, 254)",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
            </div>
            <div
              style={{
                backgroundColor: "white",
                borderRadius: "0.75rem",
                boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                padding: "1.5rem",
                transition: "box-shadow 0.3s ease-in-out",
                cursor: "pointer",
              }}
              onMouseOver={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 10px 15px -3px rgba(0, 0, 0, 0.1)")
              }
              onMouseOut={(e) =>
                (e.currentTarget.style.boxShadow =
                  "0 4px 6px -1px rgba(0, 0, 0, 0.1)")
              }
            >
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <div>
                  <p
                    style={{
                      color: "rgb(100, 116, 139)",
                      fontSize: "0.875rem",
                      fontWeight: "500",
                    }}
                  >
                    Visibles
                  </p>
                  <p
                    style={{
                      fontSize: "2.25rem",
                      fontWeight: "bold",
                      color: "rgb(234, 88, 12)",
                    }}
                  >
                    {visiblePlayers.length}
                  </p>
                </div>
                <svg
                  style={{
                    width: "3rem",
                    height: "3rem",
                    color: "rgb(254, 230, 204)",
                  }}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
              </div>
            </div>
          </section>
        )}

        {/* Ranking Table Section */}
        <section
          style={{
            backgroundColor: "white",
            borderRadius: "0",
            boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.1)",
            overflow: "hidden",
            animation: "slideUp 0.5s ease-out",
          }}
        >
          {loading ? (
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem",
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
                  Cargando jugadores…
                </p>
              </div>
            </div>
          ) : visiblePlayers.length > 0 ? (
            <RankingTable
              players={visiblePlayers}
              scoreType={scoreType}
              allPlayers={players}
            />
          ) : (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                padding: "3rem",
              }}
            >
              <svg
                style={{
                  width: "4rem",
                  height: "4rem",
                  color: "rgb(203, 213, 225)",
                  marginBottom: "1rem",
                }}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 00 9.172 13H7"
                />
              </svg>
              <p
                style={{
                  color: "rgb(71, 85, 105)",
                  fontSize: "1.125rem",
                  fontWeight: "500",
                }}
              >
                No hay jugadores para mostrar
              </p>
            </div>
          )}
        </section>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideUp {
          from { transform: translateY(20px); opacity: 0; }
          to { transform: translateY(0); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
