import * as objectivesService from "../services/objectives.service.js";

export async function create(req, res, next) {
  try {
    const { userId, nombre, descripcion, estado } = req.body;
    const result = await objectivesService.create(userId, nombre, descripcion, estado);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getByUser(req, res, next) {
  try {
    const objectives = await objectivesService.getByUser(req.params.userId);
    res.status(200).json(objectives);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const { nombre, descripcion, estado } = req.body;
    const result = await objectivesService.update(req.params.id, nombre, descripcion, estado);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await objectivesService.remove(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
