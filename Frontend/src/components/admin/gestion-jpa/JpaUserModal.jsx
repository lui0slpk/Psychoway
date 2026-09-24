import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { X, Edit3, Trash2, Save, Eye, EyeOff, User } from "lucide-react";
import { showError, showWarning } from "../../../utils/alerts";
import { mapJpaError } from "../../../api/jpaUsers.api";

// Gradiente de marca de los botones principales (patrón de GestionPage).
const SUCCESS_GRADIENT = {
  background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
  border: "none",
};

// Tipos de documento del contrato JPA (API_REFERENCE.md — sin "PA").
const DOC_TYPE_LABELS = {
  CC: "Cédula de Ciudadanía",
  TI: "Tarjeta de Identidad",
  CE: "Cédula de Extranjería",
  PP: "Pasaporte",
  PPT: "Permiso de Protección Temporal",
  NIT: "NIT",
};

// Campos editables del modal (identificadores = contrato de la API).
const EDITABLE_FIELDS = [
  "document",
  "docType",
  "names",
  "lastNames",
  "birthDate",
  "email",
  "idRol",
  "password",
  "contactNumber",
  "landlineNumber",
  "trainingProgram",
  "fichaNumber",
  "profilePhoto",
];

// Obligatorios en edición: bloqueo local antes de enviar el PUT.
const REQUIRED_FIELDS = ["document", "docType", "names", "lastNames", "birthDate", "email", "idRol"];

// Opcionales: cuando quedan vacíos se omiten por completo del body del PUT.
const OPTIONAL_FIELDS = new Set([
  "contactNumber",
  "landlineNumber",
  "trainingProgram",
  "fichaNumber",
  "profilePhoto",
]);

const EDIT_LABELS = {
  document: "Documento",
  docType: "Tipo de documento",
  names: "Nombres",
  lastNames: "Apellidos",
  birthDate: "Fecha de nacimiento",
  email: "Correo",
  idRol: "Rol",
  password: "Nueva contraseña",
  contactNumber: "Celular",
  landlineNumber: "Teléfono fijo",
  trainingProgram: "Programa de formación",
  fichaNumber: "Número de ficha",
  profilePhoto: "Foto de perfil (URL)",
};

// Modo detalle: todos los campos disponibles en la fila cargada.
const DETAIL_FIELDS = [
  { key: "document", label: "Documento" },
  { key: "docType", label: "Tipo de documento" },
  { key: "names", label: "Nombres" },
  { key: "lastNames", label: "Apellidos" },
  { key: "birthDate", label: "Fecha de nacimiento" },
  { key: "email", label: "Correo" },
  {
    key: "nombreRol",
    label: "Rol",
    // nombreRol cuando existe; si no, el identificador numérico del rol.
    get: (user) => user.nombreRol ?? (user.idRol != null ? `Rol ${user.idRol}` : null),
  },
  { key: "contactNumber", label: "Celular" },
  { key: "landlineNumber", label: "Teléfono fijo" },
  { key: "trainingProgram", label: "Programa de formación" },
  { key: "fichaNumber", label: "Número de ficha" },
  { key: "lastUpdate", label: "Última actualización" },
];

/**
 * Precarga el formulario de edición desde los datos de la fila. password
 * NUNCA se precarga (opcional en edición: vacío = conservar la actual).
 * idRol se normaliza a string para comparaciones estables con el select.
 */
const seedForm = (user) => ({
  document: user?.document ?? "",
  docType: user?.docType ?? "",
  names: user?.names ?? "",
  lastNames: user?.lastNames ?? "",
  birthDate: user?.birthDate ?? "",
  email: user?.email ?? "",
  idRol: user?.idRol != null ? String(user.idRol) : "",
  password: "",
  contactNumber: user?.contactNumber ?? "",
  landlineNumber: user?.landlineNumber ?? "",
  trainingProgram: user?.trainingProgram ?? "",
  fichaNumber: user?.fichaNumber ?? "",
  profilePhoto: user?.profilePhoto ?? "",
});

/**
 * Diff inicial → formulario para el PUT (semántica UpdateGroup del
 * microservicio): viajan SOLO los campos que cambiaron.
 *   - password: se envía únicamente cuando se llenó; vacío jamás viaja.
 *   - campos opcionales vacíos: se omiten por completo del body.
 *   - idRol viaja como número (contrato de la API).
 */
const buildDiff = (initial, form) => {
  const diff = {};
  EDITABLE_FIELDS.forEach((key) => {
    const value = form[key] ?? "";
    if (value === initial[key]) return; // sin cambio → no viaja
    if (key === "password") {
      if (String(value).trim() !== "") diff[key] = value;
      return;
    }
    if (OPTIONAL_FIELDS.has(key) && String(value).trim() === "") return;
    diff[key] = key === "idRol" ? Number(value) : value;
  });
  return diff;
};

// Valor legible para el modo detalle (nulos/vacíos → em dash).
const formatDetailValue = (value) =>
  value === null || value === undefined || value === "" ? "—" : String(value);

/**
 * JpaUserModal — modal centrado sobre overlay oscuro con dos modos:
 *
 *   view --[Editar]--> edit --[Guardar · 200]--> close (cierra el page)
 *        \--[Eliminar]--> onDelete → showConfirm (puerta en el page)
 *   edit --[Cancelar]--> view   (descarta el diff en borrador)
 *
 * El cierre NUNCA emite un request de red. En modo edición se conserva una
 * copia congelada (`initial`) de la fila para construir el diff; el 400 con
 * details[] alimenta los indicadores de error por campo del formulario.
 *
 * @param {Object} props
 * @param {Object} props.user - Fila cargada del listado (sin fetch adicional)
 * @param {"view"|"edit"} props.mode - Modo entrante al abrir el modal
 * @param {Array} props.roles - Catálogo de roles (idRol numérico + nombreRol)
 * @param {Function} props.onSubmit - (idUser, diff) ejecuta el PUT; rechaza si falla (el modal mapea el error)
 * @param {Function} props.onDelete - (user) inicia el flujo de eliminación (showConfirm vive en el page)
 * @param {Function} props.onClose - Cierra el modal sin request
 */
function JpaUserModal({ user, mode, roles, onSubmit, onDelete, onClose }) {
  const [viewMode, setViewMode] = useState(mode);
  const [form, setForm] = useState(() => seedForm(user));
  // Copia congelada de la fila para el diff (task 2.6).
  const [initial, setInitial] = useState(() => seedForm(user));
  const [fieldErrors, setFieldErrors] = useState({});
  const [saving, setSaving] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Al abrir (o cambiar de usuario) se reinicia el modo entrante y el
  // borrador — el estado de una edición nunca contamina al siguiente usuario.
  useEffect(() => {
    const seed = seedForm(user);
    setViewMode(mode);
    setForm(seed);
    setInitial(seed);
    setFieldErrors({});
    setSaving(false);
    setShowPassword(false);
  }, [user, mode]);

  const handleEditChange = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    // Corregir el campo limpia su indicador de error (details[] del 400).
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  const enterEditMode = () => {
    setForm(seedForm(user));
    setFieldErrors({});
    setViewMode("edit");
  };

  // "Cancelar" en edición: descarta el diff en borrador y vuelve a la vista.
  const cancelEdit = () => {
    setForm(seedForm(user));
    setFieldErrors({});
    setViewMode("view");
  };

  // Envío del modo edición (task 2.6): bloqueo local de requeridos → diff
  // → PUT vía onSubmit(id, diff). El 401 lo maneja el cliente compartido;
  // el resto de errores se mapea con mapJpaError (dialog + fieldErrors).
  const handleEditSubmit = async (event) => {
    event.preventDefault();
    const missing = REQUIRED_FIELDS.filter((f) => String(form[f] ?? "").trim() === "");
    if (missing.length > 0) {
      showWarning("Formulario incompleto", "Por favor completa los campos obligatorios antes de guardar.");
      return;
    }
    const diff = buildDiff(initial, form);
    if (Object.keys(diff).length === 0) {
      // Sin cambios: ningún request viaja.
      showWarning("Sin cambios", "No se detectaron cambios para guardar.");
      return;
    }
    setSaving(true);
    try {
      // El page ejecuta updateJpaUser y, con 200, cierra el modal y
      // re-consulta la página actual. Si el PUT falla, la promesa se
      // rechaza y el error se mapea AQUÍ (showError + indicadores 400).
      await onSubmit(user.idUser, diff);
    } catch (error) {
      const { title, text, fieldErrors: fields } = mapJpaError(error);
      if (fields) setFieldErrors(fields);
      showError(title, text);
    } finally {
      setSaving(false);
    }
  };

  // Indicador de error por campo (details[] del 400 → fieldErrors).
  const fieldError = (name) =>
    fieldErrors[name] ? (
      <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
        {fieldErrors[name]}
      </div>
    ) : null;

  if (!user) return null;

  const detailView = (
    <div className="px-4 pb-2">
      <div className="row g-2">
        {DETAIL_FIELDS.map(({ key, label, get }) => (
          <div className="col-md-6" key={key}>
            <div className="border rounded-3 p-2 h-100">
              <div className="text-muted" style={{ fontSize: "12px" }}>{label}</div>
              <div className="small fw-semibold text-break">{formatDetailValue(get ? get(user) : user[key])}</div>
            </div>
          </div>
        ))}
        <div className="col-md-6">
          <div className="border rounded-3 p-2 h-100">
            <div className="text-muted" style={{ fontSize: "12px" }}>Foto de perfil</div>
            {user.profilePhoto ? (
              <a
                href={user.profilePhoto}
                target="_blank"
                rel="noopener noreferrer"
                className="small fw-semibold text-decoration-none text-truncate d-block"
                style={{ color: "#0d825c" }}
                title={user.profilePhoto}
              >
                Ver foto de perfil
              </a>
            ) : (
              <div className="small fw-semibold">—</div>
            )}
          </div>
        </div>
      </div>
    </div>
  );

  const editForm = (
    <form className="px-4 pb-4" onSubmit={handleEditSubmit} noValidate>
      <div className="row g-3">
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-document">
            Documento <span className="text-danger">*</span>
          </label>
          <input
            id="edit-document"
            type="text"
            className="form-control rounded-3 border-2"
            value={form.document}
            onChange={(e) => handleEditChange("document", e.target.value)}
          />
          {fieldError("document")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-docType">
            Tipo de documento <span className="text-danger">*</span>
          </label>
          <select
            id="edit-docType"
            className="form-select rounded-3 border-2"
            value={form.docType}
            onChange={(e) => handleEditChange("docType", e.target.value)}
          >
            <option value="">Seleccione</option>
            {Object.entries(DOC_TYPE_LABELS).map(([code, label]) => (
              <option key={code} value={code}>
                {code} — {label}
              </option>
            ))}
          </select>
          {fieldError("docType")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-names">
            Nombres <span className="text-danger">*</span>
          </label>
          <input
            id="edit-names"
            type="text"
            className="form-control rounded-3 border-2"
            value={form.names}
            onChange={(e) => handleEditChange("names", e.target.value)}
          />
          {fieldError("names")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-lastNames">
            Apellidos <span className="text-danger">*</span>
          </label>
          <input
            id="edit-lastNames"
            type="text"
            className="form-control rounded-3 border-2"
            value={form.lastNames}
            onChange={(e) => handleEditChange("lastNames", e.target.value)}
          />
          {fieldError("lastNames")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-birthDate">
            Fecha de nacimiento <span className="text-danger">*</span>
          </label>
          <input
            id="edit-birthDate"
            type="date"
            className="form-control rounded-3 border-2"
            value={form.birthDate}
            onChange={(e) => handleEditChange("birthDate", e.target.value)}
          />
          {fieldError("birthDate")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-email">
            Correo <span className="text-danger">*</span>
          </label>
          <input
            id="edit-email"
            type="email"
            className="form-control rounded-3 border-2"
            value={form.email}
            onChange={(e) => handleEditChange("email", e.target.value)}
          />
          {fieldError("email")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-idRol">
            Rol <span className="text-danger">*</span>
          </label>
          <select
            id="edit-idRol"
            className="form-select rounded-3 border-2"
            value={form.idRol}
            onChange={(e) => handleEditChange("idRol", e.target.value)}
          >
            <option value="">Seleccione</option>
            {/* Valor numérico idRol = valor enviado; nombreRol = etiqueta visible. */}
            {roles.map((role) => (
              <option key={role.idRol} value={role.idRol}>
                {role.nombreRol}
              </option>
            ))}
          </select>
          {fieldError("idRol")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-password">
            {EDIT_LABELS.password}
          </label>
          <div className="input-group">
            <input
              id="edit-password"
              type={showPassword ? "text" : "password"}
              className="form-control rounded-start-3 border-2 border-end-0"
              placeholder="********"
              value={form.password}
              onChange={(e) => handleEditChange("password", e.target.value)}
            />
            <span
              className="input-group-text bg-white border-2 border-start-0 rounded-end-3"
              style={{ cursor: "pointer" }}
              onClick={() => setShowPassword(!showPassword)}
              aria-label={showPassword ? "Ocultar contraseña" : "Mostrar contraseña"}
            >
              {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
            </span>
          </div>
          {/* Opcional: vacía = conserva la actual; jamás viaja en el PUT vacía. */}
          <div className="text-muted mt-1" style={{ fontSize: "13px" }}>
            Opcional — déjala vacía para mantener la actual (mínimo 8 caracteres al cambiarla).
          </div>
          {fieldError("password")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-contactNumber">
            {EDIT_LABELS.contactNumber}
          </label>
          <input
            id="edit-contactNumber"
            type="tel"
            className="form-control rounded-3 border-2"
            value={form.contactNumber}
            onChange={(e) => handleEditChange("contactNumber", e.target.value)}
          />
          {fieldError("contactNumber")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-landlineNumber">
            {EDIT_LABELS.landlineNumber}
          </label>
          <input
            id="edit-landlineNumber"
            type="tel"
            className="form-control rounded-3 border-2"
            value={form.landlineNumber}
            onChange={(e) => handleEditChange("landlineNumber", e.target.value)}
          />
          {fieldError("landlineNumber")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-trainingProgram">
            {EDIT_LABELS.trainingProgram}
          </label>
          <input
            id="edit-trainingProgram"
            type="text"
            className="form-control rounded-3 border-2"
            value={form.trainingProgram}
            onChange={(e) => handleEditChange("trainingProgram", e.target.value)}
          />
          {fieldError("trainingProgram")}
        </div>
        <div className="col-md-6">
          <label className="form-label small fw-semibold" htmlFor="edit-fichaNumber">
            {EDIT_LABELS.fichaNumber}
          </label>
          <input
            id="edit-fichaNumber"
            type="text"
            className="form-control rounded-3 border-2"
            value={form.fichaNumber}
            onChange={(e) => handleEditChange("fichaNumber", e.target.value)}
          />
          {fieldError("fichaNumber")}
        </div>
        <div className="col-12">
          <label className="form-label small fw-semibold" htmlFor="edit-profilePhoto">
            {EDIT_LABELS.profilePhoto}
          </label>
          <input
            id="edit-profilePhoto"
            type="url"
            className="form-control rounded-3 border-2"
            placeholder="https://…"
            value={form.profilePhoto}
            onChange={(e) => handleEditChange("profilePhoto", e.target.value)}
          />
          {fieldError("profilePhoto")}
        </div>
      </div>

      <div className="d-flex justify-content-end gap-2 pt-4">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="button"
          className="btn btn-outline-secondary rounded-pill px-4"
          onClick={cancelEdit}
        >
          Cancelar
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="btn btn-success rounded-pill px-4 d-inline-flex align-items-center gap-2"
          style={SUCCESS_GRADIENT}
          disabled={saving}
        >
          <Save size={16} /> {saving ? "Guardando…" : "Guardar"}
        </motion.button>
      </div>
    </form>
  );

  return (
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{ background: "rgba(0, 0, 0, 0.55)", zIndex: 1050 }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="card border-0 shadow rounded-4 w-100"
        style={{ maxWidth: "760px", maxHeight: "90vh", overflowY: "auto" }}
        role="dialog"
        aria-modal="true"
        aria-label={viewMode === "edit" ? "Editar usuario" : "Detalle del usuario"}
      >
        <div className="d-flex align-items-center justify-content-between p-4 pb-2">
          <h5 className="mb-0 fs-5 d-flex align-items-center gap-2">
            {viewMode === "edit" ? (
              <>
                <Edit3 size={20} className="text-success" /> Editar usuario
              </>
            ) : (
              <>
                <User size={20} className="text-success" /> {user.names} {user.lastNames}
              </>
            )}
          </h5>
          {/* Cierre: NO emite ningún request de red (spec §detail modal). */}
          <button type="button" className="btn btn-link text-muted p-1" onClick={onClose} aria-label="Cerrar">
            <X size={20} />
          </button>
        </div>

        {viewMode === "view" ? (
          <>
            {detailView}
            <div className="d-flex flex-wrap justify-content-end gap-2 p-4 pt-3">
              <button type="button" className="btn btn-outline-secondary rounded-pill px-4" onClick={onClose}>
                Cerrar
              </button>
              {/* Eliminar pasa por la puerta showConfirm del page (isConfirmed → DELETE). */}
              <button
                type="button"
                className="btn btn-outline-danger rounded-pill px-4 d-inline-flex align-items-center gap-2"
                onClick={() => onDelete(user)}
              >
                <Trash2 size={16} /> Eliminar
              </button>
              <button
                type="button"
                className="btn btn-success rounded-pill px-4 d-inline-flex align-items-center gap-2"
                style={SUCCESS_GRADIENT}
                onClick={enterEditMode}
              >
                <Edit3 size={16} /> Editar
              </button>
            </div>
          </>
        ) : (
          editForm
        )}
      </motion.div>
    </div>
  );
}

export default JpaUserModal;
