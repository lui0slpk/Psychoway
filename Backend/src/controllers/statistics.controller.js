import * as statisticsService from "../services/statistics.service.js";

/**
 * Obtiene estadísticas de alertas.
 */
export async function getAlerts(req, res, next) {
  try {
    const period = req.query.period || "week";
    const result = await statisticsService.getAlertStats(period);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene estadísticas de reuniones.
 */
export async function getMeetings(req, res, next) {
  try {
    const period = req.query.period || "week";
    const userId = req.userId;
    const userRole = req.userRole;
    const result = await statisticsService.getMeetingStats(period, userId, userRole);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene estadísticas de entradas de diario.
 */
export async function getDiary(req, res, next) {
  try {
    const period = req.query.period || "week";
    const result = await statisticsService.getDiaryStats(period);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene la agenda de un psicólogo.
 */
export async function getPsychologistAgenda(req, res, next) {
  try {
    const idProfessional = Number(req.params.id_professional);
    const result = await statisticsService.getPsychologistAgenda(idProfessional);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

/**
 * Obtiene estadísticas mensuales agregadas (6 meses).
 */
export async function getMonthlyStats(req, res, next) {
  try {
    const type = req.params.type;
    if (!["alerts", "meetings", "diary"].includes(type)) {
      return res.status(400).json({ message: "Tipo inválido. Use 'alerts', 'meetings' o 'diary'." });
    }
    const result = await statisticsService.getMonthlyStats(type, req.userId, req.userRole);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}