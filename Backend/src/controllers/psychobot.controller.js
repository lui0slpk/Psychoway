import * as psychobotService from "../services/psychobot.service.js";

export async function getSessions(req, res, next) {
  try {
    const sessions = await psychobotService.getSessions(req.params.userId);
    res.status(200).json(sessions);
  } catch (error) {
    next(error);
  }
}

export async function createSession(req, res, next) {
  try {
    const result = await psychobotService.createSession(req.body.userId, req.body.title);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function deleteSession(req, res, next) {
  try {
    const result = await psychobotService.deleteSession(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getHistory(req, res, next) {
  try {
    const history = await psychobotService.getHistory(req.params.sessionId);
    res.status(200).json(history);
  } catch (error) {
    next(error);
  }
}

export async function chat(req, res, next) {
  try {
    const { userId, message, id_session, personality, chatHistory } = req.body;
    const result = await psychobotService.chat(userId, message, id_session, personality, chatHistory);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function weeklySummary(req, res, next) {
  try {
    const result = await psychobotService.weeklySummary(req.body.userId);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
