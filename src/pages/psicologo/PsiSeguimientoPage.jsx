import React, { useEffect, useRef, useState } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

function PsiSeguimientoPage() {
    const chartRef = useRef(null);
    const chartInstance = useRef(null);
    const { hasRole } = useAuth();
    const [searchTerm, setSearchTerm] = useState('');
    
    // Data states
    const [aprendices, setAprendices] = useState([]);
    const [selectedUser, setSelectedUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [alerts, setAlerts] = useState([]);

    // Fetch aprendices y alertas
    useEffect(() => {
        const fetchAprendices = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/psychologist/apprentices-with-emotions');
                if (res.ok) {
                    const data = await res.json();
                    setAprendices(data);
                    if(data.length > 0) {
                        setSelectedUser(data[0]);
                    }
                }
            } catch (error) {
                console.error("Error fetching aprendices:", error);
            } finally {
                setLoading(false);
            }
        };

        const fetchAlerts = async () => {
            try {
                const res = await fetch('http://localhost:5000/api/psychologist/alerts');
                if (res.ok) {
                    const data = await res.json();
                    setAlerts(data);
                }
            } catch (error) {
                console.error("Error fetching alerts:", error);
            }
        };

        fetchAprendices();
        fetchAlerts();

        // Refrescar alertas automáticamente cada 15 segundos
        const intervalId = setInterval(fetchAlerts, 15000);
        return () => clearInterval(intervalId);
    }, []);

    const markAlertAsRead = async (id_alert) => {
        try {
            await fetch(`http://localhost:5000/api/psychologist/alerts/${id_alert}/read`, { method: 'PUT' });
            // Actualizar estado local para que desaparezca la alerta
            setAlerts(prev => prev.map(a => a.id_alert === id_alert ? { ...a, leido: 1 } : a));
        } catch (error) {
            console.error("Error marcando alerta como leída", error);
        }
    };

    const filteredAprendices = aprendices.filter(ap => 
        ap.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
        ap.documento.includes(searchTerm)
    );

    // Draw chart when selectedUser or chartRef is ready
    useEffect(() => {
        if (!selectedUser || !chartRef.current) return;

        // Cargar Chart.js si no existe
        if (!window.Chart) {
            const script = document.createElement('script');
            script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
            script.async = true;
            script.onload = updateChart;
            document.body.appendChild(script);
        } else {
            updateChart();
        }

        function updateChart() {
            if (chartInstance.current) {
                chartInstance.current.destroy();
            }

            const { positivas, negativas, neutrales } = selectedUser.estadisticas || { positivas: 0, negativas: 0, neutrales: 0 };

            chartInstance.current = new window.Chart(chartRef.current.getContext('2d'), {
                type: 'doughnut',
                data: {
                    labels: ['Negativas', 'Positivas', 'Neutral'],
                    datasets: [{
                        data: [negativas, positivas, neutrales],
                        backgroundColor: ['#001A0B', '#005222', '#4a7c59'],
                        borderWidth: 0
                    }]
                },
                options: {
                    cutout: '65%',
                    plugins: { legend: { display: false } }
                }
            });
        }

        return () => {
            if (chartInstance.current) {
                chartInstance.current.destroy();
                chartInstance.current = null;
            }
        };
    }, [selectedUser]);

    // Verificar el rol del usuario para restringir el acceso
    if (!hasRole('Psicólogo') && !hasRole('psicologo') && !hasRole('PSICOLOGO') && !hasRole('psicologa') && !hasRole('Psicóloga')) {
        return (
            <MainLayout 
                pageTitle="Acceso Denegado" 
                pageSubtitle="No tienes permisos para ver esta página"
                currentPage="psi-seguimiento"
            >
                <div className="container-fluid px-4 py-4 bg-light">
                    <div className="alert alert-danger" role="alert">
                        Acceso restringido. Solo los usuarios con rol Psicólogo podrán visualizar la lista de aprendices.
                    </div>
                </div>
            </MainLayout>
        );
    }

    const unreadAlerts = alerts.filter(a => !a.leido);

    return (
        <MainLayout 
            pageTitle="Seguimiento del Diario" 
            pageSubtitle="Revisa el estado del diario de los aprendices y gestiona alertas"
            currentPage="psi-seguimiento"
        >
            <div className="container-fluid px-4 py-4 bg-light">
                
                {/* Panel de Alertas Críticas */}
                {unreadAlerts.length > 0 && (
                    <div className="row mb-4">
                        <div className="col-12">
                            <div className="card shadow-sm border-danger">
                                <div className="card-header bg-danger text-white fw-bold d-flex justify-content-between align-items-center">
                                    <span>
                                        <i className="bi bi-exclamation-triangle-fill me-2"></i>
                                        Alertas de Riesgo Detectadas por AI ({unreadAlerts.length})
                                    </span>
                                </div>
                                <div className="list-group list-group-flush">
                                    {unreadAlerts.map(alert => (
                                        <div key={alert.id_alert} className="list-group-item list-group-item-danger d-flex justify-content-between align-items-start">
                                            <div className="ms-2 me-auto">
                                                <div className="fw-bold">
                                                    Atención requerida para: {alert.aprendiz_nombre} (Doc: {alert.document})
                                                </div>
                                                <span className="text-dark d-block mb-1">
                                                    <strong>Motivo Clínico:</strong> {alert.motivo}
                                                </span>
                                                <small className="text-muted">Detectado el: {new Date(alert.timestamp).toLocaleString()}</small>
                                            </div>
                                            <button 
                                                className="btn btn-sm btn-outline-danger"
                                                onClick={() => markAlertAsRead(alert.id_alert)}
                                            >
                                                Marcar Leído
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                <div className="row g-4">
                    {/* Tabla de Diarios */}
                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-white fw-semibold d-flex justify-content-between align-items-center">
                                <span>Lista de Aprendices</span>
                                <input 
                                    type="text" 
                                    className="form-control form-control-sm" 
                                    style={{ maxWidth: '250px' }}
                                    placeholder="Buscar por nombre o documento..." 
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                            <div className="card-body p-3">
                                {/* Nota informativa sobre edición */}
                                <div className="alert alert-info py-2" role="alert" style={{ fontSize: '0.85rem' }}>
                                    <i className="bi bi-info-circle me-2"></i>
                                    <strong>Modo lectura:</strong> El psicólogo no podrá modificar los datos del aprendiz desde esta vista, salvo que el sistema lo permita mediante un permiso específico. Haga clic en un usuario para ver sus estadísticas.
                                </div>
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Nombre del aprendiz</th>
                                                <th>Promedio de emociones</th>
                                                <th>Última emoción</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {loading ? (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-3 text-muted">
                                                        Cargando aprendices...
                                                    </td>
                                                </tr>
                                            ) : filteredAprendices.length > 0 ? (
                                                filteredAprendices.map((aprendiz) => (
                                                    <tr 
                                                        key={aprendiz.id} 
                                                        onClick={() => setSelectedUser(aprendiz)} 
                                                        style={{ 
                                                            cursor: 'pointer',
                                                            backgroundColor: selectedUser?.id === aprendiz.id ? '#f8f9fa' : 'transparent',
                                                            borderLeft: selectedUser?.id === aprendiz.id ? '4px solid #005222' : '4px solid transparent'
                                                        }}
                                                    >
                                                        <td>
                                                            <div className="fw-medium">{aprendiz.nombre}</div>
                                                            <small className="text-muted">Doc: {aprendiz.documento}</small>
                                                        </td>
                                                        <td className="fw-semibold" style={{ color: aprendiz.promedio === 'Positivas' ? '#005222' : aprendiz.promedio === 'Negativas' ? '#001A0B' : '#4a7c59' }}>
                                                            {aprendiz.promedio}
                                                        </td>
                                                        <td style={{ color: aprendiz.ultima === 'Positivas' ? '#005222' : aprendiz.ultima === 'Negativas' ? '#001A0B' : '#4a7c59' }}>
                                                            {aprendiz.ultima}
                                                        </td>
                                                    </tr>
                                                ))
                                            ) : (
                                                <tr>
                                                    <td colSpan="3" className="text-center py-3 text-muted">
                                                        No se encontraron aprendices con emociones registradas.
                                                    </td>
                                                </tr>
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Panel de información del paciente */}
                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-body text-center d-flex flex-column justify-content-center">
                                {selectedUser ? (
                                    <>
                                        <h5 className="fw-semibold mb-2">
                                            {selectedUser.nombre}
                                        </h5>
                                        <p className="text-muted mb-4 small">Documento: {selectedUser.documento}</p>

                                        {/* Gráfico de emociones */}
                                        <div className="d-flex justify-content-center mb-4">
                                            <div style={{ maxWidth: '180px', position: 'relative' }}>
                                                <canvas ref={chartRef} width="160" height="160"></canvas>
                                                <div
                                                    className="position-absolute top-50 start-50 translate-middle fw-bold text-center"
                                                    style={{ fontSize: '0.9rem', pointerEvents: 'none' }}
                                                >
                                                    {selectedUser.estadisticas.positivas + selectedUser.estadisticas.negativas + selectedUser.estadisticas.neutrales}<br/>
                                                    <span style={{fontSize: '0.65rem', fontWeight: 'normal'}}>Registros</span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Leyenda */}
                                        <div className="d-flex flex-column align-items-start mx-auto" style={{ maxWidth: '200px' }}>
                                            <div className="d-flex align-items-center mb-2 justify-content-between w-100">
                                                <div className="d-flex align-items-center">
                                                    <span 
                                                        className="me-2 rounded" 
                                                        style={{ width: '14px', height: '14px', backgroundColor: '#005222' }}
                                                    ></span>
                                                    <span>Positivas</span>
                                                </div>
                                                <span className="fw-bold">{selectedUser.estadisticas.positivas}</span>
                                            </div>
                                            <div className="d-flex align-items-center mb-2 justify-content-between w-100">
                                                <div className="d-flex align-items-center">
                                                    <span 
                                                        className="me-2 rounded" 
                                                        style={{ width: '14px', height: '14px', backgroundColor: '#001A0B' }}
                                                    ></span>
                                                    <span>Negativas</span>
                                                </div>
                                                <span className="fw-bold">{selectedUser.estadisticas.negativas}</span>
                                            </div>
                                            <div className="d-flex align-items-center justify-content-between w-100">
                                                <div className="d-flex align-items-center">
                                                    <span 
                                                        className="me-2 rounded" 
                                                        style={{ width: '14px', height: '14px', backgroundColor: '#4a7c59' }}
                                                    ></span>
                                                    <span>Neutrales</span>
                                                </div>
                                                <span className="fw-bold">{selectedUser.estadisticas.neutrales}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-muted">
                                        <i className="bi bi-person-lines-fill mb-3 d-block" style={{fontSize: '3rem', color: '#ccc'}}></i>
                                        {loading ? "Cargando datos..." : "Seleccione a un aprendiz de la lista para ver su información detallada"}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default PsiSeguimientoPage;
