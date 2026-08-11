import * as usersService from "../services/users.service.js";
import { assertOwnProfile } from "../middlewares/auth.middleware.js";

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

export async function updateProfile(req, res, next) {
  try {
    assertOwnProfile(req, req.params.id);
    const result = await usersService.updateProfile(req.params.id, req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function updateProfilePhoto(req, res, next) {
  try {
    assertOwnProfile(req, req.params.id);
    const { profilePhoto } = req.body;
    const result = await usersService.updateProfilePhoto(req.params.id, profilePhoto);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfilePhoto(req, res, next) {
  try {
    assertOwnProfile(req, req.params.id);
    const result = await usersService.getProfilePhoto(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function getProfile(req, res, next) {
  try {
    assertOwnProfile(req, req.params.id);
    const result = await usersService.getFullProfile(req.params.id);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
