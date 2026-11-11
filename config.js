/* ==========================================================================
   ARTE & CORTE · CONFIGURACIÓN
   Este es el ÚNICO archivo que hay que tocar para cambiar datos de la web.
   ========================================================================== */
window.SITE = {
  nombre: "Arte & Corte",
  url: "https://borjadomse-zionlabs.github.io/arteycorte/",
  telefono: "931897806",                 // teléfono fijo (botón "Llamar")
  whatsapp: "34931897806",               // ⚠️ número de WhatsApp con prefijo 34, sin espacios ni +
  instagram: "arteycorte.esquivel",
  direccion: "Carrer d'Espalter, 31, 08870 Sitges, Barcelona",
  mapsUrl: "https://www.google.com/maps/place/Arte+%26+Corte/@41.2369276,1.8063941,17z/data=!3m1!4b1!4m6!3m5!1s0x12a38045f46cffff:0xbf185aaccd148e8e!8m2!3d41.2369276!4d1.8063941!16s%2Fg%2F11fx88prv9",
  resenaUrl: "",                         // opcional: enlace directo "escribir reseña" de Google
  googleRating: 4.8,
  googleResenas: 559,

  /* --- ESPERA EN DIRECTO ------------------------------------------------
     El barbero la cambia desde /panel.html con un toque.
     estadoEndpoint: URL del Google Apps Script (ver /estado-google/INSTRUCCIONES.md).
     Si está vacío = modo demo: el panel y la web se sincronizan en el MISMO móvil/navegador. */
  estadoEndpoint: "",
  panelPinDemo: "1234",       // solo en modo demo. Con el endpoint, el PIN lo comprueba Google.
  caducaMin: 90,              // si nadie actualiza en 90 min, la web muestra la estimación habitual
  refrescoSeg: 60,            // cada cuánto se refresca la espera en la web

  // Horario: 0 = domingo, 1 = lunes ... 6 = sábado. [] = cerrado.
  horario: {
    1: [["09:00", "20:00"]], 2: [["09:00", "20:00"]], 3: [["09:00", "20:00"]],
    4: [["09:00", "20:00"]], 5: [["09:00", "20:00"]], 6: [["09:00", "20:00"]],
    0: [["10:00", "15:00"]]
  },
  cerrado: ["2026-12-25", "2027-01-01", "2027-01-06"],

  /* Afluencia habitual por hora (9:00 → 19:00). 0 tranquilo · 1 normal · 2 movido · 3 lleno · null cerrado.
     ⚠️ ESTIMACIÓN INICIAL: ajustar con él (él sabe a qué horas se le llena). */
  afluencia: {
    1: [0, 0, 0, 1, 1, 0, 1, 1, 2, 2, 2],
    2: [0, 0, 0, 1, 1, 0, 1, 1, 2, 2, 1],
    3: [0, 0, 1, 1, 1, 0, 1, 1, 2, 2, 1],
    4: [0, 0, 1, 1, 1, 1, 1, 2, 2, 2, 2],
    5: [0, 1, 1, 2, 2, 1, 2, 2, 3, 3, 2],
    6: [1, 2, 3, 3, 3, 2, 2, 2, 2, 1, 1],
    0: [null, 1, 2, 2, 2, 1, null, null, null, null, null]
  },

  barberos: ["Alexis", "John", "José", "Maximiliano"],

  servicios: [
    { id: "clasico", precio: 15, cat: "barberia", top: true },
    { id: "fade", precio: 15, cat: "barberia", top: true },
    { id: "mixta", precio: 15, cat: "barberia" },
    { id: "maquina", precio: 10, cat: "barberia" },
    { id: "barba", precio: 13, cat: "barberia", top: true },
    { id: "afeitado", precio: 11, cat: "barberia" },
    { id: "afeitadoMaq", precio: 10, cat: "barberia" },
    { id: "nino", precio: 11, cat: "barberia" },
    { id: "jubilado", precio: 12, cat: "barberia" },
    { id: "colorPelo", precio: 12, cat: "tecnicos" },
    { id: "colorBarba", precio: 10, cat: "tecnicos" },
    { id: "cejas", precio: 3, cat: "tecnicos" },
    { id: "platino", precio: 25, cat: "tecnicos", top: true },
    { id: "mechas", precio: 23, cat: "tecnicos" },
    { id: "keratina", precio: 18, cat: "tecnicos" },
    { id: "organico", precio: 15, cat: "tecnicos" }
  ]
};
