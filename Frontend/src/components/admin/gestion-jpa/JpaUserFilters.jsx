import React from "react";
import { motion } from "framer-motion";
import { Search } from "lucide-react";

// Gradiente de marca de los botones principales (patrón de GestionPage).
const SUCCESS_GRADIENT = {
  background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
  border: "none",
};

// Campos de texto del filtro (name = parámetro de query del contrato JPA).
const TEXT_FIELDS = [
  { name: "document", label: "Documento", placeholder: "1234567890", type: "text" },
  { name: "email", label: "Correo", placeholder: "usuario@ejemplo.com", type: "email" },
  { name: "names", label: "Nombres", placeholder: "Juan Carlos", type: "text" },
  { name: "lastNames", label: "Apellidos", placeholder: "Pérez Gómez", type: "text" },
];

/**
 * JpaUserFilters — formulario controlado de filtros del listado JPA.
 *
 * El submit ("Buscar") es el ÚNICO disparador de consultas: sin debounce,
 * sin búsqueda al teclear (rate limit compartido de 100 req/min por IP).
 * Los valores viven en el estado del page como BORRADOR; solo al enviar se
 * convierten en filtros aplicados (fuente real del query). Los valores
 * vacíos los descarta jpaUsers.api.js antes de armar el query string.
 *
 * @param {Object} props
 * @param {Object} props.values - Borrador de filtros { document, email, names, lastNames, idRol }
 * @param {Array|null} props.roles - Catálogo de roles; null mientras carga, [] si no hay ninguno
 * @param {Function} props.onChange - (name, value) actualiza el borrador (sin consultar)
 * @param {Function} props.onSubmit - (event) aplica los filtros y consulta con page=1
 */
function JpaUserFilters({ values, roles, onChange, onSubmit }) {
  // null = catálogo en carga; [] = cargado pero sin roles (select deshabilitado).
  const rolesLoading = roles == null;
  const rolesEmpty = !rolesLoading && roles.length === 0;

  return (
    <form className="row g-3 align-items-end mb-4" onSubmit={onSubmit}>
      {TEXT_FIELDS.map(({ name, label, placeholder, type }) => (
        <div className="col-6 col-md-4 col-xl-2" key={name}>
          <label className="form-label small fw-semibold" htmlFor={`filter-${name}`}>
            {label}
          </label>
          <input
            id={`filter-${name}`}
            name={name}
            type={type}
            className="form-control rounded-3 border-2"
            placeholder={placeholder}
            value={values[name] ?? ""}
            onChange={(e) => onChange(name, e.target.value)}
          />
        </div>
      ))}

      <div className="col-6 col-md-4 col-xl-2">
        <label className="form-label small fw-semibold" htmlFor="filter-idRol">
          Rol
        </label>
        <select
          id="filter-idRol"
          name="idRol"
          className="form-select rounded-3 border-2"
          value={values.idRol ?? ""}
          onChange={(e) => onChange("idRol", e.target.value)}
          disabled={rolesLoading || rolesEmpty}
        >
          {rolesLoading ? (
            // Catálogo en carga: select deshabilitado con estado visible.
            <option value="">Cargando roles…</option>
          ) : rolesEmpty ? (
            <option value="">Sin roles disponibles</option>
          ) : (
            <>
              <option value="">Todos</option>
              {/* Valor numérico idRol = valor enviado; nombreRol = etiqueta visible. */}
              {roles.map((role) => (
                <option key={role.idRol} value={role.idRol}>
                  {role.nombreRol}
                </option>
              ))}
            </>
          )}
        </select>
      </div>

      <div className="col-12 col-md-4 col-xl-2">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="btn btn-success rounded-pill px-4 w-100 d-inline-flex align-items-center justify-content-center gap-2"
          style={SUCCESS_GRADIENT}
        >
          <Search size={16} /> Buscar
        </motion.button>
      </div>
    </form>
  );
}

export default JpaUserFilters;
