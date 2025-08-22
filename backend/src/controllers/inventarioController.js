// controllers/inventarioController.js
const Inventario = require('../models/inventario');

exports.createProducto = async (req, res) => {
  try {
    const {
      nombre, descripcion, categoria,
      cantidadDisponible, unidadDeMedida,
      precioUnitario, fechaIngreso
    } = req.body;

    if (!nombre || !descripcion || !categoria || cantidadDisponible == null || !unidadDeMedida || precioUnitario == null) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const inventario = new Inventario({
      nombre, descripcion, categoria,
      cantidadDisponible, unidadDeMedida,
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

exports.getProductos = async (req, res) => {
  try {
    const { q = '' } = req.query;
    const where = q
      ? { $or: [
          { nombre:      { $regex: q, $options: 'i' } },
          { categoria:   { $regex: q, $options: 'i' } },
          { codigo:      { $regex: q, $options: 'i' } },
          { descripcion: { $regex: q, $options: 'i' } },
        ] }
      : {};
    const productos = await Inventario.find(where).lean();
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getProductoById = async (req, res) => {
  try {
    const p = await Inventario.findById(req.params.id).lean();
    if (!p) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.buscarPorCodigo = async (req, res) => {
  try {
    const { codigo } = req.params;
    const p = await Inventario.findOne({ codigo }).lean();
    if (!p) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(p);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const {
      nombre, descripcion, categoria,
      cantidadDisponible, unidadDeMedida,
      precioUnitario, fechaIngreso
    } = req.body;

    const producto = await Inventario.findByIdAndUpdate(
      id,
      { nombre, descripcion, categoria, cantidadDisponible, unidadDeMedida, precioUnitario, fechaIngreso },
      { new: true, runValidators: true }
    );

    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Inventario.findByIdAndDelete(id);
    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
