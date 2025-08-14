
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const usuarioSchema = new mongoose.Schema(
  {
    nombreCompleto: { type: String, required: true, trim: true },

    correo: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Correo inválido'],
    },

    // 👇 ocultamos por defecto
    contrasena: { type: String, required: true, select: false, minlength: 6 },

    telefono: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9+\-() ]{6,20}$/, 'Teléfono inválido'],
    },

    carnetIdentidad: { type: String, required: true, trim: true },

    rol: {
      type: String,
      enum: ['admin', 'usuario', 'administrador', 'usuario_normal'],
      default: 'usuario',
    },

    resetToken: { type: String, select: false },
    resetTokenExpiry: { type: Date, select: false },
  },
  { timestamps: true }
);

// ---------- Helpers ----------
usuarioSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// No revelar campos sensibles al serializar
usuarioSchema.set('toJSON', {
  virtuals: true,
  transform: (_, ret) => {
    delete ret._id;
    delete ret.__v;
    delete ret.contrasena;
    delete ret.resetToken;
    delete ret.resetTokenExpiry;
    return ret;
  },
});

// ---------- Hooks ----------
usuarioSchema.pre('save', async function (next) {
  if (!this.isModified('contrasena')) return next();
  const salt = await bcrypt.genSalt(10);
  this.contrasena = await bcrypt.hash(this.contrasena, salt);
  next();
});

// También cubrir updates tipo findOneAndUpdate({$set:{contrasena}})
usuarioSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate();
  const nueva = update?.contrasena ?? update?.$set?.contrasena;
  if (!nueva) return next();

  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(nueva, salt);

  if (update.$set) update.$set.contrasena = hash;
  else this.setUpdate({ ...update, contrasena: hash });

  next();
});

// Métodos
usuarioSchema.methods.compararContrasena = function (contrasenaIngresada) {
  return bcrypt.compare(contrasenaIngresada, this.contrasena);
};

// ---------- Verificación de redefinición del modelo ----------
const Usuario = mongoose.models.Usuario || mongoose.model('Usuario', usuarioSchema);

module.exports = Usuario;
