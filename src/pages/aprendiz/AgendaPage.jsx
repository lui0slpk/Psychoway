import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import meetImg from '../../assets/img/meet.png';
import { useAuth } from '../../context/AuthContext';

// Horarios de trabajo definidos (8 AM a 4 PM)
const WORKING_HOURS = [
    '08:00', '09:00', '10:00', '11:00',
    '13:00', '14:00', '15:00', '16:00'
];

function AgendaPage() {
    const { user } = useAuth();
    const [psychologists, setPsychologists] = useState([]);
    const [occupiedSlots, setOccupiedSlots] = useState([]);

    // Historial
    const [history, setHistory] = useState([]);

    // Estado del Panel Derecho (Búsqueda)
    const [searchPsychologist, setSearchPsychologist] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [availableHours, setAvailableHours] = useState([]);

    // Estado del Panel Izquierdo (Formulario de Agendamiento)
    const [formData, setFormData] = useState({
        dia: '',
        hora: '',
        descripcion: ''
    });

    // Cargar psicólogos y historial al iniciar
    useEffect(() => {
        fetchPsychologists();
        if (user && (user.id || user.id_user)) {
            fetchHistory();
        }
    }, [user]);

    // Cargar espacios ocupados cuando se selecciona psicólogo en el panel derecho
    useEffect(() => {
        if (searchPsychologist) {
            fetchOccupiedSlots(searchPsychologist);
        } else {
            setOccupiedSlots([]);
            setAvailableHours([]);
        }
    }, [searchPsychologist]);

    // Calcular disponibles cuando cambia la fecha o se cargan nuevos ocupados
    useEffect(() => {
        if (searchDate && searchPsychologist) {
            calculateAvailableHours();
        } else {
            setAvailableHours([]);
        }
    }, [searchDate, occupiedSlots]);

    const fetchPsychologists = async () => {
        try {
            const response = await fetch('http://localhost:5000/api/psychologists');
            const data = await response.json();
            setPsychologists(data);
        } catch (error) {
            console.error("Error cargando psicólogos:", error);
        }
    };

    const fetchHistory = async () => {
        const userId = user.id || user.id_user;
        try {
            const response = await fetch(`http://localhost:5000/api/meetings/user/${userId}`);
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    const fetchOccupiedSlots = async (psychologistId) => {
        try {
            const response = await fetch(`http://localhost:5000/api/meetings/psychologist/${psychologistId}`);
            const data = await response.json();
            setOccupiedSlots(data);
        } catch (error) {
            console.error("Error cargando agenda:", error);
        }
    };

    const calculateAvailableHours = () => {
        // Filtrar slots ocupados para el día seleccionado en el panel derecho
        const busyHoursForDay = occupiedSlots
            .filter(slot => slot.day === searchDate)
            .map(slot => slot.hour.substring(0, 5)); // HH:MM

        // Calcular disponibles
        const available = WORKING_HOURS.filter(hour => !busyHoursForDay.includes(hour));
        setAvailableHours(available);
    };

    const handleAssign = (hour) => {
        // Asignar al formulario de la izquierda
        setFormData({
            ...formData,
            dia: searchDate,
            hora: hour
        });
        // Opcional: Feedback visual o scroll
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!searchPsychologist) {
            alert("Error: No se ha seleccionado psicólogo.");
            return;
        }

        if (!formData.dia || !formData.hora) {
            alert("Por favor asigna un horario disponible desde el panel derecho.");
            return;
        }

        const userId = user.id || user.id_user;
        const payload = {
            userId: userId,
            professionalId: searchPsychologist,
            day: formData.dia, // Usar los datos asignados al form
            hour: formData.hora,
            description: formData.descripcion
        };

        try {
            const response = await fetch('http://localhost:5000/api/meetings', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            const data = await response.json();

            if (response.ok) {
                alert("¡Cita agendada con éxito!");
                fetchHistory(); // Actualizar historial
                fetchOccupiedSlots(searchPsychologist); // Recargar ocupados (actualizará tabla disponibles)

                // Limpiar form
                setFormData({ dia: '', hora: '', descripcion: '' });
                // Limpiar search para obligar nueva selección? No necesariamente, mejor dejarlo.
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error agendando cita:", error);
            alert("Error al conectar con el servidor.");
        }
    };

    // Obtener nombre del psicólogo seleccionado para mostrar en el panel izquierdo
    const selectedPsychObject = psychologists.find(p => p.id_user == searchPsychologist);

    return (
        <MainLayout
            pageTitle="Agenda"
            pageSubtitle="Organiza tus citas y actividades"
            currentPage="agenda"
        >
            <div className="container-fluid px-4 py-4">
                <div className="row g-4">

                    {/* Panel Izquierdo: Formulario de Confirmación */}
                    <div className="col-md-7">
                        <div className="bg-white p-4 rounded shadow-sm h-100">
                            <h5 className="mb-4 text-success border-bottom pb-2"> Confirmar Agendamiento</h5>
                            <p className="text-muted small">
                                Los datos aquí se llenarán automáticamente al seleccionar un horario disponible en el panel derecho.
                            </p>

                            <form onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label fw-bold small text-muted">Psicólogo Seleccionado</label>
                                    <input
                                        type="text"
                                        className="form-control bg-light"
                                        value={selectedPsychObject ? `${selectedPsychObject.names} ${selectedPsychObject.last_names}` : 'Sin seleccionar'}
                                        readOnly
                                        disabled
                                    />
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Día de la Cita</label>
                                        <input
                                            type="date"
                                            className="form-control bg-light"
                                            value={formData.dia}
                                            readOnly
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label fw-bold small text-muted">Hora Asignada</label>
                                        <input
                                            type="text"
                                            className="form-control bg-light fw-bold text-success"
                                            value={formData.hora}
                                            readOnly
                                            placeholder="--:--"
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="descripcion" className="form-label fw-bold">Descripción / Motivo</label>
                                    <textarea
                                        id="descripcion"
                                        className="form-control"
                                        rows="3"
                                        placeholder="Escribe aquí el motivo de tu consulta..."
                                        value={formData.descripcion}
                                        onChange={(e) => setFormData({ ...formData, descripcion: e.target.value })}
                                    ></textarea>
                                </div>

                                <button
                                    type="submit"
                                    className="btn btn-outline-success"
                                    disabled={!formData.dia || !formData.hora}
                                >
                                    <i className=""></i>Agendar
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Panel Derecho: Selección y Disponibilidad */}
                    <div className="col-md-5">
                        <div className="bg-white p-4 rounded shadow-sm h-100">
                            <h5 className="mb-4 text-success border-bottom pb-2">Horarios Disponibles</h5>
                            <p className="text-muted small">
                                Busca y selecciona un horario aquí para asignar tu cita.
                            </p>

                            <div className="mb-3">
                                <label htmlFor="searchPsychologist" className="form-label fw-bold">Psicólogo</label>
                                <select
                                    className="form-select"
                                    id="searchPsychologist"
                                    value={searchPsychologist}
                                    onChange={(e) => setSearchPsychologist(e.target.value)}
                                >
                                    <option value="">-- Seleccionar --</option>
                                    {psychologists.map(psych => (
                                        <option key={psych.id_user} value={psych.id_user}>
                                            {psych.names} {psych.last_names}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="mb-4">
                                <label htmlFor="searchDate" className="form-label fw-bold">Fecha</label>
                                <input
                                    type="date"
                                    id="searchDate"
                                    className="form-control"
                                    value={searchDate}
                                    onChange={(e) => setSearchDate(e.target.value)}
                                />
                            </div>

                            <div className="border rounded p-2" style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                <table className="table table-hover mb-0 align-middle">
                                    <thead className="table-light sticky-top">
                                        <tr>
                                            <th>Hora Disponible</th>
                                            <th className="text-end">Acción</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {!searchPsychologist || !searchDate ? (
                                            <tr>
                                                <td colSpan="2" className="text-center text-muted py-3">
                                                    Selecciona psicólogo y fecha.
                                                </td>
                                            </tr>
                                        ) : availableHours.length > 0 ? (
                                            availableHours.map((hour) => (
                                                <tr key={hour}>
                                                    <td className="fw-bold text-dark">{hour}</td>
                                                    <td className="text-end">
                                                        <button
                                                            className="btn btn-outline-success btn-sm rounded-pill"
                                                            onClick={() => handleAssign(hour)}
                                                        >
                                                            Asignar <i className="fas fa-arrow-left ms-1"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="text-center text-danger py-3">
                                                    No hay horarios disponibles.
                                                </td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    </div>

                </div>

                {/* Historial */}
                <div className="bg-white p-4 rounded shadow-sm mt-4">
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">Historial de Encuentros</h5>
                        <button
                            className="btn btn-light border rounded-pill px-3 py-1"
                            onClick={fetchHistory}
                        >
                            <i className="fas fa-sync-alt me-1"></i> Actualizar
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Descripción</th>
                                    <th>Psicólogo/a</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id_meetings_agenda}>
                                            <td>{item.day}</td>
                                            <td>{item.hour}</td>
                                            <td>{item.descripcion || "Sin descripción"}</td>
                                            <td>{item.prof_names} {item.prof_last_names}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="text-center py-4">No tienes citas agendadas aun.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Botón con imagen */}
                <div className="text-center mt-3 mb-4">
                    <a
                        target="_blank"
                        rel="noopener noreferrer"
                        href="https://meet.google.com/ayg-yvgp-ymj"
                        className="btn btn-light text-decoration-none d-inline-block p-3"
                    >
                        <img src={meetImg} alt="Google Meet" style={{ height: '70px' }} />
                        <h3 className="mt-2 mb-0">Unirse a la llamada</h3>
                    </a>
                </div>
            </div>
        </MainLayout>
    );
}

export default AgendaPage;