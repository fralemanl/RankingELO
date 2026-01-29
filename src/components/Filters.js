"use client";

export default function Filters({
  gender,
  onChangeGender,
  categories = [],
  category,
  onChangeCategory,
  scoreType,
  onChangeScoreType,
  verified,
  onChangeVerified,
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

        {/* Tipo de puntaje */}
        <div style={filterStyles.group}>
          <label style={filterStyles.label}>
            <svg
              style={filterStyles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
              color="rgb(234, 88, 12)"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Puntaje
          </label>
          <select
            value={scoreType}
            onChange={(e) => onChangeScoreType(e.target.value)}
          >
            <option value="SUM_OF_POINTS_HISTORICO">📊 Histórico</option>
            <option value="SUM_OF_POINTS_GLOBAL">🌍 Global (365d)</option>
            <option value="SUM_OF_POINTS_RACE">🏁 Race</option>
          </select>
        </div>

        {/* Verificado */}
        <div style={filterStyles.group}>
          <label style={filterStyles.label}>
            <svg
              style={filterStyles.icon}
              fill="currentColor"
              viewBox="0 0 20 20"
              color="rgb(34, 197, 94)"
            >
              <path
                fillRule="evenodd"
                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                clipRule="evenodd"
              />
            </svg>
            Estado
          </label>
          <select
            value={verified}
            onChange={(e) => onChangeVerified(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="true">✓ Verificados</option>
            <option value="false">○ No verificados</option>
          </select>
        </div>
      </div>
    </div>
  );
}
