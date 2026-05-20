import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { motion } from "framer-motion";
import { UserPlus, Edit3, Eye, EyeOff } from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { showSuccess, showError, showWarning } from "../../utils/alerts";

function GestionPage() {
  const { authFetch } = useAuth();

  const [showPassword, setShowPassword] = useState(false);
  const [touched, setTouched] = useState({});
  const [formData, setFormData] = useState({ rol: "", documento: "", tipoDocumento: "", nombres: "", apellidos: "", fechaNacimiento: "", correo: "", password: "" });

  const validaciones = {
    documento: { longitud: formData.documento.length >= 8 && formData.documento.length <= 10 },
    password: {
      minCaracteres: formData.password.length >= 5, tieneMayuscula: /[A-Z]/.test(formData.password),
      tieneMinuscula: /[a-z]/.test(formData.password), tieneNumero: /[0-9]/.test(formData.password),
      tieneEspecial: /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password),
    },
  };
  const documentoValido = Object.values(validaciones.documento).every(Boolean);
  const passwordValida = Object.values(validaciones.password).every(Boolean);

  const Regla = ({ ok, texto }) => (<span style={{ display: "block", fontSize: "13px", color: ok ? "#005222" : "#dc3545" }}>{ok ? "✅" : "❌"} {texto}</span>);

  const handleChange = (e) => {
    let value = e.target.value;
    if (e.target.id === "documento") value = value.replace(/\D/g, "");
    setFormData({ ...formData, [e.target.id]: value }); setTouched({ ...touched, [e.target.id]: true });
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); setTouched({ password: true, documento: true });
    if (!passwordValida || !documentoValido) {
      showWarning(
        "Formulario incompleto",
        "Por favor corrige los errores en el formulario antes de continuar."
      );
      return;
    }
    try {
      const response = await authFetch("http://localhost:5000/api/users/create", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await response.json();
      if (response.ok) {
        showSuccess("¡Registro Exitoso!", "El usuario ha sido creado correctamente.");
        setFormData({ rol: "", documento: "", tipoDocumento: "", nombres: "", apellidos: "", fechaNacimiento: "", correo: "", password: "" }); setTouched({});
      } else showError("Error", data.message || "Error al crear usuario");
    } catch (error) {
      console.error("Error:", error);
      showError("Error de conexión", "Error al conectar con el servidor.");
    }
  };

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <MainLayout pageTitle="Gestión de Usuarios" pageSubtitle="Crea, elimina y modifica datos de usuario" currentPage="gestion">


      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">
          <motion.div className="col-md-7" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><UserPlus size={20} className="text-success" /> Crea una Cuenta</h5>
              <p className="text-muted small mb-4">Registra un nuevo usuario</p>
              <form className="mt-2" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Rol del Usuario <span className="text-danger">*</span></label>
                  <select className="form-select rounded-3 border-2" id="rol" value={formData.rol} onChange={handleChange} required>
                    <option value="">Seleccione</option><option disabled>-------------</option>
                    <option value="aprendiz">Aprendiz</option><option value="psicologo">Psicólogo</option><option value="administrador">Administrador</option>
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Documento <span className="text-danger">*</span></label>
                  <input type="text" className="form-control rounded-3 border-2" id="documento" placeholder="123456789" value={formData.documento} onChange={handleChange} maxLength={10} pattern="\d+" title="Solo números" required />
                  {touched.documento && <div className="mt-1"><Regla ok={validaciones.documento.longitud} texto="Debe tener entre 8 y 10 números" /></div>}
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Tipo de documento <span className="text-danger">*</span></label>
                  <select className="form-select rounded-3 border-2" id="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required>
                    <option value="">Seleccione</option><option disabled>-------------</option>
                    <option value="TI">Tarjeta de Identidad</option><option value="CC">Cédula de Ciudadanía</option><option value="CE">Cédula de Extranjería</option><option value="PA">Pasaporte</option>
                  </select>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6"><label className="form-label small fw-semibold">Nombres <span className="text-danger">*</span></label><input type="text" className="form-control rounded-3 border-2" id="nombres" placeholder="Kevin Andrés" value={formData.nombres} onChange={handleChange} required /></div>
                  <div className="col-md-6"><label className="form-label small fw-semibold">Apellidos <span className="text-danger">*</span></label><input type="text" className="form-control rounded-3 border-2" id="apellidos" placeholder="Chaverra Quintero" value={formData.apellidos} onChange={handleChange} required /></div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Fecha de nacimiento <span className="text-danger">*</span></label>
                  <input type="date" className="form-control rounded-3 border-2" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Correo <span className="text-danger">*</span></label>
                  <input type="email" className="form-control rounded-3 border-2" id="correo" placeholder="psychoway66@gmail.com" value={formData.correo} onChange={handleChange} required />
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Contraseña <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input type={showPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="password" placeholder="********" value={formData.password} onChange={handleChange} required />
                    <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </span>
                  </div>
                  <div className="mt-2"><p style={{ fontSize: "13px", marginBottom: "4px", color: "#6c757d" }}>La contraseña debe contener:</p>
                    <Regla ok={validaciones.password.minCaracteres} texto="Mínimo 5 caracteres" /><Regla ok={validaciones.password.tieneMayuscula} texto="Al menos 1 mayúscula" />
                    <Regla ok={validaciones.password.tieneMinuscula} texto="Al menos 1 minúscula" /><Regla ok={validaciones.password.tieneNumero} texto="Al menos 1 número" />
                    <Regla ok={validaciones.password.tieneEspecial} texto="Al menos 1 carácter especial" />
                  </div>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-success rounded-pill px-5 w-100"
                  style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none" }}>
                  <UserPlus size={16} className="me-2" /> Crear Cuenta
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div className="col-md-3" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ position: "sticky", top: "100px" }}>
              <div className="d-flex flex-column gap-2">
                <span className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold" style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", color: "#fff" }}><UserPlus size={16} /> Crear usuario</span>
                <Link to="/gestion-mod" className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold text-decoration-none text-dark" style={{ transition: "all 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "#f8f9fa"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  <Edit3 size={16} className="text-muted" /> Modificar usuario
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default GestionPage;
