import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';

export const authenticate = async (req, res, next) => {
  try {
    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
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
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return next(createError(401, 'Access token expired'));
      }
      next(createError(401, 'Not authorized'));
    }
  } catch (error) {
    next(error);
  }
};
