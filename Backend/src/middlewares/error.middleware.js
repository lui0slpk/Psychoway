/**
 * Middleware centralizado de manejo de errores.
 * Captura errores lanzados por controllers/services y envía respuesta apropiada.
 *
 * Uso en services: throw { status: 400, message: "Mensaje de error" }
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Si el error tiene un status explícito, usarlo
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Error interno del servidor";

  // Log solo en errores 500 (inesperados)
  if (status >= 500) {
    console.error(`❌ [${req.method}] ${req.originalUrl}:`, err);
  }

  res.status(status).json({ message });
}
