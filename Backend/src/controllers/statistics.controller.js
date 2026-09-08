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