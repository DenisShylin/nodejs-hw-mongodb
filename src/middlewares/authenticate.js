import jwt from 'jsonwebtoken';
import createError from 'http-errors';
import User from '../models/user.js';
import Session from '../models/session.js';

export const authenticate = async (req, res, next) => {
  try {
    const isLogoutRequest = req.path === '/logout';

    const { authorization = '' } = req.headers;
    const [bearer, token] = authorization.split(' ');

    if (bearer !== 'Bearer' || !token) {
      return next(createError(401, 'Not authorized'));
    }

    try {
      const decoded = jwt.decode(token);

      if (!decoded || !decoded.id) {
        return next(createError(401, 'Not authorized'));
      }

      const session = await Session.findOne({
        userId: decoded.id,
        accessToken: token,
      });

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
      if (isLogoutRequest) {
        try {
          const { id } = jwt.decode(token) || {};
          if (id) {
            req.user = { _id: id };
            return next();
          }
        } catch (e) {}
      }

      next(createError(401, 'Not authorized'));
    }
  } catch (error) {
    next(error);
  }
};
