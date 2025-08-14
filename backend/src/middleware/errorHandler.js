function errorHandler(err, req, res, next) {
  // Log detallado en consola:
  console.error('ERROR:', {
    message: err.message,
    status: err.status,
    stack: err.stack,
  });

  const status = err.status || 500;
  const message = err.message || 'Error interno';
  res.status(status).json({ error: message });
}
module.exports = { errorHandler };
