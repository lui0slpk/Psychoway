import React, { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Al iniciar, verificar si hay usuario en localStorage
  useEffect(() => {
    const savedUser = localStorage.getItem("psychoway_user");
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (e) {
        localStorage.removeItem("psychoway_user");
      }
    }
    setLoading(false);
  }, []);

  // Función para login
  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("psychoway_user", JSON.stringify(userData));
  };

  // Función para logout
  const logout = () => {
    setUser(null);
    localStorage.removeItem("psychoway_user");
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
