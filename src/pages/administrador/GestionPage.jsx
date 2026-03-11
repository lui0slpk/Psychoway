import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import MainLayout from '../../layouts/MainLayout';

function GestionPage() {
    const [showSuccess, setShowSuccess] = useState(false);
    const [showPassword, setShowPassword] = useState(false);
    const [touched, setTouched] = useState({});

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

    const validaciones = {
        documento: {
            longitud: formData.documento.length >= 8 && formData.documento.length <= 10,
        },
        password: {
            minCaracteres: formData.password.length >= 5,
            tieneMayuscula: /[A-Z]/.test(formData.password),
            tieneMinuscula: /[a-z]/.test(formData.password),
            tieneNumero: /[0-9]/.test(formData.password),
            tieneEspecial: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(
                formData.password,
            ),
        },
    };

    const documentoValido = Object.values(validaciones.documento).every(Boolean);
    const passwordValida = Object.values(validaciones.password).every(Boolean);

    const Regla = ({ ok, texto }) => (
        <span
            style={{
                display: "block",
                fontSize: "13px",
                color: ok ? "#198754" : "#dc3545",
            }}
        >
            {ok ? "✅" : "❌"} {texto}
        </span>
    );

    const handleChange = (e) => {
        let value = e.target.value;
        if (e.target.id === "documento") {
            value = value.replace(/\D/g, ""); // Solo permitir números
        }

        setFormData({
            ...formData,
            [e.target.id]: value
        });
        setTouched({ ...touched, [e.target.id]: true });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        setTouched({ password: true, documento: true });

        if (!passwordValida || !documentoValido) {
            alert("Por favor corrige los errores en el formulario antes de continuar.");
            return;
        }
        
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
                setShowSuccess(true);
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
                setTouched({});
                
                setTimeout(() => {
                    setShowSuccess(false);
                }, 2000);
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
            {/* Modal de éxito */}
            {showSuccess && (
                <div
                    className="position-fixed top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center"
                    style={{
                        backgroundColor: "rgba(51, 45, 45, 0.5)",
                        zIndex: 9999,
                    }}
                >
                    <div
                        className="bg-white rounded-4 p-5 text-center shadow-lg"
                        style={{ maxWidth: "400px" }}
                    >
                        <div className="mb-3">
                            <i
                                className="fas fa-check-circle text-success"
                                style={{ fontSize: "4rem" }}
                            ></i>
                        </div>
                        <h3 className="fw-bold text-success mb-2">
                            ¡Registro Exitoso!
                        </h3>
                        <p className="text-muted mb-0">
                            El usuario ha sido creado correctamente.
                        </p>
                    </div>
                </div>
            )}
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
                                    maxLength={10}
                                    pattern="\d+"
                                    title="Debe contener solo números"
                                    required
                                />
                                {touched.documento && (
                                    <div className="mt-1">
                                        <Regla
                                            ok={validaciones.documento.longitud}
                                            texto="Debe tener entre 8 y 10 números"
                                        />
                                    </div>
                                )}
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
                                <div className="input-group">
                                    <input 
                                        type={showPassword ? "text" : "password"} 
                                        className="form-control border-end-0"
                                        id="password"
                                        placeholder="********"
                                        value={formData.password}
                                        onChange={handleChange}
                                        required
                                    />
                                    <span
                                        className="input-group-text bg-transparent border-start-0"
                                        style={{ cursor: "pointer" }}
                                        onClick={() => setShowPassword(!showPassword)}
                                    >
                                        <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                                    </span>
                                </div>
                                <div className="mt-1">
                                    <p
                                        style={{
                                            fontSize: "13px",
                                            marginBottom: "2px",
                                            color: "#6c757d",
                                        }}
                                    >
                                        La contraseña debe contener:
                                    </p>
                                    <Regla
                                        ok={validaciones.password.minCaracteres}
                                        texto="Mínimo 5 caracteres"
                                    />
                                    <Regla
                                        ok={validaciones.password.tieneMayuscula}
                                        texto="Al menos 1 letra mayúscula"
                                    />
                                    <Regla
                                        ok={validaciones.password.tieneMinuscula}
                                        texto="Al menos 1 letra minúscula"
                                    />
                                    <Regla
                                        ok={validaciones.password.tieneNumero}
                                        texto="Al menos 1 número"
                                    />
                                    <Regla
                                        ok={validaciones.password.tieneEspecial}
                                        texto="Al menos 1 carácter especial (!@#$%...)"
                                    />
                                </div>
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
