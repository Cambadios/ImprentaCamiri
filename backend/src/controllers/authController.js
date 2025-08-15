const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');  // Asegúrate de tener el modelo Usuario

// Función para iniciar sesión
const login = async (req, res) => {
  const { correo, contrasena } = req.body;

  console.log("Correo recibido:", correo);
  console.log("Contraseña recibida:", contrasena);

  if (!correo || !contrasena) {
    return res.status(400).json({ mensaje: 'Correo y contraseña son requeridos' });
  }

  try {
    const usuario = await Usuario.findOne({ correo }).select('+contrasena');  // Incluye la contraseña
    if (!usuario) {
      return res.status(400).json({ mensaje: 'Correo no encontrado' });
    }

    console.log("Contraseña almacenada en la base de datos:", usuario.contrasena);  // Verifica la contraseña almacenada

    const esValida = await usuario.compararContrasena(contrasena);
    if (!esValida) {
      return res.status(400).json({ mensaje: 'Contraseña incorrecta' });
    }

    const token = jwt.sign({ id: usuario._id, correo: usuario.correo }, process.env.JWT_SECRET || 'SECRET_KEY', { expiresIn: '1h' });

    return res.status(200).json({
      token,
      usuario: {
        _id: usuario._id,
        nombreCompleto: usuario.nombreCompleto,
        correo: usuario.correo,
        rol: usuario.rol,
      }
    });
  } catch (error) {
    console.error('Error en login:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

// Función para registrar un nuevo usuario
const register = async (req, res) => {
  const { nombreCompleto, correo, contrasena, telefono, carnetIdentidad, rol } = req.body;

  try {
    // Verificar si el correo ya está registrado
    const existe = await Usuario.findOne({ correo });
    if (existe) return res.status(400).json({ mensaje: 'El correo ya está registrado' });

    // Crear un nuevo usuario
    const nuevoUsuario = new Usuario({
      nombreCompleto,
      correo,
      contrasena,
      telefono,
      carnetIdentidad,
      rol
    });

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    // Evitar devolver la contraseña
    const { contrasena: _, ...safeUser } = nuevoUsuario.toObject();
    res.status(201).json({ mensaje: 'Usuario creado correctamente', usuario: safeUser });
  } catch (error) {
    console.error('Error al crear usuario:', error);
    res.status(500).json({ mensaje: error.message });
  }
};

// Exporta ambas funciones para que puedan ser usadas en `app.js`
module.exports = { login, register };
