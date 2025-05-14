const Inventario = require('../models/inventario');

// Crear un nuevo producto en inventario
exports.createProducto = async (req, res) => {
  try {
    const { nombre, cantidad, descripcion } = req.body;
    const inventario = new Inventario({
      nombre,
      cantidad,
      descripcion
    });
    await inventario.save();
    res.status(201).json(inventario);
  } catch (error) {
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
    const { nombre, cantidad, descripcion } = req.body;
    const producto = await Inventario.findByIdAndUpdate(id, { nombre, cantidad, descripcion }, { new: true });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un producto del inventario
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    await Inventario.findByIdAndDelete(id);
    res.status(200).json({ message: 'Producto eliminado' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
