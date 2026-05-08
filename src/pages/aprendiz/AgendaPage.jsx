import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import meetImg from "../../assets/img/meet.png";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import { Calendar, Clock, Users, FileText, CheckCircle, Video, Search, RefreshCw } from "lucide-react";

const WORKING_HOURS = ["08:00","09:00","10:00","11:00","13:00","14:00","15:00","16:00"];

function AgendaPage() {
  const { user, authFetch } = useAuth();
  const [psychologists, setPsychologists] = useState([]);
  const [occupiedSlots, setOccupiedSlots] = useState([]);
  const [history, setHistory] = useState([]);
  const [searchPsychologist, setSearchPsychologist] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [availableHours, setAvailableHours] = useState([]);
  const [formData, setFormData] = useState({ dia: "", hora: "", descripcion: "" });

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const fetchPsychologists = React.useCallback(async () => {
    try { const r = await authFetch("http://localhost:5000/api/psychologists"); setPsychologists(await r.json()); } catch (e) { console.error("Error:", e); }
  }, []);

  const fetchHistory = React.useCallback(async () => {
    if (!user) return;
    try { const r = await authFetch(`http://localhost:5000/api/meetings/user/${user.id || user.id_user}`); setHistory(await r.json()); } catch (e) { console.error("Error:", e); }
  }, [user]);

  const fetchOccupiedSlots = React.useCallback(async (id) => {
    try { const r = await authFetch(`http://localhost:5000/api/meetings/psychologist/${id}`); setOccupiedSlots(await r.json()); } catch (e) { console.error("Error:", e); }
  }, []);

  const calculateAvailableHours = React.useCallback(() => {
    const busy = occupiedSlots.filter(s => s.day === searchDate).map(s => s.hour.substring(0, 5));
    setAvailableHours(WORKING_HOURS.filter(h => !busy.includes(h)));
  }, [occupiedSlots, searchDate]);

  useEffect(() => { fetchPsychologists(); if (user && (user.id || user.id_user)) fetchHistory(); }, [user, fetchPsychologists, fetchHistory]);
  useEffect(() => { if (searchPsychologist) fetchOccupiedSlots(searchPsychologist); else { setOccupiedSlots([]); setAvailableHours([]); } }, [searchPsychologist, fetchOccupiedSlots]);
  useEffect(() => { if (searchDate && searchPsychologist) calculateAvailableHours(); else setAvailableHours([]); }, [searchDate, searchPsychologist, calculateAvailableHours]);

  const handleAssign = (hour) => setFormData({ ...formData, dia: searchDate, hora: hour });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!searchPsychologist) { alert("Error: No se ha seleccionado psicólogo."); return; }
    if (!formData.dia || !formData.hora) { alert("Por favor asigna un horario disponible desde el panel derecho."); return; }
    const payload = { userId: user.id || user.id_user, professionalId: searchPsychologist, day: formData.dia, hour: formData.hora, description: formData.descripcion };
    try {
      const r = await authFetch("http://localhost:5000/api/meetings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
      const data = await r.json();
      if (r.ok) { alert("¡Cita agendada con éxito!"); fetchHistory(); fetchOccupiedSlots(searchPsychologist); setFormData({ dia: "", hora: "", descripcion: "" }); }
      else alert("Error: " + data.message);
    } catch (error) { console.error("Error:", error); alert("Error al conectar con el servidor."); }
  };

  const selPsych = psychologists.find(p => String(p.id_user) === String(searchPsychologist));
  const gs = { background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)", border: "none" };

  return (
    <MainLayout pageTitle="Agenda" pageSubtitle="Organiza tus citas y actividades" currentPage="agenda">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row g-4">
          <motion.div className="col-md-7" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="mb-3 fs-5 d-flex align-items-center gap-2"><CheckCircle size={20} className="text-success" /> Confirmar Agendamiento</h5>
              <p className="text-muted small mb-4">Los datos se llenarán automáticamente al seleccionar un horario disponible.</p>
              <form onSubmit={handleSubmit}>
                <div className="mb-3">
                  <label className="form-label small fw-semibold text-muted"><Users size={14} className="me-1" /> Psicólogo Seleccionado</label>
                  <input type="text" className="form-control rounded-3 border-2 bg-light" value={selPsych ? `${selPsych.names} ${selPsych.last_names}` : "Sin seleccionar"} readOnly disabled />
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted"><Calendar size={14} className="me-1" /> Día</label>
                    <input type="date" className="form-control rounded-3 border-2 bg-light" value={formData.dia} readOnly />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label small fw-semibold text-muted"><Clock size={14} className="me-1" /> Hora</label>
                    <input type="text" className="form-control rounded-3 border-2 bg-light fw-bold text-success" value={formData.hora} readOnly placeholder="--:--" />
                  </div>
                </div>
                <div className="mb-4">
                  <label className="form-label small fw-semibold"><FileText size={14} className="me-1" /> Descripción / Motivo</label>
                  <textarea className="form-control rounded-3 border-2" rows="3" placeholder="Escribe aquí el motivo de tu consulta..." value={formData.descripcion} onChange={e => setFormData({ ...formData, descripcion: e.target.value })} style={{ resize: "none" }}></textarea>
                </div>
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} type="submit" className="btn btn-success rounded-pill px-5" disabled={!formData.dia || !formData.hora} style={gs}>
                  <Calendar size={16} className="me-2" />Agendar Cita
                </motion.button>
              </form>
            </div>
          </motion.div>

          <motion.div className="col-md-5" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="mb-3 fs-5 d-flex align-items-center gap-2"><Search size={20} className="text-success" /> Horarios Disponibles</h5>
              <p className="text-muted small mb-3">Busca y selecciona un horario para asignar tu cita.</p>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Psicólogo</label>
                <select className="form-select rounded-3 border-2" value={searchPsychologist} onChange={e => setSearchPsychologist(e.target.value)}>
                  <option value="">-- Seleccionar --</option>
                  {psychologists.map(p => <option key={p.id_user} value={p.id_user}>{p.names} {p.last_names}</option>)}
                </select>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold">Fecha</label>
                <input type="date" className="form-control rounded-3 border-2" value={searchDate} onChange={e => setSearchDate(e.target.value)} />
              </div>
              <div className="rounded-3 border" style={{ maxHeight: "350px", overflowY: "auto" }}>
                <table className="table table-hover mb-0 align-middle">
                  <thead className="sticky-top" style={{ background: "#f8f9fa" }}>
                    <tr className="text-muted small"><th className="border-0 ps-3">Hora</th><th className="border-0 text-end pe-3">Acción</th></tr>
                  </thead>
                  <tbody>
                    {!searchPsychologist || !searchDate ? (
                      <tr><td colSpan="2" className="text-center text-muted py-4"><Calendar size={32} className="mb-2 opacity-25 d-block mx-auto" />Selecciona psicólogo y fecha.</td></tr>
                    ) : availableHours.length > 0 ? availableHours.map(hour => (
                      <tr key={hour}><td className="fw-bold text-dark ps-3"><Clock size={14} className="me-2 text-success" />{hour}</td>
                        <td className="text-end pe-3"><motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="btn btn-outline-success btn-sm rounded-pill px-3" onClick={() => handleAssign(hour)}>Asignar</motion.button></td></tr>
                    )) : <tr><td colSpan="2" className="text-center text-danger py-4">No hay horarios disponibles.</td></tr>}
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
                  <thead className="table-light border-0"><tr className="text-muted small"><th>Fecha</th><th>Hora</th><th>Descripción</th><th>Psicólogo/a</th></tr></thead>
                  <tbody className="border-0">
                    {history.length > 0 ? history.map(item => (
                      <tr key={item.id_meetings_agenda}>
                        <td><div className="d-flex align-items-center gap-2"><Calendar size={14} className="text-muted" />{item.day}</div></td>
                        <td className="fw-semibold">{item.hour}</td>
                        <td className="text-muted small">{item.descripcion || "Sin descripción"}</td>
                        <td className="fw-medium">{item.prof_names} {item.prof_last_names}</td>
                      </tr>
                    )) : <tr><td colSpan="4" className="text-center py-4 text-muted">No tienes citas agendadas aún.</td></tr>}
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
                <div className="text-start">
                  <h5 className="mb-0 text-dark">Unirse a la llamada</h5>
                  <span className="text-muted small"><Video size={14} className="me-1" /> Google Meet</span>
                </div>
              </div>
            </motion.a>
          </div>
        </motion.div>
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default AgendaPage;
