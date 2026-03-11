import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';
import { useAuth } from '../../context/AuthContext';

function MiCuentaPage() {
    const { user } = useAuth();
    
    const [formData, setFormData] = useState({
        documento: user?.document || '',
        tipoDocumento: '',
        nombres: user?.names || '',
        apellidos: user?.last_names || '',
        fechaNacimiento: '',
        correo: '',
        password: '',
        confirmPassword: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log('Guardar cambios:', formData);
        // Lógica para actualizar cuenta
    };

    const handleDelete = () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar tu cuenta? Esta acción no se puede deshacer.')) {
            console.log('Eliminar cuenta');
            // Lógica para eliminar cuenta
        }
    };

    return (
        <MainLayout 
            pageTitle="Mi Cuenta" 
            pageSubtitle="Modifica tus datos de registro"
            currentPage="mi-cuenta"
        >
            <div className="container-md my-5">
                <div className="row justify-content-center">
                    {/* Formulario */}
                    <div className="col-md-7 shadow-sm p-5 mb-3 bg-white rounded-5">
                        <h2 className="fw-bold">Mi Cuenta</h2>
                        <p className="text-muted">Modifica tus datos de registro</p>
                        <form className="mt-3" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">Documento</label>
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    id="documento"
                                    placeholder="123456789"
                                    value={formData.documento}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Tipo de documento</label>
                                <select 
                                    className="form-select"
                                    id="tipoDocumento"
                                    value={formData.tipoDocumento}
                                    onChange={handleChange}
                                >
                                    <option value="">Seleccione</option>
                                    <option disabled>-------------</option>
                                    <option value="TI">Tarjeta de Identidad</option>
                                    <option value="CC">Cédula de Ciudadanía</option>
                                    <option value="CE">Cédula de Extranjería</option>
                                    <option value="PA">Pasaporte</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Nombres</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    id="nombres"
                                    placeholder="Kevin Andrés"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Apellidos</label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    id="apellidos"
                                    placeholder="Chaverra Quintero"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Fecha de nacimiento</label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    id="fechaNacimiento"
                                    value={formData.fechaNacimiento}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Correo</label>
                                <input 
                                    type="email" 
                                    className="form-control"
                                    id="correo"
                                    placeholder="psychoway66@gmail.com"
                                    value={formData.correo}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">Contraseña</label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    id="password"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={handleChange}
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Confirmar contraseña <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    id="confirmPassword"
                                    placeholder="********"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="d-flex gap-3 justify-content-center">
                                <button type="submit" className="btn btn-dark px-4 w-50">
                                    Guardar cambios
                                </button>
                                <button 
                                    type="button" 
                                    className="btn btn-outline-danger px-4 w-50"
                                    onClick={handleDelete}
                                >
                                    Eliminar cuenta
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Panel lateral */}
                    <div className="col-md-3 ms-3 p-5 shadow-sm bg-white rounded-5" style={{ height: 'fit-content' }}>
                        <div className="list-group">
                            <span className="list-group-item list-group-item-action active list-group-item-secondary border-0 rounded-5 p-3 fw-semibold mb-2">
                                Mi cuenta
                            </span>
                            <Link 
                                to="/privacidad" 
                                className="list-group-item list-group-item-action d-block mb-2 border-0 rounded-5 p-3 fw-semibold"
                            >
                                Privacidad
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default MiCuentaPage;
