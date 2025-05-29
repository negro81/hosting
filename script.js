// Variables globales
let parejas = JSON.parse(localStorage.getItem('parejas')) || [];
let canchas = JSON.parse(localStorage.getItem('canchas')) || [];
let horarios = JSON.parse(localStorage.getItem('horarios')) || { desde: "", hasta: "" };
let zonas = JSON.parse(localStorage.getItem('zonas')) || [];
let nombreTorneo = localStorage.getItem('nombreTorneo') || "";
let llaves = JSON.parse(localStorage.getItem('llaves')) || [];

// Inicializar
document.addEventListener("DOMContentLoaded", () => {
  if (nombreTorneo) document.getElementById("nombreTorneo").innerText = nombreTorneo;
  mostrarParejas();
  mostrarCanchas();
  if (zonas.length) renderZonas();
  if (llaves.length) renderLlaves();
});

// Mostrar secciones
function mostrarSeccion(id) {
  document.querySelectorAll(".seccion").forEach(s => s.classList.remove("activa"));
  document.getElementById(id).classList.add("activa");
}

// Guardar nombre de torneo
function guardarNombreTorneo() {
  const nombre = document.getElementById("inputNombreTorneo").value.trim();
  if (nombre) {
    nombreTorneo = nombre;
    document.getElementById("nombreTorneo").innerText = nombre;
    localStorage.setItem("nombreTorneo", nombre);
  }
}

// Cargar y mostrar parejas
function agregarPareja() {
  const ap1 = document.getElementById("apellido1").value.trim();
  const ap2 = document.getElementById("apellido2").value.trim();
  if (ap1 && ap2) {
    parejas.push(`${ap1} / ${ap2}`);
    localStorage.setItem("parejas", JSON.stringify(parejas));
    document.getElementById("apellido1").value = "";
    document.getElementById("apellido2").value = "";
    mostrarParejas();
  }
}

function mostrarParejas() {
  const ul = document.getElementById("listaParejas");
  ul.innerHTML = "";
  parejas.forEach(p => {
    const li = document.createElement("li");
    li.textContent = p;
    ul.appendChild(li);
  });
}

// Cargar y mostrar canchas
function agregarCancha() {
  const cancha = document.getElementById("nombreCancha").value.trim();
  if (cancha && !canchas.includes(cancha)) {
    canchas.push(cancha);
    localStorage.setItem("canchas", JSON.stringify(canchas));
    mostrarCanchas();
    document.getElementById("nombreCancha").value = "";
  }
}

function mostrarCanchas() {
  const div = document.getElementById("listaCanchas");
  div.innerHTML = "<h3>Canchas:</h3>";
  canchas.forEach(c => {
    const p = document.createElement("p");
    p.textContent = c;
    div.appendChild(p);
  });
}

// Guardar horarios
function guardarHorarios() {
  const desde = document.getElementById("horaInicio").value;
  const hasta = document.getElementById("horaFin").value;
  if (desde && hasta && desde < hasta) {
    horarios = { desde, hasta };
    localStorage.setItem("horarios", JSON.stringify(horarios));
    alert("Horarios guardados.");
  }
}

// Generar zonas
function generarZonas() {
  if (parejas.length < 3) {
    alert("Debe haber al menos 3 parejas.");
    return;
  }

  zonas = [];
  const copia = [...parejas];
  let zonaN = 1;

  while (copia.length >= 3) {
    const zona = { nombre: `Zona ${zonaN}`, parejas: [] };
    for (let i = 0; i < 3 && copia.length; i++) {
      const idx = Math.floor(Math.random() * copia.length);
      zona.parejas.push(copia.splice(idx, 1)[0]);
    }
    zonas.push(zona);
    zonaN++;
  }

  if (copia.length) {
    if (zonas.length) {
      zonas[zonas.length - 1].parejas.push(...copia);
    } else {
      zonas.push({ nombre: `Zona ${zonaN}`, parejas: [...copia] });
    }
  }

  localStorage.setItem("zonas", JSON.stringify(zonas));
  renderZonas();
}

// Mostrar zonas
function renderZonas() {
  const cont = document.getElementById("contenedorZonas");
  cont.innerHTML = "";

  zonas.forEach(zona => {
    const div = document.createElement("div");
    div.innerHTML = `<h3 class="zona-titulo">${zona.nombre}</h3><ul>${zona.parejas.map(p => `<li>${p}</li>`).join("")}</ul>`;
    cont.appendChild(div);
  });
}

// Generar llaves
function generarLlaves() {
  let clasificados = [];

  zonas.forEach(z => {
    if (z.parejas.length >= 2) {
      clasificados.push(z.parejas[0]); // Simulación: primeros 2 de cada zona
      clasificados.push(z.parejas[1]);
    }
  });

  llaves = [];
  while (clasificados.length >= 2) {
    const p1 = clasificados.shift();
    const p2 = clasificados.pop();
    llaves.push({ pareja1: p1, pareja2: p2, resultado: "" });
  }

  localStorage.setItem("llaves", JSON.stringify(llaves));
  renderLlaves();
}

// Mostrar llaves
function renderLlaves() {
  const cont = document.getElementById("llavesContainer");
  cont.innerHTML = "<table><tr><th>Pareja 1</th><th>Pareja 2</th><th>Resultado</th></tr>";

  llaves.forEach(l => {
    cont.innerHTML += `
      <tr>
        <td>${l.pareja1}</td>
        <td>${l.pareja2}</td>
        <td>${l.resultado || "Pendiente"}</td>
      </tr>`;
  });

  cont.innerHTML += "</table>";
}

// Reiniciar todo
function reiniciarTodo() {
  if (confirm("¿Seguro que deseas reiniciar todo?")) {
    localStorage.clear();
    location.reload();
  }
}
