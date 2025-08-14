const jwt = require('jsonwebtoken');
const Usuario = require('../models/usuario');  // Asegúrate de tener el modelo Usuario

// Función para iniciar sesión
const login = async (req, res) => {
  const { correo, contrasena } = req.body;
  console.log("Correo:", correo, "Contraseña:", contrasena);  // Asegúrate de que estos valores no sean undefined

  try {
    const usuario = await Usuario.findOne({ correo });

    if (!usuario) {
      return res.status(400).json({ mensaje: 'Correo no encontrado' });
    }

    // Verifica si la contraseña es válida
    const esValida = await usuario.compararContrasena(contrasena);
    console.log("Contraseña válida:", esValida);  // Verifica si la comparación fue exitosa

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
    const usuarioExistente = await Usuario.findOne({ correo });
    if (usuarioExistente) {
      return res.status(400).json({ mensaje: 'Correo ya registrado' });
    }

    // Crear un nuevo usuario
    const nuevoUsuario = new Usuario({
      nombreCompleto,
      correo,
      contrasena,  // La contraseña será en texto claro, se hasheará automáticamente al guardarlo
      telefono,
      carnetIdentidad,
      rol
    });

    // Guardar el nuevo usuario en la base de datos
    await nuevoUsuario.save();

    // Responder con el nuevo usuario (sin la contraseña)
    return res.status(201).json({
      mensaje: 'Usuario registrado exitosamente',
      usuario: {
        _id: nuevoUsuario._id,
        nombreCompleto: nuevoUsuario.nombreCompleto,
        correo: nuevoUsuario.correo,
        rol: nuevoUsuario.rol
      }
    });
  } catch (error) {
    console.error('Error al registrar usuario:', error);
    return res.status(500).json({ mensaje: 'Error interno del servidor', error: error.message });
  }
};

module.exports = { login, register };
