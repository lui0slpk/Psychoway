import React, { useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import trackingApi from "../../api/tracking.api";
import diaryApi from "../../api/diary.api";
import { motion } from "framer-motion";
import { Users, AlertTriangle, Search, BarChart2, Clock, Smile, Meh, Frown, Bell, CheckCircle } from "lucide-react";

function PsiSeguimientoPage() {
  const chartRef = useRef(null);
  const chartInstance = useRef(null);
  const { hasRole } = useAuth();
  const [searchTerm, setSearchTerm] = useState("");
  const [aprendices, setAprendices] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState([]);
  const [historial, setHistorial] = useState([]);
  const [pagEmoc, setPagEmoc] = useState(1);
  const POR_PAGINA = 5;

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  const Paginacion = ({ total, pagina, setPagina }) => {
    const totalPags = Math.ceil(total / POR_PAGINA);
    if (totalPags <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPags; i++) pages.push(i);
    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPagina(p => Math.max(1, p - 1))}>‹</button>
          </li>
          {pages.map(p => (
            <li key={p} className={`page-item ${pagina === p ? "active" : ""}`}>
              <button className="page-link" onClick={() => setPagina(p)}>{p}</button>
            </li>
          ))}
          <li className={`page-item ${pagina === totalPags ? "disabled" : ""}`}>
            <button className="page-link" onClick={() => setPagina(p => Math.min(totalPags, p + 1))}>›</button>
          </li>
        </ul>
      </nav>
    );
  };

  const getEmoji = (emot) => {
    const mapa = { "Muy Feliz": <Smile className="text-success" />, Feliz: <Smile className="text-success opacity-75" />, Neutral: <Meh className="text-warning" />, Triste: <Frown className="text-danger opacity-75" />, "Muy Triste": <Frown className="text-danger" /> };
    return mapa[emot] || <Meh />;
  };

  useEffect(() => {
    const fetchAprendices = async () => {
      try { const data = await trackingApi.getApprenticesWithEmotions(); setAprendices(data); if (data.length > 0) setSelectedUser(data[0]); } catch (e) { console.error("Error:", e); } finally { setLoading(false); }
    };
    const fetchAlerts = async () => {
      try { setAlerts(await trackingApi.getAlerts()); } catch (e) { console.error("Error:", e); }
    };
    fetchAprendices(); fetchAlerts();
    const intervalId = setInterval(fetchAlerts, 15000);
    return () => clearInterval(intervalId);
  }, []);

  const markAlertAsRead = async (id_alert) => {
    try { await trackingApi.markAlertAsRead(id_alert); setAlerts(prev => prev.map(a => a.id_alert === id_alert ? { ...a, leido: 1 } : a)); } catch (e) { console.error("Error:", e); }
  };

  useEffect(() => {
    if (!selectedUser) return;
    setPagEmoc(1);
    const fetchHistorial = async () => {
      try { setHistorial(await diaryApi.getEntries(selectedUser.id)); } catch (e) { setHistorial([]); }
    };
    fetchHistorial();
  }, [selectedUser]);

  const filteredAprendices = aprendices.filter(ap => ap.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || ap.documento.includes(searchTerm));

  useEffect(() => {
    if (!selectedUser || !chartRef.current) return;
    if (!window.Chart) {
      const script = document.createElement("script"); script.src = "https://cdn.jsdelivr.net/npm/chart.js"; script.async = true; script.onload = updateChart; document.body.appendChild(script);
    } else updateChart();

    function updateChart() {
      if (chartInstance.current) chartInstance.current.destroy();
      const { positivas, negativas, neutrales } = selectedUser.estadisticas || { positivas: 0, negativas: 0, neutrales: 0 };
      chartInstance.current = new window.Chart(chartRef.current.getContext("2d"), {
        type: "doughnut",
        data: { labels: ["Negativas", "Positivas", "Neutral"], datasets: [{ data: [negativas, positivas, neutrales], backgroundColor: ["#001A0B", "#005222", "#4a7c59"], borderWidth: 0 }] },
        options: { cutout: "65%", plugins: { legend: { display: false } } },
      });
    }
    return () => { if (chartInstance.current) { chartInstance.current.destroy(); chartInstance.current = null; } };
  }, [selectedUser]);

  if (!hasRole("Psicólogo") && !hasRole("psicologo") && !hasRole("PSICOLOGO") && !hasRole("psicologa") && !hasRole("Psicóloga")) {
    return (
      <MainLayout pageTitle="Acceso Denegado" pageSubtitle="No tienes permisos" currentPage="psi-seguimiento">
        <div className="container-fluid px-4 py-4"><div className="alert alert-danger rounded-4 border-0 shadow-sm">Acceso restringido. Solo usuarios con rol Psicólogo.</div></div>
      </MainLayout>
    );
  }

  const unreadAlerts = alerts.filter(a => !a.leido);

  return (
    <MainLayout pageTitle="Seguimiento del Diario" pageSubtitle="Revisa el estado del diario de los aprendices y gestiona alertas" currentPage="psi-seguimiento">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        {/* Alertas */}
        {unreadAlerts.length > 0 && (
          <motion.div className="mb-4" variants={iV}>
            <div className="card border-0 shadow rounded-4 overflow-hidden">
              {/* Cabecera */}
              <div className="px-4 py-3 d-flex align-items-center gap-2" style={{ background: "linear-gradient(135deg, #b91c1c 0%, #7f1d1d 100%)" }}>
                <Bell size={18} className="text-white" />
                <span className="text-white fw-bold fs-6">Alertas de Riesgo — IA detectó contenido de crisis ({unreadAlerts.length})</span>
              </div>

              {/* Lista de alertas */}
              <div className="p-3 d-flex flex-column gap-3">
                {unreadAlerts.map(alert => {
                  // Extraer solo el motivo (antes del "—" si viene el formato nuevo)
                  const motivoParts = (alert.motivo || "").split(" — ");
                  const motivoTexto = motivoParts[0] || alert.motivo;

                  return (
                    <div
                      key={alert.id_alert}
                      className="rounded-3 border overflow-hidden"
                      style={{ borderColor: "#fca5a5", background: "#fff5f5" }}
                    >
                      {/* Franja superior con motivo */}
                      <div className="px-3 py-2 d-flex align-items-start gap-2" style={{ background: "#fee2e2" }}>
                        <AlertTriangle size={16} className="text-danger mt-1 flex-shrink-0" />
                        <div>
                          <span className="fw-bold text-danger small d-block">Motivo detectado por IA:</span>
                          <span className="small text-dark">{motivoTexto}</span>
                        </div>
                      </div>

                      {/* Cuerpo con datos del aprendiz */}
                      <div className="px-3 py-3">
                        <div className="row g-2 mb-2">
                          <div className="col-12">
                            <span className="fw-bold" style={{ color: "#7f1d1d", fontSize: "0.95rem" }}>
                              👤 {alert.names} {alert.last_names}
                            </span>
                          </div>
                        </div>

                        <div className="row g-2" style={{ fontSize: "0.82rem" }}>
                          <div className="col-sm-6">
                            <span className="text-muted">📄 Documento:</span>{" "}
                            <span className="fw-semibold">{alert.doc_type || ""} {alert.document}</span>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted">📋 Ficha:</span>{" "}
                            <span className="fw-semibold">{alert.ficha_number || "N/A"}</span>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted">🎓 Programa:</span>{" "}
                            <span className="fw-semibold">{alert.training_program || "N/A"}</span>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted">📱 Celular:</span>{" "}
                            <span className="fw-semibold">{alert.contact_number || "N/A"}</span>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted">📞 Fijo:</span>{" "}
                            <span className="fw-semibold">{alert.landline_number || "N/A"}</span>
                          </div>
                          <div className="col-sm-6">
                            <span className="text-muted">✉️ Email:</span>{" "}
                            <span className="fw-semibold">{alert.email || "N/A"}</span>
                          </div>
                          {alert.birth_date && (
                            <div className="col-sm-6">
                              <span className="text-muted">🎂 Nacimiento:</span>{" "}
                              <span className="fw-semibold">{new Date(alert.birth_date).toLocaleDateString("es-CO")}</span>
                            </div>
                          )}
                          <div className="col-sm-6">
                            <span className="text-muted">🕐 Fecha alerta:</span>{" "}
                            <span className="fw-semibold">{new Date(alert.timestamp).toLocaleString("es-CO", { dateStyle: "short", timeStyle: "short" })}</span>
                          </div>
                        </div>
                      </div>

                      {/* Pie con botón */}
                      <div className="px-3 pb-3 d-flex justify-content-end">
                        <motion.button
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="btn btn-sm rounded-pill px-4 fw-semibold"
                          style={{ background: "#7f1d1d", color: "#fff", fontSize: "0.8rem" }}
                          onClick={() => markAlertAsRead(alert.id_alert)}
                        >
                          <CheckCircle size={13} className="me-1" />
                          Marcar como atendida
                        </motion.button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}


        <div className="row g-4">
          {/* Lista de Aprendices */}
          <motion.div className="col-md-6" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="p-4 pb-2 d-flex justify-content-between align-items-center flex-wrap gap-2">
                <h5 className="mb-0 fs-5 d-flex align-items-center gap-2"><Users size={20} className="text-success" /> Lista de Aprendices</h5>
                <div className="position-relative">
                  <Search size={14} className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" />
                  <input type="text" className="form-control form-control-sm rounded-pill ps-5 border-2" style={{ maxWidth: "220px" }} placeholder="Buscar..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
                </div>
              </div>
              <div className="px-4 pb-2">
                <div className="alert alert-info py-2 rounded-3 border-0 small mb-0" style={{ background: "#e8f5e9" }}>
                  <strong>Modo lectura:</strong> Haga clic en un usuario para ver sus estadísticas.
                </div>
              </div>
              <div className="p-3 pt-2">
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light border-0"><tr className="text-muted small"><th>Nombre</th><th>Promedio</th><th>Última</th></tr></thead>
                    <tbody>
                      {loading ? (
                        <tr><td colSpan="3" className="text-center py-4 text-muted"><div className="spinner-border spinner-border-sm text-success me-2"></div>Cargando...</td></tr>
                      ) : filteredAprendices.length > 0 ? filteredAprendices.map(ap => (
                        <tr key={ap.id} onClick={() => setSelectedUser(ap)} style={{ cursor: "pointer", backgroundColor: selectedUser?.id === ap.id ? "#f0faf4" : "transparent", borderLeft: selectedUser?.id === ap.id ? "3px solid #005222" : "3px solid transparent", transition: "all 0.2s" }}>
                          <td><div className="fw-medium">{ap.nombre}</div><small className="text-muted">Doc: {ap.documento}</small></td>
                          <td className="fw-semibold" style={{ color: ap.promedio === "Positivas" ? "#005222" : ap.promedio === "Negativas" ? "#dc3545" : "#6c757d" }}>{ap.promedio}</td>
                          <td style={{ color: ap.ultima === "Positivas" ? "#005222" : ap.ultima === "Negativas" ? "#dc3545" : "#6c757d" }}>{ap.ultima}</td>
                        </tr>
                      )) : (
                        <tr><td colSpan="3" className="text-center py-4 text-muted">No se encontraron aprendices.</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Panel de estadísticas */}
          <motion.div className="col-md-6" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 h-100">
              <div className="card-body text-center d-flex flex-column justify-content-center p-4">
                {selectedUser ? (
                  <>
                    <h5 className="fw-bold mb-1 d-flex align-items-center justify-content-center gap-2"><BarChart2 size={20} className="text-success" />{selectedUser.nombre}</h5>
                    <p className="text-muted small mb-4">Documento: {selectedUser.documento}</p>
                    <div className="d-flex justify-content-center mb-4">
                      <div style={{ maxWidth: "180px", position: "relative" }}>
                        <canvas ref={chartRef} width="160" height="160"></canvas>
                        <div className="position-absolute top-50 start-50 translate-middle fw-bold text-center" style={{ fontSize: "0.9rem", pointerEvents: "none" }}>
                          {selectedUser.estadisticas.positivas + selectedUser.estadisticas.negativas + selectedUser.estadisticas.neutrales}<br />
                          <span style={{ fontSize: "0.65rem", fontWeight: "normal" }}>Registros</span>
                        </div>
                      </div>
                    </div>
                    <div className="d-flex flex-column align-items-start mx-auto" style={{ maxWidth: "200px" }}>
                      {[{ label: "Positivas", color: "#005222", val: selectedUser.estadisticas.positivas }, { label: "Negativas", color: "#001A0B", val: selectedUser.estadisticas.negativas }, { label: "Neutrales", color: "#4a7c59", val: selectedUser.estadisticas.neutrales }].map((item, i) => (
                        <div key={i} className="d-flex align-items-center mb-2 justify-content-between w-100">
                          <div className="d-flex align-items-center gap-2"><span className="rounded" style={{ width: 14, height: 14, backgroundColor: item.color, display: "inline-block" }}></span><span className="small">{item.label}</span></div>
                          <span className="fw-bold small">{item.val}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <div className="text-muted py-5">
                    <Users size={48} className="mb-3 opacity-25" />
                    <p>{loading ? "Cargando datos..." : "Seleccione a un aprendiz de la lista"}</p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Historial de Emociones */}
        {selectedUser && (
          <motion.div className="row g-4 mt-2 justify-content-center" variants={iV}>
            <div className="col-md-8">
              <div className="card border-0 shadow-sm rounded-4 p-4">
                <h5 className="mb-3 fs-5 d-flex align-items-center gap-2"><Smile size={20} className="text-success" /> Historial de Emociones — {selectedUser.nombre}</h5>
                <div className="table-responsive">
                  <table className="table table-hover align-middle mb-0">
                    <thead className="table-light border-0"><tr className="text-muted small"><th>Fecha</th><th>Emoción</th><th>Descripción</th></tr></thead>
                    <tbody className="border-0">
                      {(() => {
                        const slice = historial.slice((pagEmoc - 1) * POR_PAGINA, pagEmoc * POR_PAGINA);
                        return slice.length === 0 ? (
                          <tr><td colSpan="3" className="text-center py-4 text-muted">No hay registros de emociones aún.</td></tr>
                        ) : slice.map(entry => (
                          <tr key={entry.id_diary_entries}>
                            <td>
                              <div className="d-flex align-items-center gap-2"><Clock size={14} className="text-muted" />{new Date(entry.entry_date).toLocaleDateString()}</div>
                              <small className="text-muted ms-4">{new Date(entry.entry_date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small>
                            </td>
                            <td><div className="d-flex align-items-center gap-2 fw-medium">{getEmoji(entry.emot_name)} {entry.emot_name}</div></td>
                            <td className="small text-muted">{entry.description || "-"}</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
                <Paginacion total={historial.length} pagina={pagEmoc} setPagina={setPagEmoc} />
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default PsiSeguimientoPage;
