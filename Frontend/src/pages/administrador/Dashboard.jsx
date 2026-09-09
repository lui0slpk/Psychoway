import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { motion } from "framer-motion";
import { BarChart3, Calendar, BookOpen, Users, TrendingUp } from "lucide-react";
import PeriodFilter from "../../components/PeriodFilter";
import BarChartCard from "../../components/BarChartCard";
import * as statisticsApi from "../../api/statistics.api";
import psychologistsApi from "../../api/psychologists.api";

function Dashboard() {
  // Período independiente para cada sección
  const [alertsPeriod, setAlertsPeriod] = useState("week");
  const [meetingsPeriod, setMeetingsPeriod] = useState("week");
  const [diaryPeriod, setDiaryPeriod] = useState("week");

  // Datos de cada sección
  const [alertsData, setAlertsData] = useState({ total: 0, unread: 0, series: [] });
  const [meetingsData, setMeetingsData] = useState({ total: 0, byAttendance: {}, series: [] });
  const [diaryData, setDiaryData] = useState({ total: 0, series: [] });

  // Datos de tendencia mensual (6 meses)
  const [alerts6m, setAlerts6m] = useState({ total: 0, series: [] });
  const [meetings6m, setMeetings6m] = useState({ total: 0, series: [] });
  const [diary6m, setDiary6m] = useState({ total: 0, series: [] });

  // Agenda del psicólogo
  const [psychologists, setPsychologists] = useState([]);
  const [selectedPsycho, setSelectedPsycho] = useState(null);
  const [agendaData, setAgendaData] = useState(null);

  // Cargar lista de psicólogos al montar
  useEffect(() => {
    psychologistsApi.getAll()
      .then((data) => setPsychologists(data))
      .catch((err) => console.error("Error cargando psicólogos:", err));
  }, []);

  // Cargar alertas cuando cambia el período
  useEffect(() => {
    statisticsApi.getAlerts(alertsPeriod)
      .then((data) => setAlertsData(data))
      .catch((err) => console.error("Error cargando alertas:", err));
  }, [alertsPeriod]);

  // Cargar reuniones cuando cambia el período
  useEffect(() => {
    statisticsApi.getMeetings(meetingsPeriod)
      .then((data) => setMeetingsData(data))
      .catch((err) => console.error("Error cargando reuniones:", err));
  }, [meetingsPeriod]);

  // Cargar entradas de diario cuando cambia el período
  useEffect(() => {
    statisticsApi.getDiary(diaryPeriod)
      .then((data) => setDiaryData(data))
      .catch((err) => console.error("Error cargando diario:", err));
  }, [diaryPeriod]);

  // Cargar datos de tendencia mensual (6 meses) al montar
  useEffect(() => {
    statisticsApi.getMonthlyStats("alerts")
      .then((data) => setAlerts6m(data))
      .catch((err) => console.error("Error cargando alertas mensuales:", err));
    statisticsApi.getMonthlyStats("meetings")
      .then((data) => setMeetings6m(data))
      .catch((err) => console.error("Error cargando reuniones mensuales:", err));
    statisticsApi.getMonthlyStats("diary")
      .then((data) => setDiary6m(data))
      .catch((err) => console.error("Error cargando diario mensual:", err));
  }, []);

  // Cargar agenda del psicólogo seleccionado
  useEffect(() => {
    if (!selectedPsycho) return;
    statisticsApi.getPsychologistAgenda(selectedPsycho)
      .then((data) => setAgendaData(data))
      .catch((err) => console.error("Error cargando agenda del psicólogo:", err));
  }, [selectedPsycho]);

  // Variantes de animación
  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  // Badge de asistencia
  const badgeAsistencia = (estado) => {
    const map = {
      asistio: "success",
      no_asistio: "danger",
      pendiente: "warning",
    };
    return <span className={`badge bg-${map[estado] || "secondary"}`}>{estado.replace("_", " ")}</span>;
  };

  return (
    <MainLayout pageTitle="Dashboard" pageSubtitle="Estadísticas generales del sistema" currentPage="dashboard">
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={containerVariants}>
        <div className="row g-4">

          {/* Sección 1: Alertas */}
          <motion.div className="col-12" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <BarChart3 size={20} className="text-danger" /> Alertas
                  </h5>
                  <PeriodFilter value={alertsPeriod} onChange={setAlertsPeriod} />
                </div>
                <p className="text-muted small mb-2">
                  Total: <strong>{alertsData.total}</strong> | Sin leer: <strong>{alertsData.unread}</strong>
                </p>
                <BarChartCard
                  title="Alertas por día"
                  data={alertsData.series}
                  dataKeys={[{ key: "count", name: "Alertas", color: "#dc3545" }]}
                />
              </div>
            </div>
          </motion.div>

          {/* Sección 2: Reuniones y Asistencia */}
          <motion.div className="col-12" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <Calendar size={20} className="text-success" /> Reuniones y Asistencia
                  </h5>
                  <PeriodFilter value={meetingsPeriod} onChange={setMeetingsPeriod} />
                </div>
                <p className="text-muted small mb-2">
                  Total: <strong>{meetingsData.total}</strong> | Asistió: <strong>{meetingsData.byAttendance?.asistio || 0}</strong> | No asistió: <strong>{meetingsData.byAttendance?.no_asistio || 0}</strong> | Pendiente: <strong>{meetingsData.byAttendance?.pendiente || 0}</strong>
                </p>
                <BarChartCard
                  title="Reuniones por día"
                  data={meetingsData.series}
                  dataKeys={[
                    { key: "asistio", name: "Asistió", color: "#198754" },
                    { key: "no_asistio", name: "No Asistió", color: "#dc3545" },
                    { key: "pendiente", name: "Pendiente", color: "#ffc107" },
                  ]}
                />
              </div>
            </div>
          </motion.div>

          {/* Sección 3: Entradas de Diario */}
          <motion.div className="col-12" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <BookOpen size={20} className="text-primary" /> Entradas de Diario
                  </h5>
                  <PeriodFilter value={diaryPeriod} onChange={setDiaryPeriod} />
                </div>
                <p className="text-muted small mb-2">
                  Total: <strong>{diaryData.total}</strong>
                </p>
                <BarChartCard
                  title="Entradas por día"
                  data={diaryData.series}
                  dataKeys={[{ key: "count", name: "Entradas", color: "#0d6efd" }]}
                />
              </div>
            </div>
          </motion.div>

          {/* Sección 4: Agenda del Psicólogo */}
          <motion.div className="col-12" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <h5 className="mb-0 d-flex align-items-center gap-2">
                    <Users size={20} className="text-info" /> Agenda del Psicólogo
                  </h5>
                </div>

                {/* Selector de psicólogo */}
                <div className="mb-4">
                  <label className="form-label small fw-semibold">Seleccionar psicólogo</label>
                  <select
                    className="form-select rounded-3 border-2"
                    value={selectedPsycho || ""}
                    onChange={(e) => {
                      const val = e.target.value ? Number(e.target.value) : null;
                      setSelectedPsycho(val);
                      setAgendaData(null);
                    }}
                  >
                    <option value="">— Seleccione un psicólogo —</option>
                    {psychologists.map((p) => (
                      <option key={p.id_user} value={p.id_user}>
                        {p.names} {p.last_names}
                      </option>
                    ))}
                  </select>
                </div>

                {agendaData && (
                  <>
                    {/* Nombre del psicólogo seleccionado */}
                    <p className="text-muted mb-3">
                      Psicólogo: <strong>{agendaData.psychologist?.names} {agendaData.psychologist?.last_names}</strong>
                    </p>

                    {/* Reuniones pendientes */}
                    <h6 className="mb-2">Reuniones Pendientes</h6>
                    {agendaData.pending && agendaData.pending.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Hora</th>
                              <th>Fecha</th>
                              <th>Aprendiz</th>
                              <th>Descripción</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agendaData.pending.map((m, i) => (
                              <tr key={i}>
                                <td>{m.hour || "—"}</td>
                                <td>{m.day || "—"}</td>
                                <td>{m.apprentice_names || "—"}</td>
                                <td>{m.descripcion || "—"}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small mb-4">No hay reuniones pendientes</p>
                    )}

                    {/* Historial de reuniones */}
                    <h6 className="mb-2">Historial</h6>
                    {agendaData.history && agendaData.history.length > 0 ? (
                      <div className="table-responsive mb-4">
                        <table className="table table-hover align-middle">
                          <thead className="table-light">
                            <tr>
                              <th>Hora</th>
                              <th>Fecha</th>
                              <th>Aprendiz</th>
                              <th>Asistencia</th>
                            </tr>
                          </thead>
                          <tbody>
                            {agendaData.history.map((m, i) => (
                              <tr key={i}>
                                <td>{m.hour || "—"}</td>
                                <td>{m.day || "—"}</td>
                                <td>{m.apprentice_names || "—"}</td>
                                <td>{badgeAsistencia(m.asistencia)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <p className="text-muted small mb-4">No hay historial de reuniones</p>
                    )}

                    {/* Reuniones por semana */}
                    <BarChartCard
                      title="Reuniones por semana"
                      data={agendaData.meetingsPerWeek || []}
                      dataKeys={[{ key: "count", name: "Reuniones", color: "#0dcaf0" }]}
                      xAxisKey="week_start"
                    />
                  </>
                )}

                {!selectedPsycho && (
                  <p className="text-muted text-center py-3">Seleccione un psicólogo para ver su agenda</p>
                )}
              </div>
            </div>
          </motion.div>

          {/* Sección 5: Tendencia Mensual (6 Meses) */}
          <motion.div className="col-12" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4">
              <div className="card-body">
                <h5 className="mb-3 d-flex align-items-center gap-2">
                  <TrendingUp size={20} className="text-secondary" /> Tendencia Mensual (6 Meses)
                </h5>
                <div className="row g-3">
                  <div className="col-md-4">
                    <BarChartCard
                      title="Alertas por mes"
                      data={alerts6m.series}
                      dataKeys={[{ key: "count", name: "Alertas", color: "#dc3545" }]}
                      xAxisKey="date"
                    />
                  </div>
                  <div className="col-md-4">
                    <BarChartCard
                      title="Reuniones por mes"
                      data={meetings6m.series}
                      dataKeys={[
                        { key: "asistio", name: "Asistió", color: "#198754" },
                        { key: "no_asistio", name: "No Asistió", color: "#dc3545" },
                        { key: "pendiente", name: "Pendiente", color: "#ffc107" },
                      ]}
                      xAxisKey="date"
                    />
                  </div>
                  <div className="col-md-4">
                    <BarChartCard
                      title="Entradas de diario por mes"
                      data={diary6m.series}
                      dataKeys={[{ key: "count", name: "Entradas", color: "#0d6efd" }]}
                      xAxisKey="date"
                    />
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

        </div>
      </motion.div>
    </MainLayout>
  );
}

export default Dashboard;
