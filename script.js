// ======== CLAVES ========
let clavesDisponibles = ['ABC123', 'XYZ789', 'CLAVE1', 'SUPER8', 'UNICA5'];
let claveUsada = localStorage.getItem('claveUsada');

// Mostrar pantalla correcta según clave
window.onload = () => {
  if (claveUsada) {
    mostrarPantalla(1);
    cargarDatos();
  } else {
    document.getElementById('clavePantalla').classList.add('activa');
  }
};

// Validar clave
function validarClave() {
  const input = document.getElementById('claveInput').value;
  const error = document.getElementById('claveError');
  if (clavesDisponibles.includes(input)) {
    clavesDisponibles = clavesDisponibles.filter(c => c !== input);
    localStorage.setItem('claveUsada', input);
    document.getElementById('clavePantalla').classList.remove('activa');
    mostrarPantalla(1);
  } else {
    error.textContent = 'Clave inválida o ya usada.';
  }
}

// ======== NOMBRES ========
let nombres = JSON.parse(localStorage.getItem('nombres')) || [];

const nombreInput = document.getElementById('nombreInput');
nombreInput.addEventListener('keypress', e => {
  if (e.key === 'Enter') agregarNombre();
});

function agregarNombre() {
  const valor = nombreInput.value.trim();
  if (valor && nombres.length < 8) {
    const nombreCapitalizado = valor.charAt(0).toUpperCase() + valor.slice(1).toLowerCase();
    nombres.push(nombreCapitalizado);
    localStorage.setItem('nombres', JSON.stringify(nombres));
    nombreInput.value = '';
    actualizarLista();
    nombreInput.focus();
  }
}

function actualizarLista() {
  const lista = document.getElementById('listaNombres');
  lista.innerHTML = '';
  nombres.forEach((n, i) => {
    const li = document.createElement('li');
    li.textContent = `${i + 1} - ${n}`;
    lista.appendChild(li);
  });
  if (nombres.length >= 8) {
    nombreInput.disabled = true;
  }
}

// ======== PANTALLAS ========
function mostrarPantalla(n) {
  for (let i = 1; i <= 4; i++) {
    document.getElementById('pantalla' + i).classList.remove('activa');
  }
  document.getElementById('pantalla' + n).classList.add('activa');
  if (n === 2) crearTablaPartidos();
  if (n === 3) calcularPosiciones();
  if (n === 4) mostrarCampeon();
}

function irAPantalla(n) {
  mostrarPantalla(n);
}

// ======== PARTIDOS ========
const partidos = [
  [7, 6, 5, 2], [1, 0, 3, 4], [6, 3, 7, 4],
  [2, 1, 5, 0], [7, 2, 4, 1], [3, 0, 6, 5],
  [4, 6, 1, 5], [0, 2, 3, 7], [0, 4, 2, 6],
  [5, 7, 1, 3], [2, 3, 6, 1], [4, 5, 7, 0],
  [3, 5, 4, 2], [1, 7, 0, 6]
];

let resultados = JSON.parse(localStorage.getItem('resultados')) || Array(partidos.length).fill(["", ""]);

function crearTablaPartidos() {
  const contenedor = document.getElementById('tablaPartidos');
  contenedor.innerHTML = '';
  partidos.forEach((p, i) => {
    const nombresP = `${nombres[p[0]]} y ${nombres[p[1]]} vs ${nombres[p[2]]} y ${nombres[p[3]]}`;
    const parrafo = document.createElement('p');
    parrafo.innerHTML = `P${i + 1}: <span>${nombresP}</span>`;
    
    const input1 = document.createElement('input');
    const input2 = document.createElement('input');
    input1.type = input2.type = 'number';
    input1.className = input2.className = 'resultado';
    input1.min = input2.min = 0;
    input1.max = input2.max = 4;
    input1.value = resultados[i][0];
    input2.value = resultados[i][1];

    input1.onchange = () => guardarResultado(i, input1.value, input2.value);
    input2.onchange = () => guardarResultado(i, input1.value, input2.value);

    parrafo.appendChild(input1);
    parrafo.appendChild(input2);
    contenedor.appendChild(parrafo);
  });
}

function guardarResultado(index, r1, r2) {
  resultados[index] = [parseInt(r1) || 0, parseInt(r2) || 0];
  localStorage.setItem('resultados', JSON.stringify(resultados));
}

// ======== POSICIONES ========
function calcularPosiciones() {
  let tabla = {};
  nombres.forEach(nombre => tabla[nombre] = { puntos: 0, dif: 0 });

  partidos.forEach((p, i) => {
    const [a, b, c, d] = p.map(j => nombres[j]);
    const r = resultados[i];
    if (r[0] === "" || r[1] === "") return;

    const r1 = parseInt(r[0]), r2 = parseInt(r[1]);
    const ganadores = r1 > r2 ? [a, b] : r2 > r1 ? [c, d] : [];

    [a, b].forEach(j => {
      tabla[j].dif += r1 - r2;
      if (ganadores.includes(j)) tabla[j].puntos += 1;
    });

    [c, d].forEach(j => {
      tabla[j].dif += r2 - r1;
      if (ganadores.includes(j)) tabla[j].puntos += 1;
    });
  });

  let orden = Object.entries(tabla).sort((a, b) => {
    if (b[1].puntos !== a[1].puntos) return b[1].puntos - a[1].puntos;
    return b[1].dif - a[1].dif;
  });

  const contenedor = document.getElementById('tablaPosiciones');
  let html = '<table><tr><th>Jugador</th><th>Puntos</th><th>Diferencia</th></tr>';
  orden.forEach(([nombre, stats], i) => {
    html += `<tr class="${i === 0 ? 'primero' : ''}"><td>${nombre}</td><td>${stats.puntos}</td><td>${stats.dif}</td></tr>`;
  });
  html += '</table>';
  contenedor.innerHTML = html;

  localStorage.setItem('tablaOrden', JSON.stringify(orden));
}

// ======== CAMPEÓN ========
function mostrarCampeon() {
  const orden = JSON.parse(localStorage.getItem('tablaOrden'));
  if (orden && orden.length) {
    const nombre = orden[0][0];
    document.getElementById('campeonTexto').textContent = `🏆 El campeón es ${nombre} 🏆`;
  }
}

// ======== RESET ========
function resetearTodo() {
  localStorage.clear();
  nombres = [];
  resultados = Array(partidos.length).fill(["", ""]);
  nombreInput.disabled = false;
  actualizarLista();
  document.getElementById('nombreInput').value = '';
  mostrarPantalla(1);
}
