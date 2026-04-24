import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';
import Swal from 'sweetalert2';

function PrivacidadPage() {
    const { user } = useAuth();
    const [visibilidad, setVisibilidad] = useState('yo-psicologo');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;
        
        const fetchPrivacy = async () => {
            try {
                const res = await fetch(`http://localhost:5000/api/users/privacy/${user.id}`);
                if (res.ok) {
                    const data = await res.json();
                    setVisibilidad(data.diary_visibility);
                }
            } catch (error) {
                console.error("Error al cargar privacidad:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPrivacy();
    }, [user]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const res = await fetch(`http://localhost:5000/api/users/privacy/${user.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ visibilidad })
            });

            if (res.ok) {
                Swal.fire({
                    title: '¡Guardado!',
                    text: 'Tu configuración de privacidad ha sido actualizada.',
                    icon: 'success',
                    showConfirmButton: false,
                    timer: 2000
                });
            } else {
                throw new Error('Error en la respuesta del servidor');
            }
        } catch (error) {
            console.error('Error al guardar privacidad:', error);
            Swal.fire({
                title: 'Error',
                text: 'No se pudo guardar la configuración. Intenta de nuevo.',
                icon: 'error',
                confirmButtonColor: '#d33'
            });
        }
    };

    return (
        <MainLayout 
            pageTitle="Privacidad" 
            pageSubtitle="Modifica tus datos de privacidad"
            currentPage="privacidad"
        >
            <div className="container-md my-5 bg-light">
                <div className="row justify-content-center">
                    {/* Formulario */}
                    <div className="col-md-7 shadow-sm p-5 mb-3 bg-white rounded-5">
                        <h2 className="fw-bold">Privacidad</h2>
                        <p className="text-muted">Modifica tus datos de privacidad</p>
                        
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-dark" role="status">
                                    <span className="visually-hidden">Cargando...</span>
                                </div>
                            </div>
                        ) : (
                            <form className="mt-3" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label h5">
                                    Visibilidad del diario <span className="text-danger">*</span>
                                </label>
                                <select 
                                    className="form-select" 
                                    required
                                    value={visibilidad}
                                    onChange={(e) => setVisibilidad(e.target.value)}
                                >
                                    <option value="yo-psicologo">Yo y psicólogo/a</option>
                                    <option value="solo-yo">Sólo yo</option>
                                </select>
                            </div>
                            <div className="d-flex gap-3 mt-5">
                                <button type="submit" className="btn btn-dark px-4 w-50">
                                    Guardar cambios
                                </button>
                            </div>
                        </form>
                        )}
                    </div>

                    {/* Panel lateral */}
                    <div className="col-md-3 ms-3 p-5 shadow-sm bg-white rounded-5" style={{ height: 'fit-content' }}>
                        <div className="list-group">
                            <Link 
                                to="/mi-cuenta" 
                                className="list-group-item list-group-item-action d-block mb-2 border-0 rounded-5 p-3 fw-semibold"
                            >
                                Mi cuenta
                            </Link>
                            <span className="list-group-item list-group-item-action active list-group-item-secondary border-0 rounded-5 p-3 fw-semibold">
                                Privacidad
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default PrivacidadPage;
