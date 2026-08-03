import * as diaryService from "../services/diary.service.js";
import { assertOwnProfile } from "../middlewares/auth.middleware.js";

export async function createEntry(req, res, next) {
  try {
    const { userId, emotionIndex, description } = req.body;
    const result = await diaryService.createEntry(userId, emotionIndex, description);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getEntries(req, res, next) {
  try {
    const entries = await diaryService.getEntries(req.params.userId);
    res.status(200).json(entries);
  } catch (error) {
    next(error);
  }
}

export async function getPrivacy(req, res, next) {
  try {
    assertOwnProfile(req, req.params.userId);
    const result = await diaryService.getPrivacy(req.params.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updatePrivacy(req, res, next) {
  try {
    assertOwnProfile(req, req.params.userId);
    const result = await diaryService.updatePrivacy(req.params.userId, req.body.visibilidad);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
