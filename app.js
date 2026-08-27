// ─────────────────────────────────────────
// Conexión con Supabase
// ─────────────────────────────────────────

const { createClient } = supabase;
const db = createClient(SUPABASE_URL, SUPABASE_KEY);

// ─────────────────────────────────────────
// Estado global
// ─────────────────────────────────────────

const hoy = new Date();
let mesActual  = hoy.getMonth();
let añoActual  = hoy.getFullYear();
let eventos    = [];
let idEditando = null;

// ─────────────────────────────────────────
// Constantes
// ─────────────────────────────────────────

const MESES = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'
];

const DIAS_SEMANA = ['Lunes','Martes','Miércoles','Jueves','Viernes'];

const EMOJIS = {
  clase:'📚', laboratorio:'🔬', examen:'📝',
  entrega:'📌', reunion:'🤝', otro:'📅'
};

// ─────────────────────────────────────────
// Horario fijo — 1er semestre
// ─────────────────────────────────────────

const horario = [
  { nombre: 'Sis. Elec. Digitales',   dia: 1, inicio: '12:00', fin: '14:00', aula: 'B22', color: '#d4e5f7' },
  { nombre: 'Sis. Elec. Digitales',   dia: 2, inicio: '12:00', fin: '14:00', aula: 'B22', color: '#d4e5f7' },
  { nombre: 'Sis. Elec. Digitales',   dia: 3, inicio: '10:30', fin: '11:30', aula: 'B22', color: '#d4e5f7' },
  { nombre: 'Ing. Control',           dia: 3, inicio: '09:30', fin: '10:30', aula: 'B22', color: '#ffd4de' },
  { nombre: 'Ing. Control',           dia: 4, inicio: '12:00', fin: '14:00', aula: 'B22', color: '#ffd4de' },
  { nombre: 'Ing. Control',           dia: 5, inicio: '09:30', fin: '11:30', aula: 'B22', color: '#ffd4de' },
  { nombre: 'T. Máquinas Mecanismos', dia: 2, inicio: '15:00', fin: '17:00', aula: 'B31', color: '#d4f0e0' },
  { nombre: 'T. Máquinas Mecanismos', dia: 3, inicio: '16:00', fin: '17:00', aula: 'B31', color: '#d4f0e0' },
  { nombre: 'Regulación Automática',  dia: 4, inicio: '17:30', fin: '19:30', aula: 'B31', color: '#ffe4cc' },
  { nombre: 'Regulación Automática',  dia: 5, inicio: '15:00', fin: '17:00', aula: 'B31', color: '#ffe4cc' },
];

// ─────────────────────────────────────────
// Utilidad
// ─────────────────────────────────────────

function formatearFecha(año, mes, dia) {
  const mm = String(mes).padStart(2, '0');
  const dd = String(dia).padStart(2, '0');
  return `${año}-${mm}-${dd}`;
}

// ─────────────────────────────────────────
// Supabase: cargar todos los eventos
// ─────────────────────────────────────────

async function cargarEventos() {
  const { data, error } = await db.from('events').select('*');

  if (error) {
    console.error('Error cargando eventos:', error);
    return;
  }

  // Guardamos los datos en nuestro formato interno
  eventos = data.map(e => ({
    id:          e.id,
    titulo:      e.title,
    fecha:       e.date,
    hora_inicio: e.start_time,
    hora_fin:    e.end_time || '',
    tipo:        e.type || 'otro'
  }));

  mostrarCalendario();
}

// ─────────────────────────────────────────
// Supabase: guardar evento nuevo
// ─────────────────────────────────────────

async function crearEvento(datos) {
  const { data, error } = await db.from('events').insert({
    title:      datos.titulo,
    date:       datos.fecha,
    start_time: datos.hora_inicio,
    end_time:   datos.hora_fin || null,
    type:       datos.tipo
  }).select();

  if (error) { console.error('Error guardando:', error); return; }

  eventos.push({
    id:          data[0].id,
    titulo:      data[0].title,
    fecha:       data[0].date,
    hora_inicio: data[0].start_time,
    hora_fin:    data[0].end_time || '',
    tipo:        data[0].type
  });

  cerrarPanel();
  mostrarCalendario();
}

// ─────────────────────────────────────────
// Supabase: actualizar evento existente
// ─────────────────────────────────────────

async function actualizarEvento(id, datos) {
  const { error } = await db.from('events').update({
    title:      datos.titulo,
    date:       datos.fecha,
    start_time: datos.hora_inicio,
    end_time:   datos.hora_fin || null,
    type:       datos.tipo
  }).eq('id', id);

  if (error) { console.error('Error actualizando:', error); return; }

  eventos = eventos.map(e =>
    e.id === id ? { id, ...datos } : e
  );

  cerrarPanel();
  mostrarCalendario();
}

// ─────────────────────────────────────────
// Supabase: eliminar evento
// ─────────────────────────────────────────

async function eliminarEvento(id) {
  const { error } = await db.from('events').delete().eq('id', id);

  if (error) { console.error('Error eliminando:', error); return; }

  eventos = eventos.filter(e => e.id !== id);
  cerrarPanel();
  mostrarCalendario();
}

// ─────────────────────────────────────────
// Pestañas
// ─────────────────────────────────────────

document.querySelectorAll('.tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.tab').forEach(t => t.classList.remove('activo'));
    tab.classList.add('activo');

    const vista = tab.dataset.vista;
    document.getElementById('vista-calendario').classList.toggle('oculto', vista !== 'calendario');
    document.getElementById('vista-horario').classList.toggle('oculto', vista !== 'horario');

    if (vista === 'horario') mostrarHorario();
  });
});

// ─────────────────────────────────────────
// Vista: Horario
// ─────────────────────────────────────────

function mostrarHorario() {
  const contenido = document.getElementById('contenido-horario');
  contenido.innerHTML = '';

  for (let dia = 1; dia <= 5; dia++) {
    const clasesDelDia = horario
      .filter(c => c.dia === dia)
      .sort((a, b) => a.inicio.localeCompare(b.inicio));

    const diaDiv = document.createElement('div');
    diaDiv.classList.add('dia-horario');

    const titulo = document.createElement('h3');
    titulo.textContent = DIAS_SEMANA[dia - 1];
    diaDiv.appendChild(titulo);

    if (clasesDelDia.length === 0) {
      const sinClases = document.createElement('p');
      sinClases.classList.add('sin-clases');
      sinClases.textContent = 'Sin clases';
      diaDiv.appendChild(sinClases);
    } else {
      clasesDelDia.forEach(clase => {
        const card = document.createElement('div');
        card.classList.add('clase-card');
        card.style.backgroundColor = clase.color;
        card.innerHTML = `
          <span class="clase-hora">${clase.inicio}<br>${clase.fin}</span>
          <div class="clase-info">
            <span class="clase-nombre">${clase.nombre}</span>
            <span class="clase-aula">📍 ${clase.aula}</span>
          </div>
        `;
        diaDiv.appendChild(card);
      });
    }

    contenido.appendChild(diaDiv);
  }
}

// ─────────────────────────────────────────
// Vista: Calendario
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
// Panel: día
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
// Formulario: abrir modo nuevo
// ─────────────────────────────────────────

function abrirPanel() {
  idEditando = null;
  document.getElementById('panel-cabecera').querySelector('h3').textContent = 'Nuevo evento';
  document.getElementById('btn-guardar').textContent = 'Guardar evento';
  document.getElementById('btn-eliminar').classList.add('oculto');
  document.getElementById('form-evento').reset();
  document.getElementById('input-fecha').value =
    formatearFecha(hoy.getFullYear(), hoy.getMonth() + 1, hoy.getDate());
  document.getElementById('panel-formulario').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');
}

// ─────────────────────────────────────────
// Formulario: abrir modo editar
// ─────────────────────────────────────────

function abrirPanelEditar(evento) {
  idEditando = evento.id;
  document.getElementById('panel-cabecera').querySelector('h3').textContent = 'Editar evento';
  document.getElementById('btn-guardar').textContent = 'Guardar cambios';
  document.getElementById('btn-eliminar').classList.remove('oculto');
  document.getElementById('input-nombre').value      = evento.titulo;
  document.getElementById('input-fecha').value       = evento.fecha;
  document.getElementById('input-hora-inicio').value = evento.hora_inicio;
  document.getElementById('input-hora-fin').value    = evento.hora_fin;
  document.getElementById('input-tipo').value        = evento.tipo;
  document.getElementById('panel-formulario').classList.remove('oculto');
  document.getElementById('panel-overlay').classList.remove('oculto');
}

// ─────────────────────────────────────────
// Formulario: cerrar
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
// Enviar formulario: crear o actualizar
// ─────────────────────────────────────────

document.getElementById('form-evento').addEventListener('submit', (e) => {
  e.preventDefault();

  const datos = {
    titulo:      document.getElementById('input-nombre').value,
    fecha:       document.getElementById('input-fecha').value,
    hora_inicio: document.getElementById('input-hora-inicio').value,
    hora_fin:    document.getElementById('input-hora-fin').value,
    tipo:        document.getElementById('input-tipo').value,
  };

  if (idEditando === null) {
    crearEvento(datos);
  } else {
    actualizarEvento(idEditando, datos);
  }
});

// ─────────────────────────────────────────
// Eliminar evento
// ─────────────────────────────────────────

document.getElementById('btn-eliminar').addEventListener('click', () => {
  if (!confirm('¿Eliminar este evento?')) return;
  eliminarEvento(idEditando);
});

// ─────────────────────────────────────────
// Arranque: carga eventos desde Supabase
// ─────────────────────────────────────────

cargarEventos();