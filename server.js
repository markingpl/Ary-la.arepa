const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

const DATA_FILE = path.join(__dirname, 'data.json');

const DB_DEFAULT = {
  info: {
    nombre: "Ary la arepa",
    eslogan: "De Popayán para el mundo",
    base: "Base de Arepa agridulce, rellena con abundante queso y bañada en queso fundido",
    direccion: "Cra 7 #10N-22 B, Prados del Norte en WokHouse",
    telefono: "3215035691",
    nit: "1061789456-1",
    horario: "4:00 PM a 10:00 PM"
  },
  usuarios: [
    { id: 1, usuario: 'admin', clave: '1234', nombre: 'Administrador', rol: 'ADMIN' },
    { id: 2, usuario: 'cajero1', clave: '2024', nombre: 'Cajero Principal', rol: 'CAJERO' }
  ],
  clientesFrecuentes: [
    { id: 1, nombre: 'Juan Camilo', celular: '3110000000', direccion: 'Cra 9 # 12N-45', barrio: 'Ciudad Jardín', pedidos: 4 }
  ],
  barrios: [
    { nombre: 'Prados del Norte (Local)', costo: 2000 },
    { nombre: 'Bello Horizonte', costo: 4000 },
    { nombre: 'Ciudad Jardín', costo: 4000 },
    { nombre: 'Centro / Parque Caldas', costo: 4500 },
    { nombre: 'La Pamba / Pomona', costo: 5000 },
    { nombre: 'La Esmeralda', costo: 4500 },
    { nombre: 'Pandiguando', costo: 4500 },
    { nombre: 'Valencia', costo: 4500 },
    { nombre: 'Palacé / Villa del Viento', costo: 6000 },
    { nombre: 'Santa Clara / Los Hoyos', costo: 4000 }
  ],
  productos: [
    { id: 1, cat: 'arepas', nombre: 'Campesina', desc: 'Chorizo ahumado • carne desmechada • guacamole • salsas de la casa', precio: 26000, img: '/img/campesina.png' },
    { id: 2, cat: 'arepas', nombre: 'Doriloca', desc: 'Doritos • pico de gallo • carne desmechada • guacamole • salsas de la casa', precio: 25000, img: '/img/doriloca.png' },
    { id: 3, cat: 'arepas', nombre: 'Ranchera', desc: 'Pollo desmechado • salchicha ranchera • huevo de codorniz • salsas de la casa', precio: 24000, img: '/img/ranchera.png' },
    { id: 4, cat: 'arepas', nombre: 'Tocineta', desc: 'Tocineta ahumada • pollo desmechado • salsas de la casa', precio: 23000, img: '/img/tocineta.png' },
    { id: 5, cat: 'arepas', nombre: 'Mexicana', desc: 'Carne desmechada • jalapeños • totopos • guacamole • salsas de la casa', precio: 22000, img: '/img/mexicana.png' },
    { id: 6, cat: 'arepas', nombre: 'Hawaiana', desc: 'Tiras de jamón ahumado • piña calada • lonchas de jamón • salsas de la casa', precio: 17500, img: '/img/hawaiana.png' },
    { id: 7, cat: 'arepas', nombre: 'Quipitos', desc: 'Quipitos • leche condensada • arequipe', precio: 16500, img: '/img/quipitos.png' }
  ],
  extras: [
    { id: 'ex-1', nombre: 'Ranchera', precio: 5000 },
    { id: 'ex-2', nombre: 'Carne desmechada', precio: 4500 },
    { id: 'ex-3', nombre: 'Chorizo', precio: 4000 },
    { id: 'ex-4', nombre: 'Pollo desmechado', precio: 3000 },
    { id: 'ex-5', nombre: 'Tocineta', precio: 2000 },
    { id: 'ex-6', nombre: 'Jamón', precio: 2000 },
    { id: 'ex-7', nombre: 'Piña Calada', precio: 2000 },
    { id: 'ex-8', nombre: 'Pico de Gallo', precio: 2000 },
    { id: 'ex-9', nombre: 'Doritos', precio: 2000 },
    { id: 'ex-10', nombre: 'Guacamole', precio: 2000 },
    { id: 'ex-11', nombre: 'Huevo x2', precio: 1000 },
    { id: 'ex-12', nombre: 'Quipito', precio: 1000 },
    { id: 'ex-13', nombre: 'Queso extra', precio: 5000 },
    { id: 'ex-14', nombre: 'Arepa sola', precio: 7000 }
  ],
  bebidas: [
    { id: 101, nombre: 'Coca-Cola Cero 250ml', precio: 3000 },
    { id: 102, nombre: 'Manzana Cero 250ml', precio: 3000 },
    { id: 103, nombre: 'Colombiana Cero 250ml', precio: 3000 },
    { id: 104, nombre: 'Pepsi Cero 250ml', precio: 3000 },
    { id: 105, nombre: 'Pony Mini', precio: 3000 },
    { id: 106, nombre: 'Agua', precio: 2000 }
  ],
  pedidos: [],
  contadorPedido: 0,
  turnoActual: null,
  historialTurnos: []
};

let DB = DB_DEFAULT;
if (fs.existsSync(DATA_FILE)) {
  try {
    DB = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
  } catch (e) {
    DB = DB_DEFAULT;
  }
} else {
  fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2));
}

function guardarDB() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2));
  } catch (err) {
    console.error("Error al guardar data.json:", err);
  }
}

app.get('/api/data-inicial', (req, res) => res.json(DB));
app.get('/api/pedidos', (req, res) => res.json(DB.pedidos));

// Modificaciones de Menú y Domicilios
app.post('/api/admin/barrios', (req, res) => {
  if (Array.isArray(req.body.barrios)) {
    DB.barrios = req.body.barrios;
    guardarDB();
    res.json({ ok: true, barrios: DB.barrios });
  } else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/productos', (req, res) => {
  if (Array.isArray(req.body.productos)) {
    DB.productos = req.body.productos;
    guardarDB();
    res.json({ ok: true, productos: DB.productos });
  } else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/extras', (req, res) => {
  if (Array.isArray(req.body.extras)) {
    DB.extras = req.body.extras;
    guardarDB();
    res.json({ ok: true, extras: DB.extras });
  } else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/bebidas', (req, res) => {
  if (Array.isArray(req.body.bebidas)) {
    DB.bebidas = req.body.bebidas;
    guardarDB();
    res.json({ ok: true, bebidas: DB.bebidas });
  } else res.status(400).json({ error: 'Inválido' });
});

// Usuarios POS
app.get('/api/usuarios', (req, res) => res.json(DB.usuarios));
app.post('/api/usuarios', (req, res) => {
  const { usuario, clave, nombre } = req.body;
  if (!usuario || !clave || !nombre) return res.status(400).json({ error: 'Campos requeridos' });
  const existe = DB.usuarios.find(u => u.usuario.toLowerCase() === usuario.trim().toLowerCase());
  if (existe) return res.status(400).json({ error: 'Usuario ya existe' });

  const nuevo = { id: Date.now(), usuario: usuario.trim().toLowerCase(), clave: clave.trim(), nombre: nombre.trim(), rol: 'CAJERO' };
  DB.usuarios.push(nuevo);
  guardarDB();
  res.json({ ok: true, usuario: nuevo });
});

app.delete('/api/usuarios/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = DB.usuarios.findIndex(u => u.id === id);
  if (idx === -1) return res.status(404).json({ error: 'No encontrado' });
  if (DB.usuarios[idx].rol === 'ADMIN') return res.status(403).json({ error: 'No se puede borrar al administrador' });
  DB.usuarios.splice(idx, 1);
  guardarDB();
  res.json({ ok: true });
});

app.post('/api/cajero/login', (req, res) => {
  const { usuario, clave } = req.body;
  const user = DB.usuarios.find(u => u.usuario.toLowerCase() === usuario.trim().toLowerCase() && u.clave === clave.trim());
  if (user) res.json({ ok: true, usuario: { id: user.id, nombre: user.nombre, rol: user.rol } });
  else res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
});

app.post('/api/caja/abrir', (req, res) => {
  const { cajeroNombre, baseInicial } = req.body;
  DB.turnoActual = {
    id: `TURNO-${Date.now()}`,
    cajero: cajeroNombre,
    baseInicial: parseFloat(baseInicial) || 0,
    horaApertura: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fecha: new Date().toLocaleDateString('es-CO'),
    estado: 'ABIERTA'
  };
  guardarDB();
  res.json({ ok: true, turno: DB.turnoActual });
});

app.get('/api/caja/resumen', (req, res) => {
  if (!DB.turnoActual) return res.json({ turnoActivo: false });
  const pedidosTurno = DB.pedidos.filter(p => p.turnoId === DB.turnoActual.id && p.estado !== 'CANCELADO');
  const ventasEfectivo = pedidosTurno.filter(p => p.metodoPago === 'Efectivo').reduce((a, b) => a + b.total, 0);
  const ventasDigital = pedidosTurno.filter(p => p.metodoPago.includes('Nequi') || p.metodoPago.includes('Bre-B') || p.metodoPago.includes('Transferencia')).reduce((a, b) => a + b.total, 0);

  res.json({
    turnoActivo: true,
    turno: DB.turnoActual,
    ventasEfectivo,
    ventasDigital,
    totalVentas: ventasEfectivo + ventasDigital,
    totalEnCajaEsperado: DB.turnoActual.baseInicial + ventasEfectivo,
    totalPedidos: pedidosTurno.length
  });
});

app.post('/api/caja/cerrar', (req, res) => {
  if (!DB.turnoActual) return res.status(400).json({ error: 'No hay turno activo' });
  const pedidosTurno = DB.pedidos.filter(p => p.turnoId === DB.turnoActual.id && p.estado !== 'CANCELADO');
  const ventasEfectivo = pedidosTurno.filter(p => p.metodoPago === 'Efectivo').reduce((a, b) => a + b.total, 0);
  const ventasDigital = pedidosTurno.filter(p => p.metodoPago.includes('Nequi') || p.metodoPago.includes('Bre-B') || p.metodoPago.includes('Transferencia')).reduce((a, b) => a + b.total, 0);

  const turnoCerrado = {
    ...DB.turnoActual,
    horaCierre: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estado: 'CERRADA',
    ventasEfectivo,
    ventasDigital,
    totalVentas: ventasEfectivo + ventasDigital,
    totalCajaEsperado: DB.turnoActual.baseInicial + ventasEfectivo
  };

  DB.historialTurnos.unshift(turnoCerrado);
  DB.turnoActual = null;
  guardarDB();
  res.json({ ok: true, resumenCierre: turnoCerrado });
});

// Función creadora de pedidos
function registrarPedidoEnSistema(pedidoData) {
  DB.contadorPedido++;
  const now = new Date();
  const nuevoPedido = {
    id: `ORD-${Date.now()}`,
    numero: `#${String(DB.contadorPedido).padStart(3, '0')}`,
    fecha: now.toLocaleDateString('es-CO'),
    hora: now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    timestamp: Date.now(),
    estado: 'PENDIENTE',
    turnoId: DB.turnoActual ? DB.turnoActual.id : null,
    ...pedidoData
  };

  if (pedidoData.cliente && pedidoData.cliente.celular) {
    const idx = DB.clientesFrecuentes.findIndex(c => c.celular === pedidoData.cliente.celular);
    if (idx >= 0) {
      DB.clientesFrecuentes[idx].pedidos += 1;
      DB.clientesFrecuentes[idx].direccion = pedidoData.cliente.direccion;
      DB.clientesFrecuentes[idx].barrio = pedidoData.cliente.barrio;
    } else {
      DB.clientesFrecuentes.push({
        id: DB.clientesFrecuentes.length + 1,
        nombre: pedidoData.cliente.nombre,
        celular: pedidoData.cliente.celular,
        direccion: pedidoData.cliente.direccion,
        barrio: pedidoData.cliente.barrio,
        pedidos: 1
      });
    }
  }

  DB.pedidos.unshift(nuevoPedido);
  guardarDB();
  io.emit('pedido-creado', nuevoPedido);
  return nuevoPedido;
}

// ========================================================
// CEREBRO DEL AGENTE DE INTELIGENCIA ARTIFICIAL (WHATSAPP)
// ========================================================
const sesionesBot = {};

function procesarMensajeAgente(celular, mensajeTexto) {
  const texto = mensajeTexto.trim().toLowerCase();

  if (!sesionesBot[celular]) {
    sesionesBot[celular] = {
      fase: 'INICIO', // INICIO -> ARMANDO_PEDIDO -> PIDIENDO_DATOS -> CONFIRMANDO
      items: [],
      cliente: { nombre: '', direccion: '', barrio: '', celular: celular },
      metodoPago: 'Nequi / Bre-B'
    };
  }

  const sesion = sesionesBot[celular];

  // 1. Consulta de Estado de Pedido
  if (texto.includes('estado') || texto.includes('mi pedido') || texto.includes('como va') || texto.includes('cómo va')) {
    const ultimoPedido = DB.pedidos.find(p => p.cliente && p.cliente.celular === celular);
    if (ultimoPedido) {
      let detalleEstado = '';
      if (ultimoPedido.estado === 'PENDIENTE') detalleEstado = '🕒 Tu pedido fue recibido y está en cola de cocina.';
      else if (ultimoPedido.estado === 'PREPARANDO') detalleEstado = '🔥 ¡Tus arepas ya se están asando y bañando en queso!';
      else if (ultimoPedido.estado === 'LISTO') detalleEstado = '🛵 ¡Tu comanda está lista y empacada para entrega!';
      else detalleEstado = '✅ Tu pedido ya fue entregado. ¡Esperamos que lo disfrutes!';

      return `👋 Hola, tu pedido *${ultimoPedido.numero}* está en estado:\n\n*${ultimoPedido.estado}*\n${detalleEstado}\n\nTotal: $${ultimoPedido.total.toLocaleString()}`;
    } else {
      return `No encontré ningún pedido reciente con el número ${celular}. Si deseas pedir, dime: *"Quiero ver el menú"* 😊.`;
    }
  }

  // 2. Preguntas Frecuentes (Ubicación, Horario, Especialidad)
  if (texto.includes('horario') || texto.includes('abierto') || texto.includes('hora')) {
    return `🕒 Nuestro horario de atención en Popayán es de *4:00 PM a 10:00 PM*, todos los días. ¡Estamos listos para tomar tu orden!`;
  }

  if (texto.includes('donde estan') || texto.includes('dónde están') || texto.includes('ubicacion') || texto.includes('direccion')) {
    return `📍 Estamos ubicados en Popayán en la *Cra 7 #10N-22 B, Prados del Norte (en WokHouse)*. ¡También tenemos servicio a domicilio en toda la ciudad!`;
  }

  if (texto.includes('menu') || texto.includes('menú') || texto.includes('carta') || texto.includes('precios')) {
    let respuestaMenu = `🧀 *MENÚ OFICIAL ARY LA AREPA*\n_Base de arepa agridulce con abundante queso fundido:_\n\n`;
    DB.productos.forEach((p, idx) => {
      respuestaMenu += `*${idx + 1}. ${p.nombre}* - $${p.precio.toLocaleString()}\n_${p.desc}_\n\n`;
    });
    respuestaMenu += `🥤 *Bebidas:* Coca-Cola Cero ($3.000), Manzana ($3.000), Colombiana ($3.000), Pepsi ($3.000), Pony Mini ($3.000), Agua ($2.000).\n\n`;
    respuestaMenu += `👉 *Para pedir, escríbeme el nombre de la arepa* (ejemplo: _"Quiero una Campesina y una Coca-Cola"_).`;
    return respuestaMenu;
  }

  // 3. Flujo Conversacional de Toma de Pedido
  // Buscar si el cliente menciona alguna arepa
  let productoEncontrado = null;
  DB.productos.forEach(p => {
    if (texto.includes(p.nombre.toLowerCase())) {
      productoEncontrado = p;
    }
  });

  // Buscar si menciona bebidas
  let bebidaEncontrada = null;
  DB.bebidas.forEach(b => {
    if (texto.includes(b.nombre.toLowerCase().split(' ')[0])) {
      bebidaEncontrada = b;
    }
  });

  if (productoEncontrado) {
    sesion.items.push({
      id: productoEncontrado.id,
      nombre: productoEncontrado.nombre,
      precio: productoEncontrado.precio,
      extras: [],
      notas: ''
    });

    sesion.fase = 'ARMANDO_PEDIDO';
    return `✅ ¡Excelente elección! He agregado *1x Arepa ${productoEncontrado.nombre}* ($${productoEncontrado.precio.toLocaleString()}).\n\n¿Deseas agregar alguna bebida o extra (tocineta, queso, pollo)?\n\nSi ya terminaste, escríbeme: *"Listo, eso es todo"* o envíame tu nombre para continuar.`;
  }

  if (bebidaEncontrada && sesion.items.length > 0) {
    sesion.items.push({
      id: bebidaEncontrada.id,
      nombre: bebidaEncontrada.nombre,
      precio: bebidaEncontrada.precio,
      extras: [],
      notas: ''
    });
    return `🥤 Agregué *${bebidaEncontrada.nombre}* ($${bebidaEncontrada.precio.toLocaleString()}).\n\n¿Deseas algo más o escribes *"Listo"* para tomar tus datos de entrega?`;
  }

  // Si dice listo o envía dirección
  if (texto.includes('listo') || texto.includes('eso es todo') || texto.includes('ya') || sesion.fase === 'ARMANDO_PEDIDO') {
    if (sesion.items.length === 0) {
      return `¡Hola! Aún no has seleccionado ninguna arepa. Escríbeme qué se te antoja (Campesina, Doriloca, Ranchera, Tocineta...) o escribe *"Menú"*.`;
    }

    sesion.fase = 'PIDIENDO_DATOS';
    const subtotal = sesion.items.reduce((a, b) => a + b.precio, 0);
    return `📋 *Resumen de tu compra:*
${sesion.items.map(i => `• 1x ${i.nombre} ($${i.precio.toLocaleString()})`).join('\n')}
*Subtotal:* $${subtotal.toLocaleString()}

Para enviártelo a domicilio en Popayán, por favor indícame en un solo mensaje:
1. *Tu Nombre*
2. *Dirección exacta*
3. *Barrio en Popayán* (ej: Ciudad Jardín, Centro, Prados del Norte, etc.)`;
  }

  if (sesion.fase === 'PIDIENDO_DATOS') {
    // Detectar barrio de la lista de Popayán
    let barrioDetectado = DB.barrios.find(b => texto.includes(b.nombre.toLowerCase().split(' ')[0]));
    if (!barrioDetectado) barrioDetectado = DB.barrios[0]; // Prados del norte por defecto

    sesion.cliente.nombre = mensajeTexto.split('\n')[0] || 'Cliente WhatsApp';
    sesion.cliente.direccion = mensajeTexto;
    sesion.cliente.barrio = barrioDetectado.nombre;
    sesion.costoEnvio = barrioDetectado.costo;

    sesion.fase = 'CONFIRMANDO';
    const subtotal = sesion.items.reduce((a, b) => a + b.precio, 0);
    const total = subtotal + sesion.costoEnvio;

    return `📍 *Dirección registrada:* ${sesion.cliente.barrio} (Domicilio: $${sesion.costoEnvio.toLocaleString()})
💰 *TOTAL A PAGAR:* $${total.toLocaleString()}

¿Cómo deseas pagar?
1️⃣ *QR Bre-B / Nequi*
2️⃣ *Efectivo*

(Responde *"1"* o *"2"* para confirmar tu pedido directamente a la cocina).`;
  }

  if (sesion.fase === 'CONFIRMANDO') {
    const metodo = (texto === '2' || texto.includes('efectivo')) ? 'Efectivo' : 'Nequi / Bre-B';
    const subtotal = sesion.items.reduce((a, b) => a + b.precio, 0);
    const total = subtotal + sesion.costoEnvio;

    // Crear comanda en tiempo real
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

    // Reiniciar sesión
    delete sesionesBot[celular];

    let respuestaFinal = `🎉 *¡PEDIDO CONFIRMADO EXITOSAMENTE!*\n`;
    respuestaFinal += `Orden: *${nuevoPedido.numero}*\n`;
    respuestaFinal += `Total: *$${total.toLocaleString()}*\n`;
    respuestaFinal += `Método de pago: *${metodo}*\n\n`;

    if (metodo.includes('Nequi') || metodo.includes('Bre-B')) {
      respuestaFinal += `📲 *Datos para transferir por Bre-B / Nequi:*\n`;
      respuestaFinal += `• Número / Llave: *321 5035691*\n`;
      respuestaFinal += `• Titular: *Ary la arepa*\n\n`;
      respuestaFinal += `Por favor envíame la captura de pantalla del pago por este chat para verificar tu transferencia.`;
    } else {
      respuestaFinal += `💵 El domiciliario cobrará en efectivo al llegar a tu puerta.`;
    }

    respuestaFinal += `\n\n👨‍🍳 Tu comanda ya empezó a sonar en la cocina de Prados del Norte. ¡Muchas gracias!`;
    return respuestaFinal;
  }

  // Saludo General por defecto
  return `👋 ¡Hola! Bienvenido a *Ary la arepa* Popayán 🧀 (De Popayán para el mundo).\n\nSoy el asistente virtual. ¿En qué te puedo colaborar hoy?\n\n1️⃣ Escribe *"Menú"* para ver nuestras arepas y precios.\n2️⃣ Escribe *"Estado"* para saber cómo va tu comanda.\n3️⃣ O simplemente dime qué deseas ordenar (ej: _"Quiero una arepa Campesina"_).`;
}

// Endpoint para el simulador web y para Webhooks
app.post('/api/bot/chat', (req, res) => {
  const { celular, mensaje } = req.body;
  if (!celular || !mensaje) return res.status(400).json({ error: 'Faltan datos' });
  const respuesta = procesarMensajeAgente(celular, mensaje);
  res.json({ ok: true, respuesta });
});

// Endpoint Oficial Webhook Meta WhatsApp Business
app.get('/api/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];
  if (mode && token === 'ARY_TOKEN_SECRETO_2026') {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

app.post('/api/webhook', (req, res) => {
  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    if (message && message.type === 'text') {
      const from = message.from; // Celular del cliente
      const text = message.text.body;
      const respuestaBot = procesarMensajeAgente(from, text);
      console.log(`[WhatsApp ${from}]: ${text} -> [Bot]: ${respuestaBot}`);
      // Aquí se llamaría a la API de Meta Graph para enviar la respuesta
    }
  } catch (e) {}
  res.sendStatus(200);
});

// WebSockets para la cocina y admin
io.on('connection', (socket) => {
  socket.on('nuevo-pedido', (pedidoData) => {
    const nuevoPedido = registrarPedidoEnSistema(pedidoData);
    socket.emit('confirmacion-pedido', { id: nuevoPedido.id, numero: nuevoPedido.numero });
  });

  socket.on('cambiar-estado', ({ id, nuevoEstado }) => {
    const pedido = DB.pedidos.find(p => p.id === id);
    if (pedido) {
      pedido.estado = nuevoEstado;
      guardarDB();
      io.emit('estado-actualizado', { id, nuevoEstado, pedido });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(` Servidor activo: http://localhost:${PORT}`);
  console.log(` Simulador WhatsApp: http://localhost:${PORT}/whatsapp-sim.html`);
});
