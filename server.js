process.on('unhandledRejection', (reason) => console.error('⚠️ Rejection capturada:', reason));
process.on('uncaughtException', (err) => console.error('⚠️ Exception capturada:', err.message));

const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

let createClient = null;
try {
  createClient = require('@supabase/supabase-js').createClient;
} catch (e) {
  console.log("ℹ️ Operando en modo local (sin librería Supabase instalada).");
}

const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: "*" } });

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ limit: '10mb', extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/img', express.static(path.join(__dirname, 'public', 'img')));

const SUPABASE_URL = (process.env.SUPABASE_URL || 'https://rwoioajzmkjtaveosgyh.supabase.co').trim();
const SUPABASE_KEY = (process.env.SUPABASE_KEY || '').trim();

let supabase = null;
if (createClient && SUPABASE_URL && SUPABASE_KEY && !SUPABASE_KEY.includes('PEGA_AQUI')) {
  try {
    supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
    console.log("✓ Cliente Supabase conectado.");
  } catch (err) {
    supabase = null;
  }
}

const DATA_FILE = path.join(__dirname, 'data.json');

const DB_DEFAULT = {
  info: {
    nombre: "Ary la arepa",
    eslogan: "De Popayán para el mundo",
    base: "Base de Arepa agridulce, rellena con abundante queso y bañada en queso fundido",
    direccion: "Cra 7 #10N-22 B, Prados del Norte en WokHouse",
    telefono: "3215035691",
    nit: "1061789456-1",
    horarioDomicilio: "4:00 PM a 9:30 PM",
    horarioMesa: "4:00 PM a 9:45 PM",
    numeroMesas: 8,
    pinAdmin: "1234"
  },
  configPuntos: {
    puntosPorArepa: 1,
    puntosMinimosParaCanje: 5,
    valorDescuentoCanje: 5000,
    activo: true
  },
  usuarios: [
    { id: 1, usuario: 'admin', clave: '1234', nombre: 'Administrador', rol: 'ADMIN' },
    { id: 2, usuario: 'cajero1', clave: '2024', nombre: 'Cajero Principal', rol: 'CAJERO' }
  ],
  clientesFrecuentes: [
    { id: 1, nombre: 'Juan Camilo', celular: '3110000000', direccion: 'Cra 9 # 12N-45', barrio: 'Ciudad Jardín', pedidos: 4, puntos: 4 }
  ],
  cupones: [
    { id: 1, codigo: 'POPAYAN10', tipo: 'PORCENTAJE', valor: 10, activo: true, usos: 0 },
    { id: 2, codigo: 'ARY5K', tipo: 'FIJO', valor: 5000, activo: true, usos: 0 }
  ],
  inventario: [
    { id: 'inv-1', nombre: 'Arepa Base Agridulce', unidad: 'unidades', porcionTamano: 1, stockActual: 100, stockMinimo: 20 },
    { id: 'inv-2', nombre: 'Queso Fundido Artesanal', unidad: 'gramos', porcionTamano: 80, stockActual: 8000, stockMinimo: 1600 },
    { id: 'inv-3', nombre: 'Carne Desmechada', unidad: 'gramos', porcionTamano: 100, stockActual: 5000, stockMinimo: 1000 },
    { id: 'inv-4', nombre: 'Pollo Desmechado', unidad: 'gramos', porcionTamano: 100, stockActual: 5000, stockMinimo: 1000 },
    { id: 'inv-5', nombre: 'Chorizo Ahumado', unidad: 'unidades', porcionTamano: 1, stockActual: 50, stockMinimo: 10 },
    { id: 'inv-6', nombre: 'Tocineta Ahumada', unidad: 'gramos', porcionTamano: 60, stockActual: 3000, stockMinimo: 600 },
    { id: 'inv-7', nombre: 'Doritos / Totopos', unidad: 'unidades', porcionTamano: 1, stockActual: 40, stockMinimo: 10 },
    { id: 'inv-8', nombre: 'Bowls Térmicos Domicilio', unidad: 'unidades', porcionTamano: 1, stockActual: 120, stockMinimo: 25 },
    { id: 'inv-9', nombre: 'Coca-Cola Cero 250ml', unidad: 'unidades', porcionTamano: 1, stockActual: 36, stockMinimo: 12 }
  ],
  recetas: {
    'Campesina': { 'inv-1': 1, 'inv-2': 80, 'inv-3': 100, 'inv-5': 1 },
    'Doriloca': { 'inv-1': 1, 'inv-2': 80, 'inv-3': 100, 'inv-7': 1 },
    'Ranchera': { 'inv-1': 1, 'inv-2': 80, 'inv-4': 100 },
    'Tocineta': { 'inv-1': 1, 'inv-2': 80, 'inv-4': 80, 'inv-6': 60 },
    'Mexicana': { 'inv-1': 1, 'inv-2': 80, 'inv-3': 100, 'inv-7': 1 },
    'Hawaiana': { 'inv-1': 1, 'inv-2': 80 },
    'Quipitos': { 'inv-1': 1, 'inv-2': 60 }
  },
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
    const dataGuardada = JSON.parse(fs.readFileSync(DATA_FILE, 'utf-8'));
    if (dataGuardada && typeof dataGuardada === 'object') {
      DB = {
        ...DB_DEFAULT,
        ...dataGuardada,
        info: { ...DB_DEFAULT.info, ...(dataGuardada.info || {}) },
        configPuntos: { ...DB_DEFAULT.configPuntos, ...(dataGuardada.configPuntos || {}) },
        recetas: { ...DB_DEFAULT.recetas, ...(dataGuardada.recetas || {}) },
        cupones: Array.isArray(dataGuardada.cupones) ? dataGuardada.cupones : DB_DEFAULT.cupones,
        inventario: Array.isArray(dataGuardada.inventario) ? dataGuardada.inventario : DB_DEFAULT.inventario,
        clientesFrecuentes: Array.isArray(dataGuardada.clientesFrecuentes) ? dataGuardada.clientesFrecuentes : DB_DEFAULT.clientesFrecuentes,
        pedidos: Array.isArray(dataGuardada.pedidos) ? dataGuardada.pedidos : []
      };
    }
  } catch (e) {
    DB = DB_DEFAULT;
  }
}

if (!Array.isArray(DB.clientesFrecuentes)) DB.clientesFrecuentes = [];
if (!Array.isArray(DB.pedidos)) DB.pedidos = [];
if (!Array.isArray(DB.inventario)) DB.inventario = DB_DEFAULT.inventario;

function guardarDB(claveModificada = null) {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(DB, null, 2));
  } catch (err) {}

  if (supabase && claveModificada && DB[claveModificada]) {
    supabase.from('configuracion').upsert({
      clave: claveModificada,
      datos: DB[claveModificada],
      updated_at: new Date().toISOString()
    }).catch(() => {});
  }
}

async function sincronizarConSupabase() {
  if (!supabase) return;
  try {
    const { data: configData } = await supabase.from('configuracion').select('*');
    if (configData && configData.length > 0) {
      configData.forEach(row => {
        if (row.clave && row.datos) DB[row.clave] = row.datos;
      });
    }

    const { data: pedidosDb } = await supabase.from('pedidos').select('*').order('timestamp', { ascending: false }).limit(200);
    if (pedidosDb && pedidosDb.length > 0) {
      DB.pedidos = pedidosDb.map(p => ({
        id: p.id,
        numero: p.numero,
        fecha: p.fecha,
        hora: p.hora,
        timestamp: Number(p.timestamp),
        cliente: p.cliente,
        modalidad: p.modalidad,
        items: p.items,
        metodoPago: p.metodo_pago,
        subtotal: Number(p.subtotal),
        costoEnvio: Number(p.costo_envio),
        descuento: Number(p.descuento),
        total: Number(p.total),
        estado: p.estado,
        turnoId: p.turno_id,
        origen: p.origen
      }));
      DB.contadorPedido = DB.pedidos.length;
    }
  } catch (err) {}
}

function obtenerMinutosDiaColombia() {
  try {
    const now = new Date();
    const utcHours = now.getUTCHours();
    const utcMins = now.getUTCMinutes();
    const colHours = (utcHours - 5 + 24) % 24;
    return colHours * 60 + utcMins;
  } catch (e) {
    const d = new Date();
    return d.getHours() * 60 + d.getMinutes();
  }
}

function verificarEstadoServicios() {
  const mins = obtenerMinutosDiaColombia();
  const abiertoDomicilio = (mins >= 960 && mins <= 1290); // 4:00 PM a 9:30 PM
  const abiertoMesaYRecoger = (mins >= 960 && mins <= 1305); // 4:00 PM a 9:45 PM
  return { abiertoDomicilio, abiertoMesa: abiertoMesaYRecoger, abiertoRecoger: abiertoMesaYRecoger };
}

app.get('/api/estado-horarios', (req, res) => {
  const st = verificarEstadoServicios();
  res.json({
    domicilio: st.abiertoDomicilio,
    mesa: st.abiertoMesa,
    recoger: st.abiertoRecoger,
    horarios: {
      domicilio: "4:00 PM a 9:30 PM",
      mesa: "4:00 PM a 9:45 PM",
      recoger: "4:00 PM a 9:45 PM"
    }
  });
});

function descontarInventarioPorPedido(items, modalidad) {
  if (!DB.recetas || !DB.inventario) return;

  (items || []).forEach(item => {
    const receta = DB.recetas[item.nombre];
    if (receta) {
      Object.keys(receta).forEach(invId => {
        const insumo = DB.inventario.find(i => i.id === invId);
        if (insumo) {
          insumo.stockActual = Math.max(0, insumo.stockActual - receta[invId]);
        }
      });
    }

    const bebidaInsumo = DB.inventario.find(i => (i.nombre || '').toLowerCase().includes((item.nombre || '').toLowerCase()));
    if (bebidaInsumo) {
      bebidaInsumo.stockActual = Math.max(0, bebidaInsumo.stockActual - 1);
    }
  });

  if (modalidad === 'Domicilio' || modalidad === 'Para Llevar' || modalidad === 'Rappi') {
    const bowl = DB.inventario.find(i => i.id === 'inv-8');
    if (bowl) bowl.stockActual = Math.max(0, bowl.stockActual - (items ? items.length : 1));
  }

  guardarDB('inventario');
}

function devolverInventarioCancelado(items, modalidad) {
  if (!DB.recetas || !DB.inventario) return;

  (items || []).forEach(item => {
    const receta = DB.recetas[item.nombre];
    if (receta) {
      Object.keys(receta).forEach(invId => {
        const insumo = DB.inventario.find(i => i.id === invId);
        if (insumo) insumo.stockActual += receta[invId];
      });
    }
  });

  if (modalidad === 'Domicilio' || modalidad === 'Para Llevar' || modalidad === 'Rappi') {
    const bowl = DB.inventario.find(i => i.id === 'inv-8');
    if (bowl) bowl.stockActual += (items ? items.length : 1);
  }

  guardarDB('inventario');
}

function registrarPedidoEnSistema(pedidoData) {
  try {
    if (!Array.isArray(DB.clientesFrecuentes)) DB.clientesFrecuentes = [];
    if (!Array.isArray(DB.pedidos)) DB.pedidos = [];
    if (!DB.contadorPedido) DB.contadorPedido = DB.pedidos.length;

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

    descontarInventarioPorPedido(nuevoPedido.items || [], nuevoPedido.modalidad);

    if (pedidoData.cliente && pedidoData.cliente.celular && !String(pedidoData.metodoPago).includes('Pauta')) {
      const idx = DB.clientesFrecuentes.findIndex(c => c && c.celular === pedidoData.cliente.celular);
      const cantArepas = (nuevoPedido.items || []).filter(i => i && (!i.desc || !i.desc.includes('Bebida'))).length || 1;
      const factorPuntos = (DB.configPuntos && DB.configPuntos.activo) ? (DB.configPuntos.puntosPorArepa || 1) : 0;
      const puntosGanados = cantArepas * factorPuntos;

      if (idx >= 0) {
        const cli = DB.clientesFrecuentes[idx];
        cli.pedidos = (cli.pedidos || 0) + 1;
        if (pedidoData.canjeoPuntos && DB.configPuntos) {
          cli.puntos = Math.max(0, (cli.puntos || 0) - (DB.configPuntos.puntosMinimosParaCanje || 5));
        }
        cli.puntos = (cli.puntos || 0) + puntosGanados;
        cli.direccion = pedidoData.cliente.direccion;
        cli.barrio = pedidoData.cliente.barrio;
      } else {
        DB.clientesFrecuentes.push({
          id: DB.clientesFrecuentes.length + 1,
          nombre: pedidoData.cliente.nombre,
          celular: pedidoData.cliente.celular,
          direccion: pedidoData.cliente.direccion,
          barrio: pedidoData.cliente.barrio,
          pedidos: 1,
          puntos: puntosGanados
        });
      }
      guardarDB('clientesFrecuentes');
    }

    DB.pedidos.unshift(nuevoPedido);
    guardarDB();

    if (supabase) {
      supabase.from('pedidos').insert([{
        id: nuevoPedido.id,
        numero: nuevoPedido.numero,
        fecha: nuevoPedido.fecha,
        hora: nuevoPedido.hora,
        timestamp: nuevoPedido.timestamp,
        cliente: nuevoPedido.cliente,
        modalidad: nuevoPedido.modalidad,
        items: nuevoPedido.items,
        metodo_pago: nuevoPedido.metodoPago,
        subtotal: nuevoPedido.subtotal,
        costo_envio: nuevoPedido.costoEnvio,
        descuento: nuevoPedido.descuento || 0,
        total: nuevoPedido.total,
        estado: nuevoPedido.estado,
        turno_id: nuevoPedido.turnoId,
        origen: nuevoPedido.origen || 'Web/POS'
      }]).catch(() => {});
    }

    io.emit('pedido-creado', nuevoPedido);
    return nuevoPedido;
  } catch (err) {
    console.error("Error en registrarPedidoEnSistema:", err);
    const fallback = {
      id: `ORD-${Date.now()}`,
      numero: `#${String(Date.now()).slice(-3)}`,
      total: pedidoData.total || 0,
      estado: 'PENDIENTE',
      ...pedidoData
    };
    DB.pedidos.unshift(fallback);
    io.emit('pedido-creado', fallback);
    return fallback;
  }
}

// ENDPOINTS API
app.get('/api/data-inicial', (req, res) => res.json(DB));
app.get('/api/pedidos', (req, res) => res.json(DB.pedidos));

app.get('/api/pedido/:id', (req, res) => {
  const p = DB.pedidos.find(x => x.id === req.params.id);
  if (p) return res.json(p);

  if (supabase) {
    supabase.from('pedidos').select('*').eq('id', req.params.id).single()
      .then(({ data }) => {
        if (data) {
          return res.json({
            id: data.id,
            numero: data.numero,
            fecha: data.fecha,
            hora: data.hora,
            timestamp: Number(data.timestamp),
            cliente: data.cliente,
            modalidad: data.modalidad,
            items: data.items,
            metodoPago: data.metodo_pago,
            subtotal: Number(data.subtotal),
            costoEnvio: Number(data.costo_envio),
            descuento: Number(data.descuento),
            total: Number(data.total),
            estado: data.estado,
            turnoId: data.turno_id
          });
        }
        res.status(404).json({ error: 'Pedido no encontrado' });
      })
      .catch(() => res.status(404).json({ error: 'Pedido no encontrado' }));
  } else {
    res.status(404).json({ error: 'Pedido no encontrado' });
  }
});

// RUTA POST DE PEDIDOS CON EXCEPCIÓN PARA CAJA POS
app.post('/api/pedidos', (req, res) => {
  try {
    const pedidoData = req.body;
    const { abiertoDomicilio, abiertoMesa } = verificarEstadoServicios();
    const esDomicilio = (pedidoData.modalidad === 'Domicilio');
    const esLocalOMesa = (pedidoData.modalidad && (pedidoData.modalidad.includes('Local') || pedidoData.modalidad.includes('Mesa') || pedidoData.modalidad.includes('Recoger')));
    
    // REGLA CLAVE: La caja POS física NUNCA se bloquea por horario
    const esPOS = Boolean(pedidoData.cajero || pedidoData.origen === 'POS');

    if (!esPOS && !pedidoData.modoPrueba) {
      if (esDomicilio && !abiertoDomicilio) {
        return res.status(400).json({ ok: false, error: '⛔ El servicio a domicilio opera de 4:00 PM a 9:30 PM.', fueraDeHorario: true });
      }
      if (esLocalOMesa && !abiertoMesa) {
        return res.status(400).json({ ok: false, error: '⛔ La cocina ya cerró la atención en mesa y recoger por hoy (hasta 9:45 PM).', fueraDeHorario: true });
      }
    }

    const nuevoPedido = registrarPedidoEnSistema(pedidoData);
    res.json({ ok: true, id: nuevoPedido.id, numero: nuevoPedido.numero, total: nuevoPedido.total, pedido: nuevoPedido });
  } catch (err) {
    console.error("Error en POST /api/pedidos:", err);
    res.status(500).json({ ok: false, error: 'Error procesando la orden: ' + err.message });
  }
});

app.post('/api/admin/config-puntos', (req, res) => {
  const { puntosPorArepa, puntosMinimosParaCanje, valorDescuentoCanje, activo } = req.body;
  DB.configPuntos = {
    puntosPorArepa: parseInt(puntosPorArepa) || 1,
    puntosMinimosParaCanje: parseInt(puntosMinimosParaCanje) || 5,
    valorDescuentoCanje: parseInt(valorDescuentoCanje) || 5000,
    activo: activo !== false
  };
  guardarDB('configPuntos');
  res.json({ ok: true, configPuntos: DB.configPuntos });
});

app.post('/api/admin/clientes/:id/puntos', (req, res) => {
  const id = parseInt(req.params.id);
  const { puntos } = req.body;
  const cliente = DB.clientesFrecuentes.find(c => c && c.id === id);
  if (cliente) {
    cliente.puntos = Math.max(0, parseInt(puntos) || 0);
    guardarDB('clientesFrecuentes');
    res.json({ ok: true, cliente });
  } else {
    res.status(404).json({ error: 'No encontrado' });
  }
});

app.post('/api/admin/verificar-pin', (req, res) => {
  const { pin } = req.body;
  if (pin === (DB.info.pinAdmin || "1234")) res.json({ ok: true });
  else res.status(401).json({ ok: false, error: 'PIN incorrecto' });
});

app.post('/api/admin/cambiar-pin', (req, res) => {
  const { pinActual, nuevoPin } = req.body;
  if (pinActual !== (DB.info.pinAdmin || "1234")) return res.status(401).json({ error: 'PIN actual no coincide' });
  if (!nuevoPin || nuevoPin.length < 4) return res.status(400).json({ error: 'Mínimo 4 dígitos' });

  DB.info.pinAdmin = nuevoPin.trim();
  const u = DB.usuarios.find(x => x.rol === 'ADMIN');
  if (u) u.clave = nuevoPin.trim();
  guardarDB('info');
  guardarDB('usuarios');
  res.json({ ok: true });
});

app.post('/api/admin/inventario', (req, res) => {
  if (Array.isArray(req.body.inventario)) { DB.inventario = req.body.inventario; guardarDB('inventario'); res.json({ ok: true }); }
  else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/cupones/validar', (req, res) => {
  const { codigo, subtotal } = req.body;
  const cup = DB.cupones.find(c => c.codigo.toUpperCase() === (codigo || '').trim().toUpperCase() && c.activo);
  if (!cup) return res.status(404).json({ error: 'Cupón no válido' });
  let descuento = (cup.tipo === 'PORCENTAJE') ? Math.round((subtotal * cup.valor) / 100) : cup.valor;
  res.json({ ok: true, cupon: cup, descuento });
});

app.post('/api/admin/cupones', (req, res) => {
  if (Array.isArray(req.body.cupones)) { DB.cupones = req.body.cupones; guardarDB('cupones'); res.json({ ok: true }); }
  else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/barrios', (req, res) => {
  if (Array.isArray(req.body.barrios)) { DB.barrios = req.body.barrios; guardarDB('barrios'); res.json({ ok: true }); }
  else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/productos', (req, res) => {
  if (Array.isArray(req.body.productos)) { DB.productos = req.body.productos; guardarDB('productos'); res.json({ ok: true }); }
  else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/extras', (req, res) => {
  if (Array.isArray(req.body.extras)) { DB.extras = req.body.extras; guardarDB('extras'); res.json({ ok: true }); }
  else res.status(400).json({ error: 'Inválido' });
});

app.post('/api/admin/bebidas', (req, res) => {
  if (Array.isArray(req.body.bebidas)) { DB.bebidas = req.body.bebidas; guardarDB('bebidas'); res.json({ ok: true }); }
  else res.status(400).json({ error: 'Inválido' });
});

app.get('/api/usuarios', (req, res) => res.json(DB.usuarios));
app.post('/api/usuarios', (req, res) => {
  const { usuario, clave, nombre } = req.body;
  if (!usuario || !clave || !nombre) return res.status(400).json({ error: 'Requeridos' });
  const nuevo = { id: Date.now(), usuario: usuario.trim().toLowerCase(), clave: clave.trim(), nombre: nombre.trim(), rol: 'CAJERO' };
  DB.usuarios.push(nuevo);
  guardarDB('usuarios');
  res.json({ ok: true, usuario: nuevo });
});

app.delete('/api/usuarios/:id', (req, res) => {
  const idx = DB.usuarios.findIndex(u => u.id === parseInt(req.params.id));
  if (idx !== -1 && DB.usuarios[idx].rol !== 'ADMIN') {
    DB.usuarios.splice(idx, 1);
    guardarDB('usuarios');
    res.json({ ok: true });
  } else res.status(403).json({ error: 'No permitido' });
});

app.post('/api/cajero/login', (req, res) => {
  const { usuario, clave } = req.body;
  const user = DB.usuarios.find(u => u.usuario.toLowerCase() === (usuario || '').trim().toLowerCase() && u.clave === (clave || '').trim());
  if (user) res.json({ ok: true, usuario: { id: user.id, nombre: user.nombre, rol: user.rol } });
  else res.status(401).json({ ok: false, error: 'Credenciales inválidas' });
});

app.post('/api/caja/abrir', (req, res) => {
  DB.turnoActual = {
    id: `TURNO-${Date.now()}`,
    cajero: req.body.cajeroNombre,
    baseInicial: parseFloat(req.body.baseInicial) || 0,
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
  const ventasRappi = pedidosTurno.filter(p => p.metodoPago === 'Rappi').reduce((a, b) => a + b.total, 0);
  const ventasPauta = pedidosTurno.filter(p => p.metodoPago && p.metodoPago.includes('Pauta')).length;

  res.json({
    turnoActivo: true,
    turno: DB.turnoActual,
    ventasEfectivo,
    ventasDigital,
    ventasRappi,
    ventasPauta,
    totalVentas: ventasEfectivo + ventasDigital + ventasRappi,
    totalEnCajaEsperado: DB.turnoActual.baseInicial + ventasEfectivo,
    totalPedidos: pedidosTurno.length
  });
});

app.post('/api/caja/cerrar', (req, res) => {
  if (!DB.turnoActual) return res.status(400).json({ error: 'Sin turno' });
  const pedidosTurno = DB.pedidos.filter(p => p.turnoId === DB.turnoActual.id && p.estado !== 'CANCELADO');
  const ventasEfectivo = pedidosTurno.filter(p => p.metodoPago === 'Efectivo').reduce((a, b) => a + b.total, 0);
  const ventasDigital = pedidosTurno.filter(p => p.metodoPago.includes('Nequi') || p.metodoPago.includes('Bre-B') || p.metodoPago.includes('Transferencia')).reduce((a, b) => a + b.total, 0);
  const ventasRappi = pedidosTurno.filter(p => p.metodoPago === 'Rappi').reduce((a, b) => a + b.total, 0);
  const ventasPauta = pedidosTurno.filter(p => p.metodoPago && p.metodoPago.includes('Pauta')).length;

  const turnoCerrado = {
    ...DB.turnoActual,
    horaCierre: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    estado: 'CERRADA',
    ventasEfectivo,
    ventasDigital,
    ventasRappi,
    ventasPauta,
    totalVentas: ventasEfectivo + ventasDigital + ventasRappi,
    totalCajaEsperado: DB.turnoActual.baseInicial + ventasEfectivo
  };

  DB.historialTurnos.unshift(turnoCerrado);
  DB.turnoActual = null;
  guardarDB();

  if (supabase) {
    supabase.from('turnos_caja').insert([{
      id: turnoCerrado.id,
      cajero: turnoCerrado.cajero,
      base_inicial: turnoCerrado.baseInicial,
      hora_apertura: turnoCerrado.horaApertura,
      hora_cierre: turnoCerrado.horaCierre,
      fecha: turnoCerrado.fecha,
      estado: turnoCerrado.estado,
      ventas_efectivo: turnoCerrado.ventasEfectivo,
      ventas_digital: turnoCerrado.ventasDigital,
      ventas_rappi: turnoCerrado.ventasRappi,
      ventas_pauta: turnoCerrado.ventasPauta,
      total_caja_esperado: turnoCerrado.totalCajaEsperado
    }]).catch(() => {});
  }

  res.json({ ok: true, resumenCierre: turnoCerrado });
});

// Sockets
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
      if (supabase) supabase.from('pedidos').update({ estado: nuevoEstado }).eq('id', id).catch(() => {});
      io.emit('estado-actualizado', { id, nuevoEstado, pedido });
    }
  });

  socket.on('cancelar-comanda-cocina', ({ id, motivo }) => {
    const pedido = DB.pedidos.find(p => p.id === id);
    if (pedido && pedido.estado === 'PENDIENTE') {
      pedido.estado = 'CANCELADO';
      pedido.motivoCancelacion = motivo || 'Rechazado por cocina';
      devolverInventarioCancelado(pedido.items || [], pedido.modalidad);
      guardarDB();
      if (supabase) supabase.from('pedidos').update({ estado: 'CANCELADO' }).eq('id', id).catch(() => {});
      io.emit('estado-actualizado', { id, nuevoEstado: 'CANCELADO', pedido });
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, '0.0.0.0', () => {
  console.log(`✓ Servidor activo en puerto ${PORT}`);
  sincronizarConSupabase().catch(() => {});
});
