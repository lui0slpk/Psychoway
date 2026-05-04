import React, { useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";

function MiCuentaPsiPage() {
  const { user } = useAuth();

  const [formData, setFormData] = useState({
    documento: user?.document || "",
    tipoDocumento: "",
    nombres: user?.names || "",
    apellidos: user?.last_names || "",
    fechaNacimiento: "",
    correo: "",
    password: "",
    confirmPassword: "",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.id]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Guardar cambios:", formData);
    // Lógica para actualizar cuenta
  };

  return (
    <MainLayout
      pageTitle="Mi Cuenta"
      pageSubtitle="Modifica tus datos de registro"
      currentPage="mi-cuenta-psi"
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
                <div className="input-group">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-end-0"
                    id="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                  />
                  <span
                    className="input-group-text bg-white border-start-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i
                      className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </span>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">
                  Confirmar contraseña <span className="text-danger">*</span>
                </label>
                <div className="input-group">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="form-control border-end-0"
                    id="confirmPassword"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                  />
                  <span
                    className="input-group-text bg-white border-start-0"
                    style={{ cursor: "pointer" }}
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  >
                    <i
                      className={`bi ${showConfirmPassword ? "bi-eye-slash" : "bi-eye"}`}
                    ></i>
                  </span>
                </div>
              </div>

              <div className="d-flex gap-3 justify-content-center">
                <button type="submit" className="btn btn-light-green px-4 w-50">
                  Guardar cambios
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </MainLayout>
  );
}

export default MiCuentaPsiPage;
