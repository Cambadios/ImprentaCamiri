const Pedido = require('../models/pedido');
const Inventario = require('../models/inventario');

exports.entregarPedido = async (req, res) => {
  try {
    const { pedidoId, cantidadProductos } = req.body;

    // Obtener el pedido
    const pedido = await Pedido.findById(pedidoId).populate('productos.material');

    if (!pedido) {
      return res.status(404).json({ message: 'Pedido no encontrado' });
    }

    // Descontar materiales solo cuando el pedido sea entregado
    for (let i = 0; i < pedido.productos.length; i++) {
      const producto = pedido.productos[i];
      const cantidadAjuste = producto.material.cantidadPorUnidad * cantidadProductos;

      // Buscar el material en inventario
      const material = await Inventario.findById(producto.material._id);

      if (!material || material.cantidadDisponible < cantidadAjuste) {
        return res.status(400).json({ message: `No hay suficiente cantidad de ${material.nombre} en inventario` });
      }

      // Descontar el material del inventario
      material.cantidadDisponible -= cantidadAjuste;
      await material.save();
    }

    // Actualizar el estado del pedido a "entregado"
    pedido.estado = 'entregado';
    await pedido.save();

    res.status(200).json({ message: 'Pedido entregado y materiales descontados' });
  } catch (error) {
    console.error("Error al entregar pedido:", error.message);
    res.status(500).json({ message: error.message });
  }
};

