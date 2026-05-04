import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import logo_sena from "../assets/img/img_sena.png";

function Inicio() {
  const navigate = useNavigate();
  const { login } = useAuth();

  const [form, setForm] = useState({
    documento: "",
    password: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [showError, setShowError] = useState(false);
  const [successMsg, setSuccessMsg] = useState("");
  const [showSuccess, setShowSuccess] = useState(false);

  const mostrarError = (mensaje) => {
    setErrorMsg(mensaje);
    setShowError(true);
    setTimeout(() => {
      setShowError(false);
    }, 5000);
  };

  const mostrarExito = (mensaje) => {
    setSuccessMsg(mensaje);
    setShowSuccess(true);
  };

  const handleChange = (e) => {
    // Limpiar error al escribir
    if (showError) setShowError(false);
    setForm({
      ...form,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      console.log("Enviando datos:", form);

      const response = await fetch("http://localhost:5000/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document: form.documento,
          password: form.password,
        }),
      });

      console.log("Status:", response.status);

      const text = await response.text();
      console.log("Respuesta cruda del servidor:", text);

      let data;
      try {
        data = JSON.parse(text);
      } catch {
        mostrarError("Error de comunicación con el servidor.");
        return;
      }

      if (!response.ok) {
        mostrarError(data.message || "Documento o contraseña incorrectos.");
        return;
      }

      login(data.user);
      console.log("Usuario:", data.user);

      const nombre = data.user.names || "usuario";
      mostrarExito(`¡Bienvenido/a, ${nombre}!`);

      const roleRoutes = {
        aprendiz: "/diario",
        psicologo: "/psi-seguimiento",
        administrador: "/gestion",
      };

      const destination = roleRoutes[data.user.rol] || "/diario";

      // Esperar 1.5s para que el usuario vea la notificación
      setTimeout(() => {
        navigate(destination);
      }, 1500);
    } catch (error) {
      console.error("Error en fetch:", error);
      mostrarError("No se pudo conectar con el servidor.");
    }
  };

  return (
    <>
      <style>{`
                .btn-inicio {
                    background-color: #005222;
                    color: white;
                }
                .btn-inicio:hover {
                    background-color: #001A0B;
                    color: white;
                }
                .contain {
                    background-color: #007832;
                    border-radius: 20px;
                    padding: 50px 8px 0px 8px;
                }
                @keyframes slideDown {
                    from {
                        opacity: 0;
                        transform: translateY(-15px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    15% { transform: translateX(-6px); }
                    30% { transform: translateX(6px); }
                    45% { transform: translateX(-4px); }
                    60% { transform: translateX(4px); }
                    75% { transform: translateX(-2px); }
                    90% { transform: translateX(2px); }
                }
                .login-error-alert {
                    animation: slideDown 0.35s ease-out, shake 0.5s ease-in-out 0.35s;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }
                .login-success-alert {
                    animation: slideDown 0.35s ease-out;
                    border: none;
                    border-radius: 10px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                    background-color: #d1e7dd;
                    color: #0a3622;
                }
            `}</style>

      <div className="container vh-100 d-flex align-items-center justify-content-center">
        <div
          className="row shadow-lg rounded-4 overflow-hidden w-100"
          style={{ maxWidth: "960px" }}
        >
          <div className="col-md-6 d-none d-md-flex bg-light align-items-center justify-content-center p-4">
            <img
              src={logo_sena}
              alt="logo"
              className="img-fluid"
              style={{
                maxHeight: "80%",
                maxWidth: "80%",
                objectFit: "contain",
                borderRadius: "20px",
              }}
            />
          </div>

          <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
            <div className="contain p-5">
              <h3 className="fw-bold mb-2 text-light">
                Iniciar Sesión en <br />
                <span>Psychoway</span>
              </h3>

              <p className="text-light mb-4">
                Inicia sesión con tu documento de <br />
                identidad y contraseña
              </p>

              <form onSubmit={handleSubmit}>
                {showError && (
                  <div
                    className="alert alert-danger login-error-alert d-flex align-items-center py-2 px-3 mb-3"
                    role="alert"
                  >
                    <i className="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
                    <div>{errorMsg}</div>
                    <button
                      type="button"
                      className="btn-close btn-close-sm ms-auto"
                      aria-label="Cerrar"
                      onClick={() => setShowError(false)}
                      style={{ fontSize: "0.65rem" }}
                    ></button>
                  </div>
                )}

                {showSuccess && (
                  <div
                    className="alert login-success-alert d-flex align-items-center py-2 px-3 mb-3"
                    role="alert"
                  >
                    <i className="bi bi-check-circle-fill me-2 fs-5"></i>
                    <div>{successMsg}</div>
                  </div>
                )}

                <div className="text-light mb-3">
                  <label htmlFor="documento" className="form-label">
                    Documento de identidad
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i
                        className="bi bi-person-badge"
                        style={{ color: "#007832" }}
                      ></i>
                    </span>
                    <input
                      type="number"
                      className="form-control"
                      id="documento"
                      placeholder="123456789"
                      value={form.documento}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="text-light mb-3">
                  <label htmlFor="password" className="form-label">
                    Contraseña
                  </label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i
                        className="bi bi-lock-fill"
                        style={{ color: "#007832" }}
                      ></i>
                    </span>

                    <input
                      type={showPassword ? "text" : "password"}
                      className="form-control border-end-0"
                      id="password"
                      placeholder="********"
                      value={form.password}
                      onChange={handleChange}
                      required
                    />

                    <span
                      className="input-group-text bg-white border-start-0"
                      style={{ cursor: "pointer" }}
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      <i
                        className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                        style={{ color: "#007832" }}
                      ></i>
                    </span>
                  </div>
                </div>

                <div className="mb-3">
                  <Link
                    to="/recuperar-password"
                    className="text-decoration-none fw-bold text-dark"
                  >
                    ¿Olvidaste tu contraseña?
                  </Link>
                </div>

                <div className="d-grid mb-3">
                  <button type="submit" className="btn btn-inicio">
                    Iniciar sesión
                  </button>
                </div>

                <hr />

                <div className="text-center">
                  <span className="text-light">¿No tienes una cuenta? </span>
                  <Link
                    to="/registro"
                    className="text-decoration-none fw-bold text-dark"
                  >
                    Crea una cuenta
                  </Link>
                </div>

                <div className="text-center mt-4 small text-light">
                  Psychoway © 2024
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default Inicio;
