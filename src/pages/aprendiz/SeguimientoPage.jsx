import React, { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import MainLayout from "../../layouts/MainLayout";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
  Heart,
  Target,
  Calendar,
  Clock,
  Smile,
  Meh,
  Frown,
  TrendingUp,
} from "lucide-react";

function SeguimientoPage() {
  const { user } = useAuth();
  const [historial, setHistorial] = useState([]);
  const [objetivos, setObjetivos] = useState([]);
  const [pagEmoc, setPagEmoc] = useState(1);
  const [pagObj, setPagObj] = useState(1);
  const POR_PAGINA = 5;

  // Paginación reutilizable
  const Paginacion = ({ total, pagina, setPagina }) => {
    const totalPags = Math.ceil(total / POR_PAGINA);
    if (totalPags <= 1) return null;
    const pages = [];
    for (let i = 1; i <= totalPags; i++) pages.push(i);
    return (
      <nav className="d-flex justify-content-center mt-3">
        <ul className="pagination pagination-sm mb-0">
          <li className={`page-item ${pagina === 1 ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPagina((p) => Math.max(1, p - 1))}
            >
              ‹
            </button>
          </li>
          {pages.map((p) => (
            <li key={p} className={`page-item ${pagina === p ? "active" : ""}`}>
              <button className="page-link" onClick={() => setPagina(p)}>
                {p}
              </button>
            </li>
          ))}
          <li className={`page-item ${pagina === totalPags ? "disabled" : ""}`}>
            <button
              className="page-link"
              onClick={() => setPagina((p) => Math.min(totalPags, p + 1))}
            >
              ›
            </button>
          </li>
        </ul>
      </nav>
    );
  };

  // Fetch data
  useEffect(() => {
    const userId = user?.id || user?.id_user;
    if (!userId) return;

    const fetchHistorial = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/diary/entries/${userId}`,
        );
        if (res.ok) setHistorial(await res.json());
      } catch (e) {
        console.error("Error historial:", e);
      }
    };

    const fetchObjetivos = async () => {
      try {
        const res = await fetch(
          `http://localhost:5000/api/objectives/${userId}`,
        );
        if (res.ok) setObjetivos(await res.json());
      } catch (e) {
        console.error("Error objetivos:", e);
      }
    };

    fetchHistorial();
    fetchObjetivos();
  }, [user]);

  // Preparar datos para Recharts
  const getPieData = () => {
    const positivas = historial.filter(
      (e) => e.emot_estado === "Positivo",
    ).length;
    const negativas = historial.filter(
      (e) => e.emot_estado === "Negativo",
    ).length;
    const neutras = historial.filter((e) => e.emot_estado === "Neutral").length;

    return [
      { name: "Positivas", value: positivas, color: "#005222" },
      { name: "Negativas", value: negativas, color: "#001A0B" },
      { name: "Neutral", value: neutras, color: "#4a7c59" },
    ];
  };

  const getBarData = () => {
    const conteosPorDia = {};
    objetivos.forEach((obj) => {
      const fecha = new Date(obj.last_update).toLocaleDateString("es-CO", {
        day: "2-digit",
        month: "2-digit",
      });
      if (!conteosPorDia[fecha])
        conteosPorDia[fecha] = { name: fecha, cumplidos: 0, noCumplidos: 0 };
      if (obj.estado === "Cumplido") conteosPorDia[fecha].cumplidos++;
      else conteosPorDia[fecha].noCumplidos++;
    });
    return Object.values(conteosPorDia).slice(-7);
  };

  const getEmoji = (emot) => {
    const mapa = {
      "Muy Feliz": <Smile className="text-success" />,
      Feliz: <Smile className="text-success opacity-75" />,
      Neutral: <Meh className="text-warning" />,
      Triste: <Frown className="text-danger opacity-75" />,
      "Muy Triste": <Frown className="text-danger" />,
    };
    return mapa[emot] || <Meh />;
  };

  const badgeEstado = (estado) => {
    if (estado === "Cumplido") return "bg-success";
    if (estado === "No Cumplido") return "bg-danger";
    return "bg-secondary";
  };

  const containerVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.5, staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MainLayout
      pageTitle="Seguimiento del Diario"
      pageSubtitle="Revisa tu progreso emocional"
      currentPage="seguimiento"
    >
      <motion.div
        className="container-fluid px-4 py-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Gráficos */}
        <div className="row g-4 mb-4">
          {/* Donut Chart */}
          <motion.div className="col-md-4" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
              <h5 className="mb-4 fs-5 d-flex align-items-center gap-2">
                <Heart size={20} className="text-success" /> Mis Emociones
              </h5>
              <div className="position-relative" style={{ height: 220 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={getPieData()}
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                      animationBegin={200}
                      animationDuration={1000}
                    >
                      {getPieData().map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <RechartsTooltip />
                  </PieChart>
                </ResponsiveContainer>
                <div className="position-absolute top-50 start-50 translate-middle text-center">
                  <div className="fw-bold fs-4">
                    {Math.round(
                      (historial.filter((e) => e.emot_estado === "Positivo")
                        .length /
                        (historial.length || 1)) *
                        100,
                    )}
                    %
                  </div>
                  <div className="text-muted small">Positivas</div>
                </div>
              </div>
              <div className="mt-4">
                {getPieData().map((item, idx) => (
                  <div
                    key={idx}
                    className="d-flex align-items-center justify-content-between mb-2"
                  >
                    <div className="d-flex align-items-center gap-2">
                      <div
                        style={{
                          width: 12,
                          height: 12,
                          borderRadius: "50%",
                          backgroundColor: item.color,
                        }}
                      ></div>
                      <span className="small text-muted">{item.name}</span>
                    </div>
                    <span className="fw-bold small">{item.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>

          {/* Bar Chart */}
          <motion.div className="col-md-8" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4 h-100 p-4">
              <h5 className="mb-4 fs-5 d-flex align-items-center gap-2">
                <Target size={20} className="text-success" /> Objetivos por Día
              </h5>
              <div style={{ width: "100%", height: 300 }}>
                {objetivos.length === 0 ? (
                  <div className="h-100 d-flex flex-column align-items-center justify-content-center text-muted">
                    <Calendar size={48} className="mb-2 opacity-25" />
                    <p>No hay objetivos registrados aún.</p>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={getBarData()}>
                      <CartesianGrid
                        strokeDasharray="3 3"
                        vertical={false}
                        stroke="#f0f0f0"
                      />
                      <XAxis
                        dataKey="name"
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                      />
                      <YAxis
                        axisLine={false}
                        tickLine={false}
                        tick={{ fontSize: 12, fill: "#666" }}
                      />
                      <Tooltip
                        contentStyle={{
                          borderRadius: "12px",
                          border: "none",
                          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
                        }}
                      />
                      <Legend verticalAlign="top" height={36} />
                      <Bar
                        dataKey="cumplidos"
                        fill="#005222"
                        radius={[4, 4, 0, 0]}
                        name="Cumplidos"
                      />
                      <Bar
                        dataKey="noCumplidos"
                        fill="#001A0B"
                        radius={[4, 4, 0, 0]}
                        name="No Cumplidos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </div>
            </div>
          </motion.div>
        </div>

        {/* Tablas con animación */}
        <div className="row g-4">
          <motion.div className="col-md-6" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="mb-4 fs-5 d-flex align-items-center gap-2">
                <TrendingUp size={20} className="text-success" /> Historial de
                Emociones
              </h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light border-0">
                    <tr className="text-muted small uppercase">
                      <th>Fecha</th>
                      <th>Emoción</th>
                      <th>Descripción</th>
                    </tr>
                  </thead>
                  <tbody className="border-0">
                    {(() => {
                      const slice = historial.slice(
                        (pagEmoc - 1) * POR_PAGINA,
                        pagEmoc * POR_PAGINA,
                      );
                      return slice.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-4 text-muted"
                          >
                            No hay registros aún.
                          </td>
                        </tr>
                      ) : (
                        slice.map((entry) => (
                          <tr key={entry.id_diary_entries}>
                            <td>
                              <div className="d-flex align-items-center gap-2">
                                <Calendar size={14} className="text-muted" />
                                <span>
                                  {new Date(
                                    entry.entry_date,
                                  ).toLocaleDateString()}
                                </span>
                              </div>
                              <small className="text-muted d-block ms-4">
                                <Clock size={12} className="me-1" />
                                {new Date(entry.entry_date).toLocaleTimeString(
                                  [],
                                  { hour: "2-digit", minute: "2-digit" },
                                )}
                              </small>
                            </td>
                            <td>
                              <div className="d-flex align-items-center gap-2 fw-medium">
                                {getEmoji(entry.emot_name)}
                                {entry.emot_name}
                              </div>
                            </td>
                            <td className="small text-muted">
                              {entry.description || "-"}
                            </td>
                          </tr>
                        ))
                      );
                    })()}
                  </tbody>
                </table>
              </div>
              <Paginacion
                total={historial.length}
                pagina={pagEmoc}
                setPagina={setPagEmoc}
              />
            </div>
          </motion.div>

          <motion.div className="col-md-6" variants={itemVariants}>
            <div className="card border-0 shadow-sm rounded-4 p-4 h-100">
              <h5 className="mb-4 fs-5 d-flex align-items-center gap-2">
                <Target size={20} className="text-success" /> Historial de
                Objetivos
              </h5>
              <div className="table-responsive">
                <table className="table table-hover align-middle">
                  <thead className="table-light border-0">
                    <tr className="text-muted small uppercase">
                      <th>Fecha</th>
                      <th>Objetivo</th>
                      <th>Estado</th>
                    </tr>
                  </thead>
                  <tbody className="border-0">
                    {(() => {
                      const slice = objetivos.slice(
                        (pagObj - 1) * POR_PAGINA,
                        pagObj * POR_PAGINA,
                      );
                      return slice.length === 0 ? (
                        <tr>
                          <td
                            colSpan="3"
                            className="text-center py-4 text-muted"
                          >
                            No hay objetivos registrados.
                          </td>
                        </tr>
                      ) : (
                        slice.map((obj) => (
                          <tr key={obj.id_objetives}>
                            <td>
                              <div className="small">
                                {new Date(obj.last_update).toLocaleDateString()}
                              </div>
                            </td>
                            <td>
                              <div className="fw-semibold small">
                                {obj.nombre_objetivo}
                              </div>
                              <div
                                className="text-muted x-small"
                                style={{
                                  maxWidth: "150px",
                                  overflow: "hidden",
                                  textOverflow: "ellipsis",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {obj.descripcion}
                              </div>
                            </td>
                            <td>
                              <span
                                className={`badge rounded-pill ${badgeEstado(obj.estado)} px-3`}
                              >
                                {obj.estado}
                              </span>
                            </td>
                          </tr>
                        ))
                      );
                    })()}
                  </tbody>
                </table>
              </div>
              <Paginacion
                total={objetivos.length}
                pagina={pagObj}
                setPagina={setPagObj}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      <style>{`
                .uppercase { text-transform: uppercase; letter-spacing: 0.5px; }
                .x-small { font-size: 0.75rem; }
                .card { transition: transform 0.2s ease; }
                .card:hover { transform: translateY(-5px); }
            `}</style>
    </MainLayout>
  );
}

export default SeguimientoPage;
