import * as alertsService from "../services/alerts.service.js";

export async function getAll(req, res, next) {
  try {
    const alerts = await alertsService.getAll();
    res.status(200).json(alerts);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const result = await alertsService.markAsRead(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
