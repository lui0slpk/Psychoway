import React, { useEffect, useRef } from 'react';
import MainLayout from '../../layouts/MainLayout';

function PsiSeguimientoPage() {
    const chartRef = useRef(null);

    useEffect(() => {
        // Cargar Chart.js dinámicamente
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/npm/chart.js';
        script.async = true;
        script.onload = () => {
            if (chartRef.current) {
                new window.Chart(chartRef.current, {
                    type: 'doughnut',
                    data: {
                        labels: ['Negativas', 'Positivas'],
                        datasets: [{
                            data: [40, 60],
                            backgroundColor: ['#001A0B', '#005222'],
                            borderWidth: 0
                        }]
                    },
                    options: {
                        cutout: '65%',
                        plugins: { legend: { display: false } }
                    }
                });
            }
        };
        document.body.appendChild(script);

        return () => {
            document.body.removeChild(script);
        };
    }, []);

    return (
        <MainLayout 
            pageTitle="Seguimiento del Diario" 
            pageSubtitle="Revisa el estado del diario de los aprendices"
            currentPage="psi-seguimiento"
        >
            <div className="container-fluid px-4 py-4 bg-light">
                <div className="row g-4">
                    {/* Tabla de Diarios */}
                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-header bg-white fw-semibold">
                                Diarios de Emociones
                            </div>
                            <div className="card-body p-3">
                                <div className="table-responsive">
                                    <table className="table table-hover align-middle mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th>Aprendiz</th>
                                                <th>Emociones</th>
                                                <th>Última Consulta</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            <tr>
                                                <td>25 Julio, 2022</td>
                                                <td className="fw-semibold" style={{ color: '#005222' }}>Positivas</td>
                                                <td>May/2042</td>
                                            </tr>
                                            <tr>
                                                <td>22 Feb, 2022</td>
                                                <td className="fw-semibold" style={{ color: '#001A0B' }}>Negativas</td>
                                                <td>N/d</td>
                                            </tr>
                                            <tr>
                                                <td>22 Feb, 2022</td>
                                                <td className="fw-semibold" style={{ color: '#005222'}}>Positivas</td>
                                                <td>Naridy</td>
                                            </tr>
                                            <tr>
                                                <td>22 Feb, 2022</td>
                                                <td className="fw-semibold" style={{ color: '#001A0B' }}>Negativas</td>
                                                <td>Trota</td>
                                            </tr>
                                            <tr>
                                                <td>22 Feb, 2022</td>
                                                <td className="fw-semibold" style={{color: '#005222'}}>Positivas</td>
                                                <td>May/Trote</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                <nav className="px-3 py-3">
                                    <ul className="pagination justify-content-center mb-0">
                                        <li className="page-item disabled"><a className="page-link" href="#!">‹</a></li>
                                        <li className="page-item"><a className="page-link" href="#!">1</a></li>
                                        <li className="page-item active"><a className="page-link" href="#!">2</a></li>
                                        <li className="page-item"><a className="page-link" href="#!">3</a></li>
                                        <li className="page-item"><a className="page-link" href="#!">...</a></li>
                                        <li className="page-item"><a className="page-link" href="#!">20</a></li>
                                        <li className="page-item"><a className="page-link" href="#!">›</a></li>
                                    </ul>
                                </nav>
                            </div>
                        </div>
                    </div>

                    {/* Panel de información del paciente */}
                    <div className="col-md-6">
                        <div className="card shadow-sm h-100">
                            <div className="card-body text-center">
                                <h5 className="fw-semibold mb-4">
                                    Kevin Andrés <br />
                                    Chaverra Quintero
                                </h5>

                                {/* Gráfico de emociones */}
                                <div className="d-flex justify-content-center mb-4">
                                    <div style={{ maxWidth: '160px' }}>
                                        <canvas ref={chartRef} width="160" height="160"></canvas>
                                    </div>
                                </div>

                                {/* Leyenda */}
                                <div className="d-flex flex-column align-items-start mx-auto" style={{ maxWidth: '200px' }}>
                                    <div className="d-flex align-items-center mb-2">
                                        <span 
                                            className="me-2 rounded" 
                                            style={{ width: '14px', height: '14px', backgroundColor: '#001A0B' }}
                                        ></span>
                                        <span>Emociones Negativas</span>
                                    </div>
                                    <div className="d-flex align-items-center">
                                        <span 
                                            className="me-2 rounded" 
                                            style={{ width: '14px', height: '14px', backgroundColor: '#005222' }}
                                        ></span>
                                        <span>Emociones Positivas</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default PsiSeguimientoPage;
