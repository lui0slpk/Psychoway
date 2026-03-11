import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

function GestionModPage() {
    const [buscarDocumento, setBuscarDocumento] = useState('');
    const [usuarioEncontrado, setUsuarioEncontrado] = useState(false);
    
    const [formData, setFormData] = useState({
        rol: '',
        documento: '',
        tipoDocumento: '',
        nombres: '',
        apellidos: '',
        fechaNacimiento: '',
        correo: '',
        password: '',
        confirmPassword: ''
    });

    const [userId, setUserId] = useState(null);

    const handleBuscar = async () => {
        if (!buscarDocumento) {
            alert("Por favor ingrese un número de documento");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/search/${buscarDocumento}`);
            
            // Verificar si la respuesta es exitosa antes de intentar parsear JSON
            if (!response.ok) {
                // Si es 404 probablemente el endpoint no existe (falta reiniciar server) o usuario no encontrado
                if (response.status === 404) {
                    const contentType = response.headers.get("content-type");
                    if (contentType && contentType.indexOf("application/json") !== -1) {
                        const errorData = await response.json();
                        alert(errorData.message || "Usuario no encontrado");
                    } else {
                        // Si devuelve HTML (Express default 404) es que el endpoint no existe
                        alert("Error 404: El servicio de búsqueda no responde. Asegúrate de haber REINICIADO el servidor backend (node server.js).");
                    }
                } else {
                    alert(`Error del servidor: ${response.status} ${response.statusText}`);
                }
                setUsuarioEncontrado(false);
                setUserId(null);
                return;
            }

            const data = await response.json();
            setUsuarioEncontrado(true);
            setUserId(data.id_user);
            
            // Mapear datos al formulario
            setFormData({
                rol: data.rol,
                documento: data.document,
                tipoDocumento: '', 
                nombres: data.nombres,
                apellidos: data.apellidos,
                fechaNacimiento: data.fechaNacimiento,
                correo: data.correo,
                password: '', 
                confirmPassword: ''
            });

        } catch (error) {
            console.error("Error buscando usuario:", error);
            alert("Error de conexión: No se pudo contactar con el backend (localhost:5000). Asegúrate de que node server.js esté corriendo.");
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.id]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (formData.password && formData.password !== formData.confirmPassword) {
            alert("Las contraseñas no coinciden");
            return;
        }

        try {
            const response = await fetch(`http://localhost:5000/api/users/update/${userId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                alert("Usuario actualizado correctamente");
                setUsuarioEncontrado(false); // Opcional: limpiar búsqueda
                setBuscarDocumento('');
            } else {
                alert(`Error al actualizar: ${data.message}`);
            }
        } catch (error) {
            console.error("Error actualizando usuario:", error);
            alert("Error al conectar con el servidor");
        }
    };

    const handleDelete = async () => {
        if (window.confirm('¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer.')) {
            try {
                const response = await fetch(`http://localhost:5000/api/users/delete/${userId}`, {
                    method: 'DELETE'
                });

                const data = await response.json();

                if (response.ok) {
                    alert("Usuario eliminado correctamente");
                    setUsuarioEncontrado(false);
                    setBuscarDocumento('');
                    setUserId(null);
                } else {
                    alert(`Error al eliminar: ${data.message}`);
                }
            } catch (error) {
                console.error("Error eliminando usuario:", error);
                alert("Error al conectar con el servidor");
            }
        }
    };

    return (
        <MainLayout 
            pageTitle="Gestión de Usuarios" 
            pageSubtitle="Crea, elimina y modifica datos de usuario"
            currentPage="gestion-mod"
        >
            <div className="container-md my-5">
                <div className="row justify-content-center">
                    {/* Buscador */}
                    <div className="bg-white col-md-7 rounded-5 p-5 mb-3 shadow-sm">
                        <h3 className="mb-2 fw-bold">Usuario a Modificar</h3>
                        <div>
                            <p className="mb-2">Documento del Usuario</p>
                            <div className="position-relative">
                                <input 
                                    type="text" 
                                    className="form-control" 
                                    placeholder="123456789"
                                    value={buscarDocumento}
                                    onChange={(e) => setBuscarDocumento(e.target.value)}
                                />
                                <button 
                                    className="btn position-absolute top-50 end-0 translate-middle-y me-2 p-0 border-0 bg-transparent text-muted" 
                                    type="button"
                                    onClick={handleBuscar}
                                >
                                    <i className="fas fa-search"></i>
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Panel lateral */}
                    <div className="col-md-3 ms-3 p-5 shadow-sm bg-white rounded-5 mb-3" style={{ height: 'fit-content' }}>
                        <div className="list-group">
                            <Link 
                                to="/gestion" 
                                className="list-group-item list-group-item-action d-block mb-2 border-0 rounded-5 p-3 fw-semibold"
                            >
                                Crear usuario
                            </Link>
                            <span className="list-group-item list-group-item-action active list-group-item-secondary border-0 rounded-5 p-3 fw-semibold">
                                Modificar usuario
                            </span>
                        </div>
                    </div>
                </div>

                {/* Formulario de modificación (solo visible cuando se encuentra usuario) */}
                {usuarioEncontrado && (
                    <div className="row justify-content-center">
                        <div className="col-md-7 shadow-sm p-5 bg-white rounded-5">
                            <h2 className="fw-bold">Modifica una Cuenta</h2>
                            <p className="text-muted">Modifica y elimina datos de registro</p>
                            <form className="mt-3" onSubmit={handleSubmit}>
                                <div className="mb-3">
                                    <label className="form-label">Rol del Usuario</label>
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
                                    <label className="form-label">Documento</label>
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
                                    <label className="form-label">Tipo de documento</label>
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
                                    <label className="form-label">Nombres</label>
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
                                    <label className="form-label">Apellidos</label>
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
                                    <label className="form-label">Fecha de nacimiento</label>
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
                                    <label className="form-label">Correo</label>
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
                                    <label className="form-label">Contraseña</label>
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
                                    <button type="submit" className="btn btn-outline-success px-4 w-50">
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
                        {/* Espacio para mantener alineación */}
                        <div className="col-md-3 ms-3"></div>
                    </div>
                )}
            </div>
        </MainLayout>
    );
}

export default GestionModPage;
