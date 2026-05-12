import * as notificationsService from "../services/notifications.service.js";

export async function getByUser(req, res, next) {
  try {
    const notifications = await notificationsService.getByUser(req.params.userId);
    res.status(200).json(notifications);
  } catch (error) {
    next(error);
  }
}

export async function markAsRead(req, res, next) {
  try {
    const result = await notificationsService.markAsRead(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function checkIn(req, res, next) {
  try {
    const result = await notificationsService.evaluateCheckIn(req.body.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
