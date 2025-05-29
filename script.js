// Variables globales
let canchas = JSON.parse(localStorage.getItem('canchas')) || [];
let horarios = JSON.parse(localStorage.getItem('horarios')) || [];
let parejas = JSON.parse(localStorage.getItem('parejas')) || [];
let partidosZonas = [];

function mostrarPantalla(id) {
  document.querySelectorAll('.pantalla').forEach(p => p.classList.remove('activa'));
  document.getElementById(id).classList.add('activa');
}

function agregarCanchaHorario() {
  const cancha = document.getElementById('nombreCancha').value.trim();
  const rango = document.getElementById('rangoHorario').value.trim();
  if (cancha && rango) {
    canchas.push(cancha);
    horarios.push(...parseRango(rango));
    localStorage.setItem('canchas', JSON.stringify(canchas));
    localStorage.setItem('horarios', JSON.stringify(horarios));
    mostrarCanchas();
  }
}

function parseRango(rango) {
  const [inicio, fin] = rango.split('-');
  const [hIni, mIni] = inicio.split(':').map(Number);
  const [hFin, mFin] = fin.split(':').map(Number);
  const horas = [];
  for (let h = hIni; h < hFin; h++) {
    horas.push(`${h}:00`);
  }
  return horas;
}

function mostrarCanchas() {
  const cont = document.getElementById('listaCanchas');
  cont.innerHTML = '<ul>' + canchas.map(c => `<li>${c}</li>`).join('') + '</ul>';
}

function agregarPareja() {
  const nombre = document.getElementById('nombrePareja').value.trim();
  if (nombre) {
    parejas.push({ nombre });
    localStorage.setItem('parejas', JSON.stringify(parejas));
    mostrarParejas();
  }
}

function mostrarParejas() {
  const cont = document.getElementById('listaParejas');
  cont.innerHTML = '<ul>' + parejas.map(p => `<li>${p.nombre}</li>`).join('') + '</ul>';
}

function generarZonas() {
  const zonasGeneradas = document.getElementById('zonasGeneradas');
  zonasGeneradas.innerHTML = '';
  const parejasCopia = [...parejas];
  const zonas = [];
  while (parejasCopia.length >= 3) {
    const zona = parejasCopia.splice(0, Math.min(3, parejasCopia.length));
    zonas.push(zona);
  }
  zonas.forEach((zona, i) => {
    const div = document.createElement('div');
    div.className = 'zona';
    div.innerHTML = `<h3>Zona ${i + 1}</h3>` + generarTablaZona(zona);
    zonasGeneradas.appendChild(div);
  });
  partidosZonas = zonas.map(z => generarPartidosZona(z)).flat();
  asignarHorariosPartidos(partidosZonas);
  guardarPartidosZona();
}

function generarTablaZona(zona) {
  return `<table><thead><tr><th>#</th><th>Pareja</th><th>PJ</th><th>PG</th><th>PP</th><th>SF</th><th>SC</th><th>Dif</th><th>Pts</th></tr></thead><tbody>${zona.map((p, i) => `<tr><td>${i + 1}</td><td>${p.nombre}</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td><td>0</td></tr>`).join('')}</tbody></table>`;
}

function generarPartidosZona(zona) {
  const partidos = [];
  if (zona.length === 3) {
    partidos.push([zona[0], zona[1]]);
    partidos.push([zona[0], zona[2]]);
    partidos.push([zona[1], zona[2]]);
  } else if (zona.length === 4) {
    partidos.push([zona[0], zona[1]]);
    partidos.push([zona[2], zona[3]]);
    // ganadores vs ganadores y perdedores vs perdedores se resuelve luego según resultados
  }
  return partidos.map(p => ({ pareja1: p[0].nombre, pareja2: p[1].nombre }));
}

function asignarHorariosPartidos(partidos) {
  const asignados = [];
  let horarioIndex = 0;
  let canchaIndex = 0;
  const usos = {}; // { pareja: [horarios asignados] }

  for (let partido of partidos) {
    let asignado = false;
    while (!asignado && horarioIndex < horarios.length) {
      const horario = horarios[horarioIndex];
      const cancha = canchas[canchaIndex];
      const p1 = partido.pareja1;
      const p2 = partido.pareja2;

      const conflicto = (usos[p1]?.includes(horario) || usos[p2]?.includes(horario));
      if (!conflicto) {
        partido.horario = horario;
        partido.cancha = cancha;
        usos[p1] = (usos[p1] || []).concat(horario);
        usos[p2] = (usos[p2] || []).concat(horario);
        asignados.push(partido);
        asignado = true;
        canchaIndex = (canchaIndex + 1) % canchas.length;
        if (canchaIndex === 0) horarioIndex++;
      } else {
        horarioIndex++;
      }
    }
  }
}

function guardarPartidosZona() {
  localStorage.setItem('partidosZonas', JSON.stringify(partidosZonas));
}

window.onload = function () {
  mostrarPantalla('pantallaCanchas');
  mostrarCanchas();
  mostrarParejas();
};
