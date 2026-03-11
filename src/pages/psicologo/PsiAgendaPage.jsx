import React, { useState, useEffect } from 'react';
import MainLayout from '../../layouts/MainLayout';
import meetImg from '../../assets/img/meet.png';
import { useAuth } from '../../context/AuthContext';

function PsiAgendaPage() {
    const { user } = useAuth();
    const [formData, setFormData] = useState({
        documentoAprendiz: '',
        dia: '',
        hora: '08:00',
        descripcion: ''
    });

    // Estado para el aprendiz encontrado
    const [foundApprentice, setFoundApprentice] = useState(null);
    const [aprendizNombre, setAprendizNombre] = useState('No seleccionado');

    // Listas de datos
    const [occupiedSlots, setOccupiedSlots] = useState([]);
    const [history, setHistory] = useState([]);

    // Filtro
    const [buscarFecha, setBuscarFecha] = useState('');

    useEffect(() => {
        if (user && (user.id || user.id_user)) {
            fetchHistory();
            fetchOccupiedSlots();
        }
    }, [user]);

    const fetchHistory = async () => {
        const professionalId = user.id || user.id_user;
        try {
            const response = await fetch(`http://localhost:5000/api/meetings/professional-history/${professionalId}`);
            const data = await response.json();
            setHistory(data);
        } catch (error) {
            console.error("Error cargando historial:", error);
        }
    };

    const fetchOccupiedSlots = async () => {
        const professionalId = user.id || user.id_user;
        try {
            const response = await fetch(`http://localhost:5000/api/meetings/psychologist/${professionalId}`);
            const data = await response.json();
            setOccupiedSlots(data);
        } catch (error) {
            console.error("Error cargando agenda:", error);
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleBuscarAprendiz = async () => {
        if (!formData.documentoAprendiz) {
            alert("Ingresa un documento para buscar.");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/search/${formData.documentoAprendiz}`);
            const data = await response.json();

            if (response.ok) {
                setFoundApprentice(data);
                setAprendizNombre(`${data.nombres} ${data.apellidos}`);
                alert("Aprendiz encontrado: " + data.nombres + " " + data.apellidos);
            } else {
                setFoundApprentice(null);
                setAprendizNombre('No encontrado');
                alert(data.message || "Aprendiz no encontrado");
            }
        } catch (error) {
            console.error("Error buscando aprendiz:", error);
            alert("Error al buscar aprendiz");
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!foundApprentice) {
            alert("Primero debes buscar y encontrar un aprendiz válido (por documento) para agendar la cita.");
            return;
        }

        const professionalId = user.id || user.id_user;

        const payload = {
            userId: foundApprentice.id_user, // El ID del aprendiz encontrado
            professionalId: professionalId,  // Yo soy el profesional
            day: formData.dia,
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
                fetchHistory();
                fetchOccupiedSlots();
                setFormData({ ...formData, descripcion: '' });
            } else {
                alert("Error: " + data.message);
            }
        } catch (error) {
            console.error("Error agendando cita:", error);
            alert("Error al conectar con el servidor.");
        }
    };

    // Filtrar espacios ocupados
    const filteredSlots = occupiedSlots.filter(slot => {
        if (!buscarFecha) return true;
        return slot.day.startsWith(buscarFecha);
    });

    return (
        <MainLayout
            pageTitle="Agenda"
            pageSubtitle="Gestiona tus citas con aprendices"
            currentPage="psi-agenda"
        >
            <div className="container-fluid px-4 py-4 bg-light">
                <div className="row g-4">
                    {/* Agendar Encuentro */}
                    <div className="col-md-8">
                        <div className="bg-white p-4 rounded shadow-sm">
                            <h5 className="mb-4">Agendar Encuentro</h5>
                            <form onSubmit={handleSubmit}>
                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="documentoAprendiz" className="form-label fw-bold">
                                            Documento aprendiz
                                        </label>
                                        <div className="position-relative">
                                            <input
                                                type="text"
                                                className="form-control"
                                                id="documentoAprendiz"
                                                placeholder="123456789"
                                                value={formData.documentoAprendiz}
                                                onChange={handleChange}
                                            />
                                            <button
                                                className="btn position-absolute top-50 end-0 translate-middle-y"
                                                type="button"
                                                onClick={handleBuscarAprendiz}
                                                style={{ zIndex: 5 }}
                                            >
                                                <i className="fas fa-search"></i>
                                            </button>
                                        </div>
                                    </div>
                                    <div className="col-md-6">
                                        <label className="form-label">Aprendiz Seleccionado</label>
                                        <h6 className={foundApprentice ? "text-success" : "text-muted"}>
                                            {aprendizNombre}
                                        </h6>
                                    </div>
                                </div>

                                <div className="row mb-3">
                                    <div className="col-md-6">
                                        <label htmlFor="dia" className="form-label">Día</label>
                                        <input
                                            type="date"
                                            className="form-control"
                                            id="dia"
                                            value={formData.dia}
                                            onChange={handleChange}
                                            required
                                        />
                                    </div>
                                    <div className="col-md-6">
                                        <label htmlFor="hora" className="form-label">Hora</label>
                                        <select
                                            className="form-select"
                                            id="hora"
                                            value={formData.hora}
                                            onChange={handleChange}
                                            required
                                        >
                                            <option value="08:00">08:00 a.m.</option>
                                            <option value="09:00">09:00 a.m.</option>
                                            <option value="10:00">10:00 a.m.</option>
                                            <option value="11:00">11:00 a.m.</option>
                                            <option value="13:00">01:00 p.m.</option>
                                            <option value="14:00">02:00 p.m.</option>
                                            <option value="15:00">03:00 p.m.</option>
                                            <option value="16:00">04:00 p.m.</option>
                                            <option value="17:00">05:00 p.m.</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <label htmlFor="descripcion" className="form-label">Descripción</label>
                                    <textarea
                                        id="descripcion"
                                        className="form-control"
                                        rows="4"
                                        placeholder="Preferencias del encuentro... Esto es opcional"
                                        value={formData.descripcion}
                                        onChange={handleChange}
                                    ></textarea>
                                </div>
                                <button type="submit" className="btn btn-outline-success">Agendar</button>
                            </form>
                        </div>
                    </div>

                    {/* Espacios Ocupados */}
                    <div className="col-md-4">
                        <div className="bg-white p-4 rounded shadow-sm h-100">
                            <h5 className="mb-3">Tus Espacios Ocupados</h5>
                            <p className="text-muted small">Estas son tus citas ya programadas.</p>
                            <div className="mb-3">
                                <input
                                    type="date"
                                    className="form-control mb-2"
                                    value={buscarFecha}
                                    onChange={(e) => setBuscarFecha(e.target.value)}
                                />
                            </div>
                            <div style={{ maxHeight: '300px', overflowY: 'auto' }}>
                                <table className="table table-sm">
                                    <thead className="table-light">
                                        <tr>
                                            <th>Fecha</th>
                                            <th>Hora</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredSlots.length > 0 ? (
                                            filteredSlots.map((slot, index) => (
                                                <tr key={index}>
                                                    <td>{slot.day}</td>
                                                    <td>{slot.hour}</td>
                                                </tr>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="2" className="text-center text-muted">No tienes citas ocupadas en esta fecha.</td>
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
                        <button className="btn btn-light border rounded-pill px-3 py-1">
                            Ordenar: Recientes <i className="fas fa-chevron-down ms-1"></i>
                        </button>
                    </div>
                    <div className="table-responsive">
                        <table className="table align-middle">
                            <thead className="table-light">
                                <tr>
                                    <th>Fecha</th>
                                    <th>Hora</th>
                                    <th>Descripción</th>
                                    <th>Nombre Aprendiz</th>
                                    <th>Documento Aprendiz</th>
                                </tr>
                            </thead>
                            <tbody>
                                {history.length > 0 ? (
                                    history.map((item) => (
                                        <tr key={item.id_meetings_agenda}>
                                            <td>{item.day}</td>
                                            <td>{item.hour}</td>
                                            <td>{item.descripcion || "Sin descripción"}</td>
                                            <td>{item.apprentice_names} {item.apprentice_last_names}</td>
                                            <td>{item.apprentice_document}</td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="text-center py-4">No has agendado citas aun.</td>
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

export default PsiAgendaPage;
