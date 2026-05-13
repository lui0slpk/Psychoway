import * as emotionsService from "../services/emotions.service.js";

export async function getAll(req, res, next) {
  try {
    const emotions = await emotionsService.getAll();
    res.status(200).json(emotions);
  } catch (error) {
    next(error);
  }
}
