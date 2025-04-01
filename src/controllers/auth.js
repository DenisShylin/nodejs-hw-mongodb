// controllers/auth.js
import createError from 'http-errors';
import jwt from 'jsonwebtoken';
import * as authService from '../services/auth.js';
import {
  sendResetPasswordEmail,
  createResetToken,
} from '../utils/emailService.js';

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
  try {
    // Получаем sessionId из куки
    const { refreshToken, sessionId } = req.cookies;

    if (!refreshToken || !sessionId) {
      // Даже если куки отсутствуют, возвращаем 204
      res.clearCookie('refreshToken');
      res.clearCookie('sessionId');
      return res.status(204).send();
    }

    // Пытаемся найти и удалить сессию по sessionId
    await authService.logoutBySessionId(sessionId);

    // Очищаем куки
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');

    // Возвращаем статус 204
    return res.status(204).send();
  } catch (error) {
    // Даже при ошибке очищаем куки и возвращаем 204
    res.clearCookie('refreshToken');
    res.clearCookie('sessionId');
    return res.status(204).send();
  }
};

export const sendResetEmail = async (req, res) => {
  const { email } = req.body;

  // Проверяем существует ли пользователь с указанным email
  const user = await authService.findUserByEmail(email);

  if (!user) {
    throw createError(404, 'User not found!');
  }

  // Создаем токен для сброса пароля
  const token = createResetToken(email);

  // Отправляем письмо со ссылкой для сброса пароля
  const emailSent = await sendResetPasswordEmail(email, token);

  if (!emailSent) {
    throw createError(500, 'Failed to send the email, please try again later.');
  }

  res.status(200).json({
    status: 200,
    message: 'Reset password email has been successfully sent.',
    data: {},
  });
};

export const resetPassword = async (req, res) => {
  const { token, password } = req.body;

  try {
    // Проверяем валидность и срок действия токена
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { email } = decoded;

    // Изменяем пароль пользователя
    const user = await authService.changePassword(email, password);

    if (!user) {
      throw createError(404, 'User not found!');
    }

    // Удаляем все сессии пользователя
    await authService.logout(user._id);

    res.status(200).json({
      status: 200,
      message: 'Password has been successfully reset.',
      data: {},
    });
  } catch (error) {
    if (
      error.name === 'TokenExpiredError' ||
      error.name === 'JsonWebTokenError'
    ) {
      throw createError(401, 'Token is expired or invalid.');
    }
    throw error;
  }
};
