import React from "react";

/**
 * Selector de período (semana/mes) para gráficas de estadísticas.
 * @param {string} value - Valor actual ('week' o 'month')
 * @param {function} onChange - Callback al cambiar período
 */
export default function PeriodFilter({ value, onChange }) {
  return (
    <div className="btn-group btn-group-sm" role="group">
      <button
        type="button"
        className={`btn ${value === "week" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => onChange("week")}
      >
        Semana
      </button>
      <button
        type="button"
        className={`btn ${value === "month" ? "btn-primary" : "btn-outline-primary"}`}
        onClick={() => onChange("month")}
      >
        Mes
      </button>
    </div>
  );
}
