import React from "react";
import { Edit3, Trash2 } from "lucide-react";

// Tamaños de página del contrato (spec §pagination: 5/10/20/50).
const PAGE_SIZES = [5, 10, 20, 50];

/**
 * JpaUsersTable — tabla del listado JPA, puramente presentacional.
 *
 * Columnas exactas del spec: document / names+lastNames (nombre completo) /
 * email / nombreRol, más los botones de acción (editar y eliminar) a la
 * derecha de cada fila. Los datos de cada acción salen de la página YA
 * cargada: el click en el nombre abre el modal de detalle SIN ningún fetch
 * por usuario (GET /api/users/{id} no está autorizado).
 *
 * Estados: fila "Cargando usuarios…" mientras consulta; mensaje de vacío
 * cuando no hay filas con los filtros aplicados.
 *
 * @param {Object} props
 * @param {Array} props.users - Filas de la página actual (usersPage.content)
 * @param {boolean} props.loading - true mientras consulta la lista
 * @param {number} props.pageSize - Tamaño de página vigente (5/10/20/50)
 * @param {Function} props.onPageSize - (value) cambia el tamaño y re-consulta con page=1
 * @param {Function} props.onNameClick - (user) abre el modal de detalle desde el nombre
 * @param {Function} props.onEdit - (user) abre el modal en modo edición
 * @param {Function} props.onDelete - (user) inicia el flujo de eliminación (puerta showConfirm en el page)
 */
function JpaUsersTable({ users, loading, pageSize, onPageSize, onNameClick, onEdit, onDelete }) {
  const rows = Array.isArray(users) ? users : [];

  return (
    <div>
      {/* Selector de tamaño de página — re-consulta con el nuevo size. */}
      <div className="d-flex justify-content-end align-items-center gap-2 mb-2">
        <label className="form-label small fw-semibold mb-0" htmlFor="jpa-page-size">
          Usuarios por página
        </label>
        <select
          id="jpa-page-size"
          className="form-select rounded-3 border-2 w-auto"
          value={pageSize}
          onChange={(e) => onPageSize(e.target.value)}
        >
          {PAGE_SIZES.map((n) => (
            <option key={n} value={n}>
              {n}
            </option>
          ))}
        </select>
      </div>

      <div className="table-responsive">
        <table className="table table-hover align-middle mb-0">
          <thead className="table-light">
            <tr>
              <th className="small fw-semibold" scope="col">Documento</th>
              <th className="small fw-semibold" scope="col">Nombre</th>
              <th className="small fw-semibold" scope="col">Correo</th>
              <th className="small fw-semibold" scope="col">Rol</th>
              <th className="small fw-semibold text-end" scope="col">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              // Fila de carga: la tabla nunca muestra datos parciales.
              <tr>
                <td colSpan={5} className="text-center py-4">
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                  Cargando usuarios…
                </td>
              </tr>
            ) : rows.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center text-muted py-4">
                  No se encontraron usuarios con los filtros aplicados
                </td>
              </tr>
            ) : (
              rows.map((user) => (
                <tr key={user.idUser}>
                  <td className="small">{user.document}</td>
                  <td className="small">
                    {/* Click en el nombre → modal de detalle con los datos de la fila (sin fetch). */}
                    <button
                      type="button"
                      className="btn btn-link p-0 text-decoration-none fw-semibold"
                      style={{ color: "#0d825c" }}
                      onClick={() => onNameClick(user)}
                      title="Ver detalle del usuario"
                    >
                      {user.names} {user.lastNames}
                    </button>
                  </td>
                  <td className="small">{user.email}</td>
                  <td className="small">{user.nombreRol}</td>
                  <td className="text-end">
                    <div className="d-inline-flex gap-2">
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-success rounded-pill px-3 d-inline-flex align-items-center gap-1"
                        onClick={() => onEdit(user)}
                        title="Editar usuario"
                      >
                        <Edit3 size={14} /> Editar
                      </button>
                      <button
                        type="button"
                        className="btn btn-sm btn-outline-danger rounded-pill px-3 d-inline-flex align-items-center gap-1"
                        onClick={() => onDelete(user)}
                        title="Eliminar usuario"
                      >
                        <Trash2 size={14} /> Eliminar
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default JpaUsersTable;
