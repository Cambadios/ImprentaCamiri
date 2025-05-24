const Producto = require('../models/producto');

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precioUnitario, categoria, materiales } = req.body;

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precioUnitario,
      categoria,
      materiales,
    });

    await nuevoProducto.save();
    res.status(201).json(nuevoProducto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos
exports.getProductos = async (req, res) => {
  try {
    // Consultar productos y usar .populate() para obtener solo los nombres de los materiales
    const productos = await Producto.find()
      .populate({
        path: 'materiales',
        select: 'nombre'  // Aquí seleccionamos solo el campo 'nombre' de los materiales
      });

    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precioUnitario, categoria, materiales } = req.body;

    const productoActualizado = await Producto.findByIdAndUpdate(
      id,
      { nombre, descripcion, precioUnitario, categoria, materiales },
      { new: true, runValidators: true }
    );

    if (!productoActualizado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(productoActualizado);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;

    // Intentar encontrar el producto por ID y eliminarlo
    const productoEliminado = await Producto.findByIdAndDelete(id);

    // Si no se encuentra el producto, devolver un error
    if (!productoEliminado) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    // Enviar respuesta exitosa con el producto eliminado
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
