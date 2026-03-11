import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

function PrivacidadPage() {
    const [visibilidad, setVisibilidad] = useState('yo-psicologo');

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Guardar privacidad:', visibilidad);
        // Lógica para guardar configuración de privacidad
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
