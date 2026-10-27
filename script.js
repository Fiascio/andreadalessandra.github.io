/* ==========================================================
   DATI DEL BLOG
   Per aggiungere un articolo copia uno dei blocchi qui sotto,
   incollalo in cima alla lista e cambia i valori.
   ========================================================== */
const ARTICOLI = [
  // Nessun articolo per ora. Per aggiungerne uno, togli i // e compila:
  // {
  //   titolo: "Titolo dell'articolo",
  //   data: "2026-10-27",          // formato AAAA-MM-GG
  //   tag: ["3d"],                 // uno o più tag
  //   testo: "Breve descrizione.",
  //   immagine: "",                // es. "img/foto.jpg" (vuoto = colore del tag)
  //   link: "#"                    // es. "articoli/primo.html"
  // },
];

// Tag disponibili: aggiungine uno nuovo qui e usalo negli articoli
const TAG = ["3d", "game", "dc", "fumetti", "film"];

/* ==========================================================
   FUNZIONI DI SUPPORTO
   ========================================================== */

// Evita che testo con simboli speciali rompa l'HTML
function esc(testo) {
  return String(testo).replace(/[&<>"']/g, function (c) {
    return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
  });
}

// Articoli ordinati dal più recente
const ordinati = ARTICOLI.slice().sort(function (a, b) {
  return b.data.localeCompare(a.data);
});

function dataLeggibile(iso) {
  return new Date(iso).toLocaleDateString("it-IT", { day: "numeric", month: "long", year: "numeric" });
}

// Copertina: immagine se c'è, altrimenti sfondo colorato del primo tag
function copertina(a) {
  const classe = "c-" + (a.tag[0] || "altro");
  const img = a.immagine ? '<img src="' + esc(a.immagine) + '" alt="">' : "";
  return '<span class="copertina ' + esc(classe) + '">' + img + "</span>";
}

function chipsArticolo(a) {
  return a.tag.map(function (t) {
    return '<a href="tag.html?tag=' + encodeURIComponent(t) + '">#' + esc(t) + "</a>";
  }).join("");
}

function conta(tag) {
  return ARTICOLI.filter(function (a) { return a.tag.indexOf(tag) !== -1; }).length;
}

/* ==========================================================
   COMPONENTI
   ========================================================== */
function riga(a) {
  return '<div class="riga"><div class="miniatura">' + copertina(a) + "</div><div>" +
    '<h3><a href="' + esc(a.link) + '">' + esc(a.titolo) + "</a></h3>" +
    '<div class="data">' + dataLeggibile(a.data) + "</div>" +
    '<div class="riga-chips">' + chipsArticolo(a) + "</div></div></div>";
}

function chip(tag, attivo) {
  return '<a class="chip' + (attivo ? " attivo" : "") + '" href="tag.html?tag=' + encodeURIComponent(tag) + '">#' +
    esc(tag) + "<small>" + conta(tag) + "</small></a>";
}

/* ==========================================================
   HOME: carosello in primo piano + lista
   ========================================================== */
const palco = document.getElementById("hero-palco");
if (palco) {
  const miniature = document.getElementById("hero-miniature");
  const inEvidenza = ordinati.slice(0, 4);   // i 4 articoli più recenti

  if (!inEvidenza.length) {
    // Nessun articolo: mostra un riquadro "in arrivo"
    palco.innerHTML = '<div class="palco-vuoto"><strong>Il primo articolo è in arrivo</strong>' +
      "<span>Torna presto per scoprire le novità su 3D, game, fumetti e film.</span></div>";
    miniature.innerHTML = [0, 1, 2, 3].map(function () {
      return '<div class="mini vuota"><span class="mini-titolo">In arrivo</span>' +
        '<span class="mini-img"><span class="copertina"></span></span></div>';
    }).join("");
  } else {
    palco.innerHTML = inEvidenza.map(function (a, i) {
      return '<a class="slide' + (i === 0 ? " attiva" : "") + '" href="' + esc(a.link) + '">' +
        (i === 0 ? '<span class="badge-nuovo">NUOVO</span>' : "") + copertina(a) +
        '<span class="velo"><span><h3>' + esc(a.titolo) + "</h3>" +
        '<span class="etichette">' + a.tag.map(function (t) { return "#" + esc(t); }).join(" ") + "</span></span>" +
        '<span class="data">' + dataLeggibile(a.data) + "</span></span></a>";
    }).join("");

    miniature.innerHTML = inEvidenza.map(function (a, i) {
      return '<button type="button" class="mini' + (i === 0 ? " attiva" : "") + '" data-i="' + i + '">' +
        '<span class="mini-titolo">' + esc(a.titolo) + "</span>" +
        '<span class="mini-img">' + copertina(a) + "</span></button>";
    }).join("");

    const slide = palco.querySelectorAll(".slide");
    const bottoni = miniature.querySelectorAll(".mini");
    let corrente = 0;

    function mostra(i) {
      corrente = i;
      slide.forEach(function (el, n) { el.classList.toggle("attiva", n === i); });
      bottoni.forEach(function (el, n) { el.classList.toggle("attiva", n === i); });
    }

    // Passa all'articolo cliccato (o sfiorato con il mouse)
    bottoni.forEach(function (b, i) {
      b.addEventListener("click", function () { mostra(i); });
      b.addEventListener("mouseenter", function () { mostra(i); });
    });

    // Cambio automatico ogni 6 secondi, fermo se passi sopra o se riduci i movimenti
    const riduci = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!riduci && inEvidenza.length > 1) {
      let timer = setInterval(avanti, 6000);
      function avanti() { mostra((corrente + 1) % inEvidenza.length); }
      const hero = document.getElementById("hero");
      function ferma() { clearInterval(timer); }
      function riparti() { clearInterval(timer); timer = setInterval(avanti, 6000); }
      hero.addEventListener("mouseenter", ferma);
      hero.addEventListener("mouseleave", riparti);
      hero.addEventListener("focusin", ferma);
      hero.addEventListener("focusout", riparti);
    }
  }
}

const lista = document.getElementById("lista");
if (lista) {
  const altri = ordinati.slice(4);
  lista.innerHTML = altri.length
    ? altri.map(riga).join("")
    : '<p class="nessun-risultato">Nessun altro articolo per ora.</p>';
}

/* ==========================================================
   LISTA TAG NELLA BARRA LATERALE + RICERCA TAG
   ========================================================== */
const listaTag = document.getElementById("tag-lista");
if (listaTag) {
  listaTag.innerHTML = TAG.map(function (t) { return chip(t, false); }).join("");

  // Mentre scrivi, restano visibili solo i tag che contengono il testo
  const campo = document.getElementById("cerca-tag");
  campo.addEventListener("input", function () {
    const cerca = campo.value.trim().toLowerCase().replace(/^#/, "");
    listaTag.querySelectorAll(".chip").forEach(function (el) {
      const nome = el.textContent.toLowerCase();
      el.style.display = nome.indexOf(cerca) !== -1 ? "" : "none";
    });
  });
}

/* ==========================================================
   PAGINA TAG: risultati in base all'indirizzo (?tag=... o ?q=...)
   ========================================================== */
const contenitoreRisultati = document.getElementById("risultati");
if (contenitoreRisultati) {
  const parametri = new URLSearchParams(window.location.search);
  const tagCercato = (parametri.get("tag") || "").trim().toLowerCase().replace(/^#/, "");
  const testoCercato = (parametri.get("q") || "").trim().toLowerCase();

  // Tutti i tag in grande
  document.getElementById("tag-grandi").innerHTML =
    TAG.map(function (t) { return chip(t, t === tagCercato); }).join("");

  // Riempie i campi di ricerca con quello che hai cercato
  const campoTag = document.getElementById("cerca-tag");
  const campoTesto = document.getElementById("cerca-testo");
  if (campoTag) campoTag.value = tagCercato;
  if (campoTesto) campoTesto.value = parametri.get("q") || "";

  let risultati = ordinati;
  let titolo = "Tutti gli articoli";

  if (tagCercato) {
    risultati = risultati.filter(function (a) {
      return a.tag.some(function (t) { return t.indexOf(tagCercato) !== -1; });
    });
    titolo = "Articoli con tag: #" + tagCercato;
  }
  if (testoCercato) {
    risultati = risultati.filter(function (a) {
      return (a.titolo + " " + a.testo).toLowerCase().indexOf(testoCercato) !== -1;
    });
    titolo = 'Risultati per: "' + testoCercato + '"';
  }

  document.getElementById("titolo-risultati").textContent = titolo + " (" + risultati.length + ")";
  contenitoreRisultati.innerHTML = risultati.length
    ? risultati.map(riga).join("")
    : '<p class="nessun-risultato">' + (ARTICOLI.length ? 'Nessun articolo trovato. Prova con un altro tag.' : 'Ancora nessun articolo.') + '</p>';
}
