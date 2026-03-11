import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * Componente para proteger rutas
 * @param {Object} props
 * @param {React.ReactNode} props.children - Componente a renderizar si está autenticado
 * @param {string|string[]} props.allowedRoles - Roles permitidos (opcional)
 */
function ProtectedRoute({ children, allowedRoles }) {
    const { user, loading, isAuthenticated } = useAuth();
    const location = useLocation();

    // Mostrar loading mientras se verifica autenticación
    if (loading) {
        return (
            <div className="d-flex justify-content-center align-items-center vh-100">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Cargando...</span>
                </div>
            </div>
        );
    }

    // Si no está autenticado, redirigir a login
    if (!isAuthenticated) {
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    // Si hay roles permitidos, verificar que el usuario tenga uno de ellos
    if (allowedRoles) {
        const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
        if (!roles.includes(user.rol)) {
            // Redirigir a su página principal según su rol
            const defaultRoutes = {
                aprendiz: '/diario',
                psicologo: '/psi-seguimiento',
                administrador: '/gestion'
            };
            return <Navigate to={defaultRoutes[user.rol] || '/'} replace />;
        }
    }

    return children;
}

export default ProtectedRoute;
