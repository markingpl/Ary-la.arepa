socket.on('nuevo-pedido', (pedidoData) => {
    const { abiertoDomicilio, abiertoMesa } = verificarEstadoServicios();
    
    const esDomicilio = (pedidoData.modalidad === 'Domicilio');
    const esLocalOMesaORecoger = (pedidoData.modalidad && (
      pedidoData.modalidad.includes('Local') || 
      pedidoData.modalidad.includes('Mesa') || 
      pedidoData.modalidad.includes('Recoger')
    ));

    // Bloqueo Domicilio (4:00 PM a 9:30 PM)
    if (esDomicilio && !abiertoDomicilio) {
      socket.emit('error-horario', { 
        mensaje: '⛔ El servicio de domicilios está cerrado. Nuestro horario de envíos es de 4:00 PM a 9:30 PM.' 
      });
      return;
    }

    // Bloqueo Mesa y Recoger (4:00 PM a 9:45 PM)
    if (esLocalOMesaORecoger && !abiertoMesa) {
      socket.emit('error-horario', { 
        mensaje: '⛔ La cocina ya cerró la recepción de comandas en mesa y para recoger por hoy (recibimos hasta las 9:45 PM).' 
      });
      return;
    }

    const nuevoPedido = registrarPedidoEnSistema(pedidoData);
    socket.emit('confirmacion-pedido', { id: nuevoPedido.id, numero: nuevoPedido.numero });
  });
