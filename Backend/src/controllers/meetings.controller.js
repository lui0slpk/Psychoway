import * as meetingsService from "../services/meetings.service.js";

export async function create(req, res, next) {
  try {
    const { userId, professionalId, day, hour, description } = req.body;
    const result = await meetingsService.create(userId, professionalId, day, hour, description);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getByProfessional(req, res, next) {
  try {
    const result = await meetingsService.getByProfessional(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getByUser(req, res, next) {
  try {
    const result = await meetingsService.getByUser(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfessionalHistory(req, res, next) {
  try {
    const result = await meetingsService.getProfessionalHistory(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateAttendance(req, res, next) {
  try {
    const { id } = req.params;
    const { asistencia } = req.body;
    const result = await meetingsService.updateAttendance(id, asistencia);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
