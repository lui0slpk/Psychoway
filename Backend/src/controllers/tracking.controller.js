import * as trackingService from "../services/tracking.service.js";

export async function getApprenticesWithEmotions(req, res, next) {
  try {
    const result = await trackingService.getApprenticesWithEmotions();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
