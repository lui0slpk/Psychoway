import React, { useCallback, useEffect, useState } from "react";
import MainLayout from "../../layouts/MainLayout";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";
import { jpaHealth, mapJpaError } from "../../api/jpaUsers.api";
import { showError } from "../../utils/alerts";
import JpaHealthSection from "../../components/admin/gestion-jpa/JpaHealthSection";

/**
 * GestionJpaPage — módulo de administración del microservicio mysqlwithjpa.
 *
 * Slice 1 (forma mínima): envoltura MainLayout + sección de estado del
 * servicio (health). La tabla de usuarios, filtros, paginación, modal y
 * formulario de creación se integran en slices posteriores (tareas 2.2-2.7,
 * 3.1-3.5) — este archivo NO debe incluirlos todavía.
 *
 * Refresco del health: exactamente UN request al entrar a la página (efecto
 * de montaje) más el botón manual "Actualizar" de JpaHealthSection. Sin
 * setInterval ni polling (rate limit compartido de 100 req/min por IP).
 * Errores NO-401 del health se muestran con showError vía mapJpaError; el
 * 401 aplica el comportamiento global del cliente compartido (ver
 * jpaUsers.api.js).
 */
function GestionJpaPage() {
  const [health, setHealth] = useState(null);
  const [healthLoading, setHealthLoading] = useState(false);

  // Consulta el health check público (viaja sin Authorization: auth false).
  const refreshHealth = useCallback(async () => {
    setHealthLoading(true);
    try {
      const data = await jpaHealth();
      setHealth(data);
    } catch (error) {
      // health null → ambos bloques en rojo (derivación de JpaHealthSection).
      setHealth(null);
      // Fallo de red/5xx → dialog en español con la envolvente showError.
      const { title, text } = mapJpaError(error);
      showError(title, text);
    } finally {
      setHealthLoading(false);
    }
  }, []);

  // Exactamente UNA consulta al entrar a la página. Sin polling.
  useEffect(() => {
    refreshHealth();
  }, [refreshHealth]);

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
        </div>
      </motion.div>
      <style>{`.card { transition: transform 0.2s ease; } .card:hover { transform: translateY(-3px); }`}</style>
    </MainLayout>
  );
}

export default GestionJpaPage;
