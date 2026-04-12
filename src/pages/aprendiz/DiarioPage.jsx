import React, { useState, useEffect } from "react";
import MainLayout from "../../layouts/MainLayout";
import { useAuth } from "../../context/AuthContext";

function DiarioPage() {
	const { user } = useAuth();
	const [selectedEmotion, setSelectedEmotion] = useState(null);
	const [diarioTexto, setDiarioTexto] = useState("");
	const [showUpdateForm, setShowUpdateForm] = useState(false);
	const [objetivos, setObjetivos] = useState([]);
	const [selectedObjective, setSelectedObjective] = useState(""); // Nuevo estado para objetivo seleccionado
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

	// Cargar objetivos al montar el componente
	useEffect(() => {
		const userId = user?.id || user?.id_user;
		if (userId) {
			fetchObjetivos();
		}
	}, [user]);

	const fetchObjetivos = async () => {
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
	};

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
				console.log(
					`✅ ID encontrado en '${possibleKeys[0]}':`,
					userId,
				);
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

			// COMENTADO TEMPORALMENTE PARA DEPURAR
			// localStorage.removeItem('psychoway_user');
			// window.location.href = '/';
			return;
		}

		console.log("✅ UserId encontrado:", userId);

		setLoading(true);
		try {
			const response = await fetch(
				"http://localhost:5000/api/diary/entry",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId: userId,
						emotionIndex: selectedEmotion,
						description: diarioTexto.trim(),
						objectiveId: selectedObjective || null, // Enviar objetivo seleccionado
					}),
				},
			);

			const data = await response.json();

			if (response.ok) {
				showMessage(
					"¡Entrada de diario registrada correctamente!",
					"success",
				);
				setSelectedEmotion(null);
				setDiarioTexto("");
				setSelectedObjective(""); // Resetear objetivo seleccionado
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
			showMessage(
				"Por favor ingresa un nombre para el objetivo",
				"error",
			);
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
			const response = await fetch(
				"http://localhost:5000/api/objectives",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						userId: userId,
						nombre: objetivo.nombre,
						descripcion: objetivo.descripcion,
						estado: objetivo.estado,
					}),
				},
			);

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
				showMessage(
					data.message || "Error al actualizar objetivo",
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

	const handleEliminarObjetivo = async () => {
		if (!objetivoActualizar.seleccionado) {
			showMessage("Por favor selecciona un objetivo", "error");
			return;
		}

		if (
			!window.confirm(
				"¿Estás seguro de que deseas eliminar este objetivo?",
			)
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
				showMessage(
					data.message || "Error al eliminar objetivo",
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

	const handleObjetivoSeleccionado = (e) => {
		const id = e.target.value;
		setObjetivoActualizar({ ...objetivoActualizar, seleccionado: id });

		// Cargar datos del objetivo seleccionado
		const obj = objetivos.find((o) => o.id_objetives == id);
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
			<div className="container bg-light py-4">
				{/* Mensaje de éxito/error */}
				{message.text && (
					<div
						className={`alert alert-${message.type === "success" ? "success" : "danger"} alert-dismissible fade show`}
						role="alert"
					>
						{message.text}
						<button
							type="button"
							className="btn-close"
							onClick={() => setMessage({ text: "", type: "" })}
						></button>
					</div>
				)}

				{/* Sección de emociones */}
				<div className="contenedor bg-white p-4 rounded shadow-sm mb-4">
					<h2>¿Cómo te sientes ahora mismo?</h2>
					<p>
						Elige las emociones con las que te identificas en estos
						momentos.
					</p>
					<div className="emociones d-flex gap-3 justify-content-center my-4">
						{emociones.map((emoji, index) => (
							<div
								key={index}
								className={`emocion fs-1 p-3 rounded cursor-pointer ${
									selectedEmotion === index
										? "bg-warning"
										: "bg-light"
								}`}
								style={{
									cursor: "pointer",
									transition: "all 0.2s",
								}}
								onClick={() => handleEmotionClick(index)}
							>
								{emoji}
							</div>
						))}
					</div>
				</div>

				{/* Sección de diario */}
				<div className="contenedor bg-white p-4 rounded shadow-sm mb-4">
					<h2>¿Qué está pasando ahora mismo?</h2>
					<textarea
						className="form-control diario-texto mb-2"
						placeholder="Describe lo que está ocurriendo..."
						rows="4"
						value={diarioTexto}
						onChange={(e) => setDiarioTexto(e.target.value)}
					></textarea>
					<p className="text-secondary">Esto es opcional</p>
					<button
						className="btn btn-outline-success"
						onClick={handleRegistrar}
						disabled={loading}
					>
						{loading ? "Registrando..." : "Registrar"}
					</button>
				</div>

				{/* Sección agregar objetivo */}
				<div className="contenedor bg-white p-4 rounded shadow-sm mb-4">
					<h2>Agregar Objetivo</h2>
					<p className="subtexto">
						Escribe un objetivo y proponte una meta.{" "}
						<span className="text-muted">Esto es opcional</span>
					</p>
					<input
						type="text"
						className="form-control mb-3"
						placeholder="Nombre del objetivo"
						value={objetivo.nombre}
						onChange={(e) =>
							setObjetivo({ ...objetivo, nombre: e.target.value })
						}
					/>
					<label className="form-label">Descripción</label>
					<textarea
						className="form-control mb-3"
						placeholder="Describe tu objetivo..."
						value={objetivo.descripcion}
						onChange={(e) =>
							setObjetivo({
								...objetivo,
								descripcion: e.target.value,
							})
						}
					></textarea>
					<label className="form-label">Estado</label>
					<select
						className="form-select mb-3"
						value={objetivo.estado}
						onChange={(e) =>
							setObjetivo({ ...objetivo, estado: e.target.value })
						}
					>
						<option>No Cumplido</option>
						<option>Cumplido</option>
					</select>
					<div className="d-flex gap-2">
						<button
							className="btn btn-outline-success"
							onClick={handleCrearObjetivo}
							disabled={loading}
						>
							{loading ? "Creando..." : "Crear Objetivo"}
						</button>
						<button
							className="btn btn-outline-secondary"
							onClick={mostrarFormulario}
						>
							Actualizar un Objetivo
						</button>
					</div>
				</div>

				{/* Formulario de actualización */}
				{showUpdateForm && (
					<div
						className="contenedor bg-white p-4 rounded shadow-sm mb-4"
						id="formActualizar"
					>
						<h2>Actualiza un Objetivo</h2>
						<p className="subtexto">
							Actualiza el estado de un objetivo.{" "}
							<span className="text-muted">Esto es opcional</span>
						</p>
						<select
							className="form-select mb-3"
							value={objetivoActualizar.seleccionado}
							onChange={handleObjetivoSeleccionado}
						>
							<option value="">Selecciona un objetivo...</option>
							{objetivos.map((obj) => (
								<option
									key={obj.id_objetives}
									value={obj.id_objetives}
								>
									{obj.nombre_objetivo}
								</option>
							))}
						</select>
						<label className="form-label">Nombre</label>
						<input
							type="text"
							className="form-control mb-3"
							placeholder="Nombre del objetivo"
							value={objetivoActualizar.nombre}
							onChange={(e) =>
								setObjetivoActualizar({
									...objetivoActualizar,
									nombre: e.target.value,
								})
							}
						/>
						<label className="form-label">Descripción</label>
						<textarea
							className="form-control mb-3"
							placeholder="Describe tu objetivo..."
							value={objetivoActualizar.descripcion}
							onChange={(e) =>
								setObjetivoActualizar({
									...objetivoActualizar,
									descripcion: e.target.value,
								})
							}
						></textarea>
						<label className="form-label">Estado</label>
						<select
							className="form-select mb-3"
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
						<div className="row gap-2">
							<button
								className="btn btn-outline-secondary col"
								onClick={ocultarFormulario}
							>
								Cancelar
							</button>
							<button
								className="btn btn-outline-danger col"
								onClick={handleEliminarObjetivo}
								disabled={loading}
							>
								{loading
									? "Eliminando..."
									: "Eliminar objetivo"}
							</button>
							<button
								className="btn btn-outline-success col"
								onClick={handleActualizarObjetivo}
								disabled={loading}
							>
								{loading ? "Actualizando..." : "Actualizar"}
							</button>
						</div>
					</div>
				)}
			</div>
		</MainLayout>
	);
}

export default DiarioPage;
