import React from "react";
import { motion } from "framer-motion";
import { RefreshCw, Database, Server } from "lucide-react";

/**
 * JpaHealthSection — bloque de estado del microservicio mysqlwithjpa
 * a partir de GET /actuator/health. Muestra exactamente DOS bloques:
 *   - "Supabase"  ← components.db
 *   - "MongoDB"   ← components.mongo
 *
 * Derivación de color (spec jpa-service-health, evaluada en orden):
 *   rojo     → componente ausente, request fallido (health null) o status !== "UP"
 *   amarillo → status "UP" con details.responseTimeMs > 200
 *   verde    → status "UP" con responseTimeMs <= 200
 *
 * La actualización es SOLO explícita: al entrar a la página (la dispara el
 * page) y con el botón "Actualizar". Este componente no define intervalos
 * ni hace polling (rate limit compartido de 100 req/min).
 *
 * @param {Object} props
 * @param {Object|null} props.health - Respuesta de /actuator/health; null = request fallido (ambos bloques rojos)
 * @param {boolean} props.loading - true mientras consulta/actualiza el health
 * @param {Function} props.onRefresh - Re-ejecuta GET /actuator/health (botón "Actualizar")
 */

// Colores semánticos del app (mismos tonos que utils/alerts.js).
const STATE_STYLES = {
  green: { color: "#0d825c", label: "Operativo" },
  yellow: { color: "#f59e0b", label: "Latencia alta" },
  red: { color: "#ef4444", label: "No disponible" },
};

// Regla de derivación del color por componente (en orden, spec §Three-state).
const deriveComponentState = (component) => {
  // Componente ausente o con status distinto de "UP" → rojo.
  if (!component || component.status !== "UP") return "red";
  const responseTimeMs = component.details?.responseTimeMs;
  // "UP" pero por encima del umbral de 200 ms → amarillo.
  if (typeof responseTimeMs === "number" && responseTimeMs > 200) {
    return "yellow";
  }
  return "green";
};

function JpaHealthSection({ health, loading, onRefresh }) {
  // health null → el request falló: ambos bloques se derivan en rojo.
  const requestFailed = !health;
  const db = requestFailed ? null : health?.components?.db;
  const mongo = requestFailed ? null : health?.components?.mongo;

  const blocks = [
    { key: "db", label: "Supabase", component: db, icon: Database },
    { key: "mongo", label: "MongoDB", component: mongo, icon: Server },
  ];

  return (
    <div>
      <div className="row g-3">
        {blocks.map(({ key, label, component, icon: Icon }) => {
          const state = deriveComponentState(component);
          const style = STATE_STYLES[state];
          const latency = component?.details?.responseTimeMs;
          return (
            <div className="col-md-6" key={key}>
              <div
                className="border rounded-4 p-3 d-flex align-items-center gap-3"
                style={{ borderColor: `${style.color}55` }}
              >
                {loading ? (
                  // Estado de carga: spinner por bloque mientras consulta.
                  <span
                    className="spinner-border flex-shrink-0"
                    role="status"
                    aria-label="Cargando"
                    style={{ color: style.color }}
                  />
                ) : (
                  <span
                    className="d-inline-block rounded-circle flex-shrink-0"
                    style={{
                      width: "14px",
                      height: "14px",
                      background: style.color,
                    }}
                  />
                )}
                <div className="flex-grow-1">
                  <span className="fw-semibold d-flex align-items-center gap-2">
                    <Icon size={16} style={{ color: style.color }} /> {label}
                  </span>
                  <div className="small text-muted">
                    {loading ? "Consultando estado…" : style.label}
                    {/* Latencia visible cuando el componente la reporta */}
                    {typeof latency === "number" && !loading
                      ? ` · ${latency}ms`
                      : ""}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Refresco manual: el único mecanismo además de la entrada a la página */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
        type="button"
        className="btn btn-success rounded-pill px-4 mt-3 d-inline-flex align-items-center gap-2"
        style={{
          background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
          border: "none",
        }}
        onClick={onRefresh}
        disabled={loading}
      >
        <RefreshCw size={16} /> Actualizar
      </motion.button>
    </div>
  );
}

export default JpaHealthSection;
