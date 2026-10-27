/*
  Proyectos del portfolio.
  Para añadir uno nuevo, copia un bloque y cambia los datos.

  - slug:     identificador corto, sin espacios ni tildes (se usa en el enlace)
  - category: "Largometraje", "Cortometraje", "Publicidad", "Videoclip", "Serie"...
              Largometraje, Cortometraje y Serie se agrupan en "Ficción" en la página de Trabajo
  - stills:   rutas a las imágenes dentro de /img. La primera es la portada.
  - video:    opcional. { provider: "vimeo" | "youtube", id: "..." }
              Vimeo:   https://vimeo.com/76979871          -> id "76979871"
              YouTube: https://youtu.be/aqz-KE-bpKQ         -> id "aqz-KE-bpKQ"
  - credits:  lista libre de [rol, nombre]
  - camera:   opcional, cámara / formato de origen
  - featured: true para que salga en la portada (se muestran los dos primeros marcados)
*/
window.PROJECTS = [
  {
    slug: "mar-de-fondo",
    title: "Mar de fondo",
    category: "Largometraje",
    year: 2026,
    featured: true,
    credits: [["Dirección", "Lucía Ferrer"], ["Dirección de fotografía", "Pablo Arenas"], ["Productora", "Bruma Films"]],
    camera: "ARRI Alexa 35 · ARRIRAW",
    summary: "Un pueblo costero en el último verano antes del cierre de la fábrica. Etalonaje cálido en altas luces y sombras frías que se van cerrando con la historia.",
    stills: ["img/mar-de-fondo-1.jpg", "img/mar-de-fondo-2.jpg", "img/mar-de-fondo-3.jpg", "img/mar-de-fondo-4.jpg"],
    video: { provider: "vimeo", id: "76979871" }
  },
  {
    slug: "la-ultima-noche",
    title: "La última noche",
    category: "Videoclip",
    year: 2026,
    featured: true,
    credits: [["Artista", "Nadia Sol"], ["Dirección", "Marcos Vidal"], ["Dirección de fotografía", "Irene Gómez"]],
    camera: "Sony Venice 2 · X-OCN",
    summary: "Neón, humo y piel. Un look nocturno saturado que protege los tonos de piel dentro de una paleta magenta.",
    stills: ["img/la-ultima-noche-1.jpg", "img/la-ultima-noche-2.jpg", "img/la-ultima-noche-3.jpg", "img/la-ultima-noche-4.jpg"],
    video: { provider: "youtube", id: "aqz-KE-bpKQ" }
  },
  {
    slug: "niebla",
    title: "Niebla",
    category: "Cortometraje",
    year: 2025,
    credits: [["Dirección", "Álvaro Ruiz"], ["Dirección de fotografía", "Sara Montes"]],
    camera: "RED Komodo · R3D",
    summary: "Bosque gallego en invierno. Contraste bajo, verdes contenidos y una textura de grano de 35 mm añadida en la sala.",
    stills: ["img/niebla-1.jpg", "img/niebla-2.jpg", "img/niebla-3.jpg", "img/niebla-4.jpg"]
  },
  {
    slug: "cobre",
    title: "Cobre",
    category: "Publicidad",
    year: 2025,
    credits: [["Marca", "Cervezas Ámbar"], ["Agencia", "Norte Studio"], ["Dirección", "Javier Lago"]],
    camera: "ARRI Alexa Mini LF · ProRes 4444",
    summary: "Spot de 30 segundos. Ámbar y cobre en toda la imagen sin perder el detalle en las sombras del bar.",
    stills: ["img/cobre-1.jpg", "img/cobre-2.jpg", "img/cobre-3.jpg", "img/cobre-4.jpg"]
  },
  {
    slug: "azul-electrico",
    title: "Azul eléctrico",
    category: "Serie",
    year: 2024,
    credits: [["Creadora", "Elena Casas"], ["Dirección de fotografía", "Tomás Prieto"], ["Plataforma", "Por confirmar"]],
    camera: "Blackmagic URSA 12K · BRAW",
    summary: "Seis episodios. Un look base para toda la serie y variaciones por episodio que se entregaron en HDR y SDR.",
    stills: ["img/azul-electrico-1.jpg", "img/azul-electrico-2.jpg", "img/azul-electrico-3.jpg", "img/azul-electrico-4.jpg"]
  },
  {
    slug: "verano-del-92",
    title: "Verano del 92",
    category: "Largometraje",
    year: 2024,
    credits: [["Dirección", "Carmen Lozano"], ["Dirección de fotografía", "Diego Ortega"]],
    camera: "Kodak Vision3 35 mm · escaneo 4K",
    summary: "Rodada en celuloide. El trabajo fue respetar la emulsión y unificar tres laboratorios de escaneo distintos.",
    stills: ["img/verano-del-92-1.jpg", "img/verano-del-92-2.jpg", "img/verano-del-92-3.jpg", "img/verano-del-92-4.jpg"]
  }
];

/* Datos generales de la web */
window.SITE = {
  name: "Ismael de la Cruz",
  role: "Colorista",
  city: "Madrid",
  tagline: "Color para cine, series, publicidad y videoclips.",
  email: "hola@ismaeldelacruz.com",
  instagram: "https://instagram.com/",
  vimeo: "https://vimeo.com/",
  about: [
    "Soy colorista y trabajo en DaVinci Resolve sobre largometrajes, series, publicidad y videoclips.",
    "Me gusta entrar pronto en los proyectos: preparar el look con dirección y fotografía antes del rodaje ahorra muchas horas en la sala y da imágenes más coherentes.",
    "Entrego en HDR y SDR, ACES o flujos de cámara nativos, y trabajo tanto en remoto como en sala calibrada."
  ]
};
