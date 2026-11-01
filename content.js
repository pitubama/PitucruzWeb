/*
  Carga el contenido de la web desde content/projects.json y content/site.json
  (los que se editan desde Pages CMS) y después arranca app.js.
*/
(function () {
  "use strict";

  // Acepta el enlace tal cual se copia de Vimeo o YouTube
  function parseVideo(url) {
    url = String(url || "").trim();
    if (!url) return null;
    let m = url.match(/vimeo\.com\/(?:.*\/)?(?:video\/)?(\d+)(?:\/([0-9a-f]+))?/i);
    if (m) return { provider: "vimeo", id: m[1], hash: m[2] || new URL(url, location.href).searchParams.get("h") || "" };
    m = url.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/))([\w-]{6,})/i);
    if (m) return { provider: "youtube", id: m[1] };
    return null;
  }

  function normalize(p) {
    const stills = (p.stills || []).map((s) => (typeof s === "string" ? s : s && s.image)).filter(Boolean);
    return {
      ...p,
      year: p.year || "",
      stills: stills.length ? stills : [""],
      credits: (p.credits || []).filter((c) => c && (c.role || c.name)).map((c) => [c.role || "", c.name || ""]),
      video: typeof p.video === "string" ? parseVideo(p.video) : p.video || null
    };
  }

  const get = (path) => fetch(path, { cache: "no-cache" }).then((r) => {
    if (!r.ok) throw new Error(path + ": " + r.status);
    return r.json();
  });

  Promise.all([get("content/projects.json"), get("content/site.json")])
    .then(([data, site]) => {
      window.PROJECTS = (data.projects || []).filter((p) => p && p.slug && p.title).map(normalize);
      window.SITE = site || {};
    })
    .catch((err) => {
      console.error("No se pudo cargar el contenido", err);
      window.PROJECTS = [];
      window.SITE = {};
    })
    // Formato de cada portada (ancho / alto), para que las tarjetas salgan con el formato
    // original de su foto desde el primer momento. Se guarda en el navegador para la próxima visita
    .then(() => {
      let saved = {};
      try { saved = JSON.parse(localStorage.getItem("idlc-ratios") || "{}") || {}; } catch (e) {}
      window.RATIOS = saved;
      const missing = [...new Set((window.PROJECTS || []).map((p) => p.stills[0]).filter((src) => src && !saved[src]))];
      if (!missing.length) return;
      const imgs = missing.map((src) => { const im = new Image(); im.src = src; return [src, im]; });
      // El tamaño se conoce en cuanto llega la cabecera de la imagen, mucho antes de que termine de bajar
      return new Promise((done) => {
        const t0 = performance.now();
        const tick = () => {
          const ready = imgs.every(([, im]) => im.naturalWidth || im.complete);
          if (ready || performance.now() - t0 > 1500) {
            imgs.forEach(([src, im]) => { if (im.naturalWidth && im.naturalHeight) saved[src] = +(im.naturalWidth / im.naturalHeight).toFixed(4); });
            try { localStorage.setItem("idlc-ratios", JSON.stringify(saved)); } catch (e) {}
            done();
          } else setTimeout(tick, 25);
        };
        tick();
      });
    })
    .then(() => {
      const s = document.createElement("script");
      s.src = window.APP_SRC || "app.js";
      document.body.appendChild(s);
    });
})();
