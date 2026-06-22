import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { showSuccess, showError, showWarning } from "../utils/alerts";

function Registro() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    tipoDocumento: "",
    documento: "",
    correo: "",
    contraseña: "",
    confirmarContraseña: "",
    nombres: "",
    apellidos: "",
    fechaNacimiento: "",
  });

  // Validaciones
  const validaciones = {
    documento: {
      longitud: form.documento.length >= 8 && form.documento.length < 12,
    },
    correo: {
      tieneArroba: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.correo),
    },
    contraseña: {
      minCaracteres: form.contraseña.length >= 5,
      tieneMayuscula: /[A-Z]/.test(form.contraseña),
      tieneMinuscula: /[a-z]/.test(form.contraseña),
      tieneNumero: /[0-9]/.test(form.contraseña),
      tieneEspecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(
        form.contraseña,
      ),
    },
  };

  const igualContraseña = form.confirmarContraseña === form.contraseña;

  const documentoValido = Object.values(validaciones.documento).every(Boolean);
  const correoValido = Object.values(validaciones.correo).every(Boolean);
  const contraseñaValida = Object.values(validaciones.contraseña).every(
    Boolean,
  );
  const formularioValido = documentoValido && correoValido && contraseñaValida;

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.name === "documento") {
      value = value.replace(/\D/g, ""); // Solo permitir números
    }

    setForm({
      ...form,
      [e.target.name]: value,
    });
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Helper para íconos de validación
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

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marcar todos los campos como tocados para mostrar errores
    setTouched({
      documento: true,
      correo: true,
      contraseña: true,
      confirmarContraseña: true,
    });

    if (!formularioValido) {
      showWarning(
        "Formulario incompleto",
        "Por favor corrige los errores en el formulario antes de continuar."
      );
      return;
    }

    // Validar contraseñas
    if (form.contraseña !== form.confirmarContraseña) {
      showError("Error", "Las contraseñas no coinciden");
      return;
    }

    // Crear objeto con los nombres que espera tu backend
    const userData = {
      document: form.documento,
      doc_type: form.tipoDocumento,
      names: form.nombres,
      last_names: form.apellidos,
      birth_date: form.fechaNacimiento,
      email: form.correo,
      password: form.contraseña,
    };

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL || "http://localhost:5000"}/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(userData),
      });

      const data = await response.json();
      if (response.ok) {
        console.log(data);
        showSuccess("¡Registro Exitoso!", "Tu cuenta ha sido creada correctamente.");
        // Redirigir después de 2 segundos
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        if (response.status === 409) {
          showError(
            "Usuario ya registrado",
            "El documento o correo electrónico que intentas registrar ya existe."
          );
        } else {
          showError("Error", "❌ Error al registrar usuario");
        }
      }
    } catch (error) {
      console.error("Error en la solicitud:", error);
      showError("Error de conexión", "Error al conectar con el servidor");
    }
  };

  return (
    <>
      <div className="container-fluid bg-custom-green min-vh-100 d-flex justify-content-center align-items-center">
        <div
          className="card p-5 border-0 shadow-lg position-relative"
          style={{
            maxWidth: "800px",
            width: "95%",
            borderRadius: "15px",
          }}
        >
          <h2 className="text-center mb-4 fw-bold text-dark">
            Crea una cuenta en <br />
            Psychoway
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Fila 1: Nombres y Apellidos */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Nombres
                </label>
                <input
                  type="text"
                  className="form-control border-secondary-subtle"
                  name="nombres"
                  value={form.nombres}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Apellidos
                </label>
                <input
                  type="text"
                  className="form-control border-secondary-subtle"
                  name="apellidos"
                  value={form.apellidos}
                  onChange={handleChange}
                  required
                />
              </div>

              {/* Fila 2: Tipo y Documento */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Tipo de documento
                </label>
                <select
                  className="form-select border-secondary-subtle"
                  name="tipoDocumento"
                  value={form.tipoDocumento}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>
                    Seleccione
                  </option>
                  <option value="TI">Tarjeta de identidad</option>
                  <option value="CC">Cédula de ciudadanía</option>
                  <option value="CE">Cédula de extranjería</option>
                </select>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Documento
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <i className="bi bi-card-heading"></i>
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 border-secondary-subtle ps-0"
                    name="documento"
                    value={form.documento}
                    onChange={handleChange}
                    maxLength={11}
                    required
                    pattern="\d+"
                    title="Debe contener solo números"
                  />
                </div>
                {touched.documento && (
                  <div className="mt-1">
                    <Regla
                      ok={validaciones.documento.longitud}
                      texto="Ingrese un número de documento válido"
                    />
                  </div>
                )}
              </div>

              {/* Fila 3: Fecha de nacimiento y Correo */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Fecha de nacimiento
                </label>
                <div className="input-group">
                  <input
                    type="date"
                    className="form-control border-secondary-subtle"
                    name="fechaNacimiento"
                    value={form.fechaNacimiento}
                    onChange={handleChange}
                    required
                    placeholder="dd/mm/aaaa"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Correo electrónico
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <i className="bi bi-envelope"></i>
                  </span>
                  <input
                    type="email"
                    className="form-control border-start-0 border-secondary-subtle ps-0"
                    name="correo"
                    value={form.correo}
                    onChange={handleChange}
                    required
                  />
                </div>
                {touched.correo && (
                  <div className="mt-1">
                    <Regla
                      ok={validaciones.correo.tieneArroba}
                      texto="Debe ser un correo válido"
                    />
                  </div>
                )}
              </div>

              {/* Fila 4: Contraseñas */}
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 border-secondary-subtle ps-0"
                    name="contraseña"
                    value={form.contraseña}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="input-group-text bg-transparent border-start-0 border-secondary-subtle"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </span>
                </div>
                <div className="mt-1">
                  <p
                    style={{
                      fontSize: "13px",
                      marginBottom: "2px",
                      color: "#6c757d",
                    }}
                  >
                    La contraseña debe contener:
                  </p>
                  <Regla
                    ok={validaciones.contraseña.minCaracteres}
                    texto="Mínimo 5 caracteres"
                  />
                  <Regla
                    ok={validaciones.contraseña.tieneMayuscula}
                    texto="Al menos 1 letra mayúscula"
                  />
                  <Regla
                    ok={validaciones.contraseña.tieneMinuscula}
                    texto="Al menos 1 letra minúscula"
                  />
                  <Regla
                    ok={validaciones.contraseña.tieneNumero}
                    texto="Al menos 1 número"
                  />
                  <Regla
                    ok={validaciones.contraseña.tieneEspecial}
                    texto="Al menos 1 carácter especial (!@#$%...)"
                  />
                </div>
              </div>
              <div className="col-md-6">
                <label className="form-label text-muted small fw-bold">
                  Confirmar contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 border-secondary-subtle ps-0"
                    name="confirmarContraseña"
                    value={form.confirmarContraseña}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="input-group-text bg-transparent border-start-0 border-secondary-subtle"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </span>
                </div>
                {touched.confirmarContraseña && (
                  <div className="mt-1">
                    <Regla
                      ok={igualContraseña}
                      texto="Las contraseñas coinciden"
                    />
                  </div>
                )}
              </div>

              <div className="col-12 mt-4">
                <button
                  type="submit"
                  className="btn btn-custom-green w-100 py-2 rounded-2"
                >
                  Registrarse
                </button>
              </div>

              <div className="col-12 text-center mt-3">
                <small className="text-muted">
                  ¿Ya tienes una cuenta?
                  <Link
                    to="/"
                    className="text-decoration-none fw-bold ms-1 text-dark"
                  >
                    Inicia Sesion
                  </Link>
                </small>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}

export default Registro;
