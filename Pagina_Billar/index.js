/* ==========================================================================
   SISTEMA DE GESTIÓN DE BILLAR - LÓGICA INTERACTIVA DEL PROTOTIPO
   Simulación de Base de Datos y Flujo Operativo en Tiempo Real
   ========================================================================== */

// STATE DEL SISTEMA (MOCK DATABASE EN MEMORIA)
const state = {
  caja: {
    id_caja: 101,
    id_usuario: 1,
    cajero_nombre: 'Lucho (Cajero)',
    fecha_apertura: new Date(Date.now() - 4 * 3600 * 1000), // Hace 4 horas
    monto_inicial: 100.00,
    estado: 'ABIERTA',
    pagos: [
      { id_pago: 1, fecha: new Date(Date.now() - 3 * 3600 * 1000), origen: 'Venta Mostrador #1', metodo: 'Efectivo', monto: 45.00 },
      { id_pago: 2, fecha: new Date(Date.now() - 2 * 3600 * 1000), origen: 'Mesa 4 (Sesión #88)', metodo: 'QR', monto: 85.00 },
      { id_pago: 3, fecha: new Date(Date.now() - 1 * 3600 * 1000), origen: 'Mesa 2 (Sesión #89)', metodo: 'Efectivo', monto: 100.00 }
    ]
  },

  tarifas: [
    { id_tarifa: 1, nombre: 'Tarifa Estándar', monto_hora: 15.00, estado: 1 },
    { id_tarifa: 2, nombre: 'Tarifa VIP Lounge', monto_hora: 25.00, estado: 1 }
  ],

  productos: [
    { id_prod: 1, id_categoria: 'Bebidas', nombre: 'Cerveza Paceña 620ml', precio_unitario: 14.00, stock: 42, icon: '🍺' },
    { id_prod: 2, id_categoria: 'Bebidas', nombre: 'Heineken 330ml', precio_unitario: 16.00, stock: 24, icon: '🍾' },
    { id_prod: 3, id_categoria: 'Bebidas', nombre: 'Coca Cola 500ml', precio_unitario: 7.00, stock: 38, icon: '🥤' },
    { id_prod: 4, id_categoria: 'Bebidas', nombre: 'Red Bull Energy 250ml', precio_unitario: 18.00, stock: 15, icon: '⚡' },
    { id_prod: 5, id_categoria: 'Snacks', nombre: 'Papas Pringles Original', precio_unitario: 15.00, stock: 18, icon: '🥔' },
    { id_prod: 6, id_categoria: 'Snacks', nombre: 'Maní Salado 100g', precio_unitario: 5.00, stock: 50, icon: '🥜' },
    { id_prod: 7, id_categoria: 'Comida', nombre: 'Pizza Personal Pepperoni', precio_unitario: 28.00, stock: 10, icon: '🍕' },
    { id_prod: 8, id_categoria: 'Comida', nombre: 'Nachos con Queso Cheddar', precio_unitario: 22.00, stock: 12, icon: '🧀' }
  ],

  mesas: [
    {
      id_mesa: 1,
      numero_nombre: 'Mesa 1 - Estándar',
      id_tarifa: 1,
      estado: 'OCUPADA',
      sesion: {
        id_sesion: 90,
        nombre_cliente: 'Carlos Morales',
        fecha_inicio: new Date(Date.now() - 45 * 60 * 1000), // Hace 45 min
        tarifa_aplicada: 15.00,
        consumos: [
          { id_consumo: 1, id_producto: 1, nombre: 'Cerveza Paceña 620ml', cantidad: 2, precio_unitario: 14.00, subtotal: 28.00 },
          { id_consumo: 2, id_producto: 5, nombre: 'Papas Pringles Original', cantidad: 1, precio_unitario: 15.00, subtotal: 15.00 }
        ]
      }
    },
    {
      id_mesa: 2,
      numero_nombre: 'Mesa 2 - Estándar',
      id_tarifa: 1,
      estado: 'LIBRE',
      sesion: null
    },
    {
      id_mesa: 3,
      numero_nombre: 'Mesa 3 - VIP Lounge',
      id_tarifa: 2,
      estado: 'OCUPADA',
      sesion: {
        id_sesion: 91,
        nombre_cliente: 'Grupo 8-Ball Pro',
        fecha_inicio: new Date(Date.now() - 20 * 60 * 1000), // Hace 20 min
        tarifa_aplicada: 25.00,
        consumos: [
          { id_consumo: 3, id_producto: 4, nombre: 'Red Bull Energy 250ml', cantidad: 2, precio_unitario: 18.00, subtotal: 36.00 }
        ]
      }
    },
    {
      id_mesa: 4,
      numero_nombre: 'Mesa 4 - Estándar',
      id_tarifa: 1,
      estado: 'LIBRE',
      sesion: null
    },
    {
      id_mesa: 5,
      numero_nombre: 'Mesa 5 - Carambola VIP',
      id_tarifa: 2,
      estado: 'MANTENIMIENTO',
      sesion: null
    },
    {
      id_mesa: 6,
      numero_nombre: 'Mesa 6 - Estándar',
      id_tarifa: 1,
      estado: 'LIBRE',
      sesion: null
    }
  ],

  historialSesiones: [
    {
      id_sesion: 88,
      mesa_nombre: 'Mesa 4 - Estándar',
      nombre_cliente: 'Roberto Gómez',
      fecha_inicio: '18:30',
      fecha_fin: '20:15',
      minutos_jugados: 105,
      monto_tiempo: 26.25,
      monto_consumo: 58.75,
      monto_total: 85.00,
      estado: 'FINALIZADA'
    },
    {
      id_sesion: 89,
      mesa_nombre: 'Mesa 2 - Estándar',
      nombre_cliente: 'Cliente Mostrador',
      fecha_inicio: '19:00',
      fecha_fin: '21:00',
      minutos_jugados: 120,
      monto_tiempo: 30.00,
      monto_consumo: 70.00,
      monto_total: 100.00,
      estado: 'FINALIZADA'
    }
  ],

  posCart: [], // Carrito de Venta Directa
  selectedPayMode: 'EFECTIVO',
  currentFilter: 'TODAS'
};

// ==========================================================================
// INICIALIZACIÓN Y CICLO DE TIEMPO VIVO
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  startLiveClock();
  renderAll();

  // Actualizar temporizadores y montos de mesas cada 1 segundo
  setInterval(() => {
    updateLiveTableTimers();
  }, 1000);
});

function startLiveClock() {
  const clockEl = document.getElementById('liveClock');
  setInterval(() => {
    const now = new Date();
    clockEl.innerText = now.toLocaleTimeString('es-BO', { hour12: false });
  }, 1000);
}

// ==========================================================================
// RENDERS GENERALES
// ==========================================================================
function renderAll() {
  renderHeaderStatus();
  renderMetrics();
  renderMesasGrid();
  renderPosCatalog();
  renderPosCart();
  renderCajaTab();
  renderProductosTab();
  renderTarifasTab();
  renderHistorialTab();
}

function switchTab(tabKey) {
  document.querySelectorAll('.nav-tab-btn').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-content').forEach(tab => tab.classList.remove('active'));

  event.currentTarget.classList.add('active');
  const targetTab = document.getElementById(`tab-${tabKey}`);
  if (targetTab) targetTab.classList.add('active');
}

function renderHeaderStatus() {
  const pill = document.getElementById('cajaStatusPill');
  const txt = document.getElementById('cajaStatusText');
  if (state.caja.estado === 'ABIERTA') {
    pill.className = 'caja-status-pill';
    txt.innerText = `CAJA #${state.caja.id_caja} - ABIERTA`;
  } else {
    pill.className = 'caja-status-pill cerrada';
    txt.innerText = `CAJA #${state.caja.id_caja} - CERRADA`;
  }
}

function renderMetrics() {
  const libres = state.mesas.filter(m => m.estado === 'LIBRE').length;
  const ocupadas = state.mesas.filter(m => m.estado === 'OCUPADA').length;
  
  let totalConsumosActivos = 0;
  state.mesas.forEach(m => {
    if (m.sesion && m.sesion.consumos) {
      totalConsumosActivos += m.sesion.consumos.reduce((sum, c) => sum + c.subtotal, 0);
    }
  });

  const totalCaja = state.caja.monto_inicial + state.caja.pagos.reduce((sum, p) => sum + p.monto, 0);

  document.getElementById('metricLibres').innerText = libres;
  document.getElementById('metricOcupadas').innerText = ocupadas;
  document.getElementById('metricConsumos').innerText = `Bs ${totalConsumosActivos.toFixed(2)}`;
  document.getElementById('metricTotalCaja').innerText = `Bs ${totalCaja.toFixed(2)}`;
  document.getElementById('badgeMesasActivas').innerText = `${ocupadas} Activas`;
}

// ==========================================================================
// SALÓN DE MESAS (PESTAÑA 1)
// ==========================================================================
function filterMesas(filter, btnEl) {
  state.currentFilter = filter;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  if (btnEl) btnEl.classList.add('active');
  renderMesasGrid();
}

function renderMesasGrid() {
  const grid = document.getElementById('tablesGrid');
  grid.innerHTML = '';

  const filteredMesas = state.mesas.filter(m => {
    if (state.currentFilter === 'TODAS') return true;
    return m.estado === state.currentFilter;
  });

  filteredMesas.forEach(mesa => {
    const tarifaObj = state.tarifas.find(t => t.id_tarifa === mesa.id_tarifa);
    const tarifaNombre = tarifaObj ? tarifaObj.nombre : 'Tarifa Estándar';

    const card = document.createElement('div');
    card.className = `table-card estado-${mesa.estado}`;

    let bodyHTML = '';
    let financialsHTML = '';
    let actionsHTML = '';

    if (mesa.estado === 'OCUPADA' && mesa.sesion) {
      const s = mesa.sesion;
      const elapsedMins = Math.floor((Date.now() - s.fecha_inicio.getTime()) / 60000);
      const hoursDecimal = elapsedMins / 60;
      const montoTiempo = hoursDecimal * s.tarifa_aplicada;
      const montoConsumo = s.consumos.reduce((acc, c) => acc + c.subtotal, 0);
      const montoTotal = montoTiempo + montoConsumo;
      const timerStr = formatTimer(Date.now() - s.fecha_inicio.getTime());

      bodyHTML = `
        <div class="table-body">
          <img src="mesa.jpg" alt="Mesa" class="table-img">
          <div class="table-session-info">
            <div class="client-name"><i class="fa-solid fa-user"></i> ${escapeHTML(s.nombre_cliente)}</div>
            <div class="table-timer-display" id="timer-mesa-${mesa.id_mesa}">${timerStr}</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">Inicio: ${s.fecha_inicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
          </div>
        </div>
      `;

      financialsHTML = `
        <div class="table-financials">
          <div class="fin-item">
            <span class="fin-label">Tiempo</span>
            <span class="fin-val" id="montoTiempo-mesa-${mesa.id_mesa}">Bs ${montoTiempo.toFixed(2)}</span>
          </div>
          <div class="fin-item">
            <span class="fin-label">Consumo</span>
            <span class="fin-val">Bs ${montoConsumo.toFixed(2)}</span>
          </div>
          <div class="fin-item">
            <span class="fin-label">Total</span>
            <span class="fin-val total" id="montoTotal-mesa-${mesa.id_mesa}">Bs ${montoTotal.toFixed(2)}</span>
          </div>
        </div>
      `;

      actionsHTML = `
        <div class="table-actions">
          <button class="btn btn-secondary" style="flex:1;" onclick="openAgregarConsumoModal(${mesa.id_mesa})">
            <i class="fa-solid fa-utensils"></i> + Consumo
          </button>
          <button class="btn btn-warning" style="flex:1;" onclick="openCobrarSesionModal(${mesa.id_mesa})">
            <i class="fa-solid fa-receipt"></i> Cobrar
          </button>
        </div>
      `;
    } else if (mesa.estado === 'LIBRE') {
      bodyHTML = `
        <div class="table-body">
          <img src="mesa.jpg" alt="Mesa" class="table-img" style="filter: grayscale(40%);">
          <div class="table-session-info">
            <div class="client-name" style="color: var(--text-muted);"><i class="fa-solid fa-circle-dot"></i> Disponible</div>
            <div style="font-size: 0.85rem; color: var(--accent-emerald); font-weight: 600; margin-top: 4px;">Bs ${tarifaObj ? tarifaObj.monto_hora.toFixed(2) : '15.00'} / Hora</div>
          </div>
        </div>
      `;

      actionsHTML = `
        <div class="table-actions">
          <button class="btn btn-primary btn-full" onclick="openAbrirSesionModal(${mesa.id_mesa})">
            <i class="fa-solid fa-play"></i> Abrir Sesión de Mesa
          </button>
        </div>
      `;
    } else {
      // MANTENIMIENTO
      bodyHTML = `
        <div class="table-body">
          <img src="mesa.jpg" alt="Mesa" class="table-img" style="filter: opacity(50%);">
          <div class="table-session-info">
            <div class="client-name" style="color: var(--danger-red);"><i class="fa-solid fa-wrench"></i> Fuera de Servicio</div>
            <div style="font-size: 0.75rem; color: var(--text-muted);">En mantenimiento técnico</div>
          </div>
        </div>
      `;

      actionsHTML = `
        <div class="table-actions">
          <button class="btn btn-secondary btn-full" onclick="cambiarEstadoMesa(${mesa.id_mesa}, 'LIBRE')">
            <i class="fa-solid fa-wrench"></i> Habilitar Mesa
          </button>
        </div>
      `;
    }

    card.innerHTML = `
      <div class="table-card-header">
        <div class="table-name">
          ${escapeHTML(mesa.numero_nombre)}
          <span class="tarifa-tag">${tarifaNombre}</span>
        </div>
        <span class="status-badge ${mesa.estado}">${mesa.estado}</span>
      </div>
      ${bodyHTML}
      ${financialsHTML}
      ${actionsHTML}
    `;

    grid.appendChild(card);
  });
}

function updateLiveTableTimers() {
  state.mesas.forEach(mesa => {
    if (mesa.estado === 'OCUPADA' && mesa.sesion) {
      const s = mesa.sesion;
      const diffMs = Date.now() - s.fecha_inicio.getTime();
      const elapsedMins = Math.floor(diffMs / 60000);
      const hoursDecimal = elapsedMins / 60;
      const montoTiempo = hoursDecimal * s.tarifa_aplicada;
      const montoConsumo = s.consumos.reduce((acc, c) => acc + c.subtotal, 0);
      const montoTotal = montoTiempo + montoConsumo;

      const timerEl = document.getElementById(`timer-mesa-${mesa.id_mesa}`);
      const montoTiempoEl = document.getElementById(`montoTiempo-mesa-${mesa.id_mesa}`);
      const montoTotalEl = document.getElementById(`montoTotal-mesa-${mesa.id_mesa}`);

      if (timerEl) timerEl.innerText = formatTimer(diffMs);
      if (montoTiempoEl) montoTiempoEl.innerText = `Bs ${montoTiempo.toFixed(2)}`;
      if (montoTotalEl) montoTotalEl.innerText = `Bs ${montoTotal.toFixed(2)}`;
    }
  });
}

function formatTimer(ms) {
  const totalSecs = Math.floor(ms / 1000);
  const hrs = Math.floor(totalSecs / 3600);
  const mins = Math.floor((totalSecs % 3600) / 60);
  const secs = totalSecs % 60;
  return `${padZero(hrs)}:${padZero(mins)}:${padZero(secs)}`;
}

function padZero(num) {
  return num < 10 ? '0' + num : num;
}

// ==========================================================================
// MODAL: ABRIR SESIÓN
// ==========================================================================
function openAbrirSesionModal(idMesa) {
  if (state.caja.estado !== 'ABIERTA') {
    showToast('Caja Cerrada', 'Debes abrir el turno de caja antes de habilitar mesas.', 'danger');
    return;
  }

  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  if (!mesa) return;

  document.getElementById('modalAbrirSesionMesaId').value = idMesa;
  document.getElementById('modalAbrirSesionTitle').innerText = `Abrir Sesión en ${mesa.numero_nombre}`;
  document.getElementById('modalAbrirClienteName').value = '';

  const selectTarifa = document.getElementById('modalAbrirTarifaSelect');
  selectTarifa.innerHTML = '';
  state.tarifas.forEach(t => {
    const opt = document.createElement('option');
    opt.value = t.id_tarifa;
    opt.innerText = `${t.nombre} - Bs ${t.monto_hora.toFixed(2)} / hora`;
    if (t.id_tarifa === mesa.id_tarifa) opt.selected = true;
    selectTarifa.appendChild(opt);
  });

  openModal('modalAbrirSesion');
}

function confirmarAbrirSesion() {
  const idMesa = parseInt(document.getElementById('modalAbrirSesionMesaId').value);
  const nombreCliente = document.getElementById('modalAbrirClienteName').value.trim() || 'Cliente General';
  const idTarifa = parseInt(document.getElementById('modalAbrirTarifaSelect').value);
  const tarifaObj = state.tarifas.find(t => t.id_tarifa === idTarifa);

  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  if (mesa) {
    mesa.estado = 'OCUPADA';
    mesa.sesion = {
      id_sesion: Math.floor(Math.random() * 9000) + 100,
      nombre_cliente: nombreCliente,
      fecha_inicio: new Date(),
      tarifa_aplicada: tarifaObj ? tarifaObj.monto_hora : 15.00,
      consumos: []
    };

    closeModal('modalAbrirSesion');
    renderMetrics();
    renderMesasGrid();
    showToast('Sesión Iniciada', `${mesa.numero_nombre} abierta para ${nombreCliente}`, 'success');
  }
}

// ==========================================================================
// MODAL: AGREGAR CONSUMO
// ==========================================================================
function openAgregarConsumoModal(idMesa) {
  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  if (!mesa || !mesa.sesion) return;

  document.getElementById('modalConsumoMesaId').value = idMesa;
  document.getElementById('modalConsumoTitle').innerText = `Consumo para ${mesa.numero_nombre}`;

  const selectProd = document.getElementById('modalConsumoProductoSelect');
  selectProd.innerHTML = '';
  state.productos.forEach(p => {
    const opt = document.createElement('option');
    opt.value = p.id_prod;
    opt.innerText = `${p.icon} ${p.nombre} (Bs ${p.precio_unitario.toFixed(2)}) - Stock: ${p.stock}`;
    selectProd.appendChild(opt);
  });

  document.getElementById('modalConsumoCantidad').value = 1;
  updateModalConsumoPreview();
  openModal('modalAgregarConsumo');
}

function updateModalConsumoPreview() {
  const idProd = parseInt(document.getElementById('modalConsumoProductoSelect').value);
  const cant = parseInt(document.getElementById('modalConsumoCantidad').value) || 1;
  const prod = state.productos.find(p => p.id_prod === idProd);
  if (prod) {
    const subt = prod.precio_unitario * cant;
    document.getElementById('modalConsumoSubtotal').value = `Bs ${subt.toFixed(2)}`;
  }
}

function confirmarAgregarConsumo() {
  const idMesa = parseInt(document.getElementById('modalConsumoMesaId').value);
  const idProd = parseInt(document.getElementById('modalConsumoProductoSelect').value);
  const cant = parseInt(document.getElementById('modalConsumoCantidad').value) || 1;

  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  const prod = state.productos.find(p => p.id_prod === idProd);

  if (mesa && mesa.sesion && prod) {
    if (prod.stock < cant) {
      showToast('Stock Insuficiente', `Solo quedan ${prod.stock} unidades de ${prod.nombre}`, 'danger');
      return;
    }

    prod.stock -= cant; // Reducir stock simulado
    const subt = prod.precio_unitario * cant;

    mesa.sesion.consumos.push({
      id_consumo: Date.now(),
      id_producto: prod.id_prod,
      nombre: prod.nombre,
      cantidad: cant,
      precio_unitario: prod.precio_unitario,
      subtotal: subt
    });

    closeModal('modalAgregarConsumo');
    renderMetrics();
    renderMesasGrid();
    renderProductosTab();
    showToast('Consumo Agregado', `${cant}x ${prod.nombre} despachado a ${mesa.numero_nombre}`, 'success');
  }
}

// ==========================================================================
// MODAL: COBRAR Y LIQUIDAR MESA
// ==========================================================================
function openCobrarSesionModal(idMesa) {
  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  if (!mesa || !mesa.sesion) return;

  const s = mesa.sesion;
  const elapsedMins = Math.floor((Date.now() - s.fecha_inicio.getTime()) / 60000);
  const hoursDecimal = elapsedMins / 60;
  const montoTiempo = hoursDecimal * s.tarifa_aplicada;
  const montoConsumo = s.consumos.reduce((acc, c) => acc + c.subtotal, 0);
  const montoTotal = montoTiempo + montoConsumo;

  document.getElementById('modalCobrarMesaId').value = idMesa;
  document.getElementById('modalCobrarTitle').innerText = `Liquidar Account - ${mesa.numero_nombre}`;
  document.getElementById('recCliente').innerText = `${mesa.numero_nombre} - ${s.nombre_cliente}`;
  document.getElementById('recTiempo').innerText = `${elapsedMins} minutos (Tarifa: Bs ${s.tarifa_aplicada.toFixed(2)}/h)`;
  document.getElementById('recMontoTiempo').innerText = `Bs ${montoTiempo.toFixed(2)}`;
  document.getElementById('recMontoConsumo').innerText = `Bs ${montoConsumo.toFixed(2)}`;
  document.getElementById('recMontoTotal').innerText = `Bs ${montoTotal.toFixed(2)}`;

  // Inputs de pago
  document.getElementById('payEfectivoInput').value = montoTotal.toFixed(2);
  document.getElementById('payQRInput').value = '0.00';
  
  selectPayMode('EFECTIVO');
  calculateChange();
  openModal('modalCobrarSesion');
}

function selectPayMode(mode, el) {
  state.selectedPayMode = mode;
  if (el) {
    document.querySelectorAll('.pay-method-card').forEach(c => c.classList.remove('selected'));
    el.classList.add('selected');
  }

  const grpEfectivo = document.getElementById('groupPayEfectivo');
  const grpQR = document.getElementById('groupPayQR');

  if (mode === 'EFECTIVO') {
    grpEfectivo.style.display = 'block';
    grpQR.style.display = 'none';
  } else if (mode === 'QR') {
    grpEfectivo.style.display = 'none';
    grpQR.style.display = 'block';
  } else {
    // HIBRIDO
    grpEfectivo.style.display = 'block';
    grpQR.style.display = 'block';
  }
  calculateChange();
}

function calculateChange() {
  const totalTxt = document.getElementById('recMontoTotal').innerText.replace('Bs ', '');
  const totalToPay = parseFloat(totalTxt) || 0;

  let efec = 0;
  let qr = 0;

  if (state.selectedPayMode === 'EFECTIVO') {
    efec = parseFloat(document.getElementById('payEfectivoInput').value) || 0;
  } else if (state.selectedPayMode === 'QR') {
    qr = parseFloat(document.getElementById('payQRInput').value) || 0;
  } else {
    efec = parseFloat(document.getElementById('payEfectivoInput').value) || 0;
    qr = parseFloat(document.getElementById('payQRInput').value) || 0;
  }

  const totalAbonado = efec + qr;
  const cambio = totalAbonado - totalToPay;

  const cambioDisplay = document.getElementById('payCambioDisplay');
  const warnMsg = document.getElementById('payWarningMessage');

  if (cambio < -0.01) {
    cambioDisplay.innerText = 'Bs 0.00';
    warnMsg.style.display = 'block';
    warnMsg.innerText = `Falta abonar Bs ${Math.abs(cambio).toFixed(2)}`;
  } else {
    cambioDisplay.innerText = `Bs ${cambio.toFixed(2)}`;
    warnMsg.style.display = 'none';
  }
}

function confirmarCobrarSesion() {
  const idMesa = parseInt(document.getElementById('modalCobrarMesaId').value);
  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  if (!mesa || !mesa.sesion) return;

  const s = mesa.sesion;
  const elapsedMins = Math.floor((Date.now() - s.fecha_inicio.getTime()) / 60000);
  const hoursDecimal = elapsedMins / 60;
  const montoTiempo = hoursDecimal * s.tarifa_aplicada;
  const montoConsumo = s.consumos.reduce((acc, c) => acc + c.subtotal, 0);
  const montoTotal = montoTiempo + montoConsumo;

  // Registrar Pagos en la Caja
  let efec = 0;
  let qr = 0;
  if (state.selectedPayMode === 'EFECTIVO') {
    efec = montoTotal;
  } else if (state.selectedPayMode === 'QR') {
    qr = montoTotal;
  } else {
    efec = parseFloat(document.getElementById('payEfectivoInput').value) || 0;
    qr = parseFloat(document.getElementById('payQRInput').value) || 0;
  }

  if (efec > 0) {
    state.caja.pagos.push({
      id_pago: Date.now(),
      fecha: new Date(),
      origen: `${mesa.numero_nombre} (Sesión #${s.id_sesion})`,
      metodo: 'Efectivo',
      monto: efec
    });
  }
  if (qr > 0) {
    state.caja.pagos.push({
      id_pago: Date.now() + 1,
      fecha: new Date(),
      origen: `${mesa.numero_nombre} (Sesión #${s.id_sesion})`,
      metodo: 'QR',
      monto: qr
    });
  }

  // Bitácora Historial
  state.historialSesiones.unshift({
    id_sesion: s.id_sesion,
    mesa_nombre: mesa.numero_nombre,
    nombre_cliente: s.nombre_cliente,
    fecha_inicio: s.fecha_inicio.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    fecha_fin: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}),
    minutos_jugados: elapsedMins,
    monto_tiempo: montoTiempo,
    monto_consumo: montoConsumo,
    monto_total: montoTotal,
    estado: 'FINALIZADA'
  });

  // Liberar Mesa
  mesa.estado = 'LIBRE';
  mesa.sesion = null;

  closeModal('modalCobrarSesion');
  renderAll();
  showToast('Partida Cobrada', `Cobro finalizado con éxito para ${mesa.numero_nombre} por Bs ${montoTotal.toFixed(2)}`, 'success');
}

// ==========================================================================
// VENTA DIRECTA (PESTAÑA 2)
// ==========================================================================
function renderPosCatalog() {
  const grid = document.getElementById('posProductsGrid');
  grid.innerHTML = '';

  const query = (document.getElementById('searchPosProduct').value || '').toLowerCase();

  state.productos.forEach(p => {
    if (query && !p.nombre.toLowerCase().includes(query) && !p.id_categoria.toLowerCase().includes(query)) return;

    const card = document.createElement('div');
    card.className = 'product-card';
    card.onclick = () => addToPosCart(p.id_prod);
    card.innerHTML = `
      <div class="prod-icon">${p.icon}</div>
      <div class="prod-name">${escapeHTML(p.nombre)}</div>
      <div class="prod-price">Bs ${p.precio_unitario.toFixed(2)}</div>
      <div class="prod-stock">Stock: ${p.stock}</div>
    `;
    grid.appendChild(card);
  });
}

function filterPosProducts() {
  renderPosCatalog();
}

function addToPosCart(idProd) {
  const prod = state.productos.find(p => p.id_prod === idProd);
  if (!prod) return;

  const existing = state.posCart.find(item => item.id_prod === idProd);
  if (existing) {
    if (existing.cantidad < prod.stock) {
      existing.cantidad++;
    } else {
      showToast('Límite de Stock', `No hay más stock de ${prod.nombre}`, 'danger');
    }
  } else {
    state.posCart.push({
      id_prod: prod.id_prod,
      nombre: prod.nombre,
      precio_unitario: prod.precio_unitario,
      cantidad: 1
    });
  }

  renderPosCart();
}

function updatePosCartQty(idProd, delta) {
  const item = state.posCart.find(i => i.id_prod === idProd);
  if (!item) return;

  item.cantidad += delta;
  if (item.cantidad <= 0) {
    state.posCart = state.posCart.filter(i => i.id_prod !== idProd);
  }
  renderPosCart();
}

function renderPosCart() {
  const cartList = document.getElementById('posCartList');
  if (state.posCart.length === 0) {
    cartList.innerHTML = `<p style="color: var(--text-muted); text-align: center; margin-top: 2rem;">El carrito está vacío. Haz clic en un producto para agregar.</p>`;
    document.getElementById('posSubtotal').innerText = 'Bs 0.00';
    document.getElementById('posTotal').innerText = 'Bs 0.00';
    return;
  }

  cartList.innerHTML = '';
  let total = 0;

  state.posCart.forEach(item => {
    const subt = item.precio_unitario * item.cantidad;
    total += subt;

    const row = document.createElement('div');
    row.className = 'cart-item';
    row.innerHTML = `
      <div class="cart-item-info">
        <div class="cart-item-title">${escapeHTML(item.nombre)}</div>
        <div class="cart-item-sub">Bs ${item.precio_unitario.toFixed(2)} c/u</div>
      </div>
      <div class="cart-qty-ctrl">
        <button class="qty-btn" onclick="updatePosCartQty(${item.id_prod}, -1)">-</button>
        <span style="font-family: var(--font-mono); font-weight: 700;">${item.cantidad}</span>
        <button class="qty-btn" onclick="updatePosCartQty(${item.id_prod}, 1)">+</button>
      </div>
    `;
    cartList.appendChild(row);
  });

  document.getElementById('posSubtotal').innerText = `Bs ${total.toFixed(2)}`;
  document.getElementById('posTotal').innerText = `Bs ${total.toFixed(2)}`;
}

function checkoutPosOrder() {
  if (state.posCart.length === 0) {
    showToast('Carrito Vacío', 'Agrega productos al carrito antes de cobrar.', 'danger');
    return;
  }

  const total = state.posCart.reduce((sum, item) => sum + (item.precio_unitario * item.cantidad), 0);

  // Registrar Venta al Paso en la Caja
  state.caja.pagos.push({
    id_pago: Date.now(),
    fecha: new Date(),
    origen: 'Venta Directa Mostrador',
    metodo: 'Efectivo',
    monto: total
  });

  // Descontar stock
  state.posCart.forEach(item => {
    const prod = state.productos.find(p => p.id_prod === item.id_prod);
    if (prod) prod.stock -= item.cantidad;
  });

  state.posCart = [];
  renderAll();
  showToast('Venta Registrada', `Venta al paso cobrada por Bs ${total.toFixed(2)}`, 'success');
}

// ==========================================================================
// CONTROL DE CAJA (PESTAÑA 3)
// ==========================================================================
function renderCajaTab() {
  const c = state.caja;
  document.getElementById('cajaMontoInicial').innerText = `Bs ${c.monto_inicial.toFixed(2)}`;

  let efec = 0;
  let qr = 0;

  c.pagos.forEach(p => {
    if (p.metodo === 'Efectivo') efec += p.monto;
    else qr += p.monto;
  });

  const totalSistema = c.monto_inicial + efec + qr;

  document.getElementById('cajaTotalEfectivo').innerText = `Bs ${efec.toFixed(2)}`;
  document.getElementById('cajaTotalQR').innerText = `Bs ${qr.toFixed(2)}`;
  document.getElementById('cajaTotalSistema').innerText = `Bs ${totalSistema.toFixed(2)}`;

  const tableBody = document.getElementById('cajaPagosTable');
  tableBody.innerHTML = '';

  c.pagos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${p.id_pago}</td>
      <td>${p.fecha.toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</td>
      <td>${escapeHTML(p.origen)}</td>
      <td><span class="tarifa-tag">${p.metodo}</span></td>
      <td>${c.cajero_nombre}</td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-emerald);">Bs ${p.monto.toFixed(2)}</td>
    `;
    tableBody.appendChild(tr);
  });
}

function openAbrirCajaModal() {
  state.caja.estado = 'ABIERTA';
  state.caja.fecha_apertura = new Date();
  renderHeaderStatus();
  showToast('Caja Abierta', 'Turno iniciado correctamente.', 'success');
}

function openCierreCajaModal() {
  if (confirm('¿Deseas realizar el Arqueo de Caja y cerrar el turno actual?')) {
    state.caja.estado = 'CERRADA';
    renderHeaderStatus();
    showToast('Caja Cerrada', 'Turno finalizado y reporte de arqueo generado.', 'danger');
  }
}

// ==========================================================================
// PRODUCTOS E INVENTARIO (PESTAÑA 4)
// ==========================================================================
function renderProductosTab() {
  const tbody = document.getElementById('productosTableBody');
  tbody.innerHTML = '';

  state.productos.forEach(p => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${p.id_prod}</td>
      <td><span class="badge-category">${p.id_categoria}</span></td>
      <td><strong>${p.icon} ${escapeHTML(p.nombre)}</strong></td>
      <td style="font-family: var(--font-mono);">Bs ${p.precio_unitario.toFixed(2)}</td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: ${p.stock < 15 ? 'var(--danger-red)' : 'var(--text-main)'};">${p.stock} un.</td>
      <td><span class="status-badge LIBRE">ACTIVO</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// TARIFAS Y MESAS (PESTAÑA 5)
// ==========================================================================
function renderTarifasTab() {
  const tbody = document.getElementById('tarifasTableBody');
  tbody.innerHTML = '';

  state.tarifas.forEach(t => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${t.id_tarifa}</td>
      <td><strong>${escapeHTML(t.nombre)}</strong></td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-gold);">Bs ${t.monto_hora.toFixed(2)} / hora</td>
      <td><span class="status-badge LIBRE">VIGENTE</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// HISTORIAL (PESTAÑA 6)
// ==========================================================================
function renderHistorialTab() {
  const tbody = document.getElementById('historialTableBody');
  tbody.innerHTML = '';

  state.historialSesiones.forEach(h => {
    const tr = document.createElement('tr');
    tr.innerHTML = `
      <td>#${h.id_sesion}</td>
      <td>${escapeHTML(h.mesa_nombre)}</td>
      <td>${escapeHTML(h.nombre_cliente)}</td>
      <td>${h.fecha_inicio} - ${h.fecha_fin}</td>
      <td style="font-family: var(--font-mono);">${h.minutos_jugados} min</td>
      <td style="font-family: var(--font-mono);">Bs ${h.monto_tiempo.toFixed(2)}</td>
      <td style="font-family: var(--font-mono);">Bs ${h.monto_consumo.toFixed(2)}</td>
      <td style="font-family: var(--font-mono); font-weight: 700; color: var(--accent-emerald);">Bs ${h.monto_total.toFixed(2)}</td>
      <td><span class="tarifa-tag">${h.estado}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

// ==========================================================================
// MODAL HELPERS & UTILS
// ==========================================================================
function openModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.add('active');
}

function closeModal(modalId) {
  const m = document.getElementById(modalId);
  if (m) m.classList.remove('active');
}

function cambiarEstadoMesa(idMesa, nuevoEstado) {
  const mesa = state.mesas.find(m => m.id_mesa === idMesa);
  if (mesa) {
    mesa.estado = nuevoEstado;
    renderMetrics();
    renderMesasGrid();
    showToast('Estado de Mesa', `${mesa.numero_nombre} habilitada en estado LIBRE`, 'success');
  }
}

function showToast(title, message, type = 'info') {
  const container = document.getElementById('toastContainer');
  const toast = document.createElement('div');
  toast.className = 'toast';
  
  let icon = '<i class="fa-solid fa-circle-info"></i>';
  if (type === 'success') icon = '<i class="fa-solid fa-circle-check" style="color: var(--accent-emerald);"></i>';
  if (type === 'danger') icon = '<i class="fa-solid fa-triangle-exclamation" style="color: var(--danger-red);"></i>';

  toast.innerHTML = `
    <div class="toast-icon">${icon}</div>
    <div class="toast-content">
      <h4>${escapeHTML(title)}</h4>
      <p>${escapeHTML(message)}</p>
    </div>
  `;

  container.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateX(100%)';
    toast.style.transition = 'all 0.3s ease';
    setTimeout(() => toast.remove(), 300);
  }, 3500);
}

function escapeHTML(str) {
  if (!str) return '';
  return str.toString().replace(/[&<>"']/g, match => {
    const escapeMap = {
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    };
    return escapeMap[match];
  });
}
