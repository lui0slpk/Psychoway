import jwt from "jsonwebtoken";
import env from "../config/environment.js";

/**
 * Middleware para verificar token JWT.
 * Se aplica a todas las rutas /api/* excepto las públicas.
 */
export function authMiddleware(req, res, next) {
  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/api/password/forgot", "/api/password/reset"];
  if (publicPaths.includes(req.path)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ message: "Token no proporcionado. Inicie sesión." });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET);
    req.userId = decoded.userId;
    req.userRole = decoded.role;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ message: "Sesión expirada. Inicie sesión nuevamente." });
    }
    return res
      .status(401)
      .json({ message: "Token inválido. Inicie sesión nuevamente." });
  }
}

/**
 * Middleware de autorización por rol.
 * Se usa DESPUÉS de authMiddleware (req.userRole ya está seteado).
 */
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!roles.includes(req.userRole)) {
      return res
        .status(403)
        .json({ message: "No tienes permisos para realizar esta acción." });
    }
    next();
  };
}

/**
 * Middleware que restringe el acceso a administradores.
 */
export const requireAdmin = requireRole("administrador");

/**
 * Verifica que el usuario autenticado sea el dueño del recurso.
 * Solo un administrador puede acceder al perfil de otro usuario.
 * Lanza un error { status, message } para el errorHandler central.
 */
export function assertOwnProfile(req, targetId) {
  const userId = Number(req.userId);
  const target = Number(targetId);

  if (userId !== target && req.userRole !== "administrador") {
    throw { status: 403, message: "No tienes permisos para acceder a este perfil." };
  }
}
