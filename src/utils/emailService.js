// utils/emailService.js
import nodemailer from 'nodemailer';
import jwt from 'jsonwebtoken';

// Создаем транспорт для отправки писем через SMTP
const createTransport = () => {
  return nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASSWORD,
    },
  });
};

// Создание токена для сброса пароля
export const createResetToken = email => {
  return jwt.sign({ email }, process.env.JWT_SECRET, { expiresIn: '5m' });
};

// Отправка письма для сброса пароля
export const sendResetPasswordEmail = async (email, token) => {
  const transporter = createTransport();

  const resetLink = `${process.env.APP_DOMAIN}/reset-password?token=${token}`;

  const mailOptions = {
    from: process.env.SMTP_FROM,
    to: email,
    subject: 'Password Reset Instructions',
    text: `To reset your password, please follow this link: ${resetLink}`,
    html: `
      <div>
        <h1>Password Reset</h1>
        <p>To reset your password, please click the button below:</p>
        <a href="${resetLink}" style="display: inline-block; background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Password</a>
        <p>This link will expire in 5 minutes.</p>
        <p>If you did not request a password reset, please ignore this email.</p>
      </div>
    `,
  };

  try {
    await transporter.sendMail(mailOptions);
    return true;
  } catch (error) {
    console.error('Error sending reset email:', error);
    return false;
  }
};
