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
      if (isLogoutRequest) {
        req.user = { _id: null };
        return next();
      }
      return next(createError(401, 'Not authorized'));
    }

    try {
      const { id } = jwt.verify(token, process.env.JWT_SECRET);

      const session = await Session.findOne({
        userId: id,
        accessToken: token,
        accessTokenValidUntil: { $gt: new Date() },
      });

      if (!session && !isLogoutRequest) {
        return next(createError(401, 'Not authorized - session not found'));
      }

      const user = await User.findById(id);

      if (!user) {
        if (isLogoutRequest) {
          req.user = { _id: null };
          return next();
        }
        return next(createError(401, 'Not authorized'));
      }

      req.user = user;
      next();
    } catch (error) {
      if (isLogoutRequest) {
        req.user = { _id: null };
        return next();
      }

      if (error.name === 'TokenExpiredError') {
        return next(createError(401, 'Access token expired'));
      }
      next(createError(401, 'Not authorized'));
    }
  } catch (error) {
    if (req.path === '/logout') {
      req.user = { _id: null };
      return next();
    }
    next(error);
  }
};
