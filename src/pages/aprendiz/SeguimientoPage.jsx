import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useAuth } from '../../context/AuthContext';
import MainLayout from '../../layouts/MainLayout';

function SeguimientoPage() {
    const donutChartRef = useRef(null);
    const barChartRef = useRef(null);
    const donutInstance = useRef(null);
    const barInstance = useRef(null);
    const { user } = useAuth();
    const [historial, setHistorial] = useState([]);
    const [objetivos, setObjetivos] = useState([]);
    const [chartjsReady, setChartjsReady] = useState(false);
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
                    <li className={`page-item ${pagina === 1 ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPagina(p => Math.max(1, p - 1))}>‹</button>
                    </li>
                    {pages.map(p => (
                        <li key={p} className={`page-item ${pagina === p ? 'active' : ''}`}>
                            <button className="page-link" onClick={() => setPagina(p)}>{p}</button>
                        </li>
                    ))}
                    <li className={`page-item ${pagina === totalPags ? 'disabled' : ''}`}>
                        <button className="page-link" onClick={() => setPagina(p => Math.min(totalPags, p + 1))}>›</button>
                    </li>
                </ul>
            </nav>
        );
    };

    // Cargar Chart.js una vez
    useEffect(() => {
        if (window.Chart) { setChartjsReady(true); return; }
        const existing = document.querySelector('script[src*="chart.js"]');
        if (existing) { existing.onload = () => setChartjsReady(true); return; }

        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.async = true;
        script.onload = () => setChartjsReady(true);
        document.body.appendChild(script);
        return () => {
            if (document.body.contains(script)) document.body.removeChild(script);
        };
    }, []);

    // Fetch data
    useEffect(() => {
        const userId = user?.id || user?.id_user;
        if (!userId) return;

        const fetchHistorial = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/diary/entries/${userId}`);
                if (res.ok) setHistorial(await res.json());
            } catch (e) { console.error('Error historial:', e); }
        };

        const fetchObjetivos = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/objectives/${userId}`);
                if (res.ok) setObjetivos(await res.json());
            } catch (e) { console.error('Error objetivos:', e); }
        };

        fetchHistorial();
        fetchObjetivos();
    }, [user]);

    // Crear/actualizar gráficos cuando los datos Y Chart.js estén listos
    useEffect(() => {
        if (!chartjsReady || !window.Chart) return;
        if (!donutChartRef.current || !barChartRef.current) return;

        // ── DONUT: Emociones Positivas vs Negativas ──
        const positivas = historial.filter(e => e.emot_estado === 'Positivo').length;
        const negativas = historial.filter(e => e.emot_estado === 'Negativo').length;
        const neutras = historial.filter(e => e.emot_estado === 'Neutral').length;
        const totalEmoc = positivas + negativas + neutras || 1;
        const pctPositivo = Math.round((positivas / totalEmoc) * 100);

        // Emoción predominante
        const predominante =
            positivas >= negativas && positivas >= neutras ? 'Positivo' :
                negativas >= positivas && negativas >= neutras ? 'Negativo' : 'Neutral';

        if (donutInstance.current) donutInstance.current.destroy();
        donutInstance.current = new window.Chart(donutChartRef.current.getContext('2d'), {
            type: 'doughnut',
            data: {
                labels: ['Negativas', 'Positivas', 'Neutral'],
                datasets: [{
                    data: [negativas, positivas, neutras],
                    backgroundColor: ['#001A0B', '#005222', '#4a7c59'],
                    borderWidth: 0
                }]
            },
            options: {
                plugins: {
                    legend: { display: false },
                    tooltip: { enabled: true }
                },
                cutout: '70%'
            }
        });

        // Actualizar texto central del donut
        const centerEl = document.getElementById('donut-center-text');
        if (centerEl) {
            centerEl.innerHTML = `<span style="font-size:1rem;font-weight:700">${pctPositivo}%</span><br/><span style="font-size:0.72rem;color:#6c757d">${predominante}</span>`;
        }

        // ── BAR: Cumplidos vs No Cumplidos por día (últimos 7 días únicos) ──
        // Agrupar objetivos por fecha
        const conteosPorDia = {};
        objetivos.forEach(obj => {
            const fecha = new Date(obj.last_update).toLocaleDateString('es-CO', { day: '2-digit', month: '2-digit' });
            if (!conteosPorDia[fecha]) conteosPorDia[fecha] = { cumplidos: 0, noCumplidos: 0 };
            if (obj.estado === 'Cumplido') conteosPorDia[fecha].cumplidos++;
            else conteosPorDia[fecha].noCumplidos++;
        });

        // Si no hay datos, mostrar placeholder
        const fechas = Object.keys(conteosPorDia).slice(-7);
        const cumplidos = fechas.map(f => conteosPorDia[f].cumplidos);
        const noCumplidos = fechas.map(f => conteosPorDia[f].noCumplidos);

        const labelsBar = fechas.length > 0 ? fechas : ['Sin datos'];
        const dataCumpl = fechas.length > 0 ? cumplidos : [0];
        const dataNoCompl = fechas.length > 0 ? noCumplidos : [0];

        if (barInstance.current) barInstance.current.destroy();
        barInstance.current = new window.Chart(barChartRef.current.getContext('2d'), {
            type: 'bar',
            data: {
                labels: labelsBar,
                datasets: [
                    {
                        label: 'Cumplidos',
                        data: dataCumpl,
                        backgroundColor: '#005222'
                    },
                    {
                        label: 'No Cumplidos',
                        data: dataNoCompl,
                        backgroundColor: '#001A0B'
                    }
                ]
            },
            options: {
                responsive: true,
                plugins: {
                    legend: { position: 'top', labels: { boxWidth: 20 } }
                },
                scales: {
                    y: { beginAtZero: true, ticks: { stepSize: 1 } }
                }
            }
        });

    }, [chartjsReady, historial, objetivos]);

    const getEmoji = (emot) => {
        const mapa = { 'Muy Feliz': '😄', 'Feliz': '🙂', 'Neutral': '😐', 'Triste': '☹️', 'Muy Triste': '😞' };
        return mapa[emot] || '😐';
    };

    const badgeEstado = (estado) => {
        if (estado === 'Cumplido') return 'bg-success';
        if (estado === 'No Cumplido') return 'bg-danger';
        return 'bg-secondary';
    };

    return (
        <MainLayout
            pageTitle="Seguimiento del Diario"
            pageSubtitle="Revisa tu progreso emocional"
            currentPage="seguimiento"
        >
            <div className="container-fluid px-4 py-4">
                {/* Gráficos */}
                <div className="row g-4 mb-4">
                    {/* Donut */}
                    <div className="col-md-4">
                        <div className="bg-white p-4 rounded h-100">
                            <h5 className="mb-4 fs-4">Mis Emociones</h5>
                            <div className="position-relative" style={{ maxWidth: 220, margin: '0 auto' }}>
                                <canvas ref={donutChartRef} id="donutChart"></canvas>
                                <div
                                    id="donut-center-text"
                                    className="position-absolute top-50 start-50 translate-middle fw-bold text-center"
                                    style={{ fontSize: '0.85rem', pointerEvents: 'none' }}
                                >
                                    {historial.length === 0 ? 'Sin datos' : '...'}
                                </div>
                            </div>
                            <div className="mt-4 d-flex flex-column gap-1">
                                <p className="mb-1">
                                    <span className="badge me-2" style={{ backgroundColor: '#005222' }}>&nbsp;</span>
                                    Emociones Positivas
                                </p>
                                <p className="mb-1">
                                    <span className="badge me-2" style={{ backgroundColor: '#001A0B' }}>&nbsp;</span>
                                    Emociones Negativas
                                </p>
                                <p className="mb-0">
                                    <span className="badge me-2" style={{ backgroundColor: '#4a7c59' }}>&nbsp;</span>
                                    Neutral
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Bar */}
                    <div className="col-md-8">
                        <div className="bg-white p-4 rounded h-100">
                            <h5 className="mb-3 fs-4">Mis Objetivos por Día</h5>
                            {objetivos.length === 0 ? (
                                <p className="text-muted text-center mt-5">No hay objetivos registrados aún.</p>
                            ) : (
                                <canvas ref={barChartRef} id="barChart"></canvas>
                            )}
                        </div>
                    </div>
                </div>

                {/* Historiales separados */}
                <div className="row g-4">
                    {/* Historial de Emociones — Izquierda */}
                    <div className="col-md-6">
                        <div className="p-3 bg-white rounded h-100">
                            <h5 className="mb-3">
                                <span className="me-2">😊</span>Historial de Emociones
                            </h5>
                            <table className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Emoción</th>
                                        <th>Descripción</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const slice = historial.slice((pagEmoc - 1) * POR_PAGINA, pagEmoc * POR_PAGINA);
                                        return slice.length === 0 ? (
                                            <tr>
                                                <td colSpan="3" className="text-center text-muted">
                                                    No hay registros de emociones aún.
                                                </td>
                                            </tr>
                                        ) : (
                                            slice.map((entry) => (
                                                <tr key={entry.id_diary_entries}>
                                                    <td>
                                                        {new Date(entry.entry_date).toLocaleDateString()} <br />
                                                        <small className="text-muted">
                                                            {new Date(entry.entry_date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </small>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-2">
                                                            <span className="fs-4">{getEmoji(entry.emot_name)}</span>
                                                            {entry.emot_name}
                                                        </div>
                                                    </td>
                                                    <td>{entry.description || '-'}</td>
                                                </tr>
                                            ))
                                        );
                                    })()}
                                </tbody>
                            </table>
                            <Paginacion total={historial.length} pagina={pagEmoc} setPagina={setPagEmoc} />
                        </div>
                    </div>
                    <div className="col-md-6">
                        <div className="p-3 bg-white rounded h-100">
                            <h5 className="mb-3">
                                <span className="me-2">🎯</span>Historial de Objetivos
                            </h5>
                            <table className="table mb-0">
                                <thead className="table-light">
                                    <tr>
                                        <th>Fecha</th>
                                        <th>Objetivo</th>
                                        <th>Descripción</th>
                                        <th>Estado</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(() => {
                                        const slice = objetivos.slice((pagObj - 1) * POR_PAGINA, pagObj * POR_PAGINA);
                                        return slice.length === 0 ? (
                                            <tr>
                                                <td colSpan="4" className="text-center text-muted">
                                                    No has registrado objetivos aún.
                                                </td>
                                            </tr>
                                        ) : (
                                            slice.map((obj) => (
                                                <tr key={obj.id_objetives}>
                                                    <td>
                                                        {new Date(obj.last_update).toLocaleDateString()} <br />
                                                        <small className="text-muted">
                                                            {new Date(obj.last_update).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                        </small>
                                                    </td>
                                                    <td className="fw-semibold">{obj.nombre_objetivo}</td>
                                                    <td className="text-muted" style={{ maxWidth: '140px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                                        {obj.descripcion || '-'}
                                                    </td>
                                                    <td>
                                                        <span className={`badge ${badgeEstado(obj.estado)}`}>
                                                            {obj.estado || 'Sin estado'}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))
                                        );
                                    })()}
                                </tbody>
                            </table>
                            <Paginacion total={objetivos.length} pagina={pagObj} setPagina={setPagObj} />
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default SeguimientoPage;
