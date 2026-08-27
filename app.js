// ─────────────────────────────────────────
// Estado global
// ─────────────────────────────────────────

const hoy = new Date();
let mesActual  = hoy.getMonth();
let añoActual  = hoy.getFullYear();

// Array donde guardamos los eventos (en memoria por ahora)
let eventos = [];

// ─────────────────────────────────────────
// Nombres de los meses en español
// ─────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ─────────────────────────────────────────
// Dibuja el calendario
// ─────────────────────────────────────────

function mostrarCalendario() {
  document.getElementById('titulo-mes').textContent =
    `${MESES[mesActual]} ${añoActual}`;

  const calendario = document.getElementById('calendario');
  calendario.innerHTML = '';

  const primerDia    = new Date(añoActual, mesActual, 1).getDay();
  const desplazamiento = (primerDia === 0) ? 6 : primerDia - 1;
  const totalDias    = new Date(añoActual, mesActual + 1, 0).getDate();

  // Celdas vacías antes del día 1
  for (let i = 0; i < desplazamiento; i++) {
    const vacio = document.createElement('div');
    vacio.classList.add('vacio');
    calendario.appendChild(vacio);
  }

  // Un elemento por cada día
  for (let dia = 1; dia <= totalDias; dia++) {
    const celda = document.createElement('div');
    celda.classList.add('dia');
    celda.textContent = dia;

    // ¿Es hoy?
    const esHoy =
      dia === hoy.getDate() &&
      mesActual === hoy.getMonth() &&
      añoActual === hoy.getFullYear();
    if (esHoy) celda.classList.add('hoy');

    // ¿Tiene eventos? → mostrar punto azul
    const fechaDelDia = formatearFecha(añoActual, mesActual + 1, dia);
    const tieneEventos = eventos.some(e => e.fecha === fechaDelDia);
    if (tieneEventos) {
      const punto = document.createElement('div');
      punto.classList.add('punto-evento');
      celda.appendChild(punto);
    }

    calendario.appendChild(celda);
  }
}

// ─────────────────────────────────────────
// Utilidad: construye "2026-08-27"
// ─────────────────────────────────────────

function formatearFecha(año, mes, dia) {
  const mm = String(mes).padStart(2, '0');
  const dd = String(dia).padStart(2, '0');
  return `${año}-${mm}-${dd}`;
}

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
// Abrir y cerrar el panel del formulario
// ─────────────────────────────────────────

function abrirPanel() {
  document.getElementById('panel-formulario').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');

  // Pone la fecha de hoy por defecto
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
document.getElementById('panel-overlay').addEventListener('click', cerrarPanel);

// ─────────────────────────────────────────
// Guardar el evento al enviar el formulario
// ─────────────────────────────────────────

document.getElementById('form-evento').addEventListener('submit', (e) => {
  e.preventDefault();   // evita que la página se recargue

  const nuevoEvento = {
    id:         Date.now(),   // ID único temporal
    titulo:     document.getElementById('input-nombre').value,
    fecha:      document.getElementById('input-fecha').value,
    hora_inicio: document.getElementById('input-hora-inicio').value,
    hora_fin:   document.getElementById('input-hora-fin').value,
    tipo:       document.getElementById('input-tipo').value,
  };

  eventos.push(nuevoEvento);   // lo añadimos al array
  cerrarPanel();
  mostrarCalendario();         // redibuja para mostrar el punto azul
});

// ─────────────────────────────────────────
// Arranca la aplicación
// ─────────────────────────────────────────

mostrarCalendario();