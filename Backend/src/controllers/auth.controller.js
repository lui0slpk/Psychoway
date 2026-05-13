import * as authService from "../services/auth.service.js";

export async function register(req, res, next) {
  try {
    const result = await authService.register(req.body);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { document, password } = req.body;
    const result = await authService.login(document, password);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export function verify(req, res) {
  res.status(200).json({
    valid: true,
    userId: req.userId,
    role: req.userRole,
  });
}

export async function forgotPassword(req, res, next) {
  try {
    const result = await authService.forgotPassword(req.body.correo);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const { token, newPassword } = req.body;
    const result = await authService.resetPassword(token, newPassword);
    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
}
