// ─────────────────────────────────────────
// Estado global
// ─────────────────────────────────────────

const hoy = new Date();
let mesActual = hoy.getMonth();
let añoActual = hoy.getFullYear();
let eventos   = [];

// ─────────────────────────────────────────
// Nombres de meses y emojis por tipo
// ─────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

const EMOJIS = {
  clase:       '📚',
  laboratorio: '🔬',
  examen:      '📝',
  entrega:     '📌',
  reunion:     '🤝',
  otro:        '📅'
};

// ─────────────────────────────────────────
// Utilidad: construye "2026-08-27"
// ─────────────────────────────────────────

function formatearFecha(año, mes, dia) {
  const mm = String(mes).padStart(2, '0');
  const dd = String(dia).padStart(2, '0');
  return `${año}-${mm}-${dd}`;
}

// ─────────────────────────────────────────
// Dibuja el calendario
// ─────────────────────────────────────────

function mostrarCalendario() {
  document.getElementById('titulo-mes').textContent =
    `${MESES[mesActual]} ${añoActual}`;

  const calendario = document.getElementById('calendario');
  calendario.innerHTML = '';

  const primerDia      = new Date(añoActual, mesActual, 1).getDay();
  const desplazamiento = (primerDia === 0) ? 6 : primerDia - 1;
  const totalDias      = new Date(añoActual, mesActual + 1, 0).getDate();

  for (let i = 0; i < desplazamiento; i++) {
    const vacio = document.createElement('div');
    vacio.classList.add('vacio');
    calendario.appendChild(vacio);
  }

  for (let dia = 1; dia <= totalDias; dia++) {
    const celda = document.createElement('div');
    celda.classList.add('dia');
    celda.textContent = dia;

    const esHoy =
      dia === hoy.getDate() &&
      mesActual === hoy.getMonth() &&
      añoActual === hoy.getFullYear();
    if (esHoy) celda.classList.add('hoy');

    // Punto azul si tiene eventos
    const fechaDelDia = formatearFecha(añoActual, mesActual + 1, dia);
    const tieneEventos = eventos.some(e => e.fecha === fechaDelDia);
    if (tieneEventos) {
      const punto = document.createElement('div');
      punto.classList.add('punto-evento');
      celda.appendChild(punto);
    }

    // Al pulsar un día → abrir panel de eventos
    celda.addEventListener('click', () => abrirPanelDia(dia));

    calendario.appendChild(celda);
  }
}

// ─────────────────────────────────────────
// Panel: eventos de un día
// ─────────────────────────────────────────

function abrirPanelDia(dia) {
  const fecha = formatearFecha(añoActual, mesActual + 1, dia);

  // Título del panel: "27 Agosto 2026"
  document.getElementById('titulo-dia').textContent =
    `${dia} ${MESES[mesActual]} ${añoActual}`;

  // Filtra los eventos de ese día y los ordena por hora
  const eventosDelDia = eventos
    .filter(e => e.fecha === fecha)
    .sort((a, b) => a.hora_inicio.localeCompare(b.hora_inicio));

  const lista = document.getElementById('lista-eventos');
  lista.innerHTML = '';

  if (eventosDelDia.length === 0) {
    lista.innerHTML = '<p>No tienes eventos para este día.</p>';
  } else {
    eventosDelDia.forEach(evento => {
      const item = document.createElement('div');
      item.classList.add('evento-item');

      const hora = evento.hora_fin
        ? `${evento.hora_inicio} – ${evento.hora_fin}`
        : evento.hora_inicio;

      item.innerHTML = `
        <span class="evento-emoji">${EMOJIS[evento.tipo] || '📅'}</span>
        <div class="evento-info">
          <span class="evento-hora">${hora}</span>
          <span class="evento-titulo">${evento.titulo}</span>
        </div>
      `;

      lista.appendChild(item);
    });
  }

  // Muestra el panel (reutiliza el overlay del formulario)
  document.getElementById('panel-dia').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');
}

function cerrarPanelDia() {
  document.getElementById('panel-dia').classList.add('oculto');
  document.getElementById('panel-overlay').classList.add('oculto');
}

document.getElementById('btn-cerrar-dia').addEventListener('click', cerrarPanelDia);

// ─────────────────────────────────────────
// Navegación entre meses
// ─────────────────────────────────────────

document.getElementById('btn-anterior').addEventListener('click', () => {
  mesActual--;
  if (mesActual < 0) { mesActual = 11; añoActual--; }
  mostrarCalendario();
});

document.getElementById('btn-siguiente').addEventListener('click', () => {
  mesActual++;
  if (mesActual > 11) { mesActual = 0; añoActual++; }
  mostrarCalendario();
});

// ─────────────────────────────────────────
// Abrir y cerrar el formulario
// ─────────────────────────────────────────

function abrirPanel() {
  document.getElementById('panel-formulario').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');
  document.getElementById('input-fecha').value =
    formatearFecha(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
}

function cerrarPanel() {
  document.getElementById('panel-formulario').classList.add('oculto');
  document.getElementById('panel-overlay').classList.add('oculto');
  document.getElementById('form-evento').reset();
}

document.getElementById('btn-añadir').addEventListener('click', abrirPanel);
document.getElementById('btn-cerrar-panel').addEventListener('click', cerrarPanel);

// El overlay cierra cualquier panel abierto
document.getElementById('panel-overlay').addEventListener('click', () => {
  cerrarPanel();
  cerrarPanelDia();
});

// ─────────────────────────────────────────
// Guardar evento
// ─────────────────────────────────────────

document.getElementById('form-evento').addEventListener('submit', (e) => {
  e.preventDefault();

  const nuevoEvento = {
    id:          Date.now(),
    titulo:      document.getElementById('input-nombre').value,
    fecha:       document.getElementById('input-fecha').value,
    hora_inicio: document.getElementById('input-hora-inicio').value,
    hora_fin:    document.getElementById('input-hora-fin').value,
    tipo:        document.getElementById('input-tipo').value,
  };

  eventos.push(nuevoEvento);
  cerrarPanel();
  mostrarCalendario();
});

// ─────────────────────────────────────────
// Arranca la aplicación
// ─────────────────────────────────────────

mostrarCalendario();