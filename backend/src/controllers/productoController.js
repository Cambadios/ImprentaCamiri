const Producto = require('../models/producto');
const Inventario = require('../models/inventario');

// Crear un nuevo producto
exports.createProducto = async (req, res) => {
  try {
    const { nombre, descripcion, precioUnitario, materiales, categoriaId } = req.body;

    if (!nombre || !descripcion || precioUnitario == null || !materiales || !categoriaId) {
      return res.status(400).json({ message: 'Todos los campos son requeridos' });
    }

    const nuevoProducto = new Producto({
      nombre,
      descripcion,
      precioUnitario,
      materiales,
      categoria: categoriaId
    });

    await nuevoProducto.save();
    const populated = await Producto.findById(nuevoProducto._id)
      .populate('categoria', 'nombre prefijo tipo')
      .populate('materiales.material', 'nombre unidadDeMedida');
    res.status(201).json(populated);
  } catch (error) {
    console.error("Error al crear producto:", error.message);
    res.status(500).json({ message: "Hubo un error al crear el producto", error: error.message });
  }
};

// Obtener todos los productos
exports.getProductos = async (req, res) => {
  try {
    const productos = await Producto.find()
      .populate('categoria', 'nombre prefijo tipo')
      .populate('materiales.material');
    res.status(200).json(productos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Actualizar un producto
exports.updateProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const { nombre, descripcion, precioUnitario, materiales, categoriaId } = req.body;

    const update = { nombre, descripcion, precioUnitario, materiales };
    if (categoriaId) update.categoria = categoriaId;

    const producto = await Producto.findByIdAndUpdate(
      id,
      update,
      { new: true, runValidators: true }
    ).populate('categoria', 'nombre prefijo tipo');

    if (!producto) return res.status(404).json({ message: 'Producto no encontrado' });
    res.status(200).json(producto);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Eliminar un producto
exports.deleteProducto = async (req, res) => {
  try {
    const { id } = req.params;
    const producto = await Producto.findByIdAndDelete(id);

    if (!producto) {
      return res.status(404).json({ message: 'Producto no encontrado' });
    }

    res.status(200).json({ message: 'Producto eliminado correctamente' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
