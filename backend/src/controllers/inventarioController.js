const Inventario = require('../models/inventario');

// Crear un nuevo producto en inventario
exports.createProducto = async (req, res) => {
  try {
    const {
      nombre,
      descripcion,
      categoria,
      cantidadDisponible,
      unidadDeMedida,
      precioUnitario,
      fechaIngreso
    } = req.body;

    // Agregar log para verificar los datos recibidos
    console.log(req.body);

    // Verifica que todos los campos estén presentes
    if (!nombre || !descripcion || !categoria || cantidadDisponible == null || !unidadDeMedida || precioUnitario == null) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const inventario = new Inventario({
      nombre,
      descripcion,
      categoria,
      cantidadDisponible,
      unidadDeMedida,
      precioUnitario,
      fechaIngreso: fechaIngreso || Date.now()
    });

    await inventario.save();
    res.status(201).json(inventario);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ message: error.message });
  }
};

// Obtener todos los productos en inventario
exports.getProductos = async (req, res) => {
  try {
    const productos = await Inventario.find();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un producto en inventario
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre,
      descripcion,
      categoria,
      cantidadDisponible,
      unidadDeMedida,
      precioUnitario,
      fechaIngreso
    } = req.body;

    const producto = await Inventario.findByIdAndUpdate(
      id,
      {
        nombre,
        descripcion,
        categoria,
        cantidadDisponible,
        unidadDeMedida,
        precioUnitario,
        fechaIngreso
      },
      { new: true, runValidators: true }
    );

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un producto en inventario
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Inventario.findByIdAndDelete(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
