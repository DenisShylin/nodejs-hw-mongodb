import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

export const authenticate = async (req, res, next) => {
  try {
    // Получаем токен из заголовка
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return next(createError(401, 'Not authorized'));
    }

    try {
      // Проверяем валидность токена
      const { id } = jwt.verify(token, process.env.JWT_SECRET);

      // ВАЖНО: Проверяем наличие активной сессии в базе данных
      const session = await Session.findOne({
        userId: id,
        accessToken: token,
      });

      // Если сессия не найдена (например, после логаута), возвращаем ошибку
      if (!session) {
        // Специальная обработка для запроса логаута
        if (req.path === '/logout') {
          req.user = { _id: id };
          return next();
        }
        return next(createError(401, 'Not authorized'));
      }

      const user = await User.findById(id);

      if (!user) {
        return next(createError(401, 'Not authorized'));
      }

      req.user = user;
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(createError(401, 'Access token expired'));
      }
      // Специальная обработка для запроса логаута с недействительным токеном
      if (req.path === '/logout') {
        try {
          const decoded = jwt.decode(token);
          if (decoded && decoded.id) {
            req.user = { _id: decoded.id };
            return next();
          }
        } catch (e) {
          // Игнорируем ошибки декодирования для логаута
        }
      }
      next(createError(401, 'Not authorized'));
    }
  } catch (error) {
    next(error);
  }
};
