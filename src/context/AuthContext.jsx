import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const AuthContext = createContext(null);

const API_URL = "http://localhost:5000";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, verificar si hay token válido en localStorage
  useEffect(() => {
    const verifySession = async () => {
      const savedToken = localStorage.getItem("psychoway_token");
      const savedUser = localStorage.getItem("psychoway_user");

      if (!savedToken || !savedUser) {
        // No hay sesión guardada
        localStorage.removeItem("psychoway_token");
        localStorage.removeItem("psychoway_user");
        setLoading(false);
        return;
      }

      try {
        // Verificar token con el servidor
        const response = await fetch(`${API_URL}/api/auth/verify`, {
          headers: {
            Authorization: `Bearer ${savedToken}`,
          },
        });

        if (response.ok) {
          // Token válido, restaurar sesión
          setUser(JSON.parse(savedUser));
        } else {
          // Token inválido o expirado, limpiar sesión
          console.warn("⚠️ Sesión expirada o inválida. Cerrando sesión...");
          localStorage.removeItem("psychoway_token");
          localStorage.removeItem("psychoway_user");
          setUser(null);
        }
      } catch (error) {
        // Error de conexión con el servidor, mantener sesión local
        // pero marcar que puede no ser válida
        console.warn("⚠️ No se pudo verificar la sesión con el servidor:", error.message);
        // En caso de que el servidor no esté disponible,
        // mantenemos la sesión local temporalmente
        try {
          setUser(JSON.parse(savedUser));
        } catch (e) {
          localStorage.removeItem("psychoway_token");
          localStorage.removeItem("psychoway_user");
        }
      }

      setLoading(false);
    };

    verifySession();
  }, []);

  // Función para login - ahora almacena también el token JWT
  const login = (userData, token) => {
    setUser(userData);
    localStorage.setItem("psychoway_user", JSON.stringify(userData));
    if (token) {
      localStorage.setItem("psychoway_token", token);
    }
  };

  // Función para logout - limpia token y datos de usuario
  const logout = () => {
    setUser(null);
    localStorage.removeItem("psychoway_user");
    localStorage.removeItem("psychoway_token");
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === "string") return user.rol === roles;
    return roles.includes(user.rol);
  };

  /**
   * Fetch autenticado - automáticamente agrega el token JWT
   * Si el token expira, cierra la sesión automáticamente
   */
  const authFetch = useCallback(async (url, options = {}) => {
    const token = localStorage.getItem("psychoway_token");

    if (!token) {
      // No hay token, cerrar sesión
      logout();
      throw new Error("No hay sesión activa");
    }

    const headers = {
      ...options.headers,
      Authorization: `Bearer ${token}`,
    };

    // Agregar Content-Type si hay body y no es FormData
    if (options.body && !(options.body instanceof FormData)) {
      headers["Content-Type"] = headers["Content-Type"] || "application/json";
    }

    const response = await fetch(url, { ...options, headers });

    // Si el servidor responde 401, la sesión expiró
    if (response.status === 401) {
      console.warn("⚠️ Sesión expirada. Cerrando sesión...");
      setUser(null);
      localStorage.removeItem("psychoway_user");
      localStorage.removeItem("psychoway_token");
      window.location.href = "/";
      throw new Error("Sesión expirada");
    }

    return response;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /**
   * Obtener el token JWT actual
   */
  const getToken = () => {
    return localStorage.getItem("psychoway_token");
  };

  const value = {
    user,
    loading,
    login,
    logout,
    hasRole,
    authFetch,
    getToken,
    isAuthenticated: !!user,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth debe usarse dentro de AuthProvider");
  }
  return context;
}

export default AuthContext;
