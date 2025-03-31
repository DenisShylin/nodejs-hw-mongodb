import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

export const authenticate = async (req, res, next) => {
  try {
    // Специальное условие для запроса на логаут
    const isLogoutRequest = req.path === '/logout';

    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return next(createError(401, 'Not authorized'));
    }

    try {
      // Декодируем токен без валидации, чтобы получить ID пользователя
      const decoded = jwt.decode(token);

      if (!decoded || !decoded.id) {
        return next(createError(401, 'Not authorized'));
      }

      // Проверяем наличие сессии в базе данных
      const session = await Session.findOne({
        userId: decoded.id,
        accessToken: token,
      });

      // Если запрос не на логаут и сессия не найдена, возвращаем ошибку
      if (!session && !isLogoutRequest) {
        return next(createError(401, 'Not authorized'));
      }

      try {
        const { id } = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(id);

        if (!user) {
          return next(createError(401, 'Not authorized'));
        }

        req.user = user;
        next();
      } catch (jwtError) {
        if (jwtError.name === 'TokenExpiredError') {
          return next(createError(401, 'Access token expired'));
        }
        return next(createError(401, 'Not authorized'));
      }
    } catch (error) {
      // Для логаута делаем особую обработку
      if (isLogoutRequest) {
        try {
          // Пытаемся извлечь ID пользователя для логаута
          const { id } = jwt.decode(token) || {};
          if (id) {
            req.user = { _id: id };
            return next();
          }
        } catch (e) {
          // Игнорируем ошибки для логаута
        }
      }

      next(createError(401, 'Not authorized'));
    }
  } catch (error) {
    next(error);
  }
};
