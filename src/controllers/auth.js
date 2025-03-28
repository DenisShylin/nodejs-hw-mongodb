// auth.js;
import createError from 'http-errors';
import * as authService from '../services/auth.js';

export const register = async (req, res) => {
  const user = await authService.registerUser(req.body);

  if (!user) {
    throw createError(409, 'Email in use');
  }

  res.status(201).json({
    status: 201,
    message: 'Successfully registered a user!',
    data: user,
  });
};

export const login = async (req, res) => {
  const result = await authService.loginUser(req.body);

  if (!result) {
    throw createError(401, 'Email or password is wrong');
  }

  const { refreshToken, accessToken, user, sessionId } = result;

  // Встановлюємо refreshToken та sessionId у cookies
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully logged in an user!',
    data: {
      accessToken,
    },
  });
};

export const refresh = async (req, res) => {
  const { refreshToken } = req.cookies;

  if (!refreshToken) {
    throw createError(401, 'Not authorized');
  }

  const result = await authService.refreshSession(refreshToken);

  if (!result) {
    throw createError(401, 'Not authorized');
  }

  const { accessToken, refreshToken: newRefreshToken, sessionId } = result;

  // Встановлюємо новий refreshToken та sessionId у cookies
  res.cookie('refreshToken', newRefreshToken, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.cookie('sessionId', sessionId, {
    httpOnly: true,
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 днів
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
  });

  res.status(200).json({
    status: 200,
    message: 'Successfully refreshed a session!',
    data: {
      accessToken,
    },
  });
};

export const logout = async (req, res) => {
  const { _id } = req.user;
  const { sessionId, refreshToken } = req.cookies;

  if (!refreshToken || !sessionId) {
    throw createError(401, 'Not authorized');
  }

  await authService.logout(_id, sessionId);

  // Очищаємо обидва куки
  res.clearCookie('refreshToken');
  res.clearCookie('sessionId');

  res.status(204).send();
};
