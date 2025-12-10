"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchPlayers } from "@/lib/sheets";
import Filters from "@/components/Filters";
import RankingTable from "@/components/RankingTable";

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
        // Añadir campo gender para enlaces y normalizar nombres
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

  // obtener categorías desde players
  const categories = useMemo(() => {
    const set = new Set();
    players.forEach((p) => {
      if (p.CATEGORY) set.add(p.CATEGORY);
    });
    return ["all", ...Array.from(set).sort()];
  }, [players]);

  // aplicar filtros por categoría y verificado
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
    <main className="main">
      <header className="header">
        <div>
          <h1 className="site-title">Ranking de Pádel - Panamá</h1>
        </div>
        <div className="controls" />
      </header>

      <section>
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

      <section>
        {loading ? (
          <p style={{ textAlign: "center" }}>Cargando jugadores…</p>
        ) : (
          <RankingTable players={visiblePlayers} scoreType={scoreType} />
        )}
      </section>
    </main>
  );
}
