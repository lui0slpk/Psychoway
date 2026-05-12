import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { User, FileText, Lock, Eye, EyeOff, Save, Trash2, Shield, Camera, Loader } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000";

function MiCuentaPage() {
  const { user, authFetch, logout, login, profilePhoto, setProfilePhoto } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    documento: "", tipoDocumento: "", nombres: "",
    apellidos: "", fechaNacimiento: "", correo: "", password: "", confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  // Cargar datos del usuario al montar
  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${API_URL}/api/users/profile/${user.id}`);
        if (res.ok) {
          const data = await res.json();
          setFormData({
            documento: data.document || "",
            tipoDocumento: data.tipoDocumento || "",
            nombres: data.nombres || "",
            apellidos: data.apellidos || "",
            fechaNacimiento: data.fechaNacimiento || "",
            correo: data.correo || "",
            password: "",
            confirmPassword: "",
          });
          // Cargar foto de perfil desde la base de datos
          if (data.profile_photo) {
            setProfilePhoto(data.profile_photo);
          }
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  // Manejar cambio de foto de perfil
  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.startsWith("image/")) {
      Swal.fire({ title: "Archivo no válido", text: "Por favor selecciona una imagen (JPG, PNG, GIF).", icon: "error", confirmButtonColor: "#005222" });
      return;
    }

    // Validar tamaño (máximo 2MB)
    if (file.size > 2 * 1024 * 1024) {
      Swal.fire({ title: "Imagen muy grande", text: "La imagen debe ser menor a 2MB.", icon: "error", confirmButtonColor: "#005222" });
      return;
    }

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target.result;
      try {
        const res = await authFetch(`${API_URL}/api/users/profile-photo/${user.id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ profile_photo: base64 }),
        });
        if (res.ok) {
          setProfilePhoto(base64);
          Swal.fire({ title: "¡Foto actualizada!", text: "Tu foto de perfil ha sido guardada.", icon: "success", showConfirmButton: false, timer: 1500 });
        } else {
          throw new Error("Error en el servidor");
        }
      } catch (error) {
        console.error("Error al subir foto:", error);
        Swal.fire({ title: "Error", text: "No se pudo guardar la foto. Intenta de nuevo.", icon: "error", confirmButtonColor: "#005222" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleRemovePhoto = () => {
    Swal.fire({
      title: "¿Eliminar foto?",
      text: "Se eliminará tu foto de perfil actual.",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar",
      cancelButtonText: "Cancelar",
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await authFetch(`${API_URL}/api/users/profile-photo/${user.id}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ profile_photo: null }),
          });
          if (res.ok) {
            setProfilePhoto(null);
            Swal.fire({ title: "Eliminada", text: "Tu foto de perfil ha sido eliminada.", icon: "success", showConfirmButton: false, timer: 1500 });
          } else {
            throw new Error("Error en el servidor");
          }
        } catch (error) {
          console.error("Error al eliminar foto:", error);
          Swal.fire({ title: "Error", text: "No se pudo eliminar la foto. Intenta de nuevo.", icon: "error", confirmButtonColor: "#005222" });
        }
      }
    });
  };

  // Guardar cambios del perfil
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar contraseñas si se quiere cambiar
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({ title: "Error", text: "Las contraseñas no coinciden.", icon: "error", confirmButtonColor: "#005222" });
        return;
      }
      if (formData.password.length < 6) {
        Swal.fire({ title: "Error", text: "La contraseña debe tener al menos 6 caracteres.", icon: "error", confirmButtonColor: "#005222" });
        return;
      }
    }

    // Validar campos requeridos
    if (!formData.documento || !formData.nombres || !formData.apellidos || !formData.correo) {
      Swal.fire({ title: "Campos requeridos", text: "Documento, nombres, apellidos y correo son obligatorios.", icon: "warning", confirmButtonColor: "#005222" });
      return;
    }

    setSaving(true);
    try {
      const body = {
        rol: user.rol || "aprendiz",
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fechaNacimiento: formData.fechaNacimiento,
        correo: formData.correo,
      };

      // Solo enviar contraseña si se escribió una nueva
      if (formData.password && formData.password.trim() !== "") {
        body.password = formData.password;
      }

      const res = await authFetch(`${API_URL}/api/users/update/${user.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        // Actualizar datos del usuario en el contexto y localStorage
        const updatedUser = {
          ...user,
          document: formData.documento,
          names: formData.nombres,
          last_names: formData.apellidos,
        };
        login(updatedUser, localStorage.getItem("psychoway_token"));

        // Limpiar campos de contraseña
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));

        Swal.fire({ title: "¡Guardado!", text: "Tus datos han sido actualizados correctamente.", icon: "success", showConfirmButton: false, timer: 2000 });
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({ title: "Error", text: error.message || "No se pudieron guardar los cambios. Intenta de nuevo.", icon: "error", confirmButtonColor: "#d33" });
    } finally {
      setSaving(false);
    }
  };

  // Eliminar cuenta
  const handleDelete = () => {
    Swal.fire({
      title: "¿Eliminar tu cuenta?",
      html: `<p style="color:#6c757d">Esta acción <b>no se puede deshacer</b>. Se eliminarán todos tus datos permanentemente.</p>`,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar mi cuenta",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          const res = await authFetch(`${API_URL}/api/users/delete/${user.id}`, { method: "DELETE" });
          if (res.ok) {
            localStorage.removeItem(`psychoway_photo_${user.id}`);
            Swal.fire({ title: "Cuenta eliminada", text: "Tu cuenta ha sido eliminada exitosamente.", icon: "success", showConfirmButton: false, timer: 2000 });
            setTimeout(() => { logout(); navigate("/"); }, 2100);
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "Error al eliminar");
          }
        } catch (error) {
          console.error("Error al eliminar cuenta:", error);
          Swal.fire({ title: "Error", text: error.message || "No se pudo eliminar la cuenta. Intenta de nuevo.", icon: "error", confirmButtonColor: "#d33" });
        }
      }
    });
  };

  // Generar iniciales para el avatar placeholder
  const getInitials = () => {
    const n = formData.nombres || user?.names || "";
    const a = formData.apellidos || user?.last_names || "";
    return `${n.charAt(0)}${a.charAt(0)}`.toUpperCase();
  };

  return (
    <MainLayout pageTitle="Mi Cuenta" pageSubtitle="Modifica tus datos de registro" currentPage="mi-cuenta">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">
          <motion.div className="col-md-7" variants={iV}>
            {/* ===== SECCIÓN FOTO DE PERFIL ===== */}
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5 mb-4">
              <h5 className="mb-4 fs-5 d-flex align-items-center gap-2">
                <Camera size={20} className="text-success" /> Foto de perfil
              </h5>
              <div className="d-flex align-items-center gap-4">
                {/* Avatar */}
                <div style={{ position: "relative", cursor: "pointer" }} onClick={() => fileInputRef.current?.click()}>
                  <div
                    style={{
                      width: 110, height: 110, borderRadius: "50%", overflow: "hidden",
                      background: profilePhoto ? "transparent" : "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      border: "4px solid #e9ecef", boxShadow: "0 4px 15px rgba(0,82,34,0.15)",
                      transition: "all 0.3s ease",
                    }}
                  >
                    {profilePhoto ? (
                      <img src={profilePhoto} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span style={{ color: "#fff", fontSize: 36, fontWeight: 700, letterSpacing: 2 }}>{getInitials()}</span>
                    )}
                  </div>
                  {/* Overlay hover */}
                  <div
                    style={{
                      position: "absolute", top: 0, left: 0, width: 110, height: 110, borderRadius: "50%",
                      background: "rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
                      opacity: 0, transition: "opacity 0.3s ease",
                    }}
                    className="photo-overlay"
                  >
                    <Camera size={24} color="#fff" />
                  </div>
                </div>

                {/* Info y botones */}
                <div className="d-flex flex-column gap-2">
                  <h6 className="mb-0 fw-bold">{formData.nombres || "Usuario"} {formData.apellidos || ""}</h6>
                  <p className="text-muted small mb-2">JPG, PNG o GIF. Máximo 2MB.</p>
                  <div className="d-flex gap-2">
                    <motion.button
                      whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                      type="button" className="btn btn-sm rounded-pill px-3 d-flex align-items-center gap-1"
                      style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", color: "#fff", border: "none", fontSize: 13 }}
                      onClick={() => fileInputRef.current?.click()}
                    >
                      <Camera size={14} /> Cambiar foto
                    </motion.button>
                    {profilePhoto && (
                      <motion.button
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
                        type="button" className="btn btn-sm btn-outline-danger rounded-pill px-3"
                        style={{ fontSize: 13 }}
                        onClick={handleRemovePhoto}
                      >
                        Eliminar
                      </motion.button>
                    )}
                  </div>
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: "none" }} onChange={handlePhotoChange} />
              </div>
            </div>

            {/* ===== SECCIÓN DATOS DE CUENTA ===== */}
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><User size={20} className="text-success" /> Mi Cuenta</h5>
              <p className="text-muted small mb-4">Modifica tus datos de registro</p>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: "#005222" }}><span className="visually-hidden">Cargando...</span></div>
                  <p className="text-muted mt-2 small">Cargando tus datos...</p>
                </div>
              ) : (
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

                  {/* Separador visual para contraseñas */}
                  <div className="d-flex align-items-center gap-2 my-4">
                    <hr className="flex-grow-1" style={{ borderColor: "#e9ecef" }} />
                    <span className="text-muted small fw-semibold">Cambiar contraseña (opcional)</span>
                    <hr className="flex-grow-1" style={{ borderColor: "#e9ecef" }} />
                  </div>

                  <div className="mb-3">
                    <label className="form-label small fw-semibold"><Lock size={14} className="me-1" /> Nueva contraseña</label>
                    <div className="input-group">
                      <input type={showPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="password" placeholder="Dejar vacío para no cambiar" value={formData.password} onChange={handleChange} />
                      <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Confirmar nueva contraseña</label>
                    <div className="input-group">
                      <input type={showConfirmPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="confirmPassword" placeholder="Repetir contraseña" value={formData.confirmPassword} onChange={handleChange} />
                      <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                      </span>
                    </div>
                  </div>

                  <div className="d-flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
                      className="btn btn-success rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2"
                      style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none", opacity: saving ? 0.7 : 1 }}>
                      {saving ? <><Loader size={16} className="spin-icon" /> Guardando...</> : <><Save size={16} /> Guardar cambios</>}
                    </motion.button>
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="button"
                      className="btn btn-outline-danger rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2" onClick={handleDelete}>
                      <Trash2 size={16} /> Eliminar cuenta
                    </motion.button>
                  </div>
                </form>
              )}
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
      <style>{`
        .card { transition: transform 0.2s ease; }
        .card:hover { transform: translateY(-3px); }
        .photo-overlay { cursor: pointer; }
        div:hover > .photo-overlay { opacity: 1 !important; }
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        .spin-icon { animation: spin 1s linear infinite; }
      `}</style>
    </MainLayout>
  );
}

export default MiCuentaPage;
