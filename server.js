// ========================================================
// CEREBRO DEL AGENTE IA DE WHATSAPP (CÁLIDO, CERCANO Y ANTOJADIZO)
// ========================================================
const sesionesBot = {};

function procesarMensajeAgente(celular, mensajeTexto) {
  const texto = mensajeTexto.trim().toLowerCase();
  const { abiertoDomicilio, abiertoMesa } = verificarEstadoServicios();

  if (!sesionesBot[celular]) {
    sesionesBot[celular] = {
      fase: 'INICIO',
      modoHumano: false,
      items: [],
      cliente: { nombre: '', direccion: '', barrio: '', celular: celular },
      metodoPago: 'Nequi / Bre-B'
    };
  }

  const sesion = sesionesBot[celular];

  // 1. MODO HUMANO EN PAUSA
  if (sesion.modoHumano) {
    if (texto === '#bot' || texto === 'menu' || texto === 'menú' || texto === 'hola') {
      sesion.modoHumano = false;
      return `🤖 ¡Hola de nuevo! Qué gusto saludarte. Ya reactivé mis funciones automáticas. Cuéntame, ¿qué se te antoja ordenar hoy? 🧀✨`;
    }
    return null;
  }

  // 2. ATENCIÓN HUMANA / ASESOR
  if (texto.includes('asesor') || texto.includes('humano') || texto.includes('persona') || texto.includes('alguien') || texto.includes('que me atienda alguien')) {
    sesion.modoHumano = true;
    return `🙋‍♂️ ¡Claro que sí, con todo el gusto del mundo! Ya mismo te pongo en contacto con una persona de nuestro equipo aquí en el local de Popayán.\n\nEn un momento toman este chat para atenderte personalmente. Si necesitas algo urgente, también puedes timbrarnos directamente al 📞 *321 5035691*.\n\n_(Pausé mis respuestas para que puedan hablar tranquilos. Si me necesitas de nuevo más tarde, solo escribe "#bot")_.`;
  }

  // 3. FOTOS DE LAS AREPAS Y REDES
  if (texto.includes('foto') || texto.includes('fotos') || texto.includes('imagen') || texto.includes('imagenes') || texto.includes('imágenes') || texto.includes('como se ven') || texto.includes('cómo se ven') || texto.includes('verlas') || texto.includes('instagram')) {
    return `📸 ¡Uff, claro que sí! Te aseguro que te vas a enamorar 🤤.\n\nPuedes ver todas las fotos reales en alta definición de nuestras arepas bañadas en queso fundido directamente aquí en nuestro menú interactivo:\n👉 *https://ary-la-arepa.onrender.com*\n\nÉchale un ojito a la *Campesina*, la *Doriloca* o la dulce de *Quipitos*... ¿cuál de todas te hace ojitos para preparártela hoy? ✨🧀`;
  }

  // 4. PREGUNTA DE PUNTOS VIP / FIDELIZACIÓN
  if (texto.includes('puntos') || texto.includes('fidelidad') || texto.includes('vip') || texto.includes('premio')) {
    const minPts = (DB.configPuntos && DB.configPuntos.puntosMinimosParaCanje) || 5;
    const valorDesc = (DB.configPuntos && DB.configPuntos.valorDescuentoCanje) || 5000;
    return `⭐ *¡Nos encanta premiar a nuestros clientes fieles!* 🎉\n\nPor cada arepa que pides con tu número de celular, acumulas puntos automáticamente:\n• Al llegar a *${minPts} puntos*, ¡recibes *$${valorDesc.toLocaleString()} de descuento* directo en tu siguiente pedido!\n\nPregúntame cuando quieras cuántos puntos llevas acumulados con nosotros 😊.`;
  }

  // 5. CANCELACIÓN DE PEDIDOS (AMABLE Y EMPÁTICA)
  if (texto.includes('cancelar') || texto.includes('cancelo') || texto.includes('anular') || texto.includes('ya no quiero')) {
    const ultimoPedido = DB.pedidos.find(p => p.cliente && p.cliente.celular === celular && p.estado !== 'CANCELADO' && p.estado !== 'ENTREGADO');
    if (ultimoPedido) {
      if (ultimoPedido.estado === 'PENDIENTE') {
        ultimoPedido.estado = 'CANCELADO';
        devolverInventarioCancelado(ultimoPedido.items || [], ultimoPedido.modalidad);
        guardarDB();
        io.emit('estado-actualizado', { id: ultimoPedido.id, nuevoEstado: 'CANCELADO', pedido: ultimoPedido });
        delete sesionesBot[celular];
        return `🙌 ¡Entendido de una! No te preocupes para nada, ya cancelé tu pedido *${ultimoPedido.numero}* y le avisé a los chicos de la cocina para que no lo preparen.\n\nSi ya habías hecho la transferencia por Nequi/Bre-B, escríbenos porfa para devolverte el dinero sin problema. ¡Esperamos consentirte en una próxima ocasión! ❤️`;
      } else {
        return `⚠️ ¡Ay! Tu pedido *${ultimoPedido.numero}* ya está en la plancha con el quesito derretido 🔥 o empacándose.\n\nPorfa llámanos de una al 📞 *321 5035691* para revisar si alcanzamos a frenarlo con el domiciliario.`;
      }
    } else {
      return `Tranquilo(a), revisé en el sistema y no tienes ningún pedido activo en este momento. Si necesitas algo más, aquí estoy con todo el gusto.`;
    }
  }

  // 6. OPCIONES VEGETARIANAS
  if (texto.includes('vegetariano') || texto.includes('vegetariana') || texto.includes('sin carne') || texto.includes('vegano')) {
    return `🌱 *¡Por supuesto que sí! Pensamos en todos los gustos y te va a encantar.*\n\nNuestra base es de *arepa agridulce artesanal rellena de abundante queso y bañada en queso fundido caliente* 🧀🤤.\n\nPuedes pedir la *Arepa Sola con Queso ($7.000)* y consentirla con nuestros extras 100% vegetarianos:\n• 🥑 Guacamole fresco y cremoso ($2.000)\n• 🍅 Pico de gallo recién picado ($2.000)\n• 🌽 Totopos crocantes de Doritos ($2.000)\n• 🍍 Piña calada dulce de la casa ($2.000)\n• 🌶️ Jalapeños para los que les gusta el picante ($2.000)\n• 🥚 Huevitos de codorniz ($1.000)\n• 🧀 O doble capa de queso extra ($5.000)\n\n¡Y si te gusta el dulce, nuestra arepa de *Quipitos con arequipe y leche condensada ($16.500)* no tiene carne y es una locura! ¿Te animas a probarla? ✨`;
  }

  // 7. HORARIOS Y UBICACIÓN
  if (texto.includes('horario') || texto.includes('hora') || texto.includes('abierto') || texto.includes('cierran')) {
    return `🕒 ¡Con gusto te cuento! En Popayán atendemos todos los días:\n🛵 *Domicilios:* De 4:00 PM a 9:30 PM\n🍽️ *En Mesa y para Llevar:* De 4:00 PM a 9:45 PM\n\n${abiertoDomicilio ? '🟢 ¡En este momento tenemos la plancha prendida y estamos listos para atenderte!' : '🔴 Ahorita la cocina está en descanso, pero a las 4:00 PM arrancamos con toda.'}`;
  }

  if (texto.includes('donde estan') || texto.includes('dónde están') || texto.includes('ubicacion') || texto.includes('ubicación') || texto.includes('direccion')) {
    return `📍 ¡Nos encantaría que nos visites! Estamos en Popayán en la *Cra 7 #10N-22 B, Prados del Norte (dentro de WokHouse)* 🍽️.\n\nY si no quieres salir de casa, ¡te lo llevamos calientito hasta tu puerta! 🛵💨`;
  }

  if (texto.includes('tiempo') || texto.includes('cuanto demora') || texto.includes('cuánto tarda')) {
    return `🛵 Normalmente nos tardamos entre *30 y 45 minuticos*, porque cada arepa se asa y se baña en queso al momento para que te llegue humeando a la mesa. ¡Te prometemos que la espera vale totalmente la pena! 🤤`;
  }

  // 8. CONSULTA DE ESTADO
  if (texto.includes('estado') || texto.includes('mi pedido') || texto.includes('como va') || texto.includes('cómo va')) {
    const ultimoPedido = DB.pedidos.find(p => p.cliente && p.cliente.celular === celular && p.estado !== 'CANCELADO');
    if (ultimoPedido) {
      let estadoTexto = '';
      if (ultimoPedido.estado === 'PENDIENTE') estadoTexto = '🕒 Ya entró a la comanda y está en cola de cocina.';
      else if (ultimoPedido.estado === 'PREPARANDO') estadoTexto = '🔥 ¡Tus arepas ya están en la plancha bañándose en queso!';
      else if (ultimoPedido.estado === 'LISTO') estadoTexto = '🛵 ¡Tu pedido ya quedó empacado y va saliendo con el motorizado!';
      else estadoTexto = '✅ Ya aparece como entregado. ¡Esperamos que te haya gustado muchísimo!';

      return `👋 ¡Hola de nuevo! Tu pedido *${ultimoPedido.numero}* va así:\n\n*Estado:* ${ultimoPedido.estado}\n${estadoTexto}\n\n*Total:* $${ultimoPedido.total.toLocaleString()}`;
    } else {
      return `Revisé y no encontré ningún pedido activo con tu número. Si quieres que te preparemos algo delicioso, solo dime: *"Quiero ver el menú"* 😊.`;
    }
  }

  // 9. MENÚ COMPLETO
  if (texto.includes('menu') || texto.includes('menú') || texto.includes('carta') || texto.includes('precios') || texto.includes('que hay')) {
    let respuestaMenu = `🧀 *¡AQUÍ TIENES NUESTRO MENÚ COMPLETO!* 🤤\n_Todas van con base de arepa agridulce y abundante queso fundido:_\n\n`;
    DB.productos.forEach((p, idx) => {
      respuestaMenu += `*${idx + 1}. ${p.nombre}* • $${p.precio.toLocaleString()}\n_${p.desc}_\n\n`;
    });
    respuestaMenu += `🥤 *Bebidas frías:* Coca-Cola Cero, Manzana, Colombiana, Pepsi, Pony Mini ($3.000) y Agua ($2.000).\n\n`;
    
    if (!abiertoDomicilio) {
      respuestaMenu += `🕒 _Nota con cariño:_ Recuerda que abrimos cocina a las *4:00 PM*. ¡Puedes ir escogiendo tus favoritas desde ya! ✨`;
    } else {
      respuestaMenu += `👉 *¿Cuál te antojó más?* Solo escríbeme el nombre (ejemplo: _"Quiero una Campesina y una Coca-Cola"_).`;
    }
    return respuestaMenu;
  }

  // ==========================================
  // RESPUESTA CÁLIDA CUANDO ESTÁ CERRADO
  // ==========================================
  if (!abiertoDomicilio) {
    if (abiertoMesa) {
      return `¡Hola! 👋 Qué gusto que nos escribas. Te cuento que por hoy el servicio de *domicilios ya cerró* (va hasta las 9:30 PM).\n\n🍽️ *¡Pero aún alcanzamos a atenderte en nuestro local de Prados del Norte hasta las 9:45 PM!* O si prefieres, puedes revisar el *"Menú"* y dejarnos tu antojo listo para mañana a las 4:00 PM 🧀✨.`;
    } else {
      return `🌙 *¡Hola! Qué gusto saludarte.* En este momento nuestra cocina se encuentra descansando para tener todo fresquito mañana.\n\n🕒 *Nuestros horarios en Popayán son:*\n🛵 Domicilios: 4:00 PM a 9:30 PM\n🍽️ En local: 4:00 PM a 9:45 PM\n\n📖 *¡Pero no te quedes con las ganas de ver las delicias que tenemos!*\n• Escribe *"Menú"* para antojarte con la carta y precios.\n• O mira las fotos reales aquí: *https://ary-la-arepa.onrender.com*\n\n¡Mañana desde las 4:00 PM te esperamos con los brazos abiertos y el queso bien caliente! 🧀❤️`;
    }
  }

  // ==========================================
  // FLUJO DE TOMA DE PEDIDO CON ANTOJO
  // ==========================================
  let productoEncontrado = DB.productos.find(p => texto.includes(p.nombre.toLowerCase()));
  let bebidaEncontrada = DB.bebidas.find(b => texto.includes(b.nombre.toLowerCase().split(' ')[0]));

  if (productoEncontrado) {
    sesion.items.push({ id: productoEncontrado.id, nombre: productoEncontrado.nombre, precio: productoEncontrado.precio, extras: [], notas: '' });
    sesion.fase = 'ARMANDO_PEDIDO';
    return `🤤 *¡Uff, excelente elección!* La *${productoEncontrado.nombre}* es de las más pedidas de la casa.\n\nTe anoté:\n• *1x Arepa ${productoEncontrado.nombre}* ($${productoEncontrado.precio.toLocaleString()}) 🧀\n\n¿Te gustaría consentirte con algo más? (Tenemos adición de tocineta crocante, queso extra fundido o una bebida bien fría para acompañar).\n\nSi ya estás listo(a), avísame escribiendo: *"Listo"* o *"Ya"* para tomar tus datos de entrega calientita 🛵💨.`;
  }

  if (bebidaEncontrada && sesion.items.length > 0) {
    sesion.items.push({ id: bebidaEncontrada.id, nombre: bebidaEncontrada.nombre, precio: bebidaEncontrada.precio, extras: [], notas: '' });
    return `🥤 ¡De una! Agregué *${bebidaEncontrada.nombre}* ($${bebidaEncontrada.precio.toLocaleString()}) bien fría a tu orden.\n\n¿Deseas agregar alguna otra arepa o escribes *"Listo"* para tomarte la dirección?`;
  }

  if ((texto.includes('listo') || texto.includes('eso es todo') || texto.includes('ya')) && sesion.items.length > 0) {
    sesion.fase = 'PIDIENDO_DATOS';
    const subtotal = sesion.items.reduce((a, b) => a + b.precio, 0);
    return `📋 *¡Perfecto! Ya casi tenemos todo listo para prender la plancha:*
${sesion.items.map(i => `• 1x ${i.nombre} ($${i.precio.toLocaleString()})`).join('\n')}
*Subtotal arepas:* $${subtotal.toLocaleString()}

Para que el domiciliario llegue derechito y sin demoras a tu puerta en Popayán, porfa regálame en un solo mensajito:
1. *Tu Nombre completo*
2. *Dirección exacta* (casa, torre o apto)
3. *Tu Barrio* (ej: Ciudad Jardín, Prados del Norte, Centro...)`;
  }

  if (sesion.fase === 'PIDIENDO_DATOS') {
    let barrioDetectado = DB.barrios.find(b => texto.includes(b.nombre.toLowerCase().split(' ')[0]));
    if (!barrioDetectado) barrioDetectado = DB.barrios[0];

    sesion.cliente.nombre = mensajeTexto.split('\n')[0] || 'Cliente WhatsApp';
    sesion.cliente.direccion = mensajeTexto;
    sesion.cliente.barrio = barrioDetectado.nombre;
    sesion.costoEnvio = barrioDetectado.costo;

    sesion.fase = 'CONFIRMANDO';
    const subtotal = sesion.items.reduce((a, b) => a + b.precio, 0);
    const total = subtotal + sesion.costoEnvio;

    return `📍 *¡Súper! Anoté tu entrega en:* ${sesion.cliente.barrio} (Costo de envío: $${sesion.costoEnvio.toLocaleString()})
💰 *VALOR TOTAL A PAGAR:* $${total.toLocaleString()}

¿Cómo te queda más cómodo pagar hoy?
1️⃣ *QR Bre-B / Nequi / Bancolombia*
2️⃣ *Efectivo contra entrega*

_(Respóndeme con el número *"1"* o *"2"* para mandar la comanda a la cocina ya mismo)_.`;
  }

  if (sesion.fase === 'CONFIRMANDO') {
    const metodo = (texto === '2' || texto.includes('efectivo')) ? 'Efectivo' : 'Nequi / Bre-B';
    const subtotal = sesion.items.reduce((a, b) => a + b.precio, 0);
    const total = subtotal + sesion.costoEnvio;

    const nuevoPedido = registrarPedidoEnSistema({
      cliente: sesion.cliente,
      modalidad: 'Domicilio',
      items: sesion.items,
      metodoPago: metodo,
      subtotal: subtotal,
      costoEnvio: sesion.costoEnvio,
      total: total,
      origen: 'WhatsApp IA'
    });

    delete sesionesBot[celular];

    let respuestaFinal = `🎉 *¡LISTO! TU PEDIDO ESTÁ CONFIRMADO*\n\n`;
    respuestaFinal += `Orden: *${nuevoPedido.numero}*\n`;
    respuestaFinal += `Total a pagar: *$${total.toLocaleString()}*\n`;
    respuestaFinal += `Método elegido: *${metodo}*\n\n`;

    if (metodo.includes('Nequi') || metodo.includes('Bre-B')) {
      respuestaFinal += `📲 *Aquí tienes los daticos para tu transferencia:*\n`;
      respuestaFinal += `• Número Nequi / Llave Bre-B: *321 5035691*\n`;
      respuestaFinal += `• Titular: *Ary la arepa*\n\n`;
      respuestaFinal += `Porfa cuando hagas el pago, envíame la fotico del comprobante por aquí para despacharte sin demora.`;
    } else {
      respuestaFinal += `💵 El motorizado llevará el cambio necesario para recibirte en efectivo en tu puerta.`;
    }

    respuestaFinal += `\n\n👨‍🍳 La campana ya sonó en la cocina y tus arepas empezaron a asarse. ¡Mil gracias por preferirnos y que disfrutes muchísimo tu comida! 🧀✨`;
    return respuestaFinal;
  }

  // 10. SALUDO DE BIENVENIDA NATURAL
  if (['hola', 'buenas', 'buenos dias', 'buenas tardes', 'buenas noches', 'hey'].includes(texto)) {
    return `👋 ¡Hola! Qué alegría saludarte. Bienvenido(a) a *Ary la arepa* Popayán 🧀✨ (De Popayán para el mundo).\n\nSoy tu asistente virtual y hoy tenemos la plancha lista con las arepas más brutales y cargadas de queso derretido. ¿Qué se te antoja probar hoy? 🤤\n\n1️⃣ Escribe *"Menú"* para ver la carta completa y precios.\n2️⃣ Escribe *"Fotos"* para ver cómo lucen de provocativas.\n3️⃣ Escribe *"Asesor"* si prefieres que te atienda una persona de nuestro equipo.\n4️⃣ O simplemente dime qué deseas pedir (ejemplo: _"Quiero una arepa Campesina"_).`;
  }

  // 11. FALLBACK HUMILDE Y SERVICIAL (SI NO COMPRENDIÓ)
  return `Ay, discúlpame de corazón 🙈, como soy el asistente virtual no alcancé a entender bien ese mensajito.\n\n👉 Si deseas que te atienda una *persona de nuestro equipo* aquí en el local, escribe *"Asesor"* o llámanos con toda confianza al 📞 *321 5035691*.\n\n👉 Y si quieres ver nuestras arepas y precios, escríbeme *"Menú"* y con gusto te lo comparto 🧀✨.`;
}
