import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { User, Shield, Eye, Save } from "lucide-react";
import { showSuccess, showError } from "../../utils/alerts";

function PrivacidadPage() {
  const { user, authFetch } = useAuth();
  const [visibilidad, setVisibilidad] = useState("yo-psicologo");
  const [loading, setLoading] = useState(true);

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  useEffect(() => {
    if (!user) return;
    const fetchPrivacy = async () => {
      try {
        const res = await authFetch(`http://localhost:5000/api/users/privacy/${user.id}`);
        if (res.ok) { const data = await res.json(); setVisibilidad(data.diary_visibility); }
      } catch (error) { console.error("Error al cargar privacidad:", error); }
      finally { setLoading(false); }
    };
    fetchPrivacy();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await authFetch(`http://localhost:5000/api/users/privacy/${user.id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ visibilidad }),
      });
      if (res.ok) {
        showSuccess("¡Guardado!", "Tu configuración de privacidad ha sido actualizada.");
      } else throw new Error("Error en la respuesta del servidor");
    } catch (error) {
      console.error("Error al guardar privacidad:", error);
      showError("Error", "No se pudo guardar la configuración. Intenta de nuevo.");
    }
  };

  return (
    <MainLayout pageTitle="Privacidad" pageSubtitle="Modifica tus datos de privacidad" currentPage="privacidad">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">
          <motion.div className="col-md-7" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2"><Shield size={20} className="text-success" /> Privacidad</h5>
              <p className="text-muted small mb-4">Modifica tus datos de privacidad</p>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border" role="status" style={{ color: "#005222" }}><span className="visually-hidden">Cargando...</span></div>
                </div>
              ) : (
                <form className="mt-2" onSubmit={handleSubmit}>
                  <div className="mb-4">
                    <label className="form-label fw-semibold d-flex align-items-center gap-2">
                      <Eye size={16} className="text-success" /> Visibilidad del diario <span className="text-danger">*</span>
                    </label>
                    <select className="form-select rounded-3 border-2" required value={visibilidad} onChange={(e) => setVisibilidad(e.target.value)}>
                      <option value="yo-psicologo">Yo y psicólogo/a</option>
                      <option value="solo-yo">Sólo yo</option>
                    </select>
                    <div className="mt-2 small text-muted">
                      {visibilidad === "yo-psicologo"
                        ? "Tu psicólogo podrá ver tu diario emocional para darte un mejor seguimiento."
                        : "Solo tú podrás ver tu diario emocional. Tu psicólogo no tendrá acceso."}
                    </div>
                  </div>
                  <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit"
                    className="btn btn-success rounded-pill px-5 d-flex align-items-center gap-2"
                    style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none" }}>
                    <Save size={16} /> Guardar cambios
                  </motion.button>
                </form>
              )}
            </div>
          </motion.div>

          <motion.div className="col-md-3" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4" style={{ position: "sticky", top: "100px" }}>
              <div className="d-flex flex-column gap-2">
                <Link to="/mi-cuenta" className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold text-decoration-none text-dark" style={{ transition: "all 0.2s" }}
                  onMouseEnter={e => e.target.style.background = "#f8f9fa"} onMouseLeave={e => e.target.style.background = "transparent"}>
                  <User size={16} className="text-muted" /> Mi cuenta
                </Link>
                <span className="d-flex align-items-center gap-2 p-3 rounded-3 fw-semibold" style={{ background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", color: "#fff" }}>
                  <Shield size={16} /> Privacidad
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default PrivacidadPage;
