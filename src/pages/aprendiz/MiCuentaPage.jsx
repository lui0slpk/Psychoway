import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { User, FileText, Lock, Eye, EyeOff, Save, Trash2, Shield } from "lucide-react";

function MiCuentaPage() {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    documento: user?.document || "", tipoDocumento: "", nombres: user?.names || "",
    apellidos: user?.last_names || "", fechaNacimiento: "", correo: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });
  const handleSubmit = (e) => { e.preventDefault(); console.log("Guardar cambios:", formData); };
  const handleDelete = () => { if (window.confirm("¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.")) console.log("Eliminar cuenta"); };

  return (
    <MainLayout pageTitle="Mi Cuenta" pageSubtitle="Modifica tus datos de registro" currentPage="mi-cuenta">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">
          <motion.div className="col-md-7" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><User size={20} className="text-success" /> Mi Cuenta</h5>
              <p className="text-muted small mb-4">Modifica tus datos de registro</p>
              <form className="mt-2" onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold"><FileText size={14} className="me-1" /> Documento</label>
                  <input type="text" className="form-control rounded-3 border-2" id="documento" placeholder="123456789" value={formData.documento} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Tipo de documento</label>
                  <select className="form-select rounded-3 border-2" id="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange}>
                    <option value="">Seleccione</option><option disabled>-------------</option>
                    <option value="TI">Tarjeta de Identidad</option><option value="CC">Cédula de Ciudadanía</option>
                    <option value="CE">Cédula de Extranjería</option><option value="PA">Pasaporte</option>
                  </select>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Nombres</label>
                    <input type="text" className="form-control rounded-3 border-2" id="nombres" placeholder="Kevin Andrés" value={formData.nombres} onChange={handleChange} />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold">Apellidos</label>
                    <input type="text" className="form-control rounded-3 border-2" id="apellidos" placeholder="Chaverra Quintero" value={formData.apellidos} onChange={handleChange} />
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Fecha de nacimiento</label>
                  <input type="date" className="form-control rounded-3 border-2" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold">Correo</label>
                  <input type="email" className="form-control rounded-3 border-2" id="correo" placeholder="correo@ejemplo.com" value={formData.correo} onChange={handleChange} />
                </div>
                <div className="mb-3">
                  <label className="form-label small fw-semibold"><Lock size={14} className="me-1" /> Contraseña</label>
                  <div className="input-group">
                    <input type={showPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="password" placeholder="********" value={formData.password} onChange={handleChange} />
                    <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                      {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </span>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Confirmar contraseña <span className="text-danger">*</span></label>
                  <div className="input-group">
                    <input type={showConfirmPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="confirmPassword" placeholder="********" value={formData.confirmPassword} onChange={handleChange} required />
                    <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                      {showConfirmPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                    </span>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-success rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2"
                    style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none" }}>
                    <Save size={16} /> Guardar cambios
                  </motion.button>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" className="btn btn-outline-danger rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2" onClick={handleDelete}>
                    <Trash2 size={16} /> Eliminar cuenta
                  </motion.button>
                </div>
              </form>
            </div>
          </motion.div>

          <motion.div className="col-md-3" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ position: "sticky", top: "100px" }}>
              <div className="d-flex flex-column gap-2">
                <span className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold" style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", color: "#fff" }}>
                  <User size={16} /> Mi cuenta
                </span>
                <Link to="/privacidad" className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold text-decoration-none text-dark" style={{ transition: "all 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "#f8f9fa"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  <Shield size={16} className="text-muted" /> Privacidad
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

export default MiCuentaPage;
