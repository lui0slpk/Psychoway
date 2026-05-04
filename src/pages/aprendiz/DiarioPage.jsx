import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";
import { motion } from "framer-motion";
import {
  Heart,
  BookOpen,
  Target,
  PlusCircle,
  RefreshCw,
  Trash2,
  Edit3,
  X,
  CheckCircle,
  AlertCircle,
} from "lucide-react";

function DiarioPage() {
  const { user } = useAuth();
  const [selectedEmotion, setSelectedEmotion] = useState(null);
  const [diarioTexto, setDiarioTexto] = useState("");
  const [showUpdateForm, setShowUpdateForm] = useState(false);
  const [objetivos, setObjetivos] = useState([]);

  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });

  const [objetivo, setObjetivo] = useState({
    nombre: "",
    descripcion: "",
    estado: "No Cumplido",
  });

  const [objetivoActualizar, setObjetivoActualizar] = useState({
    seleccionado: "",
    nombre: "",
    descripcion: "",
    estado: "No Cumplido",
  });

  const emociones = ["😄", "🙂", "😐", "☹️", "😞"];

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

  const gs = {
    background: "linear-gradient(135deg, #005222 0%, #001A0B 100%)",
    border: "none",
  };

  const fetchObjetivos = React.useCallback(async () => {
    const userId = user?.id || user?.id_user;
    if (!userId) return;
    try {
      const response = await fetch(
        `http://localhost:5000/api/objectives/${userId}`,
      );
      if (response.ok) {
        const data = await response.json();
        setObjetivos(data);
      }
    } catch (error) {
      console.error("Error cargando objetivos:", error);
    }
  }, [user]);

  // Cargar objetivos al montar el componente
  useEffect(() => {
    const userId = user?.id || user?.id_user;
    if (userId) {
      fetchObjetivos();
    }
  }, [user, fetchObjetivos]);

  const showMessage = (text, type = "success") => {
    setMessage({ text, type });
    setTimeout(() => setMessage({ text: "", type: "" }), 5000);
  };

  const handleEmotionClick = (index) => {
    setSelectedEmotion(index);
  };

  const handleRegistrar = async () => {
    console.log("🔍 Debug - Usuario completo:", user);
    console.log("🔍 Debug - user.id:", user?.id);
    console.log("🔍 Debug - user.id_user:", user?.id_user);

    if (selectedEmotion === null) {
      showMessage("Por favor selecciona una emoción", "error");
      return;
    }

    // Verificar si el usuario existe y tiene ID
    let userId = user?.id || user?.id_user;

    // Intento desesperado de encontrar ID
    if (!userId && user) {
      console.warn(
        "⚠️ ID no encontrado en campos estándar. Buscando en claves...",
      );
      const possibleKeys = Object.keys(user).filter((k) =>
        k.toLowerCase().includes("id"),
      );
      console.log("Claves candidatas:", possibleKeys);
      if (possibleKeys.length > 0) {
        userId = user[possibleKeys[0]];
        console.log(`✅ ID encontrado en '${possibleKeys[0]}':`, userId);
      }
    }

    if (!userId) {
      console.error(
        "❌ Usuario no tiene ID. Objeto completo:",
        JSON.stringify(user, null, 2),
      );
      alert(
        "Error de autenticación: No se pudo encontrar tu ID de usuario. Revisa la consola (F12) para ver el objeto completo.",
      );
      return;
    }

    console.log("✅ UserId encontrado:", userId);

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/diary/entry", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          emotionIndex: selectedEmotion,
          description: diarioTexto.trim(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("¡Entrada de diario registrada correctamente!", "success");
        setSelectedEmotion(null);
        setDiarioTexto("");
      } else {
        showMessage(
          data.error || data.message || "Error al registrar entrada",
          "error",
        );
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleCrearObjetivo = async () => {
    if (!objetivo.nombre.trim()) {
      showMessage("Por favor ingresa un nombre para el objetivo", "error");
      return;
    }

    const userId = user?.id || user?.id_user;
    if (!userId) {
      showMessage(
        "Error: Usuario no autenticado. Por favor cierra sesión y vuelve a iniciar sesión.",
        "error",
      );
      return;
    }

    setLoading(true);
    try {
      const response = await fetch("http://localhost:5000/api/objectives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: userId,
          nombre: objetivo.nombre,
          descripcion: objetivo.descripcion,
          estado: objetivo.estado,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        showMessage("¡Objetivo creado correctamente!", "success");
        setObjetivo({
          nombre: "",
          descripcion: "",
          estado: "Pendiente",
        });
        fetchObjetivos();
      } else {
        showMessage(data.message || "Error al crear objetivo", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleActualizarObjetivo = async () => {
    if (!objetivoActualizar.seleccionado) {
      showMessage("Por favor selecciona un objetivo", "error");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/objectives/${objetivoActualizar.seleccionado}`,
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            nombre: objetivoActualizar.nombre,
            descripcion: objetivoActualizar.descripcion,
            estado: objetivoActualizar.estado,
          }),
        },
      );

      const data = await response.json();

      if (response.ok) {
        showMessage("¡Objetivo actualizado correctamente!", "success");
        setShowUpdateForm(false);
        setObjetivoActualizar({
          seleccionado: "",
          nombre: "",
          descripcion: "",
          estado: "Pendiente",
        });
        fetchObjetivos();
      } else {
        showMessage(data.message || "Error al actualizar objetivo", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleEliminarObjetivo = async () => {
    if (!objetivoActualizar.seleccionado) {
      showMessage("Por favor selecciona un objetivo", "error");
      return;
    }

    if (
      !window.confirm("¿Estás seguro de que deseas eliminar este objetivo?")
    ) {
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/objectives/${objetivoActualizar.seleccionado}`,
        {
          method: "DELETE",
        },
      );

      const data = await response.json();

      if (response.ok) {
        showMessage("¡Objetivo eliminado correctamente!", "success");
        setShowUpdateForm(false);
        setObjetivoActualizar({
          seleccionado: "",
          nombre: "",
          descripcion: "",
          estado: "Pendiente",
        });
        fetchObjetivos();
      } else {
        showMessage(data.message || "Error al eliminar objetivo", "error");
      }
    } catch (error) {
      console.error("Error:", error);
      showMessage("No se pudo conectar con el servidor", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleObjetivoSeleccionado = (e) => {
    const id = e.target.value;
    setObjetivoActualizar({ ...objetivoActualizar, seleccionado: id });

    // Cargar datos del objetivo seleccionado
    const obj = objetivos.find((o) => String(o.id_objetives) === String(id));
    if (obj) {
      setObjetivoActualizar({
        seleccionado: id,
        nombre: obj.nombre_objetivo,
        descripcion: obj.descripcion || "",
        estado: obj.estado || "Pendiente",
      });
    }
  };

  const mostrarFormulario = () => {
    setShowUpdateForm(true);
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: "smooth",
      });
    }, 100);
  };

  const ocultarFormulario = () => {
    setShowUpdateForm(false);
    setObjetivoActualizar({
      seleccionado: "",
      nombre: "",
      descripcion: "",
      estado: "Pendiente",
    });
  };

  return (
    <MainLayout
      pageTitle="Diario de Emociones"
      pageSubtitle="Registra cómo te sientes"
      currentPage="diario"
    >
      <motion.div
        className="container-fluid px-4 py-4"
        initial="hidden"
        animate="visible"
        variants={containerVariants}
      >
        {/* Mensaje de éxito/error */}
        {message.text && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`alert d-flex align-items-center gap-2 rounded-4 border-0 shadow-sm ${message.type === "success" ? "alert-success" : "alert-danger"}`}
            role="alert"
          >
            {message.type === "success" ? (
              <CheckCircle size={18} />
            ) : (
              <AlertCircle size={18} />
            )}
            {message.text}
            <button
              type="button"
              className="btn-close ms-auto"
              onClick={() => setMessage({ text: "", type: "" })}
            ></button>
          </motion.div>
        )}

        {/* Sección de emociones */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fs-5 d-flex align-items-center gap-2 mb-2">
              <Heart size={20} className="text-success" /> ¿Cómo te sientes ahora mismo?
            </h5>
            <p className="text-muted small">
              Elige las emociones con las que te identificas en estos momentos.
            </p>
            <div className="emociones d-flex gap-3 justify-content-center my-4">
              {emociones.map((emoji, index) => (
                <motion.div
                  key={index}
                  whileHover={{ scale: 1.15, y: -5 }}
                  whileTap={{ scale: 0.9 }}
                  className={`fs-1 p-3 rounded-4 ${
                    selectedEmotion === index ? "shadow" : ""
                  }`}
                  style={{
                    cursor: "pointer",
                    transition: "all 0.2s",
                    background:
                      selectedEmotion === index
                        ? "linear-gradient(135deg, #005222 0%, #4a7c59 100%)"
                        : "#f8f9fa",
                  }}
                  onClick={() => handleEmotionClick(index)}
                >
                  {emoji}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.div>

        {/* Sección de diario */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fs-5 d-flex align-items-center gap-2 mb-2">
              <BookOpen size={20} className="text-success" /> ¿Qué está pasando ahora mismo?
            </h5>
            <textarea
              className="form-control rounded-3 border-2 mb-2"
              placeholder="Describe lo que está ocurriendo..."
              rows="4"
              value={diarioTexto}
              onChange={(e) => setDiarioTexto(e.target.value)}
              style={{ resize: "none" }}
            ></textarea>
            <p className="text-muted small">Esto es opcional</p>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="btn btn-success rounded-pill px-4"
              onClick={handleRegistrar}
              disabled={loading}
              style={gs}
            >
              {loading ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Registrando...
                </>
              ) : (
                "Registrar"
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Sección agregar objetivo */}
        <motion.div variants={itemVariants} className="mb-4">
          <div className="card border-0 shadow-sm rounded-4 p-4">
            <h5 className="fs-5 d-flex align-items-center gap-2 mb-2">
              <Target size={20} className="text-success" /> Agregar Objetivo
            </h5>
            <p className="text-muted small">
              Escribe un objetivo y proponte una meta.{" "}
              <span className="text-muted">Esto es opcional</span>
            </p>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Nombre del objetivo</label>
              <input
                type="text"
                className="form-control rounded-3 border-2"
                placeholder="Nombre del objetivo"
                value={objetivo.nombre}
                onChange={(e) =>
                  setObjetivo({ ...objetivo, nombre: e.target.value })
                }
              />
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Descripción</label>
              <textarea
                className="form-control rounded-3 border-2"
                placeholder="Describe tu objetivo..."
                value={objetivo.descripcion}
                onChange={(e) =>
                  setObjetivo({
                    ...objetivo,
                    descripcion: e.target.value,
                  })
                }
                style={{ resize: "none" }}
              ></textarea>
            </div>
            <div className="mb-3">
              <label className="form-label small fw-semibold">Estado</label>
              <select
                className="form-select rounded-3 border-2"
                value={objetivo.estado}
                onChange={(e) =>
                  setObjetivo({ ...objetivo, estado: e.target.value })
                }
              >
                <option>No Cumplido</option>
                <option>Cumplido</option>
              </select>
            </div>
            <div className="d-flex gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={handleCrearObjetivo}
                disabled={loading}
                style={gs}
              >
                <PlusCircle size={16} />
                {loading ? "Creando..." : "Crear Objetivo"}
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="btn btn-outline-secondary rounded-pill px-4 d-flex align-items-center gap-2"
                onClick={mostrarFormulario}
              >
                <Edit3 size={16} /> Actualizar un Objetivo
              </motion.button>
            </div>
          </div>
        </motion.div>

        {/* Formulario de actualización */}
        {showUpdateForm && (
          <motion.div
            className="mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card border-0 shadow-sm rounded-4 p-4" id="formActualizar">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="mb-0 fs-5 d-flex align-items-center gap-2">
                  <RefreshCw size={20} className="text-success" /> Actualiza un Objetivo
                </h5>
                <motion.button
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                  className="btn btn-light rounded-circle p-2"
                  onClick={ocultarFormulario}
                >
                  <X size={18} />
                </motion.button>
              </div>
              <p className="text-muted small">
                Actualiza el estado de un objetivo.{" "}
                <span className="text-muted">Esto es opcional</span>
              </p>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Selecciona un objetivo</label>
                <select
                  className="form-select rounded-3 border-2"
                  value={objetivoActualizar.seleccionado}
                  onChange={handleObjetivoSeleccionado}
                >
                  <option value="">Selecciona un objetivo...</option>
                  {objetivos.map((obj) => (
                    <option key={obj.id_objetives} value={obj.id_objetives}>
                      {obj.nombre_objetivo}
                    </option>
                  ))}
                </select>
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Nombre</label>
                <input
                  type="text"
                  className="form-control rounded-3 border-2"
                  placeholder="Nombre del objetivo"
                  value={objetivoActualizar.nombre}
                  onChange={(e) =>
                    setObjetivoActualizar({
                      ...objetivoActualizar,
                      nombre: e.target.value,
                    })
                  }
                />
              </div>
              <div className="mb-3">
                <label className="form-label small fw-semibold">Descripción</label>
                <textarea
                  className="form-control rounded-3 border-2"
                  placeholder="Describe tu objetivo..."
                  value={objetivoActualizar.descripcion}
                  onChange={(e) =>
                    setObjetivoActualizar({
                      ...objetivoActualizar,
                      descripcion: e.target.value,
                    })
                  }
                  style={{ resize: "none" }}
                ></textarea>
              </div>
              <div className="mb-4">
                <label className="form-label small fw-semibold">Estado</label>
                <select
                  className="form-select rounded-3 border-2"
                  value={objetivoActualizar.estado}
                  onChange={(e) =>
                    setObjetivoActualizar({
                      ...objetivoActualizar,
                      estado: e.target.value,
                    })
                  }
                >
                  <option>No Cumplido</option>
                  <option>Cumplido</option>
                </select>
              </div>
              <div className="d-flex gap-2">
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-outline-secondary rounded-pill px-4"
                  onClick={ocultarFormulario}
                >
                  Cancelar
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-outline-danger rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={handleEliminarObjetivo}
                  disabled={loading}
                >
                  <Trash2 size={16} />
                  {loading ? "Eliminando..." : "Eliminar objetivo"}
                </motion.button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  className="btn btn-success rounded-pill px-4 d-flex align-items-center gap-2"
                  onClick={handleActualizarObjetivo}
                  disabled={loading}
                  style={gs}
                >
                  <CheckCircle size={16} />
                  {loading ? "Actualizando..." : "Actualizar"}
                </motion.button>
              </div>
            </div>
          </motion.div>
        )}
      </motion.div>

      <style>{`
        .card { transition: transform 0.2s ease; }
        .card:hover { transform: translateY(-3px); }
      `}</style>
    </MainLayout>
  );
}

export default DiarioPage;
