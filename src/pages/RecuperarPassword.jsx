import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo_sena from "../assets/img/img_sena.png";
import { showSuccess, showError } from "../utils/alerts";

function RecuperarPassword() {
  const navigate = useNavigate();
  const [correo, setCorreo] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(
        `${process.env.REACT_APP_API_URL || "http://localhost:5000"}/api/password/forgot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ correo }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showSuccess(
          "¡Envío Exitoso!",
          "Te hemos enviado un enlace para restablecer tu contraseña."
        );
        setTimeout(() => {
          navigate("/");
        }, 2000);
      } else {
        showError(
          "Error",
          data.message || "El correo ingresado no se encuentra registrado en nuestra base de datos."
        );
      }
    } catch (error) {
      console.error("Error validando correo:", error);
      showError(
        "Error de conexión",
        "Error al conectar con el servidor."
      );
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
        .link-green {
          color: #005222;
        }
        .link-green:hover {
          color: #001A0B;
        }
        .contain {
          background-color: #007832;
          border-radius: 20px;
          padding: 50px 8px 0px 8px;
        }
      `}</style>


      <div
        className="container-fluid vh-100 d-flex align-items-center justify-content-center"
        style={{ backgroundColor: "#eef2f5" }}
      >
        <div
          className="row shadow-lg rounded-4 overflow-hidden bg-white w-100"
          style={{ maxWidth: "960px", minHeight: "550px" }}
        >
          {/* Imagen lateral */}
          <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-4 bg-light">
            <img
              src={logo_sena}
              alt="logo o ilustración"
              className="img-fluid"
              style={{
                maxHeight: "90%",
                maxWidth: "90%",
                objectFit: "contain",
                borderRadius: "20px",
              }}
            />
          </div>

          {/* Formulario de recuperación */}
          <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
            <div className="contain p-5">
              <h2
                className="fw-bolder mb-3 text-light"
                style={{ fontSize: "2.2rem", letterSpacing: "-0.5px" }}
              >
                ¿Olvidaste tu <br />
                contraseña?
              </h2>
              <p
                className="text-light mb-4"
                style={{ fontSize: "0.90rem", lineHeight: "1.5" }}
              >
                Ingresa tu correo electrónico y te enviaremos un enlace para
                restaurar tu contraseña.
              </p>

              <form onSubmit={handleSubmit}>
                <div className="text-light mb-4 mt-2">
                  <label
                    htmlFor="correo"
                    className="form-label small fw-semibold"
                  >
                    Correo electrónico
                  </label>
                  <div className="input-group">
                    <span className="input-group-text bg-white border-end-0 border-secondary-subtle">
                      <i
                        className="bi bi-envelope"
                        style={{ color: "#007832" }}
                      ></i>
                    </span>
                    <input
                      type="email"
                      className="form-control border-start-0 border-secondary-subtle ps-0 py-2"
                      id="correo"
                      placeholder="psychoway66@correo.com"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      required
                    />
                  </div>
                </div>

                <div className="d-grid mb-4">
                  <button
                    type="submit"
                    className="btn btn-inicio py-2 fw-semibold rounded-2 mt-2"
                  >
                    Enviar
                  </button>
                </div>

                <hr className="text-light" />

                <div className="text-center mt-4">
                  <Link
                    to="/"
                    className="text-decoration-underline fw-bold text-light"
                    style={{ fontSize: "0.9rem" }}
                  >
                    Volver a Iniciar Sesión.
                  </Link>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RecuperarPassword;
