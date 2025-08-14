class HttpError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
  static badRequest(msg = 'Solicitud inválida') { return new HttpError(400, msg); }
  static unauthorized(msg = 'No autenticado') { return new HttpError(401, msg); }
  static forbidden(msg = 'No autorizado') { return new HttpError(403, msg); }
  static notFound(msg = 'No encontrado') { return new HttpError(404, msg); }
  static conflict(msg = 'Conflicto') { return new HttpError(409, msg); }
  static server(msg = 'Error interno') { return new HttpError(500, msg); }
}
module.exports = { HttpError };
