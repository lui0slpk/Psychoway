import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";

function GestionModPage() {
  const [buscarDocumento, setBuscarDocumento] = useState("");
  const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorModalMessage, setErrorModalMessage] = useState("");

  const [formData, setFormData] = useState({
    rol: "",
    documento: "",
    tipoDocumento: "",
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  const [touched, setTouched] = useState({});

  const validaciones = {
    documento: {
      longitud:
        formData.documento.length >= 8 && formData.documento.length <= 10,
    },
    password: {
      minCaracteres: formData.password ? formData.password.length >= 5 : true,
      tieneMayuscula: formData.password
        ? /[A-Z]/.test(formData.password)
        : true,
      tieneMinuscula: formData.password
        ? /[a-z]/.test(formData.password)
        : true,
      tieneNumero: formData.password ? /[0-9]/.test(formData.password) : true,
      tieneEspecial: formData.password
        ? /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(formData.password)
        : true,
    },
  };

  const documentoValido = Object.values(validaciones.documento).every(Boolean);
  const passwordValida = Object.values(validaciones.password).every(Boolean);

  const Regla = ({ ok, texto }) => (
    <span
      style={{
        display: "block",
        fontSize: "13px",
        color: ok ? "#198754" : "#dc3545",
      }}
    >
      {ok ? "✅" : "❌"} {texto}
    </span>
  );

  const [userId, setUserId] = useState(null);

  const handleBuscar = async () => {
    if (!buscarDocumento) {
      setErrorModalMessage("Por favor ingrese un número de documento");
      setShowErrorModal(true);
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/search/${buscarDocumento}`,
      );

      // Verificar si la respuesta es exitosa antes de intentar parsear JSON
      if (!response.ok) {
        // Si es 404 probablemente el endpoint no existe (falta reiniciar server) o usuario no encontrado
        if (response.status === 404) {
          const contentType = response.headers.get("content-type");
          if (contentType && contentType.indexOf("application/json") !== -1) {
            const errorData = await response.json();
            setErrorModalMessage(errorData.message || "Usuario no encontrado");
          } else {
            // Si devuelve HTML (Express default 404) es que el endpoint no existe
            setErrorModalMessage(
              "Error 404: El servicio de búsqueda no responde. Asegúrate de haber REINICIADO el servidor backend.",
            );
          }
          setShowErrorModal(true);
        } else {
          setErrorModalMessage(
            `Error del servidor: ${response.status} ${response.statusText}`,
          );
          setShowErrorModal(true);
        }
        setUsuarioEncontrado(false);
        setUserId(null);
        return;
      }

      const data = await response.json();
      console.log("DEBUG - Datos crudos del servidor:", data);

      setUsuarioEncontrado(true);
      setUserId(data.id_user);
      setSuccessMessage("¡Usuario Encontrado!");
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);

      // Mapear datos al formulario
      setFormData({
        rol: data.rol || "",
        documento: data.document || "",
        tipoDocumento: data.tipoDocumento || "",
        nombres: data.nombres || "",
        apellidos: data.apellidos || "",
        fechaNacimiento: data.fechaNacimiento || "",
        correo: data.correo || "",
        password: "",
        confirmPassword: "",
      });
      console.log("DEBUG - State formData actualizado con:", {
        ...formData,
        tipoDocumento: data.tipoDocumento,
      });
    } catch (error) {
      console.error("Error buscando usuario:", error);
      setErrorModalMessage(
        "Error de conexión: No se pudo contactar con el backend (localhost:5000). Asegúrate de que node server.js esté corriendo.",
      );
      setShowErrorModal(true);
    }
  };

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.id === "documento") {
      value = value.replace(/\D/g, ""); // Solo permitir números
    }
    setFormData({
      ...formData,
      [e.target.id]: value,
    });
    setTouched({ ...touched, [e.target.id]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ documento: true, password: true });

    if (!documentoValido || (formData.password && !passwordValida)) {
      alert(
        "Por favor corrige los errores en el formulario antes de continuar.",
      );
      return;
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      alert("Las contraseñas no coinciden");
      return;
    }

    try {
      const response = await fetch(
        `http://localhost:5000/api/users/update/${userId}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(formData),
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("¡Usuario Actualizado!");
        setShowSuccess(true);
        setTimeout(() => setShowSuccess(false), 2000);

        // Opcional: limpiar búsqueda
        setTimeout(() => {
          setUsuarioEncontrado(false);
          setBuscarDocumento("");
        }, 2000);
      } else {
        alert(`Error al actualizar: ${data.message}`);
      }
    } catch (error) {
      console.error("Error actualizando usuario:", error);
      alert("Error al conectar con el servidor");
    }
  };

  const handleDeleteClick = () => {
    setShowDeleteConfirm(true);
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false); // Hide confirmation modal and proceed
    try {
      const response = await fetch(
        `http://localhost:5000/api/users/delete/${userId}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        setSuccessMessage("¡Usuario Eliminado!");
        setShowSuccess(true);

        setTimeout(() => {
          setShowSuccess(false);
          setUsuarioEncontrado(false);
          setBuscarDocumento("");
          setUserId(null);
        }, 2000);
      } else {
        alert(`Error al eliminar: ${data.message}`);
      }
    } catch (error) {
      console.error("Error eliminando usuario:", error);
      alert("Error al conectar con el servidor");
    }
  };

  return (
    <MainLayout
      pageTitle="Gestión de Usuarios"
      pageSubtitle="Crea, elimina y modifica datos de usuario"
      currentPage="gestion-mod"
    >
      {/* Modal de éxito */}
      {showSuccess && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(51, 45, 45, 0.5)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 p-5 text-center shadow-lg"
            style={{ maxWidth: "400px" }}
          >
            <div className="mb-3">
              <i
                className="fas fa-check-circle text-success"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h3 className="fw-bold text-success mb-2">{successMessage}</h3>
            <p className="text-muted mb-0">
              {successMessage === "¡Usuario Encontrado!"
                ? "Los datos del usuario han sido cargados."
                : successMessage === "¡Usuario Eliminado!"
                  ? "La cuenta ha sido eliminada permanentemente."
                  : "Los datos han sido actualizados correctamente."}
            </p>
          </div>
        </div>
      )}

      {/* Modal de confirmación de eliminación */}
      {showDeleteConfirm && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(51, 45, 45, 0.5)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 p-5 text-center shadow-lg"
            style={{ maxWidth: "400px" }}
          >
            <div className="mb-3">
              <i
                className="fas fa-exclamation-triangle text-warning"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h3 className="fw-bold mb-2">¿Estás seguro?</h3>
            <p className="text-muted mb-4">
              ¿Deseas eliminar esta cuenta? Esta acción no se puede deshacer.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                type="button"
                className="btn btn-outline-secondary px-4 w-50"
                onClick={handleCancelDelete}
              >
                Cancelar
              </button>
              <button
                type="button"
                className="btn btn-danger px-4 w-50"
                onClick={executeDelete}
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de error/notificación */}
      {showErrorModal && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
          style={{
            backgroundColor: "rgba(51, 45, 45, 0.5)",
            zIndex: 9999,
          }}
        >
          <div
            className="bg-white rounded-4 p-5 text-center shadow-lg"
            style={{ maxWidth: "400px" }}
          >
            <div className="mb-3">
              <i
                className="fas fa-exclamation-circle text-danger"
                style={{ fontSize: "4rem" }}
              ></i>
            </div>
            <h3 className="fw-bold mb-2">Aviso</h3>
            <p className="text-muted mb-4">{errorModalMessage}</p>
            <div className="d-flex justify-content-center">
              <button
                type="button"
                className="btn btn-secondary px-5"
                onClick={() => setShowErrorModal(false)}
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="container-md my-5">
        <div className="row justify-content-center">
          {/* Buscador */}
          <div className="bg-white col-md-7 rounded-5 p-5 mb-3 shadow-sm">
            <h3 className="mb-2 fw-bold">Usuario a Modificar</h3>
            <div>
              <p className="mb-2">Documento del Usuario</p>
              <div className="position-relative">
                <input
                  type="text"
                  className="form-control"
                  placeholder="123456789"
                  value={buscarDocumento}
                  onChange={(e) => setBuscarDocumento(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleBuscar()}
                />
                <button
                  className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-muted"
                  type="button"
                  onClick={handleBuscar}
                >
                  <i className="fas fa-search"></i>
                </button>
              </div>
            </div>
          </div>

          {/* Panel lateral */}
          <div
            className="col-md-3 ms-3 p-5 shadow-sm bg-white rounded-5 mb-3"
            style={{ height: "fit-content" }}
          >
            <div className="list-group">
              <Link
                to="/gestion"
                className="list-group-item list-group-item-action d-block mb-2 border-0 rounded-5 p-3 fw-semibold"
              >
                Crear usuario
              </Link>
              <span className="list-group-item list-group-item-action active list-group-item-secondary border-0 rounded-5 p-3 fw-semibold">
                Modificar usuario
              </span>
            </div>
          </div>
        </div>

        {/* Formulario de modificación (solo visible cuando se encuentra usuario) */}
        {usuarioEncontrado && (
          <div className="row justify-content-center">
            <div className="col-md-7 shadow-sm p-5 bg-white rounded-5">
              <h2 className="fw-bold">Modifica una Cuenta</h2>
              <p className="text-muted">Modifica y elimina datos de registro</p>
              <form className="mt-3" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label">Rol del Usuario</label>
                  <select
                    className="form-select"
                    id="rol"
                    value={formData.rol}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option disabled>-------------</option>
                    <option value="aprendiz">Aprendiz</option>
                    <option value="psicologo">Psicólogo</option>
                    <option value="administrador">Administrador</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Documento</label>
                  <input
                    type="text"
                    className="form-control"
                    id="documento"
                    placeholder="123456789"
                    value={formData.documento}
                    onChange={handleChange}
                    maxLength={10}
                    pattern="\d+"
                    title="Debe contener solo números"
                    required
                  />
                  {touched.documento && (
                    <div className="mt-1">
                      <Regla
                        ok={validaciones.documento.longitud}
                        texto="Debe tener entre 8 y 10 números"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">Tipo de documento</label>
                  <select
                    className="form-select"
                    id="tipoDocumento"
                    value={formData.tipoDocumento}
                    onChange={handleChange}
                    required
                  >
                    <option value="">Seleccione</option>
                    <option disabled>-------------</option>
                    <option value="TI">Tarjeta de Identidad</option>
                    <option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option>
                    <option value="PA">Pasaporte</option>
                  </select>
                </div>

                <div className="mb-3">
                  <label className="form-label">Nombres</label>
                  <input
                    type="text"
                    className="form-control"
                    id="nombres"
                    placeholder="Kevin Andrés"
                    value={formData.nombres}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Apellidos</label>
                  <input
                    type="text"
                    className="form-control"
                    id="apellidos"
                    placeholder="Chaverra Quintero"
                    value={formData.apellidos}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Fecha de nacimiento</label>
                  <input
                    type="date"
                    className="form-control"
                    id="fechaNacimiento"
                    value={formData.fechaNacimiento}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Correo</label>
                  <input
                    type="email"
                    className="form-control"
                    id="correo"
                    placeholder="psychoway66@gmail.com"
                    value={formData.correo}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="mb-3">
                  <label className="form-label">Contraseña</label>
                  <div className="input-group">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-end-0"
                      id="password"
                      placeholder="********"
                      value={formData.password}
                      onChange={handleChange}
                    />
                    <span
                      className="input-group-text bg-transparent border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </span>
                  </div>
                  {formData.password && (
                    <div className="mt-1">
                      <p
                        style={{
                          fontSize: "13px",
                          marginBottom: "2px",
                          color: "#6c757d",
                        }}
                      >
                        La nueva contraseña debe contener:
                      </p>
                      <Regla
                        ok={validaciones.password.minCaracteres}
                        texto="Mínimo 5 caracteres"
                      />
                      <Regla
                        ok={validaciones.password.tieneMayuscula}
                        texto="Al menos 1 letra mayúscula"
                      />
                      <Regla
                        ok={validaciones.password.tieneMinuscula}
                        texto="Al menos 1 letra minúscula"
                      />
                      <Regla
                        ok={validaciones.password.tieneNumero}
                        texto="Al menos 1 número"
                      />
                      <Regla
                        ok={validaciones.password.tieneEspecial}
                        texto="Al menos 1 carácter especial (!@#$%...)"
                      />
                    </div>
                  )}
                </div>

                <div className="mb-3">
                  <label className="form-label">
                    Confirmar contraseña{" "}
                    {formData.password && (
                      <span className="text-danger">*</span>
                    )}
                  </label>
                  <div className="input-group">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      className="form-control border-end-0"
                      id="confirmPassword"
                      placeholder="********"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      required={!!formData.password}
                    />
                    <span
                      className="input-group-text bg-transparent border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                    >
                      <i className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                    </span>
                  </div>
                </div>

                <div className="d-flex gap-3 justify-content-center">
                  <button
                    type="submit"
                    className="btn btn-outline-success px-4 w-50"
                  >
                    Guardar cambios
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-danger px-4 w-50"
                    onClick={handleDeleteClick}
                  >
                    Eliminar cuenta
                  </button>
                </div>
              </form>
            </div>
            {/* Espacio para mantener alineación */}
            <div className="col-md-3 ms-3"></div>
          </div>
        )}
      </div>
    </MainLayout>
  );
}

export default GestionModPage;
