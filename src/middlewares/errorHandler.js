export const errorHandler = (err, req, res, next) => {
  const statusCode = err.status || 500;

  res.status(statusCode).json({
    status: statusCode,
    message: statusCode === 500 ? 'Something went wrong' : err.message,
    data: err.message,
  });
};
