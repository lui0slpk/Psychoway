import jwt from "jsonwebtoken";
import env from "../config/environment.js";

/**
 * Middleware para verificar token JWT.
 * Se aplica a todas las rutas /api/* excepto las públicas.
 */
export function authMiddleware(req, res, next) {
  // Rutas públicas que no requieren autenticación
  const publicPaths = ["/password/forgot", "/password/reset"];
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
