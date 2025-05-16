const mongoose = require('mongoose');
const Usuario = require('./models/usuario'); // Ajusta ruta si es necesario

mongoose.connect('mongodb+srv://sergiouriona:sergio21@cluster0.ysvwmag.mongodb.net/imprentacamiri?retryWrites=true&w=majority', {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Conectado a MongoDB Atlas');
  actualizarUsuariosSinRol();
}).catch(error => {
  console.error('Error conectando a MongoDB:', error);
});

async function actualizarUsuariosSinRol() {
  try {
    const result = await Usuario.updateMany(
      { rol: { $exists: false } },
      { $set: { rol: 'usuario_normal' } }
    );
    console.log(`${result.modifiedCount} usuarios actualizados con rol por defecto.`);
  } catch (error) {
    console.error('Error actualizando usuarios:', error);
  } finally {
    mongoose.disconnect();
  }
}
