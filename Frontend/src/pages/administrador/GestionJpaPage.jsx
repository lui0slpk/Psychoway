import React, { useCallback, useEffect, useRef, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { motion } from "framer-motion";
import { Activity, Users } from "lucide-react";
import {
  jpaHealth,
  listJpaRoles,
  listJpaUsers,
  updateJpaUser,
  deleteJpaUser,
  mapJpaError,
} from "../../api/jpaUsers.api";
import { showSuccess, showError, showConfirm } from "../../utils/alerts";
import JpaHealthSection from "../../components/admin/gestion-jpa/JpaHealthSection";
import JpaUserFilters from "../../components/admin/gestion-jpa/JpaUserFilters";
import JpaUsersTable from "../../components/admin/gestion-jpa/JpaUsersTable";
import JpaPagination from "../../components/admin/gestion-jpa/JpaPagination";
import JpaUserModal from "../../components/admin/gestion-jpa/JpaUserModal";

// Forma vacía de los filtros (document/email/names/lastNames exactos o
// parciales según el contrato; idRol numérico). Los valores vacíos los
// descarta jpaUsers.api.js antes de armar el query string.
const EMPTY_FILTERS = { document: "", email: "", names: "", lastNames: "", idRol: "" };

// Escapa entidades HTML para interpolaciones seguras en el cuerpo (html)
// del showConfirm — los datos del usuario nunca se inyectan crudos.
// Sufijos de entidad por carácter (el prefijo "&" se prependea en código
// para que ningún literal de entidad se corrompa en el archivo fuente).
const HTML_ENTITY_SUFFIX = { "&": "amp;", "<": "lt;", ">": "gt;", '"': "quot;", "'": "#39;" };
const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (ch) => "&" + HTML_ENTITY_SUFFIX[ch]);

/**
 * GestionJpaPage — orquestador del módulo de administración del
 * microservicio mysqlwithjpa (ruta /gestion-jpa). TODO el estado de
 * servidor y de UI vive aquí; los componentes de sección son presentacionales.
 *
 * Entrada a la página (task 3.1): UN solo efecto emite exactamente TRES
 * requests vía Promise.allSettled — health (auth:false), roles y la primera
 * página de usuarios (page=1&size=5). Los fallos son independientes:
 * health → bloques rojos; list → tabla vacía + showError; roles → selects
 * vacíos + showError. Sin crash, sin datos obsoletos.
 *
 * Refresco del health: entrada a la página + botón manual "Actualizar" de
 * JpaHealthSection. Sin setInterval ni polling (rate limit compartido de
 * 100 req/min por IP).
 *
 * Filtros (task 3.2): `draftFilters` es el borrador editable del formulario;
 * SOLO el submit ("Buscar") los convierte en `appliedFilters` (fuente real
 * del query) y re-consulta con page=1 — estructuralmente no hay request
 * mientras se teclea.
 *
 * Errores (task 3.5): toda llamada JPA está envuelta en try/catch que mapea
 * mapJpaError → dialogs de utils/alerts.js. El 401 NO se maneja aquí: el
 * cliente compartido limpia la sesión y redirige a "/" (política aceptada,
 * ver jpaUsers.api.js).
 */
function GestionJpaPage() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);
  // null = catálogo en carga; [] = cargado (posiblemente fallido) sin roles.
  const [roles, setRoles] = useState(null);
  const [draftFilters, setDraftFilters] = useState(EMPTY_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState(EMPTY_FILTERS);
  const [usersPage, setUsersPage] = useState(null);
  // Página 1-indexed de la UI — la conversión a 0-indexed vive SOLO en
  // jpaUsers.api.js (único punto de conversión del módulo).
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(5);
  const [usersLoading, setUsersLoading] = useState(false);
  const [modal, setModal] = useState({ open: false, user: null, mode: "view" });

  /**
   * Consulta el health check público (viaja sin Authorization: auth false).
   * Usado por el botón "Actualizar" — en la entrada a la página participa
   * en la tanda única del efecto de montaje.
   */
  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await jpaHealth();
      setHealth(data);
    } catch (error) {
      // health null → ambos bloques en rojo (derivación de JpaHealthSection).
      setHealth(null);
      const { title, text } = mapJpaError(error);
      showError(title, text);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // El StrictMode de React 18 remonta en desarrollo: el guard asegura
  // EXACTAMENTE tres requests por entrada real a la página (spec: un único
  // GET /actuator/health al entrar; sin doble consulta).
  const bootstrapped = useRef(false);

  // Entrada a la página: una sola tanda de tres requests con fallos
  // independientes (task 3.1). Sin polling posterior.
  useEffect(() => {
    if (bootstrapped.current) return;
    bootstrapped.current = true;

    (async () => {
      setHealthLoading(true);
      setUsersLoading(true);
      const [healthRes, rolesRes, usersRes] = await Promise.allSettled([
        jpaHealth(),
        listJpaRoles(),
        listJpaUsers({ page: 1, size: 5 }),
      ]);
      setHealthLoading(false);
      setUsersLoading(false);

      // Health: fallo → null → ambos bloques en rojo.
      if (healthRes.status === "fulfilled") {
        setHealth(healthRes.value);
      } else {
        setHealth(null);
        const { title, text } = mapJpaError(healthRes.reason);
        showError(title, text);
      }

      // Roles: fallo → selects vacíos ("Sin roles disponibles") + dialog.
      if (rolesRes.status === "fulfilled") {
        setRoles(rolesRes.value);
      } else {
        setRoles([]);
        const { title, text } = mapJpaError(rolesRes.reason);
        showError(title, text);
      }

      // Usuarios: fallo → tabla vacía y estable (sin datos parciales) + dialog.
      if (usersRes.status === "fulfilled") {
        setUsersPage(usersRes.value);
      } else {
        setUsersPage(null);
        const { title, text } = mapJpaError(usersRes.reason);
        showError(title, text);
      }
    })();
  }, []);

  /**
   * Re-consulta la lista con los parámetros indicados. El estado de página
   * solo avanza si el request tiene éxito; en fallo la tabla queda vacía y
   * estable (spec §service unavailable) y se conserva el último número de
   * página bueno. No se usa en el montaje (la tanda inicial es allSettled).
   */
  const fetchUsers = async ({ page: targetPage, size: targetSize, filters }) => {
    setUsersLoading(true);
    try {
      const data = await listJpaUsers({ page: targetPage, size: targetSize, ...filters });
      setUsersPage(data);
      setPage(targetPage);
      setSize(targetSize);
      return data;
    } catch (error) {
      // Sin datos obsoletos/parciales: tabla vacía + dialog en español.
      setUsersPage(null);
      const { title, text } = mapJpaError(error);
      showError(title, text);
      return null;
    } finally {
      setUsersLoading(false);
    }
  };

  // task 3.2 — el borrador es editable sin consultar; SOLO "Buscar" aplica.
  const handleFilterChange = (name, value) => {
    setDraftFilters((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilterSubmit = (event) => {
    event.preventDefault();
    const applied = { ...draftFilters };
    setAppliedFilters(applied);
    // Nueva búsqueda → página 1. Con todos vacíos el request viaja sin
    // parámetros de filtro (listJpaUsers los descarta).
    fetchUsers({ page: 1, size, filters: applied });
  };

  // task 3.3 — paginación conserva filtros aplicados y tamaño vigente.
  const handlePage = (targetPage) => {
    fetchUsers({ page: targetPage, size, filters: appliedFilters });
  };

  // task 3.3 — cambiar tamaño conserva filtros y reinicia a página 1.
  const handlePageSize = (value) => {
    fetchUsers({ page: 1, size: Number(value), filters: appliedFilters });
  };

  const openModal = (user, mode) => setModal({ open: true, user, mode });
  const closeModal = () => setModal({ open: false, user: null, mode: "view" });

  /**
   * task 3.4 (edición) — PUT con SOLO los campos cambiados (el diff lo
   * construye JpaUserModal). 200 → showSuccess → cierre → re-consulta de
   * la página actual. Los errores NO-401 los mapea el modal (dialog +
   * fieldErrors del 400); el 401 aplica el comportamiento global.
   */
  const handleModalSubmit = async (idUser, diff) => {
    await updateJpaUser(idUser, diff);
    showSuccess("¡Usuario actualizado!", "Los cambios se guardaron correctamente.");
    closeModal();
    fetchUsers({ page, size, filters: appliedFilters });
  };

  /**
   * task 3.4 (eliminación) — puerta showConfirm compartida por el botón de
   * fila y el del modal. Solo con isConfirmed viaja el DELETE. Con 204 la
   * fila se remueve LOCALMENTE (sin re-fetch completo); si la página queda
   * vacía y no es la primera, se retrocede una página y se re-consulta.
   */
  const handleDeleteUser = async (user) => {
    const result = await showConfirm(
      "¿Eliminar usuario?",
      `Esta acción no se puede deshacer y eliminará permanentemente a ` +
        `<strong>${escapeHtml(user.names)} ${escapeHtml(user.lastNames)}</strong> ` +
        `(documento ${escapeHtml(user.document)}).`
    );
    // Cancelar → sin request y sin cambios en la tabla (spec §delete).
    if (!result.isConfirmed) return;

    try {
      await deleteJpaUser(user.idUser);
      showSuccess("¡Usuario eliminado!", "El usuario ha sido eliminado correctamente.");
      // No-op si el borrado se inició desde la fila (modal cerrado).
      closeModal();

      const remaining = (usersPage?.content ?? []).filter((u) => u.idUser !== user.idUser);
      // Remoción local: content, totalElements y derivados coherentes.
      setUsersPage((prev) => {
        if (!prev) return prev;
        const content = prev.content.filter((u) => u.idUser !== user.idUser);
        const totalElements = Math.max(0, prev.totalElements - 1);
        const totalPages = size > 0 ? Math.max(1, Math.ceil(totalElements / size)) : prev.totalPages;
        return {
          ...prev,
          content,
          totalElements,
          totalPages,
          last: page >= totalPages,
        };
      });

      // ¿La página quedó vacía? → retrocede una página y re-consulta.
      if (remaining.length === 0 && page > 1) {
        fetchUsers({ page: page - 1, size, filters: appliedFilters });
      }
    } catch (error) {
      const { title, text } = mapJpaError(error);
      showError(title, text);
    }
  };

  const cV = { hidden: { opacity: 0, y: 20 }, visible: { opacity: 1, y: 0, transition: { duration: 0.5, staggerChildren: 0.1 } } };
  const iV = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <MainLayout
      pageTitle="Gestión JPA"
      pageSubtitle="Administra los usuarios y el estado del microservicio JPA"
      currentPage="gestion-jpa"
    >
      <motion.div className="container-fluid px-4 py-4" initial="hidden" animate="visible" variants={cV}>
        <div className="row justify-content-center g-4">
          <motion.div className="col-12 col-lg-8" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2">
                <Activity size={20} className="text-success" /> Estado del servicio
              </h5>
              <p className="text-muted small mb-4">
                Conectividad del microservicio mysqlwithjpa con sus dependencias
                (Supabase y MongoDB). Se actualiza al entrar a la página y con el
                botón Actualizar.
              </p>
              <JpaHealthSection
                health={health}
                loading={healthLoading}
                onRefresh={refreshHealth}
              />
            </div>
          </motion.div>

          <motion.div className="col-12 col-xxl-10" variants={iV}>
            <div className="card border-0 shadow-sm rounded-4 p-4 p-md-5">
              <h5 className="mb-1 fs-5 d-flex align-items-center gap-2">
                <Users size={20} className="text-success" /> Usuarios del servicio JPA
              </h5>
              <p className="text-muted small mb-4">
                Listado paginado del microservicio. Los filtros se aplican solo al
                pulsar Buscar; el detalle y la edición abren desde el nombre de cada
                fila con los datos ya cargados.
              </p>

              <JpaUserFilters
                values={draftFilters}
                roles={roles}
                onChange={handleFilterChange}
                onSubmit={handleFilterSubmit}
              />

              <JpaUsersTable
                users={usersPage?.content ?? []}
                loading={usersLoading}
                pageSize={size}
                onPageSize={handlePageSize}
                onNameClick={(user) => openModal(user, "view")}
                onEdit={(user) => openModal(user, "edit")}
                onDelete={handleDeleteUser}
              />

              <JpaPagination
                page={page}
                totalPages={usersPage?.totalPages ?? 0}
                last={usersPage?.last ?? true}
                onPage={handlePage}
              />
            </div>
          </motion.div>
        </div>
      </motion.div>

      {/* Modal de detalle/edición — se renderiza solo abierto. */}
      {modal.open && (
        <JpaUserModal
          user={modal.user}
          mode={modal.mode}
          roles={roles ?? []}
          onSubmit={handleModalSubmit}
          onDelete={handleDeleteUser}
          onClose={closeModal}
        />
      )}

      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default GestionJpaPage;
