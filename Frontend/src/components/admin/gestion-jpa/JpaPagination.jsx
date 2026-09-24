import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

// Gradiente de marca del botón de página activa.
const SUCCESS_GRADIENT = {
  background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
  border: "none",
};

/**
 * Ventana de páginas numeradas alrededor de la actual, con primera/última
 * y separadores "…" cuando hay huecos. Evita renderizar decenas de botones
 * en catálogos grandes (p.ej. 150 usuarios con size=5 → 30 páginas).
 */
const buildPageItems = (page, totalPages) => {
  const items = [];
  const windowStart = Math.max(1, page - 2);
  const windowEnd = Math.min(totalPages, page + 2);

  if (windowStart > 1) {
    items.push(1);
    if (windowStart > 2) items.push("…");
  }
  for (let p = windowStart; p <= windowEnd; p++) items.push(p);
  if (windowEnd < totalPages) {
    if (windowEnd < totalPages - 1) items.push("…");
    items.push(totalPages);
  }
  return items;
};

/**
 * JpaPagination — controles de paginación 1-indexed (UI).
 *
 * TODOS los valores emitidos vía onPage son páginas 1-indexed; la única
 * conversión a 0-indexed vive en jpaUsers.api.js (task 1.2). Oculto por
 * completo durante la primera carga (sin datos aún) o cuando hay una sola
 * página. "Siguiente" se deshabilita con last === true o al llegar a la
 * última página; "Anterior" en la primera.
 *
 * @param {Object} props
 * @param {number} props.page - Página actual visible en la UI (1-indexed)
 * @param {number} props.totalPages - Total de páginas de la respuesta (0/undefined = sin datos)
 * @param {boolean} props.last - true si la respuesta marca la última página
 * @param {Function} props.onPage - (n) navega a la página n (1-indexed), mantiene filtros y size
 */
function JpaPagination({ page, totalPages, last, onPage }) {
  // Oculto sin datos (primera carga) o con una sola página (spec §loading/empty).
  if (!totalPages || totalPages <= 1) return null;

  const prevDisabled = page <= 1;
  const nextDisabled = last === true || page >= totalPages;
  const items = buildPageItems(page, totalPages);

  return (
    <nav className="d-flex flex-wrap align-items-center justify-content-center gap-1 mt-3" aria-label="Paginación de usuarios">
      <button
        type="button"
        className="btn btn-sm btn-outline-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
        disabled={prevDisabled}
        onClick={() => onPage(page - 1)}
      >
        <ChevronLeft size={14} /> Anterior
      </button>

      {items.map((item, index) =>
        typeof item === "number" ? (
          <button
            key={`page-${item}`}
            type="button"
            className={`btn btn-sm rounded-pill px-3 ${
              item === page ? "text-white" : "btn-outline-success"
            }`}
            style={item === page ? SUCCESS_GRADIENT : undefined}
            onClick={() => onPage(item)}
            aria-current={item === page ? "page" : undefined}
            aria-label={`Página ${item}`}
          >
            {item}
          </button>
        ) : (
          <span key={`gap-${index}`} className="px-1 text-muted" aria-hidden="true">
            …
          </span>
        )
      )}

      <button
        type="button"
        className="btn btn-sm btn-outline-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
        disabled={nextDisabled}
        onClick={() => onPage(page + 1)}
      >
        Siguiente <ChevronRight size={14} />
      </button>
    </nav>
  );
}

export default JpaPagination;
