import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import logo_sena from "../assets/img/img_sena.png";

function RecuperarPassword() {
    const navigate = useNavigate();
    const [correo, setCorreo] = useState("");
    const [showSuccess, setShowSuccess] = useState(false);
    const [showError, setShowError] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            // Verificar si el correo existe llamando a la ruta de búsqueda
            // Asumiremos que crearemos/existe una ruta o usaremos una genérica para buscar por correo.
            // Para mantener compatibilidad con lo actual, envíamos petición POST a nueva ruta u otra
            const response = await fetch('http://localhost:5000/api/users/check-email', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ correo })
            });

            if (response.ok) {
                setShowSuccess(true);
                setTimeout(() => {
                    navigate("/");
                }, 2000);
            } else {
                setShowError(true);
                setTimeout(() => {
                    setShowError(false);
                }, 3000);
            }
        } catch (error) {
            console.error("Error validando correo:", error);
            alert("Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.");
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
                        <h3 className="fw-bold text-success mb-2">
                            ¡Envío Exitoso!
                        </h3>
                        <p className="text-muted mb-0">
                            Te hemos enviado un enlace para restablecer tu contraseña.
                        </p>
                        <p className="text-muted mt-2">
                            Redirigiendo al inicio de sesión...
                        </p>
                        <div
                            className="spinner-border spinner-border-sm text-primary mt-2"
                            role="status"
                        >
                            <span className="visually-hidden">Cargando...</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal de error */}
            {showError && (
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
                                className="fas fa-times-circle text-danger"
                                style={{ fontSize: "4rem" }}
                            ></i>
                        </div>
                        <h3 className="fw-bold text-danger mb-2">
                            ¡Correo no encontrado!
                        </h3>
                        <p className="text-muted mb-0">
                            El correo ingresado no se encuentra registrado en nuestra base de datos.
                        </p>
                        <p className="text-muted mt-2">
                            Inténtalo de nuevo.
                        </p>
                    </div>
                </div>
            )}

            <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: '#eef2f5' }}>
                <div className="row shadow-lg rounded-4 overflow-hidden bg-white w-100" style={{ maxWidth: "960px", minHeight: "550px" }}>
                    {/* Imagen lateral */}
                    <div className="col-md-6 d-none d-md-flex align-items-center justify-content-center p-4 bg-light">
                         <img 
                            src={logo_sena} 
                            alt="logo o ilustración" 
                            className="img-fluid" 
                            style={{ maxHeight: '90%', maxWidth: '90%', objectFit: 'contain', borderRadius: '20px' }} 
                        />
                    </div>

                    {/* Formulario de recuperación */}
                    <div className="col-md-6 bg-white p-5 d-flex flex-column justify-content-center">
                        <div className="contain p-5">
                            <h2 className="fw-bolder mb-3 text-light" style={{ fontSize: '2.2rem', letterSpacing: '-0.5px' }}>
                                ¿Olvidaste tu <br />
                                contraseña?
                            </h2>
                            <p className="text-light mb-4" style={{ fontSize: '0.90rem', lineHeight: '1.5' }}>
                                Ingresa tu correo electrónico y te enviaremos un enlace para restaurar tu contraseña.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="text-light mb-4 mt-2">
                                    <label htmlFor="correo" className="form-label small fw-semibold">
                                        Correo electrónico
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text bg-white border-end-0 border-secondary-subtle">
                                            <i className="bi bi-envelope" style={{ color: "#007832" }}></i>
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
                                    <button type="submit" className="btn btn-inicio py-2 fw-semibold rounded-2 mt-2">
                                        Enviar
                                    </button>
                                </div>

                                <hr className="text-light" />

                                <div className="text-center mt-4">
                                    <Link to="/" className="text-decoration-underline fw-bold text-light" style={{ fontSize: '0.9rem' }}>
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
