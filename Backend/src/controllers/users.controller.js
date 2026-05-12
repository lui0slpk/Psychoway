import * as usersService from "../services/users.service.js";

export async function create(req, res, next) {
  try {
    const result = await usersService.create(req.body);
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
}

export async function search(req, res, next) {
  try {
    const result = await usersService.searchByDocument(req.params.document);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function update(req, res, next) {
  try {
    const result = await usersService.update(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function remove(req, res, next) {
  try {
    const result = await usersService.remove(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getPsychologists(req, res, next) {
  try {
    const result = await usersService.getPsychologists();
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
