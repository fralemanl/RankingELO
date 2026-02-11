"use client";

import Link from "next/link";

export default function Filters({
  gender,
  onChangeGender,
  categories = [],
  category,
  onChangeCategory,
  nationality,
  onChangeNationality,
  sortBy,
  onChangeSortBy,
  searchTerm,
  onChangeSearchTerm,
}) {
  const filterStyles = {
    container: {
      backgroundColor: "white",
      borderRadius: "0.75rem",
      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
      padding: "1.5rem",
      marginBottom: "2rem",
    },
    title: {
      fontSize: "1.125rem",
      fontWeight: "600",
      color: "rgb(15, 23, 42)",
    },
    header: {
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      gap: "1rem",
      marginBottom: "1.5rem",
    },
    eloLink: {
      display: "inline-flex",
      alignItems: "center",
      gap: "0.5rem",
      padding: "0.5rem 0.9rem",
      borderRadius: "999px",
      backgroundColor: "rgb(15, 23, 42)",
      color: "white",
      fontSize: "0.875rem",
      fontWeight: "600",
      textDecoration: "none",
      whiteSpace: "nowrap",
    },
    eloDot: {
      width: "0.5rem",
      height: "0.5rem",
      borderRadius: "999px",
      backgroundColor: "rgb(56, 189, 248)",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
      gap: "1.5rem",
    },
    group: {
      display: "flex",
      flexDirection: "column",
    },
    label: {
      fontSize: "0.875rem",
      fontWeight: "600",
      color: "rgb(51, 65, 85)",
      marginBottom: "0.5rem",
      display: "flex",
      alignItems: "center",
      gap: "0.5rem",
    },
    icon: {
      width: "1rem",
      height: "1rem",
    },
  };

  return (
    <div style={filterStyles.container}>
      <div style={filterStyles.header}>
        <h3 style={filterStyles.title}>Filtrar Resultados</h3>
        <Link href="/elo" style={filterStyles.eloLink}>
          <span style={filterStyles.eloDot} />
          Calcula tu categoría
        </Link>
      </div>

      <div style={filterStyles.grid}>
        {/* Género */}
        <div style={filterStyles.group}>
          <label style={filterStyles.label}>
            <svg
              style={filterStyles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
              color="rgb(6, 182, 212)"
            >
              <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
            </svg>
            Género
          </label>
          <select
            value={gender}
            onChange={(e) => onChangeGender(e.target.value)}
          >
            <option value="masculino">Masculino ♂</option>
            <option value="femenino">Femenino ♀</option>
          </select>
        </div>

        {/* Categoría */}
        <div style={filterStyles.group}>
          <label style={filterStyles.label}>
            <svg
              style={filterStyles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
              color="rgb(139, 92, 246)"
            >
              <path
                fillRule="evenodd"
                d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                clipRule="evenodd"
              />
            </svg>
            Categoría
          </label>
          <select
            value={category}
            onChange={(e) => onChangeCategory(e.target.value)}
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c === "all" ? "Todas las categorías" : c}
              </option>
            ))}
          </select>
        </div>

        {/* Ordenar */}
        <div style={filterStyles.group}>
          <label style={filterStyles.label}>
            <svg
              style={filterStyles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
              color="rgb(14, 165, 233)"
            >
              <path d="M5 4a1 1 0 011-1h8a1 1 0 110 2H6a1 1 0 01-1-1zm0 6a1 1 0 011-1h5a1 1 0 110 2H6a1 1 0 01-1-1zm0 6a1 1 0 011-1h2a1 1 0 110 2H6a1 1 0 01-1-1z" />
            </svg>
            Ordenar por
          </label>
          <select value={sortBy} onChange={(e) => onChangeSortBy(e.target.value)}>
            <option value="elo">ELO</option>
            <option value="points">Puntos</option>
          </select>
        </div>

        {/* Nacionalidad */}
        <div style={filterStyles.group}>
          <label style={filterStyles.label}>
            <svg
              style={filterStyles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
              color="rgb(16, 185, 129)"
            >
              <path
                fillRule="evenodd"
                d="M5 3a1 1 0 011-1h5a1 1 0 01.894.553l1.5 3A1 1 0 0114.5 7H7.236l1.382 2.764a1 1 0 01-.447 1.341l-1.106.553 1.362 2.724a1 1 0 01-.447 1.341l-1.5.75A1 1 0 015 15.618V3zm9.5 4a1 1 0 01.894.553l1.5 3a1 1 0 01-.447 1.341l-1.447.724 1.447 2.894A1 1 0 0115.5 17h-5a1 1 0 01-.894-.553l-1.5-3a1 1 0 01.447-1.341l1.106-.553L8.297 8.829A1 1 0 018.744 7.5H14.5z"
                clipRule="evenodd"
              />
            </svg>
            Nacionalidad
          </label>
          <select
            value={nationality}
            onChange={(e) => onChangeNationality(e.target.value)}
          >
            <option value="all">Todas</option>
            <option value="panama">Panamá</option>
          </select>
        </div>
      </div>

      {/* Buscador */}
      <div style={filterStyles.group}>
        <label style={filterStyles.label}>
          <svg
            style={filterStyles.icon}
            fill="currentColor"
            viewBox="0 0 20 20"
            color="rgb(59, 130, 246)"
          >
            <path
              fillRule="evenodd"
              d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.817-4.817A6 6 0 012 8z"
              clipRule="evenodd"
            />
          </svg>
          Buscar jugador
        </label>
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onChangeSearchTerm(e.target.value)}
          placeholder="Nombre del jugador"
          style={{
            padding: "0.5rem 0.75rem",
            borderRadius: "0.5rem",
            border: "1px solid rgb(226, 232, 240)",
          }}
        />
      </div>
    </div>
  );
}
