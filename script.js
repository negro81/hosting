// Variables globales y carga de localStorage
let parejas = JSON.parse(localStorage.getItem('parejas')) || [];
let canchas = JSON.parse(localStorage.getItem('canchas')) || [];
let horarios = JSON.parse(localStorage.getItem('horarios')) || {
  viernes: { desde: "", hasta: "" },
  sabado: { desde: "", hasta: "" },
  domingo: { desde: "", hasta: "" }
};
let nombreTorneo = localStorage.getItem('nombreTorneo') || "";
let zonas = JSON.parse(localStorage.getItem('zonas')) || [];
let partidosZonas = JSON.parse(localStorage.getItem('partidosZonas')) || []; // partidos generados por zona
let llaves = JSON.parse(localStorage.getItem('llaves')) || []; // partidos eliminación directa

// Navegación entre secciones
document.querySelectorAll('nav button.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    const seccion = btn.dataset.seccion;
    document.querySelectorAll('.seccion').forEach(sec => sec.classList.remove('activa'));
    document.getElementById(seccion).classList.add('activa');

    document.querySelectorAll('nav button.nav-btn').forEach(b => b.classList.remove('activa'));
    btn.classList.add('activa');
  });
});

// Mostrar nombre torneo inicial
document.getElementById("nombreTorneo").innerText = nombreTorneo || "Torneo Padel";

// Guardar nombre torneo
document.getElementById("btnGuardarNombreTorneo").onclick = () => {
  const input = document.getElementById("inputNombreTorneo");
  if(input.value.trim()) {
    nombreTorneo = input.value.trim();
    localStorage.setItem("nombreTorneo", nombreTorneo);
    document.getElementById("nombreTorneo").innerText = nombreTorneo;
    alert("Nombre de torneo guardado.");
  }
};

// Agregar pareja
document.getElementById("btnAgregarPareja").onclick = () => {
  const ap1 = document.getElementById("apellido1").value.trim();
  const ap2 = document.getElementById("apellido2").value.trim();
  if(ap1 && ap2) {
    parejas.push(`${ap1} / ${ap2}`);
    localStorage.setItem('parejas', JSON.stringify(parejas));
    document.getElementById("apellido1").value = "";
    document.getElementById("apellido2").value = "";
    mostrarParejas();
  }
};

function mostrarParejas() {
  const ul = document.getElementById("listaParejas");
  ul.innerHTML = "";
  parejas.forEach((p,i) => {
    const li = document.createElement("li");
    li.textContent = p;
    ul.appendChild(li);
  });
}
mostrarParejas();

// Agregar cancha
document.getElementById("btnAgregarCancha").onclick = () => {
  const cancha = document.getElementById("nombreCancha").value.trim();
  if(cancha && !canchas.includes(cancha)) {
    canchas.push(cancha);
    localStorage.setItem('canchas', JSON.stringify(canchas));
    document.getElementById("nombreCancha").value = "";
    mostrarCanchas();
  }
};

function mostrarCanchas() {
  const div = document.getElementById("listaCanchas");
  div.innerHTML = "";
  canchas.forEach(c => {
    const p = document.createElement("p");
    p.textContent = c;
    div.appendChild(p);
  });
}
mostrarCanchas();

// Guardar horarios
document.getElementById("btnGuardarHorarios").onclick = () => {
  const hViDesde = document.getElementById("horaInicioViernes").value;
  const hViHasta = document.getElementById("horaFinViernes").value;
  const hSaDesde = document.getElementById("horaInicioSabado").value;
  const hSaHasta = document.getElementById("horaFinSabado").value;
  const hDoDesde = document.getElementById("horaInicioDomingo").value;
  const hDoHasta = document.getElementById("horaFinDomingo").value;

  if(!hViDesde || !hViHasta || !hSaDesde || !hSaHasta || !hDoDesde || !hDoHasta) {
    alert("Completar todos los horarios.");
    return;
  }
  if(hViDesde >= hViHasta || hSaDesde >= hSaHasta || hDoDesde >= hDoHasta) {
    alert("El horario desde debe ser menor que el hasta.");
    return;
  }

  horarios = {
    viernes: { desde: hViDesde, hasta: hViHasta },
    sabado: { desde: hSaDesde, hasta: hSaHasta },
    domingo: { desde: hDoDesde, hasta: hDoHasta }
  };
  localStorage.setItem('horarios', JSON.stringify(horarios));
  document.getElementById("mensajeHorarios").textContent = "Horarios guardados.";
};

// GENERAR ZONAS con prioridad 3, luego 4
document.getElementById("btnGenerarZonas").onclick = () => {
  if(parejas.length < 3) {
    alert("Debe haber al menos 3 parejas para generar zonas.");
    return;
  }
  zonas = generarZonas(parejas);
  localStorage.setItem('zonas', JSON.stringify(zonas));
  generarFixtureZonas();
};

function generarZonas(parejas) {
  const zonas = [];
  let index = 0;
  const total = parejas.length;

  // Armar zonas de 3 priorizando esa cantidad
  while(index < total) {
    let restante = total - index;
    if(restante >= 3) {
      zonas.push(parejas.slice(index, index+3));
      index += 3;
    } else if(restante === 2) {
      // Para 2 parejas extra, asignamos zona de 4 incluyendo una pareja antes
      if(zonas.length > 0 && zonas[zonas.length-1].length === 3) {
        zonas[zonas.length-1].push(parejas[index]);
        index++;
        zonas[zonas.length-1].push(parejas[index]);
        index++;
      } else {
        // si no hay zona para agregar, hacemos zona 4 con esas dos parejas
        zonas.push(parejas.slice(index, index+2));
        index += 2;
      }
    } else if(restante === 1) {
      // Una pareja sobrante, se agrega a la última zona si puede o nueva zona
      if(zonas.length > 0 && zonas[zonas.length-1].length < 4) {
        zonas[zonas.length-1].push(parejas[index]);
        index++;
      } else {
        zonas.push([parejas[index]]);
        index++;
      }
    }
  }
  return zonas;
}

function generarFixtureZonas() {
  partidosZonas = []; // reset
  const cont = document.getElementById("contenedorZonas");
  cont.innerHTML = "";

  zonas.forEach((zona, i) => {
    const divZona = document.createElement("div");
    divZona.classList.add("zona-block");

    const h3 = document.createElement("h3");
    h3.classList.add("zona-titulo");
    h3.textContent = `Zona ${i+1}`;
    divZona.appendChild(h3);

    const tabla = document.createElement("table");
    tabla.border = "1";
    tabla.style.borderCollapse = "collapse";
    tabla.style.width = "100%";

    // Cabecera
    const thead = document.createElement("thead");
    const trHead = document.createElement("tr");
    ["Partido", "Pareja 1", "Pareja 2", "Resultado (Sets)", "Horario", "Cancha"].forEach(text => {
      const th = document.createElement("th");
      th.textContent = text;
      trHead.appendChild(th);
    });
    thead.appendChild(trHead);
    tabla.appendChild(thead);

    const tbody = document.createElement("tbody");

    // Generar partidos según reglas:
    // Si zona de 3: todos contra todos (3 partidos)
    // Si zona 4: A vs B, C vs D, luego ganador vs ganador y perdedor vs perdedor (4 partidos)

    if(zona.length === 3) {
      // Partidos todos contra todos
      let partidoNum = 1;
      for(let a=0; a<zona.length-1; a++) {
        for(let b=a+1; b<zona.length; b++) {
          const partido = {
            id: `Z${i+1}P${partidoNum}`,
            zona: i+1,
            pareja1: zona[a],
            pareja2: zona[b],
            sets: [],
            resultado: "",
            dia: (i%2 === 0) ? 'viernes' : 'sabado', // asigna días alternados
            hora: null,
            cancha: null
          };
          partidosZonas.push(partido);
          partidoNum++;
        }
      }
    } else if(zona.length === 4) {
      // Partidos 4: A vs B y C vs D (semifinales), luego ganador vs ganador y perdedor vs perdedor (final y consolación)
      // Semifinales
      partidosZonas.push({
        id: `Z${i+1}P1`,
        zona: i+1,
        pareja1: zona[0],
        pareja2: zona[1],
        sets: [],
        resultado: "",
        dia: 'viernes',
        hora: null,
        cancha: null,
        ronda: "semifinal"
      });
      partidosZonas.push({
        id: `Z${i+1}P2`,
        zona: i+1,
        pareja1: zona[2],
        pareja2: zona[3],
        sets: [],
        resultado: "",
        dia: 'viernes',
        hora: null,
        cancha: null,
        ronda: "semifinal"
      });
      // Final y consolación (se generarán cuando se tengan resultados)
    }

    // Mostrar tabla con partidos y inputs para resultados
    partidosZonas.forEach((p, idx) => {
      if(p.zona !== (i+1)) return;
      const tr = document.createElement("tr");

      const tdPartido = document.createElement("td");
      tdPartido.textContent = p.id;
      tr.appendChild(tdPartido);

      const tdP1 = document.createElement("td");
      tdP1.textContent = p.pareja1;
      tr.appendChild(tdP1);

      const tdP2 = document.createElement("td");
      tdP2.textContent = p.pareja2;
      tr.appendChild(tdP2);

      const tdResultado = document.createElement("td");
      // inputs sets 1, 2 y tiebreak (3)
      for(let si=0; si<3; si++) {
        const inputSet = document.createElement("input");
        inputSet.type = "number";
        inputSet.min = "0";
        inputSet.max = "7";
        inputSet.classList.add("set-input");
        inputSet.dataset.partidoId = p.id;
        inputSet.dataset.setIndex = si;
        // rellenar valor guardado si existe
        inputSet.value = p.sets[si] !== undefined ? p.sets[si] : "";
        inputSet.addEventListener("change", onSetInputChange);
        tdResultado.appendChild(inputSet);
      }
      tr.appendChild(tdResultado);

      // Horario
      const tdHora = document.createElement("td");
      tdHora.textContent = p.hora || "";
      tr.appendChild(tdHora);

      // Cancha
      const tdCancha = document.createElement("td");
      tdCancha.textContent = p.cancha || "";
      tr.appendChild(tdCancha);

      tbody.appendChild(tr);
    });

    tabla.appendChild(tbody);
    divZona.appendChild(tabla);
    cont.appendChild(divZona);
  });

  // Asignar horarios y canchas automáticamente después de generar fixture
  asignarHorariosPartidos(partidosZonas);
  guardarPartidosZona();
  mostrarZonas(); // refrescar con horarios
}

function onSetInputChange(event) {
  const input = event.target;
  const partidoId = input.dataset.partidoId;
  const setIndex = parseInt(input.dataset.setIndex);
  const valor = input.value;

  const partido = partidosZonas.find(p => p.id === partidoId);
  if(!partido) return;

  partido.sets[setIndex] = valor !== "" ? parseInt(valor) : undefined;

  // Actualizar resultado en texto
  partido.resultado = partido.sets.map(s => s !== undefined ? s : "").join("-");
  guardarPartidosZona();
}

// Asignar horarios y canchas en forma progresiva respetando días y disponibilidad
function asignarHorariosPartidos(partidos) {
  // Ordenar partidos por día y zona para asignar progresivamente
  partidos.sort((a,b) => {
    if(a.dia !== b.dia) return a.dia.localeCompare(b.dia);
    return a.id.localeCompare(b.id);
  });

  // Asignar horarios por día y cancha, de forma progresiva
  // Asumimos que cada partido dura 1 hora
  const horariosDia = {
    viernes: [],
    sabado: [],
    domingo: []
  };

  // Parsear horarios de cada día en formato número para facilitar comparación
  function parseHora(horaStr) {
    const [h,m] = horaStr.split(":").map(x => parseInt(x));
    return h + m/60;
  }

  const inicioVi = horarios.viernes ? parseHora(horarios.viernes.desde) : 8;
  const finVi = horarios.viernes ? parseHora(horarios.viernes.hasta) : 20;
  const inicioSa = horarios.sabado ? parseHora(horarios.sabado.desde) : 8;
  const finSa = horarios.sabado ? parseHora(horarios.sabado.hasta) : 20;
  const inicioDo = horarios.domingo ? parseHora(horarios.domingo.desde) : 8;
  const finDo = horarios.domingo ? parseHora(horarios.domingo.hasta) : 20;

  // Generar horarios disponibles por hora para cada cancha
  function generarSlots(inicio, fin, canchas) {
    const slots = [];
    for(let hora=inicio; hora < fin; hora++) {
      canchas.forEach(cancha => {
        slots.push({ hora: hora, cancha: cancha, libre: true });
      });
    }
    return slots;
  }

  const slotsVi = generarSlots(inicioVi, finVi, canchas);
  const slotsSa = generarSlots(inicioSa, finSa, canchas);
  const slotsDo = generarSlots(inicioDo, finDo, canchas);

  // Asignar a cada partido el primer slot disponible en su día
  partidos.forEach(p => {
    let slotsDia;
    if(p.dia === 'viernes') slotsDia = slotsVi;
    else if(p.dia === 'sabado') slotsDia = slotsSa;
    else if(p.dia === 'domingo') slotsDia = slotsDo;
    else slotsDia = [];

    const slotLibre = slotsDia.find(s => s.libre);
    if(slotLibre) {
      p.hora = formatHora(slotLibre.hora);
      p.cancha = slotLibre.cancha;
      slotLibre.libre = false;
    } else {
      p.hora = "";
      p.cancha = "";
    }
  });
}

function formatHora(h) {
  const hInt = Math.floor(h);
  const m = (h - hInt) * 60;
  return `${hInt.toString().padStart(2,'0')}:${m === 0 ? "00" : "30"}`;
}

function guardarPartidosZona() {
  localStorage.setItem('partidosZonas', JSON.stringify(partidosZonas));
}

function mostrarZonas() {
  // Refrescar la tabla de zonas con horarios y canchas actualizados
  generarFixtureZonas();
}

// Función para generar listado de partidos por horario y cancha
document.getElementById("btnListadoPartidos").onclick = () => {
  if(partidosZonas.length === 0) {
    alert("No hay partidos generados.");
    return;
  }
  const listado = generarListadoPartidos(partidosZonas);
  mostrarListadoPartidos(listado);
};

function generarListadoPartidos(partidos) {
  // Ordenar partidos por día, hora y cancha
  return partidos.slice().sort((a,b) => {
    if(a.dia !== b.dia) return a.dia.localeCompare(b.dia);
    if(a.hora !== b.hora) return a.hora.localeCompare(b.hora);
    if(a.cancha !== b.cancha) return a.cancha.localeCompare(b.cancha);
    return a.id.localeCompare(b.id);
  });
}

function mostrarListadoPartidos(listado) {
  const cont = document.getElementById("contenedorListado");
  cont.innerHTML = "";

  const tabla = document.createElement("table");
  tabla.border = "1";
  tabla.style.borderCollapse = "collapse";
  tabla.style.width = "100%";

  const thead = document.createElement("thead");
  const trHead = document.createElement("tr");
  ["Día", "Hora", "Cancha", "Partido", "Pareja 1", "Pareja 2", "Resultado"].forEach(text => {
    const th = document.createElement("th");
    th.textContent = text;
    trHead.appendChild(th);
  });
  thead.appendChild(trHead);
  tabla.appendChild(thead);

  const tbody = document.createElement("tbody");

  listado.forEach(p => {
    const tr = document.createElement("tr");
    const tdDia = document.createElement("td");
    tdDia.textContent = capitalize(p.dia);
    tr.appendChild(tdDia);

    const tdHora = document.createElement("td");
    tdHora.textContent = p.hora;
    tr.appendChild(tdHora);

    const tdCancha = document.createElement("td");
    tdCancha.textContent = p.cancha;
    tr.appendChild(tdCancha);

    const tdId = document.createElement("td");
    tdId.textContent = p.id;
    tr.appendChild(tdId);

    const tdP1 = document.createElement("td");
    tdP1.textContent = p.pareja1;
    tr.appendChild(tdP1);

    const tdP2 = document.createElement("td");
    tdP2.textContent = p.pareja2;
    tr.appendChild(tdP2);

    const tdRes = document.createElement("td");
    tdRes.textContent = p.resultado;
    tr.appendChild(tdRes);

    tbody.appendChild(tr);
  });

  tabla.appendChild(tbody);
  cont.appendChild(tabla);
}

function capitalize(s) {
  if(!s) return "";
  return s.charAt(0).toUpperCase() + s.slice(1);
}
</script>

</body>
</html>
