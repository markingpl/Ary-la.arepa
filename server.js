const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const DB = {
  info: {
    nombre: "Ary la arepa",
    eslogan: "De Popayán para el mundo",
    direccion: "Cra 7 #10N-22 B, Prados del Norte en WokHouse",
    telefono: "3215035691",
    nit: "1061789456-1"
  },
  usuarios: [
    { id: 1, usuario: 'admin', clave: '1234', nombre: 'Administrador', rol: 'ADMIN' },
    { id: 2, usuario: 'cajero1', clave: '2024', nombre: 'Cajero Principal', rol: 'CAJERO' }
  ],
  clientesFrecuentes: [
    { id: 1, nombre: 'Juan Camilo', celular: '3110000000', direccion: 'Cra 9 # 12N-45', barrio: 'Ciudad Jardín', pedidos: 4 }
  ],
  turnoActual: null, // { id, cajero, baseInicial, horaApertura, estado: 'ABIERTA' }
  historialTurnos: [],
  barrios: [
    { nombre: 'Prados del Norte (Local)', costo: 2000 },
    { nombre: 'Bello Horizonte', costo: 3500 },
    { nombre: 'Ciudad Jardín', costo: 3500 },
    { nombre: 'Centro / Parque Caldas', costo: 4000 },
    { nombre: 'La Pamba / Pomona', costo: 4500 },
    { nombre: 'La Esmeralda', costo: 4000 },
    { nombre: 'Pandiguando', costo: 4000 },
    { nombre: 'Valencia', costo: 4000 },
    { nombre: 'Palacé / Villa del Viento', costo: 5000 },
    { nombre: 'Santa Clara / Los Hoyos', costo: 3500 }
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
  contadorPedido: 0
};

// Endpoints
app.get('/api/data-inicial', (req, res) => res.json(DB));
app.get('/api/pedidos', (req, res) => res.json(DB.pedidos));
app.get('/api/pedido/:id', (req, res) => {
  const p = DB.pedidos.find(x => x.id === req.params.id);
  p ? res.json(p) : res.status(404).json({ error: 'No encontrado' });
});

// Login de Cajero
app.post('/api/cajero/login', (req, res) => {
  const { usuario, clave } = req.body;
  const user = DB.usuarios.find(u => u.usuario === usuario && u.clave === clave);
  if (user) {
    res.json({ ok: true, usuario: { id: user.id, nombre: user.nombre, rol: user.rol } });
  } else {
    res.status(401).json({ ok: false, error: 'Usuario o contraseña incorrectos' });
  }
});

// Apertura de Turno de Caja
app.post('/api/caja/abrir', (req, res) => {
  const { cajeroNombre, baseInicial } = req.body;
  DB.turnoActual = {
    id: `TURNO-${Date.now()}`,
    cajero: cajeroNombre,
    baseInicial: parseFloat(baseInicial) || 0,
    horaApertura: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    fecha: new Date().toLocaleDateString('es-CO'),
    estado: 'ABIERTA',
    pedidosAtendidos: []
  };
  res.json({ ok: true, turno: DB.turnoActual });
});

// Estado de Caja y Resumen
app.get('/api/caja/resumen', (req, res) => {
  if (!DB.turnoActual) return res.json({ turnoActivo: false });
  
  const pedidosTurno = DB.pedidos.filter(p => p.turnoId === DB.turnoActual.id && p.estado !== 'CANCELADO');
  const ventasEfectivo = pedidosTurno.filter(p => p.metodoPago === 'Efectivo').reduce((a, b) => a + b.total, 0);
  const ventasDigital = pedidosTurno.filter(p => p.metodoPago.includes('Nequi') || p.metodoPago.includes('Transferencia')).reduce((a, b) => a + b.total, 0);

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

// Cierre de Turno
app.post('/api/caja/cerrar', (req, res) => {
  if (!DB.turnoActual) return res.status(400).json({ error: 'No hay turno activo' });
  
  const pedidosTurno = DB.pedidos.filter(p => p.turnoId === DB.turnoActual.id && p.estado !== 'CANCELADO');
  const ventasEfectivo = pedidosTurno.filter(p => p.metodoPago === 'Efectivo').reduce((a, b) => a + b.total, 0);
  const ventasDigital = pedidosTurno.filter(p => p.metodoPago.includes('Nequi') || p.metodoPago.includes('Transferencia')).reduce((a, b) => a + b.total, 0);

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
  res.json({ ok: true, resumenCierre: turnoCerrado });
});

// Cancelar Pedido
app.post('/api/pedido/cancelar', (req, res) => {
  const { pedidoId, motivo } = req.body;
  const p = DB.pedidos.find(x => x.id === pedidoId);
  if (p) {
    p.estado = 'CANCELADO';
    p.motivoCancelacion = motivo || 'Cancelado por caja';
    io.emit('estado-actualizado', { id: p.id, nuevoEstado: 'CANCELADO', pedido: p });
    res.json({ ok: true });
  } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
});

// WebSockets
io.on('connection', (socket) => {
  socket.on('nuevo-pedido', (pedidoData) => {
    DB.contadorPedido++;
    const nuevoPedido = {
      id: `ORD-${Date.now()}`,
      numero: `#${String(DB.contadorPedido).padStart(3, '0')}`,
      fecha: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      timestamp: Date.now(),
      estado: 'PENDIENTE',
      turnoId: DB.turnoActual ? DB.turnoActual.id : null,
      ...pedidoData
    };

    // Actualizar o guardar cliente frecuente
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
    io.emit('pedido-creado', nuevoPedido);
    socket.emit('confirmacion-pedido', { id: nuevoPedido.id, numero: nuevoPedido.numero });
  });

  socket.on('cambiar-estado', ({ id, nuevoEstado }) => {
    const pedido = DB.pedidos.find(p => p.id === id);
    if (pedido) {
      pedido.estado = nuevoEstado;
      io.emit('estado-actualizado', { id, nuevoEstado, pedido });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(` Ary la arepa en línea: http://localhost:${PORT}`);
  console.log(` Punto de Venta (POS): http://localhost:${PORT}/pos.html`);
});