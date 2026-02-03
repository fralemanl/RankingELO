"use client";

export default function Filters({
  gender,
  onChangeGender,
  categories = [],
  category,
  onChangeCategory,
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
      marginBottom: "1.5rem",
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
      <h3 style={filterStyles.title}>Filtrar Resultados</h3>

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

      </div>
    </div>
  );
}
