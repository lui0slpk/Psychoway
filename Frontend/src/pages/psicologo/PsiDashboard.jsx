import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import { motion } from 'framer-motion';
import { BarChart3, Calendar, TrendingUp } from 'lucide-react';
import PeriodFilter from '../../components/PeriodFilter';
import BarChartCard from '../../components/BarChartCard';
import * as statisticsApi from '../../api/statistics.api';

function PsiDashboard() {
	// Período independiente para cada sección
	const [alertsPeriod, setAlertsPeriod] = useState('week');
	const [meetingsPeriod, setMeetingsPeriod] = useState('week');

	// Datos de cada sección
	const [alertsData, setAlertsData] = useState({
		total: 0,
		unread: 0,
		series: [],
	});
	const [meetingsData, setMeetingsData] = useState({
		total: 0,
		byAttendance: {},
		series: [],
	});

	// Datos de tendencia mensual (6 meses)
	const [alerts6m, setAlerts6m] = useState({ total: 0, series: [] });
	const [meetings6m, setMeetings6m] = useState({ total: 0, series: [] });

	// Cargar alertas cuando cambia el período
	useEffect(() => {
		statisticsApi
			.getAlerts(alertsPeriod)
			.then((data) => setAlertsData(data))
			.catch((err) => console.error('Error cargando alertas:', err));
	}, [alertsPeriod]);

	// Cargar reuniones cuando cambia el período
	useEffect(() => {
		statisticsApi
			.getMeetings(meetingsPeriod)
			.then((data) => setMeetingsData(data))
			.catch((err) => console.error('Error cargando reuniones:', err));
	}, [meetingsPeriod]);

	// Cargar datos de tendencia mensual (6 meses) al montar
	useEffect(() => {
		statisticsApi
			.getMonthlyStats('alerts')
			.then((data) => setAlerts6m(data))
			.catch((err) =>
				console.error('Error cargando alertas mensuales:', err),
			);
		statisticsApi
			.getMonthlyStats('meetings')
			.then((data) => setMeetings6m(data))
			.catch((err) =>
				console.error('Error cargando reuniones mensuales:', err),
			);
	}, []);

	// Variantes de animación
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
			pageTitle="Dashboard"
			pageSubtitle="Estadísticas del psicólogo"
			currentPage="psi-dashboard"
		>
			<motion.div
				className="container-fluid px-4 py-4"
				initial="hidden"
				animate="visible"
				variants={containerVariants}
			>
				<div className="row g-4">
					{/* Sección 1: Alertas */}
					<motion.div className="col-12" variants={itemVariants}>
						<div className="card border-0 shadow-sm rounded-4">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h5 className="mb-0 d-flex align-items-center gap-2">
										<BarChart3
											size={20}
											className="text-danger"
										/>{' '}
										Alertas
									</h5>
									<PeriodFilter
										value={alertsPeriod}
										onChange={setAlertsPeriod}
									/>
								</div>
								<p className="text-muted small mb-2">
									Total: <strong>{alertsData.total}</strong> |
									Sin leer:{' '}
									<strong>{alertsData.unread}</strong>
								</p>
								<BarChartCard
									title="Alertas por día"
									data={alertsData.series}
									dataKeys={[
										{
											key: 'count',
											name: 'Alertas',
											color: '#dc3545',
										},
									]}
								/>
							</div>
						</div>
					</motion.div>

					{/* Sección 2: Reuniones */}
					<motion.div className="col-12" variants={itemVariants}>
						<div className="card border-0 shadow-sm rounded-4">
							<div className="card-body">
								<div className="d-flex justify-content-between align-items-center mb-3">
									<h5 className="mb-0 d-flex align-items-center gap-2">
										<Calendar
											size={20}
											className="text-success"
										/>{' '}
										Mis Reuniones
									</h5>
									<PeriodFilter
										value={meetingsPeriod}
										onChange={setMeetingsPeriod}
									/>
								</div>
								<p className="text-muted small mb-2">
									Total: <strong>{meetingsData.total}</strong>{' '}
									| Asistió:{' '}
									<strong>
										{meetingsData.byAttendance?.asistio ||
											0}
									</strong>{' '}
									| No asistió:{' '}
									<strong>
										{meetingsData.byAttendance
											?.no_asistio || 0}
									</strong>{' '}
									| Pendiente:{' '}
									<strong>
										{meetingsData.byAttendance?.pendiente ||
											0}
									</strong>
								</p>
								<BarChartCard
									title="Reuniones por día"
									data={meetingsData.series}
									dataKeys={[
										{
											key: 'asistio',
											name: 'Asistió',
											color: '#198754',
										},
										{
											key: 'no_asistio',
											name: 'No Asistió',
											color: '#dc3545',
										},
										{
											key: 'pendiente',
											name: 'Pendiente',
											color: '#ffc107',
										},
									]}
								/>
							</div>
						</div>
					</motion.div>

					{/* Sección 3: Tendencia Mensual (6 Meses) */}
					<motion.div className="col-12" variants={itemVariants}>
						<div className="card border-0 shadow-sm rounded-4">
							<div className="card-body">
								<h5 className="mb-3 d-flex align-items-center gap-2">
									<TrendingUp
										size={20}
										className="text-secondary"
									/>{' '}
									Tendencia Mensual (6 Meses)
								</h5>
								<div className="row g-3">
									<div className="col-md-6">
										<BarChartCard
											title="Alertas por mes"
											data={alerts6m.series}
											dataKeys={[
												{
													key: 'count',
													name: 'Alertas',
													color: '#dc3545',
												},
											]}
											xAxisKey="date"
										/>
									</div>
									<div className="col-md-6">
										<BarChartCard
											title="Reuniones por mes"
											data={meetings6m.series}
											dataKeys={[
												{
													key: 'asistio',
													name: 'Asistió',
													color: '#198754',
												},
												{
													key: 'no_asistio',
													name: 'No Asistió',
													color: '#dc3545',
												},
												{
													key: 'pendiente',
													name: 'Pendiente',
													color: '#ffc107',
												},
											]}
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

export default PsiDashboard;
