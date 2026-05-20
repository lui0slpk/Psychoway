import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { showSuccess, showError } from "../utils/alerts";

function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [touched, setTouched] = useState({});

  const [form, setForm] = useState({
    contraseña: "",
    confirmarContraseña: "",
  });

  // Validaciones (mismas que Registro)
  const validaciones = {
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

  const igualContraseña =
    form.confirmarContraseña === form.contraseña && form.contraseña.length > 0;
  const contraseñaValida = Object.values(validaciones.contraseña).every(
    Boolean,
  );
  const formularioValido = contraseñaValida && igualContraseña;

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
    setTouched({ ...touched, [e.target.name]: true });
  };

  // Helper para íconos de validación (igual que Registro)
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

  useEffect(() => {
    if (!token) {
      showError(
        "Token inválido",
        "No se proporcionó un token de recuperación válido."
      );
    }
  }, [token]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    setTouched({ contraseña: true, confirmarContraseña: true });

    if (!formularioValido) {
      return;
    }

    setLoading(true);

    try {
      const response = await fetch("http://localhost:5000/api/password/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token: token,
          newPassword: form.contraseña,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          "¡Contraseña Actualizada!",
          "Tu contraseña ha sido restablecida correctamente. Redirigiendo al inicio de sesión..."
        );
        setTimeout(() => {
          navigate("/");
        }, 2500);
      } else {
        showError(
          "Error",
          data.message || "Error al restablecer la contraseña."
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showError(
        "Error de conexión",
        "Error al conectar con el servidor. Asegúrate de que el backend esté corriendo."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>

      <div className="container-fluid bg-custom-green min-vh-100 d-flex justify-content-center align-items-center">
        <div
          className="card p-5 border-0 shadow-lg position-relative"
          style={{
            maxWidth: "550px",
            width: "95%",
            borderRadius: "15px",
          }}
        >
          <h2 className="text-center mb-2 fw-bold text-dark">
            Restablecer contraseña
          </h2>
          <p
            className="text-center text-muted mb-4"
            style={{ fontSize: "0.9rem" }}
          >
            Ingresa tu nueva contraseña para recuperar tu cuenta en Psychoway.
          </p>

          <form onSubmit={handleSubmit}>
            <div className="row g-4">
              {/* Nueva contraseña */}
              <div className="col-12">
                <label className="form-label text-muted small fw-bold">
                  Nueva contraseña
                </label>
                <div className="input-group">
                  <span className="input-group-text bg-transparent border-end-0 border-secondary-subtle">
                    <i className="bi bi-lock"></i>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-start-0 border-end-0 border-secondary-subtle ps-0"
                    name="contraseña"
                    placeholder="Ingresa tu nueva contraseña"
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

              {/* Confirmar contraseña */}
              <div className="col-12">
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
                    placeholder="Repite tu nueva contraseña"
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
                  disabled={loading || !formularioValido}
                >
                  {loading ? (
                    <>
                      <span
                        className="spinner-border spinner-border-sm me-2"
                        role="status"
                      ></span>
                      Actualizando...
                    </>
                  ) : (
                    "Restablecer contraseña"
                  )}
                </button>
              </div>

              <div className="col-12 text-center mt-3">
                <small className="text-muted">
                  <Link
                    to="/"
                    className="text-decoration-none fw-bold ms-1 text-dark"
                  >
                    Volver a Iniciar Sesión
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

export default ResetPassword;
