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

    const handleChange = (e) => {
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
                alert("El servidor está devolviendo HTML, no JSON.");
                return;
            }

            if (!response.ok) {
                alert(data.message);
                return;
            }

            login(data.user);
            console.log("Usuario:", data.user);

            const roleRoutes = {
                aprendiz: "/diario",
                psicologo: "/psi-seguimiento",
                administrador: "/gestion"
            };

            const destination = roleRoutes[data.user.rol] || "/diario";
            navigate(destination);

        } catch (error) {
            console.error("Error en fetch:", error);
            alert("No se pudo conectar con el servidor.");
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
            `}</style>

            <div className="container vh-100 d-flex align-items-center justify-content-center">
                <div className="row shadow-lg rounded-4 overflow-hidden w-100" style={{ maxWidth: "960px" }}>
                    
                    <div className="col-md-6 d-none d-md-flex bg-light align-items-center justify-content-center p-4">
                        <img 
                            src={logo_sena} 
                            alt="logo" 
                            className="img-fluid" 
                            style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain', borderRadius: '20px' }} 
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

                                <div className="text-light mb-3">
                                    <label htmlFor="documento" className="form-label">
                                        Documento de identidad
                                    </label>
                                    <div className="input-group">
                                        <span className="input-group-text">
                                            <i className="bi bi-person-badge" style={{ color: "#007832" }}></i>
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
                                            <i className="bi bi-lock-fill" style={{ color: "#007832" }}></i>
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
                                            <i className={`bi ${showPassword ? 'bi-eye-slash' : 'bi-eye'}`} style={{ color: "#007832" }}></i>
                                        </span>
                                    </div>
                                </div>

                                <div className="mb-3">
                                    <Link to="/recuperar-password" className="text-decoration-none fw-bold text-dark">
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
                                    <Link to="/registro" className="text-decoration-none fw-bold text-dark">
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