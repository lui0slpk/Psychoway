import React, { useState } from "react";
import { motion } from "framer-motion";
import { Eye, EyeOff, UserPlus } from "lucide-react";
import { createJpaUser, mapJpaError } from "../../../api/jpaUsers.api";
import { showSuccess, showError, showWarning } from "../../../utils/alerts";

// Gradiente de marca de los botones principales (patrón de GestionPage).
const SUCCESS_GRADIENT = {
  background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
  border: "none",
};

// Tipos de documento del contrato JPA — enum REAL del microservicio:
// CC/TI/CE/PP/RC/NIT ("PPT" NO existe; API_REFERENCE.md está desactualizado).
const DOC_TYPE_LABELS = {
  CC: "Cédula de Ciudadanía",
  TI: "Tarjeta de Identidad",
  CE: "Cédula de Extranjería",
  PP: "Pasaporte",
  RC: "Registro Civil",
  NIT: "NIT",
};

// Requeridos del CreateGroup: sin alguno de ellos el envío se bloquea
// localmente (showWarning) y NADA viaja al servidor.
const REQUIRED_FIELDS = [
  "document",
  "docType",
  "names",
  "lastNames",
  "birthDate",
  "email",
  "password",
  "idRol",
];

// Opcionales del contrato: cuando quedan vacíos se omiten POR COMPLETO del
// payload del POST (spec §6 — "no optional keys").
const OPTIONAL_FIELDS = [
  "contactNumber",
  "landlineNumber",
  "trainingProgram",
  "fichaNumber",
  "profilePhoto",
];

// Límites de longitud del contrato (API_REFERENCE.md — CreateGroup).
const MAX_LENGTHS = {
  document: 15,
  names: 100,
  lastNames: 100,
  email: 100,
  contactNumber: 20,
  landlineNumber: 20,
  trainingProgram: 100,
  fichaNumber: 20,
  profilePhoto: 500,
};

// Regla de contraseña del contrato JPA: mínimo 8 caracteres. La regla de
// GestionPage (5 + complejidad) NO se reutiliza — el contrato manda.
const PASSWORD_MIN = 8;

const EMPTY_FORM = {
  document: "",
  docType: "",
  names: "",
  lastNames: "",
  birthDate: "",
  email: "",
  password: "",
  idRol: "",
  contactNumber: "",
  landlineNumber: "",
  trainingProgram: "",
  fichaNumber: "",
  profilePhoto: "",
};

// Fecha estrictamente pasada (un nacimiento HOY aún no es fecha pasada).
const isPastDate = (value) => {
  if (!value) return false;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return new Date(`${value}T00:00:00`) < today;
};

// Documento alfanumérico del contrato (máx 15, sin espacios).
const isAlphanumeric = (value) => /^[A-Za-z0-9]+$/.test(value);

// Nombres/apellidos del contrato: solo letras y espacios (con acentos).
const isLettersAndSpaces = (value) => /^[A-Za-zÀ-ÿ\s]+$/.test(value);

/**
 * Construye el payload EXACTO del CreateGroup desde el estado del
 * formulario (spec §6):
 *   - requeridos siempre presentes, con idRol como NÚMERO (el select guarda
 *     string; el contrato exige número);
 *   - opcionales SOLO cuando llevan contenido — vacíos se omiten por
 *     completo del body del POST;
 *   - password viaja tal cual (sin trim — los espacios son parte del valor).
 */
const buildCreatePayload = (form) => {
  const payload = {
    document: form.document.trim(),
    docType: form.docType,
    names: form.names.trim(),
    lastNames: form.lastNames.trim(),
    birthDate: form.birthDate,
    email: form.email.trim(),
    password: form.password,
    idRol: Number(form.idRol),
  };
  OPTIONAL_FIELDS.forEach((key) => {
    const value = String(form[key] ?? "").trim();
    if (value !== "") payload[key] = value;
  });
  return payload;
};

// Indicador de regla en vivo en español (patrón visual Regla de
// GestionPage — solo el patrón; las reglas son las del contrato JPA).
const Regla = ({ ok, texto }) => (
  <span style={{ display: "block", fontSize: "13px", color: ok ? "#005222" : "#dc3545" }}>
    {ok ? "✅" : "❌"} {texto}
  </span>
);

/**
 * JpaUserCreateForm — formulario de creación con el contrato NATIVO del
 * microservicio (nombres de campo de la API, verbatim; NO reutiliza los
 * nombres de campos en español de los formularios Express).
 *
 * Flujo (design §Data Flow): submit → bloqueos locales (requeridos,
 * password < 8, birthDate no pasada) → createJpaUser(payload) → 201 →
 * showSuccess → onCreated() (el page re-consulta la PÁGINA ACTUAL) → el
 * formulario se reinicia.
 *
 * Errores (misma propiedad que el modal de edición): este componente es el
 * dueño del estado del formulario, por eso captura el fallo del POST y
 * mapea mapJpaError — el 400 con details[] alimenta los indicadores por
 * campo (fieldErrors) + dialog resumen; el 401 NO se maneja aquí (cliente
 * compartido: limpieza de sesión + redirección a "/"). Sin 401, la sesión
 * se conserva ante cualquier otro error.
 *
 * @param {Object} props
 * @param {Array|null} props.roles - Catálogo de GET /api/roles; null mientras carga, [] si no hay roles
 * @param {Function} props.onCreated - Notifica al page que un usuario fue creado (re-fetch de la página actual)
 */
function JpaUserCreateForm({ roles, onCreated }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [touched, setTouched] = useState({});
  const [fieldErrors, setFieldErrors] = useState({});
  const [creating, setCreating] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // null = catálogo en carga; [] = cargado sin roles (select deshabilitado).
  const rolesLoading = roles == null;
  const rolesEmpty = !rolesLoading && roles.length === 0;

  /**
   * Actualiza un campo con la higiene de entrada correspondiente:
   * teléfonos solo dígitos (patrón de GestionPage), documento sin
   * espacios (alfanumérico del contrato) y nombres/apellidos sin < >
   * (higiene XSS). Corregir un campo limpia su indicador del 400.
   */
  const handleChange = (name, rawValue) => {
    let value = rawValue;
    if (name === "contactNumber" || name === "landlineNumber") {
      value = rawValue.replace(/\D/g, "");
    } else if (name === "document") {
      value = rawValue.replace(/\s/g, "");
    } else if (name === "names" || name === "lastNames") {
      value = rawValue.replace(/[<>]/g, "");
    }
    setForm((prev) => ({ ...prev, [name]: value }));
    setTouched((prev) => ({ ...prev, [name]: true }));
    setFieldErrors((prev) => {
      if (!prev[name]) return prev;
      const next = { ...prev };
      delete next[name];
      return next;
    });
  };

  // Reglas en vivo del contrato (se muestran como indicadores Regla).
  const documentOk =
    form.document.trim() !== "" &&
    isAlphanumeric(form.document.trim());
  const namesOk =
    form.names.trim().length >= 3 && isLettersAndSpaces(form.names.trim());
  const lastNamesOk =
    form.lastNames.trim().length >= 3 && isLettersAndSpaces(form.lastNames.trim());
  const birthDateOk = isPastDate(form.birthDate);
  const passwordOk = form.password.length >= PASSWORD_MIN;

  /**
   * Envío del formulario. Todos los bloqueos son locales y en español
   * (spec §6: password < 8 JAMÁS viaja al servidor). noValidate en el
   * <form> garantiza que TODO resumen de validación sea dialog de
   * utils/alerts.js, nunca tooltip nativo del navegador.
   */
  const handleSubmit = async (event) => {
    event.preventDefault();
    // Marca los requeridos como tocados → los indicadores en vivo se ven.
    setTouched((prev) => ({
      ...prev,
      ...Object.fromEntries(REQUIRED_FIELDS.map((f) => [f, true])),
    }));

    const missing = REQUIRED_FIELDS.filter((f) => String(form[f] ?? "").trim() === "");
    if (missing.length > 0) {
      showWarning(
        "Formulario incompleto",
        "Por favor completa los campos obligatorios antes de continuar."
      );
      return;
    }

    // Bloqueo local obligatorio del mínimo de contraseña (spec §6).
    if (form.password.length < PASSWORD_MIN) {
      showWarning(
        "Contraseña demasiado corta",
        `La contraseña debe tener mínimo ${PASSWORD_MIN} caracteres.`
      );
      return;
    }

    if (!birthDateOk) {
      showError(
        "Fecha inválida",
        "La fecha de nacimiento debe ser una fecha pasada."
      );
      return;
    }

    setCreating(true);
    try {
      await createJpaUser(buildCreatePayload(form));
      showSuccess("¡Usuario creado!", "El usuario ha sido creado correctamente.");
      // onCreated → el page re-consulta la PÁGINA ACTUAL con los filtros
      // vigentes (design §Data Flow) y el formulario queda listo de nuevo.
      onCreated();
      setForm(EMPTY_FORM);
      setTouched({});
      setFieldErrors({});
    } catch (error) {
      // El 401 NO llega aquí (cliente compartido: sesión limpiada y
      // redirección aplicadas antes). Resto de errores: dialog por status +
      // fieldErrors por campo cuando el 400 trae details[].
      const { title, text, fieldErrors: fields } = mapJpaError(error);
      if (fields) setFieldErrors(fields);
      showError(title, text);
    } finally {
      setCreating(false);
    }
  };

  // Indicador de error por campo (details[] del 400 → fieldErrors).
  const fieldError = (name) =>
    fieldErrors[name] ? (
      <div className="text-danger mt-1" style={{ fontSize: "13px" }}>
        {fieldErrors[name]}
      </div>
    ) : null;

  return (
    <form className="row g-3" onSubmit={handleSubmit} noValidate>
      <p className="col-12 text-muted small mb-0">
        Los campos con <span className="text-danger">*</span> son obligatorios. Los
        demás son opcionales y se omiten del envío cuando quedan vacíos.
      </p>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-document">
          Documento <span className="text-danger">*</span>
        </label>
        <input
          id="create-document"
          type="text"
          className="form-control rounded-3 border-2"
          placeholder="1234567890"
          maxLength={MAX_LENGTHS.document}
          value={form.document}
          onChange={(e) => handleChange("document", e.target.value)}
        />
        {touched.document && (
          <div className="mt-1">
            <Regla ok={documentOk} texto="Solo letras y números, máximo 15 caracteres" />
          </div>
        )}
        {fieldError("document")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-docType">
          Tipo de documento <span className="text-danger">*</span>
        </label>
        <select
          id="create-docType"
          className="form-select rounded-3 border-2"
          value={form.docType}
          onChange={(e) => handleChange("docType", e.target.value)}
        >
          <option value="">Seleccione</option>
          {/* Enum exacto del servicio: CC/TI/CE/PP/RC/NIT (PPT no existe). */}
          {Object.entries(DOC_TYPE_LABELS).map(([code, label]) => (
            <option key={code} value={code}>
              {code} — {label}
            </option>
          ))}
        </select>
        {fieldError("docType")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-names">
          Nombres <span className="text-danger">*</span>
        </label>
        <input
          id="create-names"
          type="text"
          className="form-control rounded-3 border-2"
          placeholder="Juan Carlos"
          maxLength={MAX_LENGTHS.names}
          value={form.names}
          onChange={(e) => handleChange("names", e.target.value)}
        />
        {touched.names && (
          <div className="mt-1">
            <Regla ok={namesOk} texto="Entre 3 y 100 caracteres, solo letras y espacios" />
          </div>
        )}
        {fieldError("names")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-lastNames">
          Apellidos <span className="text-danger">*</span>
        </label>
        <input
          id="create-lastNames"
          type="text"
          className="form-control rounded-3 border-2"
          placeholder="Pérez Gómez"
          maxLength={MAX_LENGTHS.lastNames}
          value={form.lastNames}
          onChange={(e) => handleChange("lastNames", e.target.value)}
        />
        {touched.lastNames && (
          <div className="mt-1">
            <Regla ok={lastNamesOk} texto="Entre 3 y 100 caracteres, solo letras y espacios" />
          </div>
        )}
        {fieldError("lastNames")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-birthDate">
          Fecha de nacimiento <span className="text-danger">*</span>
        </label>
        <input
          id="create-birthDate"
          type="date"
          className="form-control rounded-3 border-2"
          value={form.birthDate}
          onChange={(e) => handleChange("birthDate", e.target.value)}
        />
        {touched.birthDate && form.birthDate && (
          <div className="mt-1">
            <Regla ok={birthDateOk} texto="Debe ser una fecha pasada" />
          </div>
        )}
        {fieldError("birthDate")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-email">
          Correo <span className="text-danger">*</span>
        </label>
        <input
          id="create-email"
          type="email"
          className="form-control rounded-3 border-2"
          placeholder="usuario@ejemplo.com"
          maxLength={MAX_LENGTHS.email}
          value={form.email}
          onChange={(e) => handleChange("email", e.target.value)}
        />
        {fieldError("email")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-idRol">
          Rol <span className="text-danger">*</span>
        </label>
        <select
          id="create-idRol"
          className="form-select rounded-3 border-2"
          value={form.idRol}
          onChange={(e) => handleChange("idRol", e.target.value)}
          disabled={rolesLoading || rolesEmpty}
        >
          {rolesLoading ? (
            // Catálogo en carga: select deshabilitado con estado visible.
            <option value="">Cargando roles…</option>
          ) : rolesEmpty ? (
            <option value="">Sin roles disponibles</option>
          ) : (
            <>
              <option value="">Seleccione</option>
              {/* Valor numérico idRol = valor enviado; nombreRol = etiqueta. */}
              {roles.map((role) => (
                <option key={role.idRol} value={role.idRol}>
                  {role.nombreRol}
                </option>
              ))}
            </>
          )}
        </select>
        {fieldError("idRol")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-password">
          Contraseña <span className="text-danger">*</span>
        </label>
        <div className="input-group">
          <input
            id="create-password"
            type={showPassword ? "text" : "password"}
            className="form-control rounded-start-3 border-2 border-end-0"
            placeholder="********"
            autoComplete="new-password"
            value={form.password}
            onChange={(e) => handleChange("password", e.target.value)}
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
        {/* Regla visible en vivo del contrato (bloqueo local si no se cumple). */}
        <div className="mt-1">
          <Regla ok={passwordOk} texto={`Mínimo ${PASSWORD_MIN} caracteres`} />
        </div>
        {fieldError("password")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-contactNumber">
          Celular
        </label>
        <input
          id="create-contactNumber"
          type="tel"
          className="form-control rounded-3 border-2"
          placeholder="3001234567"
          maxLength={MAX_LENGTHS.contactNumber}
          value={form.contactNumber}
          onChange={(e) => handleChange("contactNumber", e.target.value)}
        />
        {fieldError("contactNumber")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-landlineNumber">
          Teléfono fijo
        </label>
        <input
          id="create-landlineNumber"
          type="tel"
          className="form-control rounded-3 border-2"
          placeholder="6041234567"
          maxLength={MAX_LENGTHS.landlineNumber}
          value={form.landlineNumber}
          onChange={(e) => handleChange("landlineNumber", e.target.value)}
        />
        {fieldError("landlineNumber")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-trainingProgram">
          Programa de formación
        </label>
        <input
          id="create-trainingProgram"
          type="text"
          className="form-control rounded-3 border-2"
          placeholder="Análisis y Desarrollo de Software"
          maxLength={MAX_LENGTHS.trainingProgram}
          value={form.trainingProgram}
          onChange={(e) => handleChange("trainingProgram", e.target.value)}
        />
        {fieldError("trainingProgram")}
      </div>

      <div className="col-md-6">
        <label className="form-label small fw-semibold" htmlFor="create-fichaNumber">
          Número de ficha
        </label>
        <input
          id="create-fichaNumber"
          type="text"
          className="form-control rounded-3 border-2"
          placeholder="255678"
          maxLength={MAX_LENGTHS.fichaNumber}
          value={form.fichaNumber}
          onChange={(e) => handleChange("fichaNumber", e.target.value)}
        />
        {fieldError("fichaNumber")}
      </div>

      <div className="col-12">
        <label className="form-label small fw-semibold" htmlFor="create-profilePhoto">
          Foto de perfil (URL)
        </label>
        <input
          id="create-profilePhoto"
          type="url"
          className="form-control rounded-3 border-2"
          placeholder="https://…"
          maxLength={MAX_LENGTHS.profilePhoto}
          value={form.profilePhoto}
          onChange={(e) => handleChange("profilePhoto", e.target.value)}
        />
        {fieldError("profilePhoto")}
      </div>

      <div className="col-12 d-flex justify-content-end pt-3">
        <motion.button
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          type="submit"
          className="btn btn-success rounded-pill px-4 d-inline-flex align-items-center gap-2"
          style={SUCCESS_GRADIENT}
          disabled={creating}
        >
          <UserPlus size={16} /> {creating ? "Creando…" : "Crear usuario"}
        </motion.button>
      </div>
    </form>
  );
}

export default JpaUserCreateForm;
