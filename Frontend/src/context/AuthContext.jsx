import React, { createContext, useContext, useState, useEffect } from "react";
import authApi from "../api/auth.api";

const AuthContext = createContext(null);

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
        await authApi.verifySession();
        // Token válido, restaurar sesión desde la caché local
        setUser(JSON.parse(savedUser));
      } catch (error) {
        if (error.status === 0) {
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
        } else {
          // Token inválido o expirado — el cliente ya limpió localStorage y
          // redirigió a "/" en el 401; acá limpiamos el estado local.
          console.warn("⚠️ Sesión expirada o inválida. Cerrando sesión...");
          localStorage.removeItem("psychoway_token");
          localStorage.removeItem("psychoway_user");
          setUser(null);
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

  // Función para actualizar datos del usuario (sin cerrar sesión)
  const updateUser = (updatedData) => {
    const newUser = { ...user, ...updatedData };
    setUser(newUser);
    localStorage.setItem("psychoway_user", JSON.stringify(newUser));
  };

  // Verificar si el usuario tiene un rol específico
  const hasRole = (roles) => {
    if (!user) return false;
    if (typeof roles === "string") return user.rol === roles;
    return roles.includes(user.rol);
  };

  const value = {
    user,
    loading,
    login,
    logout,
    updateUser,
    hasRole,
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
