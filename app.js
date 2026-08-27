// ─────────────────────────────────────────
// Estado: el mes y año que se está viendo
// ─────────────────────────────────────────

const hoy = new Date();

let mesActual = hoy.getMonth();   // 0 = enero, 7 = agosto
let añoActual = hoy.getFullYear();

// ─────────────────────────────────────────
// Nombres de los meses en español
// ─────────────────────────────────────────

const MESES = [
  'Enero', 'Febrero', 'Marzo', 'Abril',
  'Mayo', 'Junio', 'Julio', 'Agosto',
  'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

// ─────────────────────────────────────────
// Función principal: dibuja el calendario
// ─────────────────────────────────────────

function mostrarCalendario() {
  // Actualiza el título
  const titulo = document.getElementById('titulo-mes');
  titulo.textContent = `${MESES[mesActual]} ${añoActual}`;

  // Limpia los días anteriores
  const calendario = document.getElementById('calendario');
  calendario.innerHTML = '';

  // Calcula el primer día del mes (0=dom, 1=lun...)
  // Lo convertimos a formato lunes=0, domingo=6
  const primerDia = new Date(añoActual, mesActual, 1).getDay();
  const desplazamiento = (primerDia === 0) ? 6 : primerDia - 1;

  // Número total de días en el mes
  const totalDias = new Date(añoActual, mesActual + 1, 0).getDate();

  // Añade celdas vacías antes del día 1
  for (let i = 0; i < desplazamiento; i++) {
    const vacio = document.createElement('div');
    vacio.classList.add('vacio');
    calendario.appendChild(vacio);
  }

  // Añade un elemento por cada día del mes
  for (let dia = 1; dia <= totalDias; dia++) {
    const celda = document.createElement('div');
    celda.classList.add('dia');
    celda.textContent = dia;

    // Marca el día de hoy
    const esHoy =
      dia === hoy.getDate() &&
      mesActual === hoy.getMonth() &&
      añoActual === hoy.getFullYear();

    if (esHoy) {
      celda.classList.add('hoy');
    }

    calendario.appendChild(celda);
  }
}

// ─────────────────────────────────────────
// Navegación: mes anterior y mes siguiente
// ─────────────────────────────────────────

document.getElementById('btn-anterior').addEventListener('click', () => {
  mesActual--;
  if (mesActual < 0) {
    mesActual = 11;   // diciembre
    añoActual--;
  }
  mostrarCalendario();
});

document.getElementById('btn-siguiente').addEventListener('click', () => {
  mesActual++;
  if (mesActual > 11) {
    mesActual = 0;    // enero
    añoActual++;
  }
  mostrarCalendario();
});

// ─────────────────────────────────────────
// Arranca la aplicación
// ─────────────────────────────────────────

mostrarCalendario();