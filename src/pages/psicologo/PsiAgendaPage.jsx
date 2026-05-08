import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import meetImg from "../../assets/img/meet.png";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, FileText, Search, Video, RefreshCw } from "lucide-react";

function PsiAgendaPage() {
  const { user, authFetch } = useAuth();
  const [formData, setFormData] = useState({ documentoAprendiz: "", dia: "", hora: "08:00", descripcion: "" });
  const [foundApprentice, setFoundApprentice] = useState(null);
  const [aprendizNombre, setAprendizNombre] = useState("No seleccionado");
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [history, setHistory] = useState([]);
  const [buscarFecha, setBuscarFecha] = useState("");

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };
  const gs = { background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none" };

  const fetchHistory = React.useCallback(async () => {
    const pid = user.id || user.id_user;
    try { const r = await authFetch(`http://localhost:5000/api/meetings/professional-history/${pid}`); setHistory(await r.json()); } catch (e) { console.error("Error:", e); }
  }, [user]);

  const fetchOccupiedSlots = React.useCallback(async () => {
    const pid = user.id || user.id_user;
    try { const r = await authFetch(`http://localhost:5000/api/meetings/psychologist/${pid}`); setOccupiedSlots(await r.json()); } catch (e) { console.error("Error:", e); }
  }, [user]);

  useEffect(() => { if (user && (user.id || user.id_user)) { fetchHistory(); fetchOccupiedSlots(); } }, [user, fetchHistory, fetchOccupiedSlots]);

  const handleChange = (e) => setFormData({ ...formData, [e.target.id]: e.target.value });

  const handleBuscarAprendiz = async () => {
    if (!formData.documentoAprendiz) { alert("Ingresa un documento para buscar."); return; }
    try {
      const r = await authFetch(`http://localhost:5000/api/users/search/${formData.documentoAprendiz}`);
      const data = await r.json();
      if (r.ok) { setFoundApprentice(data); setAprendizNombre(`${data.nombres} ${data.apellidos}`); alert("Aprendiz encontrado: " + data.nombres + " " + data.apellidos); }
      else { setFoundApprentice(null); setAprendizNombre("No encontrado"); alert(data.message || "Aprendiz no encontrado"); }
    } catch (e) { console.error("Error:", e); alert("Error al buscar aprendiz"); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!foundApprentice) { alert("Primero debes buscar y encontrar un aprendiz válido."); return; }
    const payload = { userId: foundApprentice.id_user, professionalId: user.id || user.id_user, day: formData.dia, hour: formData.hora, description: formData.descripcion };
    try {
      const r = await authFetch("http://localhost:5000/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (r.ok) { alert("¡Cita agendada con éxito!"); fetchHistory(); fetchOccupiedSlots(); setFormData({ ...formData, descripcion: "" }); }
      else alert("Error: " + data.message);
    } catch (e) { console.error("Error:", e); alert("Error al conectar con el servidor."); }
  };

  const filteredSlots = occupiedSlots.filter(s => !buscarFecha || s.day.startsWith(buscarFecha));

  return (
    <MainLayout pageTitle="Agenda" pageSubtitle="Gestiona tus citas con aprendices" currentPage="psi-agenda">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row g-4">
          <motion.div className="col-md-8" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <h5 className="mb-4 fs-5 d-flex align-items-center gap-2"><Calendar size={20} className="text-success" /> Agendar Encuentro</h5>
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold"><Search size={14} className="me-1" /> Documento aprendiz</label>
                    <div className="position-relative">
                      <input type="text" className="form-control rounded-3 border-2" id="documentoAprendiz" placeholder="123456789" value={formData.documentoAprendiz} onChange={handleChange} />
                      <motion.button whileHover={{ scale: 1.1 }} className="btn position-absolute top-50 end-0 translate-middle-y" type="button" onClick={handleBuscarAprendiz} style={{ zIndex: 5 }}>
                        <Search size={16} className="text-success" />
                      </motion.button>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold"><Users size={14} className="me-1" /> Aprendiz Seleccionado</label>
                    <div className={`p-2 rounded-3 border-2 ${foundApprentice ? "border-success bg-success bg-opacity-10" : "bg-light"}`}>
                      <span className={`fw-semibold ${foundApprentice ? "text-success" : "text-muted"}`}>{aprendizNombre}</span>
                    </div>
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold"><Calendar size={14} className="me-1" /> Día</label>
                    <input type="date" className="form-control rounded-3 border-2" id="dia" value={formData.dia} onChange={handleChange} required />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold"><Clock size={14} className="me-1" /> Hora</label>
                    <select className="form-select rounded-3 border-2" id="hora" value={formData.hora} onChange={handleChange} required>
                      {["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00","17:00"].map(h => <option key={h} value={h}>{h}</option>)}
                    </select>
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold"><FileText size={14} className="me-1" /> Descripción</label>
                  <textarea id="descripcion" className="form-control rounded-3 border-2" rows="3" placeholder="Preferencias del encuentro... (Opcional)" value={formData.descripcion} onChange={handleChange} style={{ resize: "none" }}></textarea>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-success rounded-pill px-5" style={gs}>
                  <Calendar size={16} className="me-2" />Agendar
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div className="col-md-4" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="mb-3 fs-5 d-flex align-items-center gap-2"><Clock size={20} className="text-success" /> Espacios Ocupados</h5>
              <p className="text-muted small">Tus citas ya programadas.</p>
              <div className="mb-3">
                <input type="date" className="form-control rounded-3 border-2 mb-2" value={buscarFecha} onChange={e => setBuscarFecha(e.target.value)} />
              </div>
              <div className="rounded-3 border" style={{ maxHeight: "300px", overflowY: "auto" }}>
                <table className="table table-hover table-sm mb-0 align-middle">
                  <thead className="table-light sticky-top"><tr className="text-muted small"><th className="border-0">Fecha</th><th className="border-0">Hora</th></tr></thead>
                  <tbody>
                    {filteredSlots.length > 0 ? filteredSlots.map((s, i) => (
                      <tr key={i}><td className="small">{s.day}</td><td className="fw-semibold small">{s.hour}</td></tr>
                    )) : <tr><td colSpan="2" className="text-center text-muted py-3 small">Sin citas en esta fecha.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </motion.div>
        </div>

        <motion.div className="row g-4 mt-2" variants={iV}>
          <div className="col-12">
            <div className="card border-0 shadow-sm rounded-4 p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fs-5 d-flex align-items-center gap-2"><Clock size={20} className="text-success" /> Historial de Encuentros</h5>
                <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-light border rounded-pill px-3 py-1 d-flex align-items-center gap-2" onClick={fetchHistory}><RefreshCw size={14} /> Actualizar</motion.button>
              </div>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light border-0"><tr className="text-muted small"><th>Fecha</th><th>Hora</th><th>Descripción</th><th>Aprendiz</th><th>Documento</th></tr></thead>
                  <tbody className="border-0">
                    {history.length > 0 ? history.map(item => (
                      <tr key={item.id_meetings_agenda}>
                        <td><div className="d-flex align-items-center gap-2"><Calendar size={14} className="text-muted" />{item.day}</div></td>
                        <td className="fw-semibold">{item.hour}</td>
                        <td className="text-muted small">{item.descripcion || "Sin descripción"}</td>
                        <td className="fw-medium">{item.apprentice_names} {item.apprentice_last_names}</td>
                        <td className="small text-muted">{item.apprentice_document}</td>
                      </tr>
                    )) : <tr><td colSpan="5" className="text-center py-4 text-muted">No has agendado citas aún.</td></tr>}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </motion.div>

        <motion.div className="row mt-4 mb-4" variants={iV}>
          <div className="col-12 text-center">
            <motion.a whileHover={{ scale: 1.03, y: -3 }} whileTap={{ scale: 0.98 }} target="_blank" rel="noopener noreferrer" href="https://meet.google.com/ayg-yvgp-ymj"
              className="card border-0 shadow-sm rounded-4 p-4 text-decoration-none d-inline-flex align-items-center gap-3">
              <div className="d-flex align-items-center gap-3">
                <img src={meetImg} alt="Google Meet" style={{ height: "50px" }} />
                <div className="text-start"><h5 className="mb-0 text-dark">Unirse a la llamada</h5><span className="text-muted small"><Video size={14} className="me-1" /> Google Meet</span></div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default PsiAgendaPage;
