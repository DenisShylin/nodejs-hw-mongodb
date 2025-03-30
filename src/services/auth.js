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

  await Session.deleteMany({ userId: user._id });

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

    if (new Date() > session.refreshTokenValidUntil) {
      await Session.findByIdAndDelete(session._id);
      return null;
    }

    await Session.findByIdAndDelete(session._id);

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
  return await Session.deleteMany({ userId });
};
