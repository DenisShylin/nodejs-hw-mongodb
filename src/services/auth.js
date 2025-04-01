// services/auth.js
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Session from '../models/session.js';

export const registerUser = async userData => {
  const { name, email, password } = userData;

  const user = await User.findOne({ email });
  if (user) {
    return null;
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const newUser = await User.create({
    name,
    email,
    password: hashedPassword,
  });

  const userWithoutPassword = {
    _id: newUser._id,
    name: newUser.name,
    email: newUser.email,
    createdAt: newUser.createdAt,
    updatedAt: newUser.updatedAt,
  };

  return userWithoutPassword;
};

export const loginUser = async userData => {
  const { email, password } = userData;

  const user = await User.findOne({ email });
  if (!user) {
    return null;
  }

  const isPasswordValid = await bcrypt.compare(password, user.password);
  if (!isPasswordValid) {
    return null;
  }

  // Видалити стару сесію користувача, якщо вона є
  await Session.deleteMany({ userId: user._id });

  // Створити токени
  const accessTokenExpires = new Date();
  accessTokenExpires.setMinutes(accessTokenExpires.getMinutes() + 15);

  const refreshTokenExpires = new Date();
  refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 30);

  const payload = { id: user._id };
  const accessToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '15m',
  });
  const refreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: '30d',
  });

  // Зберегти сесію в базі даних
  const session = await Session.create({
    userId: user._id,
    accessToken,
    refreshToken,
    accessTokenValidUntil: accessTokenExpires,
    refreshTokenValidUntil: refreshTokenExpires,
  });

  return {
    user: {
      _id: user._id,
      name: user.name,
      email: user.email,
    },
    accessToken,
    refreshToken,
    sessionId: session._id,
  };
};

export const refreshSession = async refreshToken => {
  try {
    const { id } = jwt.verify(refreshToken, process.env.JWT_SECRET);

    const session = await Session.findOne({ refreshToken });
    if (!session) {
      return null;
    }

    // Перевірка чи не протермінований refreshToken
    if (new Date() > session.refreshTokenValidUntil) {
      await Session.findByIdAndDelete(session._id);
      return null;
    }

    // Видалити стару сесію
    await Session.findByIdAndDelete(session._id);

    // Створити нові токени
    const accessTokenExpires = new Date();
    accessTokenExpires.setMinutes(accessTokenExpires.getMinutes() + 15);

    const refreshTokenExpires = new Date();
    refreshTokenExpires.setDate(refreshTokenExpires.getDate() + 30);

    const payload = { id };
    const newAccessToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '15m',
    });
    const newRefreshToken = jwt.sign(payload, process.env.JWT_SECRET, {
      expiresIn: '30d',
    });

    // Зберегти нову сесію
    const newSession = await Session.create({
      userId: id,
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      accessTokenValidUntil: accessTokenExpires,
      refreshTokenValidUntil: refreshTokenExpires,
    });

    return {
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      sessionId: newSession._id,
    };
  } catch (error) {
    return null;
  }
};

export const logout = async userId => {
  // Удаляем все сессии пользователя
  return await Session.deleteMany({ userId });
};

export const logoutBySessionId = async sessionId => {
  try {
    return await Session.findByIdAndDelete(sessionId);
  } catch (error) {
    console.error('Error in logoutBySessionId:', error);
    return null;
  }
};

export const findUserByEmail = async email => {
  try {
    return await User.findOne({ email });
  } catch (error) {
    console.error('Error finding user by email:', error);
    throw error;
  }
};

export const changePassword = async (email, newPassword) => {
  try {
    const user = await User.findOne({ email });

    if (!user) {
      return null;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    await user.save();

    return user;
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
