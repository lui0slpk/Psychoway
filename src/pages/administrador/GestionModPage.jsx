import React, { useState } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { motion, AnimatePresence } from "framer-motion";
import { UserPlus, Edit3, Search, Eye, EyeOff, CheckCircle, AlertTriangle, AlertCircle, Save, Trash2 } from "lucide-react";

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
  const [formData, setFormData] = useState({ rol: "", documento: "", tipoDocumento: "", nombres: "", apellidos: "", fechaNacimiento: "", correo: "", password: "", confirmPassword: "" });
  const [touched, setTouched] = useState({});
  const [userId, setUserId] = useState(null);

  const validaciones = {
    documento: { longitud: formData.documento.length >= 8 && formData.documento.length <= 10 },
    password: {
      minCaracteres: formData.password ? formData.password.length >= 5 : true, tieneMayuscula: formData.password ? /[A-Z]/.test(formData.password) : true,
      tieneMinuscula: formData.password ? /[a-z]/.test(formData.password) : true, tieneNumero: formData.password ? /[0-9]/.test(formData.password) : true,
      tieneEspecial: formData.password ? /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(formData.password) : true,
    },
  };
  const documentoValido = Object.values(validaciones.documento).every(Boolean);
  const passwordValida = Object.values(validaciones.password).every(Boolean);
  const Regla = ({ ok, texto }) => (<span style={{ display: "block", fontSize: "13px", color: ok ? "#005222" : "#dc3545" }}>{ok ? "✅" : "❌"} {texto}</span>);

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const handleBuscar = async () => {
    if (!buscarDocumento) { setErrorModalMessage("Por favor ingrese un número de documento"); setShowErrorModal(true); return; }
    try {
      const response = await fetch(`http://localhost:5000/api/users/search/${buscarDocumento}`);
      if (!response.ok) {
        if (response.status === 404) {
          const ct = response.headers.get("content-type");
          if (ct && ct.indexOf("application/json") !== -1) { const d = await response.json(); setErrorModalMessage(d.message || "Usuario no encontrado"); }
          else setErrorModalMessage("Error 404: El servicio no responde. Reinicia el backend.");
          setShowErrorModal(true);
        } else { setErrorModalMessage(`Error del servidor: ${response.status}`); setShowErrorModal(true); }
        setUsuarioEncontrado(false); setUserId(null); return;
      }
      const data = await response.json();
      setUsuarioEncontrado(true); setUserId(data.id_user); setSuccessMessage("¡Usuario Encontrado!"); setShowSuccess(true); setTimeout(() => setShowSuccess(false), 2000);
      setFormData({ rol: data.rol || "", documento: data.document || "", tipoDocumento: data.tipoDocumento || "", nombres: data.nombres || "", apellidos: data.apellidos || "", fechaNacimiento: data.fechaNacimiento || "", correo: data.correo || "", password: "", confirmPassword: "" });
    } catch (error) { console.error("Error:", error); setErrorModalMessage("Error de conexión con el backend."); setShowErrorModal(true); }
  };

  const handleChange = (e) => { let v = e.target.value; if (e.target.id === "documento") v = v.replace(/\D/g, ""); setFormData({ ...formData, [e.target.id]: v }); setTouched({ ...touched, [e.target.id]: true }); };

  const handleSubmit = async (e) => {
    e.preventDefault(); setTouched({ documento: true, password: true });
    if (!documentoValido || (formData.password && !passwordValida)) { alert("Corrige los errores."); return; }
    if (formData.password && formData.password !== formData.confirmPassword) { alert("Las contraseñas no coinciden"); return; }
    try {
      const r = await fetch(`http://localhost:5000/api/users/update/${userId}`, { method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify(formData) });
      const data = await r.json();
      if (r.ok) { setSuccessMessage("¡Usuario Actualizado!"); setShowSuccess(true); setTimeout(() => { setShowSuccess(false); setUsuarioEncontrado(false); setBuscarDocumento(""); }, 2000); }
      else alert(`Error: ${data.message}`);
    } catch (e) { console.error("Error:", e); alert("Error al conectar con el servidor"); }
  };

  const executeDelete = async () => {
    setShowDeleteConfirm(false);
    try {
      const r = await fetch(`http://localhost:5000/api/users/delete/${userId}`, { method: "DELETE" });
      const data = await r.json();
      if (r.ok) { setSuccessMessage("¡Usuario Eliminado!"); setShowSuccess(true); setTimeout(() => { setShowSuccess(false); setUsuarioEncontrado(false); setBuscarDocumento(""); setUserId(null); }, 2000); }
      else alert(`Error: ${data.message}`);
    } catch (e) { console.error("Error:", e); alert("Error al conectar"); }
  };

  const ModalOverlay = ({ children }) => (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center" style={{ backgroundColor: "rgba(0,0,0,0.4)", zIndex: 9999 }}>
      <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} className="card border-0 rounded-4 p-5 text-center shadow-lg" style={{ maxWidth: "400px" }}>{children}</motion.div>
    </motion.div>
  );

  return (
    <MainLayout pageTitle="Gestión de Usuarios" pageSubtitle="Crea, elimina y modifica datos de usuario" currentPage="gestion-mod">
      <AnimatePresence>
        {showSuccess && <ModalOverlay><CheckCircle size={64} className="text-success mx-auto mb-3" /><h3 className="fw-bold text-success mb-2">{successMessage}</h3><p className="text-muted mb-0">{successMessage === "¡Usuario Encontrado!" ? "Datos cargados." : successMessage === "¡Usuario Eliminado!" ? "Cuenta eliminada." : "Datos actualizados."}</p></ModalOverlay>}
        {showDeleteConfirm && <ModalOverlay><AlertTriangle size={64} className="text-warning mx-auto mb-3" /><h3 className="fw-bold mb-2">¿Estás seguro?</h3><p className="text-muted mb-4">Esta acción no se puede deshacer.</p><div className="d-flex gap-3"><button className="btn btn-outline-secondary rounded-pill px-4 w-50" onClick={() => setShowDeleteConfirm(false)}>Cancelar</button><button className="btn btn-danger rounded-pill px-4 w-50" onClick={executeDelete}>Eliminar</button></div></ModalOverlay>}
        {showErrorModal && <ModalOverlay><AlertCircle size={64} className="text-danger mx-auto mb-3" /><h3 className="fw-bold mb-2">Aviso</h3><p className="text-muted mb-4">{errorModalMessage}</p><button className="btn btn-secondary rounded-pill px-5" onClick={() => setShowErrorModal(false)}>Entendido</button></ModalOverlay>}
      </AnimatePresence>

      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">
          <motion.div className="col-md-7" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><Search size={20} className="text-success" /> Usuario a Modificar</h5>
              <p className="text-muted small mb-3">Busca por documento</p>
              <div className="position-relative mb-2">
                <input type="text" className="form-control rounded-3 border-2" placeholder="123456789" value={buscarDocumento} onChange={e => setBuscarDocumento(e.target.value)} onKeyDown={e => e.key === "Enter" && handleBuscar()} />
                <motion.button whileHover={{ scale: 1.1 }} className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent" type="button" onClick={handleBuscar}>
                  <Search size={18} className="text-success" />
                </motion.button>
              </div>
            </div>

            {usuarioEncontrado && (
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mt-4">
                <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><Edit3 size={20} className="text-success" /> Modifica una Cuenta</h5>
                <p className="text-muted small mb-4">Modifica y elimina datos de registro</p>
                <form className="mt-2" onSubmit={handleSubmit}>
                  <div className="mb-3"><label className="form-label small fw-semibold">Rol</label>
                    <select className="form-select rounded-3 border-2" id="rol" value={formData.rol} onChange={handleChange} required>
                      <option value="">Seleccione</option><option disabled>---</option><option value="aprendiz">Aprendiz</option><option value="psicologo">Psicólogo</option><option value="administrador">Administrador</option>
                    </select></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Documento</label>
                    <input type="text" className="form-control rounded-3 border-2" id="documento" value={formData.documento} onChange={handleChange} maxLength={10} required />
                    {touched.documento && <div className="mt-1"><Regla ok={validaciones.documento.longitud} texto="8-10 números" /></div>}</div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Tipo de documento</label>
                    <select className="form-select rounded-3 border-2" id="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} required>
                      <option value="">Seleccione</option><option disabled>---</option><option value="TI">TI</option><option value="CC">CC</option><option value="CE">CE</option><option value="PA">Pasaporte</option>
                    </select></div>
                  <div className="row mb-3">
                    <div className="col-md-6"><label className="form-label small fw-semibold">Nombres</label><input type="text" className="form-control rounded-3 border-2" id="nombres" value={formData.nombres} onChange={handleChange} required /></div>
                    <div className="col-md-6"><label className="form-label small fw-semibold">Apellidos</label><input type="text" className="form-control rounded-3 border-2" id="apellidos" value={formData.apellidos} onChange={handleChange} required /></div>
                  </div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Fecha de nacimiento</label><input type="date" className="form-control rounded-3 border-2" id="fechaNacimiento" value={formData.fechaNacimiento} onChange={handleChange} required /></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Correo</label><input type="email" className="form-control rounded-3 border-2" id="correo" value={formData.correo} onChange={handleChange} required /></div>
                  <div className="mb-3"><label className="form-label small fw-semibold">Contraseña</label>
                    <div className="input-group"><input type={showPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="password" placeholder="********" value={formData.password} onChange={handleChange} />
                      <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>{showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}</span></div>
                    {formData.password && <div className="mt-1"><Regla ok={validaciones.password.minCaracteres} texto="Mín 5 caracteres" /><Regla ok={validaciones.password.tieneMayuscula} texto="1 mayúscula" /><Regla ok={validaciones.password.tieneMinuscula} texto="1 minúscula" /><Regla ok={validaciones.password.tieneNumero} texto="1 número" /><Regla ok={validaciones.password.tieneEspecial} texto="1 carácter especial" /></div>}</div>
                  <div className="mb-4"><label className="form-label small fw-semibold">Confirmar contraseña {formData.password && <span className="text-danger">*</span>}</label>
                    <div className="input-group"><input type={showConfirmPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="confirmPassword" placeholder="********" value={formData.confirmPassword} onChange={handleChange} required={!!formData.password} />
                      <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>{showConfirmPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}</span></div></div>
                  <div className="d-flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-success rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2" style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none" }}><Save size={16} /> Guardar</motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button" className="btn btn-outline-danger rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2" onClick={() => setShowDeleteConfirm(true)}><Trash2 size={16} /> Eliminar</motion.button>
                  </div>
                </form>
              </motion.div>
            )}
          </motion.div>

          <motion.div className="col-md-3" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ position: "sticky", top: "100px" }}>
              <div className="d-flex flex-column gap-2">
                <Link to="/gestion" className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold text-decoration-none text-dark" style={{ transition: "all 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "#f8f9fa"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  <UserPlus size={16} className="text-muted" /> Crear usuario
                </Link>
                <span className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold" style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", color: "#fff" }}><Edit3 size={16} /> Modificar usuario</span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default GestionModPage;
