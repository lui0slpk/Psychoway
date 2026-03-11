import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

function GestionPage() {
    const [formData, setFormData] = useState({
        rol: '',
        documento: '',
        tipoDocumento: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        correo: '',
        password: ''
    });

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await fetch('http://localhost:5000/api/users/create', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert('Usuario creado exitosamente');
                // Limpiar formulario
                setFormData({
                    rol: '',
                    documento: '',
                    tipoDocumento: '',
                    nombres: '',
                    apellidos: '',
                    fechaNacimiento: '',
                    correo: '',
                    password: ''
                });
            } else {
                alert(`Error: ${data.message || 'Error al crear usuario'}`);
            }
        } catch (error) {
            console.error('Error al conectar con el servidor:', error);
            alert('Error al conectar con el servidor. Asegúrate de que el backend esté corriendo.');
        }
    };

    return (
        <MainLayout 
            pageTitle="Gestión de Usuarios" 
            pageSubtitle="Crea, elimina y modifica datos de usuario"
            currentPage="gestion"
        >
            <div className="container-md my-5">
                <div className="row justify-content-center">
                    {/* Formulario */}
                    <div className="col-md-7 shadow-sm p-5 mb-3 bg-white rounded-5">
                        <h2 className="fw-bold">Crea una Cuenta</h2>
                        <p className="text-muted">Registra un nuevo usuario</p>
                        <form className="mt-3" onSubmit={handleSubmit}>
                            <div className="mb-3">
                                <label className="form-label">
                                    Rol del Usuario <span className="text-danger">*</span>
                                </label>
                                <select 
                                    className="form-select" 
                                    id="rol"
                                    value={formData.rol}
                                    onChange={handleChange}
                                    required
                                >
                                    <option value="">Seleccione</option>
                                    <option disabled>-------------</option>
                                    <option value="aprendiz">Aprendiz</option>
                                    <option value="psicologo">Psicólogo</option>
                                    <option value="administrador">Administrador</option>
                                </select>
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Documento <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    id="documento"
                                    placeholder="123456789"
                                    value={formData.documento}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Tipo de documento <span className="text-danger">*</span>
                                </label>
                                <select 
                                    className="form-select"
                                    id="tipoDocumento"
                                    value={formData.tipoDocumento}
                                    onChange={handleChange}
                                    required
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
                                <label className="form-label">
                                    Nombres <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    id="nombres"
                                    placeholder="Kevin Andrés"
                                    value={formData.nombres}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Apellidos <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="text" 
                                    className="form-control"
                                    id="apellidos"
                                    placeholder="Chaverra Quintero"
                                    value={formData.apellidos}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Fecha de nacimiento <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="date" 
                                    className="form-control"
                                    id="fechaNacimiento"
                                    value={formData.fechaNacimiento}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Correo <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="email" 
                                    className="form-control"
                                    id="correo"
                                    placeholder="psychoway66@gmail.com"
                                    value={formData.correo}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <div className="mb-3">
                                <label className="form-label">
                                    Contraseña <span className="text-danger">*</span>
                                </label>
                                <input 
                                    type="password" 
                                    className="form-control"
                                    id="password"
                                    placeholder="********"
                                    value={formData.password}
                                    onChange={handleChange}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn btn-outline-success w-100">
                                Crear Cuenta
                            </button>
                        </form>
                    </div>

                    {/* Panel lateral */}
                    <div className="col-md-3 ms-3 p-5 shadow-sm bg-white rounded-5" style={{ height: 'fit-content' }}>
                        <div className="list-group">
                            <span className="list-group-item list-group-item-action active list-group-item-secondary border-0 rounded-5 p-3 fw-semibold">
                                Crear usuario
                            </span>
                            <Link 
                                to="/gestion-mod" 
                                className="list-group-item list-group-item-action d-block mb-2 border-0 rounded-5 p-3 fw-semibold"
                            >
                                Modificar usuario
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </MainLayout>
    );
}

export default GestionPage;
