// ─────────────────────────────────────────
// Estado global
// ─────────────────────────────────────────

const hoy = new Date();
let mesActual   = hoy.getMonth();
let añoActual   = hoy.getFullYear();
let eventos     = [];
let idEditando  = null;   // null = nuevo evento, número = editando uno existente

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

    const fechaDelDia  = formatearFecha(añoActual, mesActual + 1, dia);
    const tieneEventos = eventos.some(e => e.fecha === fechaDelDia);
    if (tieneEventos) {
      const punto = document.createElement('div');
      punto.classList.add('punto-evento');
      celda.appendChild(punto);
    }

    celda.addEventListener('click', () => abrirPanelDia(dia));
    calendario.appendChild(celda);
  }
}

// ─────────────────────────────────────────
// Panel: eventos de un día
// ─────────────────────────────────────────

function abrirPanelDia(dia) {
  const fecha = formatearFecha(añoActual, mesActual + 1, dia);

  document.getElementById('titulo-dia').textContent =
    `${dia} ${MESES[mesActual]} ${añoActual}`;

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

      // Al pulsar el evento → abre el formulario para editarlo
      item.addEventListener('click', () => {
        cerrarPanelDia();
        abrirPanelEditar(evento);
      });

      lista.appendChild(item);
    });
  }

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
// Abrir formulario — modo NUEVO evento
// ─────────────────────────────────────────

function abrirPanel() {
  idEditando = null;   // modo nuevo

  document.getElementById('panel-cabecera').querySelector('h3').textContent = 'Nuevo evento';
  document.getElementById('btn-guardar').textContent  = 'Guardar evento';
  document.getElementById('btn-eliminar').classList.add('oculto');
  document.getElementById('form-evento').reset();

  document.getElementById('input-fecha').value =
    formatearFecha(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());

  document.getElementById('panel-formulario').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');
}

// ─────────────────────────────────────────
// Abrir formulario — modo EDITAR evento
// ─────────────────────────────────────────

function abrirPanelEditar(evento) {
  idEditando = evento.id;   // guardamos qué evento estamos editando

  document.getElementById('panel-cabecera').querySelector('h3').textContent = 'Editar evento';
  document.getElementById('btn-guardar').textContent = 'Guardar cambios';
  document.getElementById('btn-eliminar').classList.remove('oculto');

  // Rellena el formulario con los datos del evento
  document.getElementById('input-nombre').value      = evento.titulo;
  document.getElementById('input-fecha').value       = evento.fecha;
  document.getElementById('input-hora-inicio').value = evento.hora_inicio;
  document.getElementById('input-hora-fin').value    = evento.hora_fin;
  document.getElementById('input-tipo').value        = evento.tipo;

  document.getElementById('panel-formulario').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');
}

// ─────────────────────────────────────────
// Cerrar formulario
// ─────────────────────────────────────────

function cerrarPanel() {
  document.getElementById('panel-formulario').classList.add('oculto');
  document.getElementById('panel-overlay').classList.add('oculto');
  document.getElementById('form-evento').reset();
  idEditando = null;
}

document.getElementById('btn-añadir').addEventListener('click', abrirPanel);
document.getElementById('btn-cerrar-panel').addEventListener('click', cerrarPanel);

document.getElementById('panel-overlay').addEventListener('click', () => {
  cerrarPanel();
  cerrarPanelDia();
});

// ─────────────────────────────────────────
// Guardar: crea o actualiza el evento
// ─────────────────────────────────────────

document.getElementById('form-evento').addEventListener('submit', (e) => {
  e.preventDefault();

  const datosFormulario = {
    titulo:      document.getElementById('input-nombre').value,
    fecha:       document.getElementById('input-fecha').value,
    hora_inicio: document.getElementById('input-hora-inicio').value,
    hora_fin:    document.getElementById('input-hora-fin').value,
    tipo:        document.getElementById('input-tipo').value,
  };

  if (idEditando === null) {
    // Modo nuevo: añadir al array
    eventos.push({ id: Date.now(), ...datosFormulario });
  } else {
    // Modo editar: reemplazar el evento existente
    eventos = eventos.map(e =>
      e.id === idEditando ? { id: idEditando, ...datosFormulario } : e
    );
  }

  cerrarPanel();
  mostrarCalendario();
});

// ─────────────────────────────────────────
// Eliminar evento
// ─────────────────────────────────────────

document.getElementById('btn-eliminar').addEventListener('click', () => {
  if (idEditando === null) return;

  const confirmar = confirm('¿Eliminar este evento?');
  if (!confirmar) return;

  eventos = eventos.filter(e => e.id !== idEditando);
  cerrarPanel();
  mostrarCalendario();
});

// ─────────────────────────────────────────
// Arranca la aplicación
// ─────────────────────────────────────────

mostrarCalendario();