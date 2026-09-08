import * as statisticsRepo from "../repositories/statistics.repository.js";

/**
 * Retorna el rango de fechas para un período dado.
 * @param {string} period - 'week' o 'month'
 * @returns {{ startDate: Date, endDate: Date }}
 */
function getDateRange(period) {
  const endDate = new Date();
  const startDate = new Date();
  if (period === "week") {
    startDate.setDate(endDate.getDate() - 7);
  } else if (period === "month") {
    startDate.setDate(endDate.getDate() - 30);
  } else {
    throw { status: 400, message: "Período inválido. Use 'week' o 'month'." };
  }
  return { startDate, endDate };
}

/**
 * Genera una serie de fechas como strings 'YYYY-MM-DD' para zero-fill.
 * @param {Date} startDate - Fecha inicio (inclusive)
 * @param {Date} endDate - Fecha fin (exclusive)
 * @returns {Array<string>} Array de fechas en formato ISO
 */
function generateDateSeries(startDate, endDate) {
  const series = [];
  const current = new Date(startDate);
  while (current < endDate) {
    series.push(current.toISOString().split("T")[0]);
    current.setDate(current.getDate() + 1);
  }
  return series;
}

/**
 * Completa la serie con ceros donde no hay datos.
 * Copia todos los campos numéricos del row original (count, asistio, no_asistio, pendiente, unread, etc.)
 * @param {Array} series - Datos crudos de la BD
 * @param {Array<string>} dateSeries - Serie completa de fechas
 * @returns {Array} Array con objetos { date, ...campos }
 */
function zeroFill(series, dateSeries) {
  const map = new Map();
  for (const row of series) {
    const dateStr = row.date instanceof Date
      ? row.date.toISOString().split("T")[0]
      : String(row.date).split("T")[0];
    map.set(dateStr, row);
  }
  // Obtener todas las keys numéricas del primer row con datos (excluyendo 'date')
  const sampleRow = series[0] || {};
  const numericKeys = Object.keys(sampleRow).filter((k) => k !== "date");

  return dateSeries.map((date) => {
    const row = map.get(date);
    if (!row) {
      // Sin datos — todos los campos numéricos en 0
      const zeroed = { date };
      for (const key of numericKeys) {
        zeroed[key] = 0;
      }
      return zeroed;
    }
    // Copiar todos los campos numéricos del row original
    const result = { date };
    for (const [key, value] of Object.entries(row)) {
      if (key !== "date") {
        result[key] = Number(value) || 0;
      }
    }
    return result;
  });
}

/**
 * Obtiene estadísticas de alertas para un período.
 * @param {string} period - 'week' o 'month'
 * @returns {Promise<Object>} Objeto con period, total, unread, series
 */
export async function getAlertStats(period) {
  const { startDate, endDate } = getDateRange(period);
  const series = await statisticsRepo.countAlertsByDay(startDate, endDate);
  const dateSeries = generateDateSeries(startDate, endDate);
  const filled = zeroFill(series, dateSeries);
  const total = filled.reduce((sum, item) => sum + item.count, 0);
  // Calcular unread sumando los unread de las filas originales
  const unread = series.reduce((sum, row) => sum + Number(row.unread || 0), 0);
  return { period, total, unread, series: filled };
}

/**
 * Obtiene estadísticas de reuniones para un período.
 * @param {string} period - 'week' o 'month'
 * @param {number} userId - ID del usuario
 * @param {string} userRole - Rol del usuario
 * @returns {Promise<Object>} Objeto con period, total, byAttendance, series
 */
export async function getMeetingStats(period, userId, userRole) {
  const { startDate, endDate } = getDateRange(period);
  const professionalId = userRole === "psicologo" ? userId : null;
  const series = await statisticsRepo.countMeetingsByDay(startDate, endDate, professionalId);
  const dateSeries = generateDateSeries(startDate, endDate);
  const filled = zeroFill(series, dateSeries);
  const total = filled.reduce((sum, item) => sum + item.count, 0);
  // Calcular asistencia sumando de las filas originales
  const asistio = series.reduce((sum, row) => sum + Number(row.asistio || 0), 0);
  const no_asistio = series.reduce((sum, row) => sum + Number(row.no_asistio || 0), 0);
  const pendiente = series.reduce((sum, row) => sum + Number(row.pendiente || 0), 0);
  return {
    period,
    total,
    byAttendance: { asistio, no_asistio, pendiente },
    series: filled,
  };
}

/**
 * Obtiene estadísticas de entradas de diario para un período.
 * @param {string} period - 'week' o 'month'
 * @returns {Promise<Object>} Objeto con period, total, series
 */
export async function getDiaryStats(period) {
  const { startDate, endDate } = getDateRange(period);
  const series = await statisticsRepo.countDiaryEntriesByDay(startDate, endDate);
  const dateSeries = generateDateSeries(startDate, endDate);
  const filled = zeroFill(series, dateSeries);
  const total = filled.reduce((sum, item) => sum + item.count, 0);
  return { period, total, series: filled };
}

/**
 * Obtiene la agenda de un psicólogo (pendientes, historial, reuniones por semana).
 * @param {number} idProfessional - ID del profesional
 * @returns {Promise<Object>} Objeto con pending, history, meetingsPerWeek
 */
export async function getPsychologistAgenda(idProfessional) {
  const rows = await statisticsRepo.findPsychologistById(idProfessional);
  if (!rows || rows.length === 0) {
    throw { status: 404, message: "Psicólogo no encontrado" };
  }
  const psychologist = rows[0];
  const pending = await statisticsRepo.findPendingMeetings(idProfessional);
  const history = await statisticsRepo.findMeetingHistory(idProfessional);
  const meetingsPerWeek = await statisticsRepo.countMeetingsByWeek(idProfessional);
  return { psychologist, pending, history, meetingsPerWeek };
}