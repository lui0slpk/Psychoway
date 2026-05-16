import React, { useState, useEffect, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { User, FileText, Lock, Eye, EyeOff, Save, Trash2, Shield, Camera, Upload, X } from "lucide-react";
import Swal from "sweetalert2";

const API_URL = "http://localhost:5000/api";

function MiCuentaPage() {
  const { user, authFetch, logout, updateUser } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [formData, setFormData] = useState({
    documento: "", tipoDocumento: "", nombres: "", apellidos: "",
    fechaNacimiento: "", correo: "", password: "", confirmPassword: "",
  });
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  // Cargar datos del perfil al montar
  useEffect(() => {
    if (!user) return;
    const fetchProfile = async () => {
      try {
        const res = await authFetch(`${API_URL}/users/profile/${user.id || user.id_user}`);
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
          if (data.profile_photo) {
            setPhotoPreview(data.profile_photo);
          }
        }
      } catch (error) {
        console.error("Error al cargar perfil:", error);
        // Fallback a datos del contexto
        setFormData({
          documento: user?.document || "",
          tipoDocumento: "",
          nombres: user?.names || "",
          apellidos: user?.last_names || "",
          fechaNacimiento: "",
          correo: "",
          password: "",
          confirmPassword: "",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [user]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  // ==================== FOTO DE PERFIL ====================
  const handleFileSelect = (file) => {
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      Swal.fire({ icon: "error", title: "Archivo no válido", text: "Solo se permiten imágenes (JPG, PNG, GIF, WEBP).", confirmButtonColor: "#d33" });
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      Swal.fire({ icon: "error", title: "Imagen muy grande", text: "La imagen no debe superar 5 MB.", confirmButtonColor: "#d33" });
      return;
    }

    const reader = new FileReader();
    reader.onloadend = () => {
      setProfilePhoto(reader.result);
      setPhotoPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handlePhotoChange = (e) => {
    handleFileSelect(e.target.files[0]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleRemovePhoto = () => {
    setProfilePhoto("");
    setPhotoPreview(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ==================== GUARDAR CAMBIOS ====================
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validar contraseñas
    if (formData.password || formData.confirmPassword) {
      if (formData.password !== formData.confirmPassword) {
        Swal.fire({ icon: "error", title: "Error", text: "Las contraseñas no coinciden.", confirmButtonColor: "#d33" });
        return;
      }
      if (formData.password.length < 6) {
        Swal.fire({ icon: "error", title: "Error", text: "La contraseña debe tener al menos 6 caracteres.", confirmButtonColor: "#d33" });
        return;
      }
    }

    setSaving(true);
    try {
      const userId = user.id || user.id_user;
      const bodyData = {
        documento: formData.documento,
        tipoDocumento: formData.tipoDocumento,
        nombres: formData.nombres,
        apellidos: formData.apellidos,
        fechaNacimiento: formData.fechaNacimiento,
        correo: formData.correo,
      };

      // Solo enviar password si se llenó
      if (formData.password && formData.password.trim() !== "") {
        bodyData.password = formData.password;
      }

      // Incluir foto si cambió
      if (profilePhoto !== null) {
        bodyData.profilePhoto = profilePhoto;
      }

      const res = await authFetch(`${API_URL}/users/profile/${userId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      if (res.ok) {
        const data = await res.json();
        // Actualizar el contexto con los nuevos datos
        if (data.user) {
          updateUser(data.user);
        }
        // Limpiar passwords
        setFormData(prev => ({ ...prev, password: "", confirmPassword: "" }));
        setProfilePhoto(null);

        Swal.fire({
          icon: "success",
          title: "¡Guardado!",
          text: "Tu perfil ha sido actualizado correctamente.",
          showConfirmButton: false,
          timer: 2000,
          background: "#fff",
          iconColor: "#005222",
        });
      } else {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.message || "Error al actualizar");
      }
    } catch (error) {
      console.error("Error al guardar:", error);
      Swal.fire({
        icon: "error",
        title: "Error",
        text: error.message || "No se pudo actualizar el perfil. Intenta de nuevo.",
        confirmButtonColor: "#d33",
      });
    } finally {
      setSaving(false);
    }
  };

  // ==================== ELIMINAR CUENTA ====================
  const handleDelete = async () => {
    const result = await Swal.fire({
      title: "¿Eliminar tu cuenta?",
      html: `
        <p style="color:#666; margin-bottom:8px;">Esta acción <b>no se puede deshacer</b>.</p>
        <p style="color:#666;">Se eliminarán todos tus datos: diario, objetivos, conversaciones y citas.</p>
      `,
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#6c757d",
      confirmButtonText: "Sí, eliminar cuenta",
      cancelButtonText: "Cancelar",
      reverseButtons: true,
    });

    if (result.isConfirmed) {
      // Confirmación doble
      const confirm2 = await Swal.fire({
        title: "Confirmación final",
        text: "Escribe ELIMINAR para confirmar.",
        input: "text",
        inputPlaceholder: "ELIMINAR",
        showCancelButton: true,
        confirmButtonColor: "#d33",
        cancelButtonColor: "#6c757d",
        confirmButtonText: "Eliminar permanentemente",
        cancelButtonText: "Cancelar",
        inputValidator: (value) => {
          if (value !== "ELIMINAR") return "Debes escribir ELIMINAR para confirmar.";
        },
      });

      if (confirm2.isConfirmed) {
        try {
          const userId = user.id || user.id_user;
          const res = await authFetch(`${API_URL}/users/delete/${userId}`, { method: "DELETE" });

          if (res.ok) {
            await Swal.fire({
              icon: "success",
              title: "Cuenta eliminada",
              text: "Tu cuenta ha sido eliminada. Serás redirigido al inicio.",
              showConfirmButton: false,
              timer: 2500,
            });
            logout();
            navigate("/");
          } else {
            const errData = await res.json().catch(() => ({}));
            throw new Error(errData.message || "No se pudo eliminar la cuenta");
          }
        } catch (error) {
          console.error("Error al eliminar:", error);
          Swal.fire({
            icon: "error",
            title: "Error",
            text: error.message || "No se pudo eliminar la cuenta. Intenta de nuevo.",
            confirmButtonColor: "#d33",
          });
        }
      }
    }
  };

  return (
    <MainLayout pageTitle="Mi Cuenta" pageSubtitle="Modifica tus datos de registro" currentPage="mi-cuenta">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">

          {/* ==================== COLUMNA PRINCIPAL ==================== */}
          <motion.div className="col-md-7" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><User size={20} className="text-success" /> Mi Cuenta</h5>
              <p className="text-muted small mb-4">Modifica tus datos de registro</p>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: "#005222" }}><span className="visually-hidden">Cargando...</span></div>
                  <p className="text-muted mt-2 small">Cargando tu perfil...</p>
                </div>
              ) : (
                <form className="mt-2" onSubmit={handleSubmit}>
                  {/* ===== FOTO DE PERFIL ===== */}
                  <div className="mb-4">
                    <label className="form-label small fw-semibold d-flex align-items-center gap-2">
                      <Camera size={14} className="text-success" /> Foto de perfil
                    </label>
                    <div className="d-flex align-items-start gap-4">
                      {/* Preview de la foto */}
                      <div className="position-relative">
                        <div
                          style={{
                            width: 100, height: 100, borderRadius: "50%",
                            overflow: "hidden", border: "3px solid #e9ecef",
                            display: "flex", alignItems: "center", justifyContent: "center",
                            background: photoPreview ? "transparent" : "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
                            cursor: "pointer",
                          }}
                          onClick={() => fileInputRef.current?.click()}
                        >
                          {photoPreview ? (
                            <img src={photoPreview} alt="Foto de perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                          ) : (
                            <User size={40} color="#fff" />
                          )}
                        </div>
                        {photoPreview && (
                          <motion.button
                            whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                            type="button" onClick={handleRemovePhoto}
                            className="btn btn-sm position-absolute"
                            style={{
                              top: -4, right: -4, width: 24, height: 24, padding: 0,
                              borderRadius: "50%", background: "#d33", border: "2px solid #fff",
                              display: "flex", alignItems: "center", justifyContent: "center",
                            }}
                          >
                            <X size={12} color="#fff" />
                          </motion.button>
                        )}
                      </div>

                      {/* Zona de carga */}
                      <div
                        className={`flex-grow-1 rounded-3 text-center p-3 ${isDragging ? "photo-drop-active" : "photo-drop-zone"}`}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onClick={() => fileInputRef.current?.click()}
                        style={{ cursor: "pointer" }}
                      >
                        <Upload size={24} className={isDragging ? "text-success" : "text-muted"} />
                        <p className="small mb-0 mt-1" style={{ color: isDragging ? "#005222" : "#6c757d" }}>
                          <span className="fw-semibold" style={{ color: "#005222" }}>Haz clic aquí</span> o arrastra una imagen
                        </p>
                        <p className="text-muted" style={{ fontSize: "0.7rem", margin: 0 }}>JPG, PNG, WEBP — Máx. 5 MB</p>
                      </div>

                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/gif,image/webp"
                        onChange={handlePhotoChange}
                        style={{ display: "none" }}
                      />
                    </div>
                  </div>

                  {/* ===== DATOS PERSONALES ===== */}
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

                  {/* ===== CONTRASEÑA ===== */}
                  <div className="mb-3">
                    <label className="form-label small fw-semibold"><Lock size={14} className="me-1" /> Nueva contraseña <span className="text-muted fw-normal">(dejar vacío para no cambiar)</span></label>
                    <div className="input-group">
                      <input type={showPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="password" placeholder="********" value={formData.password} onChange={handleChange} />
                      <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowPassword(!showPassword)}>
                        {showPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                      </span>
                    </div>
                  </div>
                  <div className="mb-4">
                    <label className="form-label small fw-semibold">Confirmar contraseña</label>
                    <div className="input-group">
                      <input type={showConfirmPassword ? "text" : "password"} className="form-control rounded-start-3 border-2 border-end-0" id="confirmPassword" placeholder="********" value={formData.confirmPassword} onChange={handleChange} />
                      <span className="input-group-text bg-white border-2 border-start-0 rounded-end-3" style={{ cursor: "pointer" }} onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                        {showConfirmPassword ? <EyeOff size={16} className="text-muted" /> : <Eye size={16} className="text-muted" />}
                      </span>
                    </div>
                  </div>

                  {/* ===== BOTONES ===== */}
                  <div className="d-flex gap-3">
                    <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" disabled={saving}
                      className="btn btn-success rounded-pill px-4 w-50 d-flex align-items-center justify-content-center gap-2"
                      style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none", opacity: saving ? 0.7 : 1 }}>
                      {saving ? (
                        <><span className="spinner-border spinner-border-sm" role="status" /> Guardando...</>
                      ) : (
                        <><Save size={16} /> Guardar cambios</>
                      )}
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

          {/* ==================== SIDEBAR NAVEGACIÓN ==================== */}
          <motion.div className="col-md-3" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ position: "sticky", top: "100px" }}>
              {/* Mini perfil */}
              {photoPreview && (
                <div className="text-center mb-3">
                  <div style={{ width: 64, height: 64, borderRadius: "50%", overflow: "hidden", margin: "0 auto", border: "3px solid #005222" }}>
                    <img src={photoPreview} alt="Perfil" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                  </div>
                  <p className="fw-semibold small mt-2 mb-0">{formData.nombres} {formData.apellidos}</p>
                  <p className="text-muted" style={{ fontSize: "0.75rem" }}>Aprendiz</p>
                </div>
              )}
              <div className="d-flex flex-column gap-2">
                <span className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold" style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", color: "#fff" }}>
                  <User size={16} /> Mi cuenta
                </span>
                <Link to="/privacidad" className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold text-decoration-none text-dark sidebar-link">
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
        .photo-drop-zone {
          border: 2px dashed #d1d5db;
          background: #f9fafb;
          transition: all 0.3s ease;
        }
        .photo-drop-zone:hover {
          border-color: #005222;
          background: #f0fdf4;
        }
        .photo-drop-active {
          border: 2px dashed #005222;
          background: #dcfce7;
          transition: all 0.3s ease;
        }
        .sidebar-link {
          transition: all 0.2s ease !important;
        }
        .sidebar-link:hover {
          background: #f8f9fa !important;
        }
      `}</style>
    </MainLayout>
  );
}

export default MiCuentaPage;
