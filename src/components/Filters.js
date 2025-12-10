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
  return (
    <div className="filters" style={{ marginBottom: 16 }}>
      <div className="filter-group">
        <label>Género</label>
        <select value={gender} onChange={(e) => onChangeGender(e.target.value)}>
          <option value="masculino">Masculino</option>
          <option value="femenino">Femenino</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Categoría</label>
        <select
          value={category}
          onChange={(e) => onChangeCategory(e.target.value)}
        >
          {categories.map((c) => (
            <option key={c} value={c}>
              {c === "all" ? "Todas" : c}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Tipo de puntaje</label>
        <select
          value={scoreType}
          onChange={(e) => onChangeScoreType(e.target.value)}
        >
          <option value="SUM_OF_POINTS_HISTORICO">Histórico</option>
          <option value="SUM_OF_POINTS_GLOBAL">Global (365d)</option>
          <option value="SUM_OF_POINTS_RACE">Race</option>
        </select>
      </div>

      <div className="filter-group">
        <label>Verificado</label>
        <select
          value={verified}
          onChange={(e) => onChangeVerified(e.target.value)}
        >
          <option value="all">Todos</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      </div>
    </div>
  );
}
