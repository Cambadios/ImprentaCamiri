const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombreCompleto: { type: String, required: true, trim: true },
    correo: { type: String, required: true, unique: true, lowercase: true, trim: true, match: [/^\S+@\S+\.\S+$/, 'Correo inválido'] },
    contrasena: { type: String, required: true, select: false, minlength: 6 },
    telefono: { type: String, required: true, trim: true, match: [/^[0-9+\-() ]{6,20}$/, 'Teléfono inválido'] },
    carnetIdentidad: { type: String, required: true, trim: true },
    rol: { type: String, enum: ['admin', 'usuario', 'administrador', 'usuario_normal'], default: 'usuario' },
    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// ---------- Hooks ----------
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contrasena')) return next();
  const salt = await bcrypt.genSalt(10);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
  next();
});

usuarioSchema.methods.compararContrasena = function (contrasenaIngresada) {
  return bcrypt.compare(contrasenaIngresada, this.contrasena);
};

module.exports = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);
