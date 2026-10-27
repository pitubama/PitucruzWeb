(function () {
  "use strict";

  const projects = window.PROJECTS || [];
  const site = window.SITE || {};
  const main = document.getElementById("main");
  const root = document.documentElement;
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const esc = (s) => String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const bySlug = (slug) => projects.find((p) => p.slug === slug);

  /* ---------- Datos generales ---------- */
  document.getElementById("brand-name").textContent = site.name || "";
  document.getElementById("brand-role").textContent = site.role || "";
  document.getElementById("mail-address").textContent = site.email || "";
  document.getElementById("foot-links").innerHTML = [
    site.email && `<li><a href="mailto:${esc(site.email)}">Email</a></li>`,
    site.instagram && `<li><a href="${esc(site.instagram)}" target="_blank" rel="noopener">Instagram</a></li>`,
    site.vimeo && `<li><a href="${esc(site.vimeo)}" target="_blank" rel="noopener">Vimeo</a></li>`
  ].filter(Boolean).join("");
  document.getElementById("foot-small").textContent = `© ${new Date().getFullYear()} ${site.name || ""}. ${site.city || ""}`;

  const copyBtn = document.getElementById("copy-mail");
  copyBtn.addEventListener("click", () => {
    const done = () => { copyBtn.textContent = "Email copiado"; setTimeout(() => (copyBtn.textContent = "Copiar email"), 2000); };
    const fallback = () => {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById("mail-address"));
      const sel = window.getSelection(); sel.removeAllRanges(); sel.addRange(range);
    };
    try { navigator.clipboard.writeText(site.email).then(done, fallback); } catch (e) { fallback(); }
  });

  /* ---------- Vistas ---------- */
  // Filtro de Trabajo: primer dial (Todo, Ficción, Publicidad...) y, dentro de Ficción, el segundo
  const FICTION = ["Largometraje", "Cortometraje", "Serie"];
  const PLURAL = { Largometraje: "Largometrajes", Cortometraje: "Cortos", Serie: "Series", Videoclip: "Videoclips", Documental: "Documentales" };
  const activeFilter = { top: "Todo", sub: "Ficción" };

  function sizeFor(i, total) {
    // Ritmo de la rejilla: ancho completo, luego parejas 7/5 y 5/7
    const pattern = ["w12", "w7", "w5", "w5", "w7"];
    const cls = pattern[i % pattern.length];
    const startsPair = cls === "w7" && i % 5 === 1 || cls === "w5" && i % 5 === 3;
    if (startsPair && i === total - 1) return "w12";
    return cls;
  }

  function cardHTML(p, i, total, size) {
    return `<li class="${size || sizeFor(i, total)}" style="--i:${i}">
      <a class="card" href="#p-${esc(p.slug)}">
        <div class="card-frame" data-vt="still-${esc(p.slug)}" style="view-transition-name: still-${esc(p.slug)}"><img src="${esc(p.stills[0])}" alt="Fotograma de ${esc(p.title)}" loading="${i < 2 ? "eager" : "lazy"}"></div>
        <div class="card-text">
          <span class="card-title">${esc(p.title)}</span>
          <span class="card-meta">${esc(p.category)}, ${esc(p.year)}${p.video ? ". Con vídeo" : ""}</span>
        </div>
      </a>
    </li>`;
  }

  function renderGrid() {
    const { top, sub } = activeFilter;
    const list = projects.filter((p) =>
      top === "Todo" ? true
      : top === "Ficción" ? (sub === "Ficción" ? FICTION.includes(p.category) : p.category === sub)
      : p.category === top);
    const grid = document.getElementById("grid");
    grid.innerHTML = list.length
      ? list.map((p, i) => cardHTML(p, i, list.length)).join("")
      : `<li class="empty">Todavía no hay proyectos en esta categoría.</li>`;
    if (!reduceMotion) grid.querySelectorAll("li").forEach((li) => li.classList.add("reveal"));
  }

  function featured() {
    const marked = projects.filter((p) => p.featured);
    return (marked.length ? marked : projects).slice(0, 2);
  }

  function renderHome() {
    const picks = featured();
    main.innerHTML = `
      <section class="intro wrap" aria-label="Presentación">
        <p class="intro-line">${esc(site.tagline)}</p>
      </section>

      <section class="section wrap" aria-labelledby="destacados-title">
        <div class="section-head">
          <h2 class="section-title" id="destacados-title">Trabajo reciente</h2>
          <a class="all-link" href="#trabajo">Ver todo el trabajo</a>
        </div>
        <ul class="grid grid-featured">
          ${picks.map((p, i) => cardHTML(p, i, picks.length, i ? "w5" : "w7")).join("")}
        </ul>
        <a class="all-link all-link-bottom" href="#trabajo">Ver todo el trabajo</a>
      </section>

      <section class="section wrap" id="sobre-mi" aria-labelledby="sobre-title">
        <div class="section-head"><h2 class="section-title" id="sobre-title">Sobre mí</h2></div>
        <div class="about">
          <dl class="about-facts">
            <dt>Base</dt><dd>${esc(site.city)}</dd>
            <dt>Herramienta</dt><dd>DaVinci Resolve Studio</dd>
            <dt>Entregas</dt><dd>HDR (PQ, HLG) y SDR Rec.709, DCP</dd>
            <dt>Flujos</dt><dd>ACES, RCM, LUTs de rodaje</dd>
          </dl>
          <div class="about-text">${(site.about || []).map((t) => `<p>${esc(t)}</p>`).join("")}</div>
        </div>
      </section>`;
  }

  function renderWork() {
    const cats = [...new Set(projects.map((p) => p.category))];
    const fiction = FICTION.filter((c) => cats.includes(c));
    const top = [{ value: "Todo", label: "Todo" }];
    if (fiction.length) top.push({ value: "Ficción", label: "Ficción" });
    cats.filter((c) => !FICTION.includes(c)).forEach((c) => top.push({ value: c, label: PLURAL[c] || c }));
    const sub = [{ value: "Ficción", label: "Toda" }, ...fiction.map((c) => ({ value: c, label: PLURAL[c] || c }))];
    main.innerHTML = `
      <section class="work wrap" aria-labelledby="trabajo-title">
        <div class="section-head">
          <h1 class="work-title" id="trabajo-title">Trabajo</h1>
          <div class="dials">
            <div class="dial-host" id="dial-top"></div>
            <div class="dial-sub" id="dial-sub-wrap"><div><div class="dial-host" id="dial-sub"></div></div></div>
          </div>
        </div>
        <ul class="grid grid-all" id="grid"></ul>
      </section>`;
    const subWrap = document.getElementById("dial-sub-wrap");
    const showSub = (on) => { subWrap.classList.toggle("is-open", on); subWrap.inert = !on; };
    makeDial(document.getElementById("dial-top"), top, activeFilter.top, "Tipo de proyecto", (v) => {
      activeFilter.top = v; showSub(v === "Ficción"); renderGrid();
    });
    makeDial(document.getElementById("dial-sub"), sub, activeFilter.sub, "Tipo de ficción", (v) => {
      activeFilter.sub = v; renderGrid();
    });
    showSub(activeFilter.top === "Ficción");
    renderGrid();
  }

  /* ---------- Selector tipo píldora: el fondo se desliza hasta la opción elegida ---------- */
  function makeDial(host, items, value, label, onChange) {
    host.innerHTML = `<div class="seg-scroll"><div class="seg" role="radiogroup" aria-label="${esc(label)}">
        <span class="seg-thumb" aria-hidden="true"><span class="seg-thumb-labels">${items.map((it) => `<span class="seg-item">${esc(it.label)}</span>`).join("")}</span></span>
        ${items.map((it, i) => `<button type="button" class="seg-item" role="radio" aria-checked="false" tabindex="-1" data-i="${i}">${esc(it.label)}</button>`).join("")}
      </div></div>`;
    const scroller = host.firstElementChild, seg = scroller.firstElementChild, thumb = seg.querySelector(".seg-thumb");
    const buttons = [...seg.querySelectorAll("button.seg-item")];
    // Dentro de la píldora hay una copia de las etiquetas en el color contrario que se desplaza al revés:
    // así el texto cambia de color justo por donde pasa el borde de la píldora
    const thumbLabels = thumb.firstElementChild;
    const setThumb = (x, w, sy = 1) => {
      thumb.style.width = w + "px";
      thumb.style.transform = `translateX(${x}px)` + (sy !== 1 ? ` scaleY(${sy.toFixed(3)})` : "");
      thumbLabels.style.transform = `translateX(${-x}px)` + (sy !== 1 ? ` scaleY(${(1 / sy).toFixed(3)})` : "");
    };
    let index = Math.max(0, items.findIndex((it) => it.value === value));

    function place(animate) {
      const b = buttons[index];
      thumb.classList.toggle("is-moving", !!animate);
      setThumb(b.offsetLeft, b.offsetWidth);
      buttons.forEach((x, j) => { x.setAttribute("aria-checked", String(j === index)); x.tabIndex = j === index ? 0 : -1; x.classList.toggle("is-near", j === index); });
      // Si no cabe entero (móvil), desliza la fila para que la opción elegida quede a la vista
      const br = b.getBoundingClientRect(), sr = scroller.getBoundingClientRect();
      const pad = 24, left = scroller.scrollLeft + br.left - sr.left - pad, right = scroller.scrollLeft + br.right - sr.left + pad;
      if (left < scroller.scrollLeft) scroller.scrollTo({ left, behavior: animate ? "smooth" : "auto" });
      else if (right > scroller.scrollLeft + scroller.clientWidth) scroller.scrollTo({ left: right - scroller.clientWidth, behavior: animate ? "smooth" : "auto" });
    }
    function select(i, focus) {
      i = Math.max(0, Math.min(items.length - 1, i));
      const changed = i !== index;
      index = i;
      place(true);
      if (focus) buttons[i].focus({ preventScroll: true });
      if (changed) onChange(items[i].value);
    }
    seg.addEventListener("click", (e) => {
      if (dragged) { dragged = false; return; }
      const b = e.target.closest(".seg-item"); if (b) select(+b.dataset.i);
    });
    // Arrastrar: la píldora sigue al dedo, cambia de ancho entre opciones y al soltar encaja en la más cercana
    let drag = null, dragged = false;
    const centers = () => buttons.map((b) => b.offsetLeft + b.offsetWidth / 2);
    seg.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      drag = { x0: e.clientX, near: index, active: false };
    });
    seg.addEventListener("pointermove", (e) => {
      if (!drag) return;
      if (!drag.active) {
        if (Math.abs(e.clientX - drag.x0) < 5) return;
        drag.active = true; seg.setPointerCapture(e.pointerId); seg.classList.add("is-dragging");
        thumb.classList.remove("is-moving");
      }
      const c = centers(), rect = seg.getBoundingClientRect();
      const raw = e.clientX - rect.left;
      const x = Math.max(c[0], Math.min(c[c.length - 1], raw));
      const over = raw - x; // cuánto se ha pasado del tope
      let i = 0;
      while (i < c.length - 2 && x > c[i + 1]) i++;
      const t = c.length > 1 ? (x - c[i]) / (c[i + 1] - c[i]) : 0;
      const w = buttons[i].offsetWidth + (buttons[Math.min(i + 1, c.length - 1)].offsetWidth - buttons[i].offsetWidth) * t;
      if (over) {
        // Pasado el tope se estira como un chicle: cada vez cuesta más y se adelgaza un poco
        const pull = 26 * (1 - Math.exp(-Math.abs(over) / 70));
        setThumb(over > 0 ? x - w / 2 : x - w / 2 - pull, w + pull, 1 - 0.14 * (pull / 26));
      } else setThumb(x - w / 2, w);
      const near = t < 0.5 ? i : i + 1;
      if (near !== drag.near) {
        drag.near = near;
        buttons.forEach((b, j) => b.classList.toggle("is-near", j === near));
        if (navigator.vibrate) navigator.vibrate(4);
      }
    });
    const endDrag = () => {
      if (!drag) return;
      const d = drag; drag = null;
      if (!d.active) return;
      dragged = true; setTimeout(() => (dragged = false), 0);
      seg.classList.remove("is-dragging");
      if (d.near === index) place(true); else select(d.near);
    };
    seg.addEventListener("pointerup", endDrag);
    seg.addEventListener("pointercancel", endDrag);
    seg.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (k) { e.preventDefault(); select(index + k, true); }
      else if (e.key === "Home") { e.preventDefault(); select(0, true); }
      else if (e.key === "End") { e.preventDefault(); select(items.length - 1, true); }
    });
    place(false);
    if ("ResizeObserver" in window) new ResizeObserver(() => place(false)).observe(seg);
    if (document.fonts) document.fonts.ready.then(() => place(false));
  }

  function videoHTML(v, title) {
    if (!v || !v.id) return "";
    const isVimeo = v.provider === "vimeo";
    const src = isVimeo
      ? `https://player.vimeo.com/video/${encodeURIComponent(v.id)}?dnt=1&title=0&byline=0&portrait=0`
      : `https://www.youtube-nocookie.com/embed/${encodeURIComponent(v.id)}?rel=0`;
    const page = isVimeo ? `https://vimeo.com/${encodeURIComponent(v.id)}` : `https://www.youtube.com/watch?v=${encodeURIComponent(v.id)}`;
    return `<div class="video"><iframe src="${src}" title="${esc(title)}" loading="lazy"
        allow="autoplay; fullscreen; picture-in-picture; encrypted-media" allowfullscreen></iframe></div>
      <a class="video-link" href="${page}" target="_blank" rel="noopener">Ver en ${isVimeo ? "Vimeo" : "YouTube"}</a>`;
  }

  function renderProject(p) {
    const idx = projects.indexOf(p);
    const next = projects[(idx + 1) % projects.length];
    const credits = [["Tipo", p.category], ["Año", p.year], ...(p.camera ? [["Origen", p.camera]] : []), ...(p.credits || [])];
    main.innerHTML = `
      <article class="project wrap">
        <a class="back" href="#trabajo">Todo el trabajo</a>
        <h1 class="project-title">${esc(p.title)}</h1>
        <div class="project-intro">
          <p class="project-summary">${esc(p.summary)}</p>
          <dl class="credits">${credits.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join("")}</dl>
        </div>
        <p class="media-hint">Toca un fotograma para verlo en horizontal</p>
        <div class="media">
          <img src="${esc(p.stills[0])}" alt="Fotograma 1 de ${esc(p.title)}" data-vt="still-${esc(p.slug)}" style="view-transition-name: still-${esc(p.slug)}" tabindex="0">
          ${videoHTML(p.video, p.title)}
          ${p.stills.slice(1).map((s, i) => `<img src="${esc(s)}" alt="Fotograma ${i + 2} de ${esc(p.title)}" loading="lazy" tabindex="0">`).join("")}
        </div>
        ${next && next !== p ? `<a class="next" href="#p-${esc(next.slug)}"><span class="next-label">Siguiente proyecto</span><span class="next-title">${esc(next.title)}</span></a>` : ""}
      </article>`;
  }

  /* ---------- Router por hash: #trabajo, #p-slug, o portada ---------- */
  let currentView = null;
  function route() {
    const hash = decodeURIComponent(location.hash.slice(1));
    const project = hash.startsWith("p-") ? bySlug(hash.slice(2)) : null;
    const view = project ? "p:" + project.slug : hash === "trabajo" ? "work" : "home";
    const paint = () => {
      if (view !== currentView) {
        if (project) renderProject(project);
        else if (view === "work") renderWork();
        else renderHome();
        root.dataset.view = view === "work" ? "work" : view === "home" ? "home" : "project";
        currentView = view;
        // La animación del titular de portada solo se ve en la primera carga
        requestAnimationFrame(() => (root.dataset.loaded = ""));
      }
      document.title = project ? `${project.title}, ${site.name}` : view === "work" ? `Trabajo, ${site.name}` : site.name;
      const target = view === "home" && hash && document.getElementById(hash);
      if (target) target.scrollIntoView();
      else window.scrollTo(0, 0);
      document.querySelectorAll(".site-nav a").forEach((a) => a.toggleAttribute("aria-current", a.getAttribute("href") === "#" + hash));
    };
    const changesView = view !== currentView && currentView !== null;
    // En móvil: fundido sencillo y rápido del contenido; la cabecera no se toca
    if (changesView && !reduceMotion && window.matchMedia("(max-width: 759px)").matches) {
      clearTimeout(route.t);
      main.classList.remove("is-entering");
      main.classList.add("is-leaving");
      route.t = setTimeout(() => {
        paint();
        main.classList.remove("is-leaving");
        void main.offsetWidth;
        main.classList.add("is-entering");
      }, 160);
      return;
    }
    if (changesView && document.startViewTransition && !reduceMotion) {
      // Los stills que ya estaban en pantalla vuelan a su sitio; los nuevos se abren como un obturador
      const before = new Set([...document.querySelectorAll("[data-vt]")].map((el) => el.dataset.vt));
      root.dataset.transition = view === "work" ? "to-work" : "page";
      const t = document.startViewTransition(() => {
        paint();
        document.querySelectorAll(".grid li").forEach((li) => {
          const frame = li.querySelector("[data-vt]");
          if (!frame) return;
          if (before.has(frame.dataset.vt)) li.classList.remove("reveal");
          else frame.style.viewTransitionName = "none";
        });
      });
      t.finished.finally(() => {
        delete root.dataset.transition;
        document.querySelectorAll("[data-vt]").forEach((el) => (el.style.viewTransitionName = el.dataset.vt));
      });
    } else paint();
  }
  window.addEventListener("hashchange", route);
  document.querySelector("[data-home]").addEventListener("click", (e) => {
    e.preventDefault();
    if (location.hash) history.pushState(null, "", location.pathname + location.search);
    route();
  });
  route();

  /* ---------- Cabecera en móvil: menú desplegable y ocultación al hacer scroll ---------- */
  const head = document.querySelector(".site-head");
  const menuBtn = document.getElementById("menu-toggle");
  const mobile = window.matchMedia("(max-width: 759px)");
  const setMenu = (open) => {
    head.toggleAttribute("data-open", open);
    root.toggleAttribute("data-menu", open);
    menuBtn.setAttribute("aria-expanded", String(open));
    menuBtn.querySelector(".menu-label").textContent = open ? "Cerrar" : "Menú";
    if (open) setHidden(0);
  };
  menuBtn.addEventListener("click", () => setMenu(!head.hasAttribute("data-open")));
  document.getElementById("site-nav").addEventListener("click", (e) => { if (e.target.closest("a") || e.target.id === "site-nav") setMenu(false); });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && head.hasAttribute("data-open")) { setMenu(false); menuBtn.focus(); } });
  document.addEventListener("pointerdown", (e) => { if (head.hasAttribute("data-open") && !head.contains(e.target)) setMenu(false); });

  // Al bajar, la cabecera se va desvaneciendo y subiendo al ritmo del scroll; al subir, vuelve igual
  let hidden = 0, lastY = window.scrollY;
  function setHidden(px) {
    hidden = px;
    const h = head.offsetHeight || 1;
    head.style.transform = px ? `translateY(${-px}px)` : "";
    head.style.opacity = px ? String(Math.max(0, 1 - px / (h * 0.8))) : "";
    head.style.pointerEvents = px >= h ? "none" : "";
  }
  window.addEventListener("scroll", () => {
    const y = Math.max(0, window.scrollY);
    root.toggleAttribute("data-scrolled", y > 4);
    const delta = y - lastY;
    lastY = y;
    if (!mobile.matches || head.hasAttribute("data-open")) { if (hidden) setHidden(0); return; }
    setHidden(Math.min(head.offsetHeight, Math.max(0, hidden + delta), y));
  }, { passive: true });
  /* Móvil: cerca de los bordes de la pantalla el contenido se curva hacia ti, como en una pantalla curva.
     Cada bloque se inclina en 3D según lo cerca que esté del borde y se ensancha un poco */
  const CURVE = ".intro-line, .section-head, .card-frame, .card-text, .all-link-bottom, .about-facts dt, .about-facts dd, .about-text p, .back, .project-title, .project-summary, .credits dt, .credits dd, .media > *, .next, .site-foot > *";
  let curveEls = [], curveRaf = 0;
  // Las posiciones se miden sin transformar y se guardan; al hacer scroll solo se recalcula el ángulo
  function measureCurve() {
    curveEls = [...document.querySelectorAll(CURVE)];
    curveEls.forEach((el) => { el.style.transform = ""; });
    const y = window.scrollY;
    curveEls = curveEls.map((el) => { const r = el.getBoundingClientRect(); return { el, top: r.top + y, h: r.height, left: r.left }; });
    updateCurve();
  }
  function updateCurve() {
    curveRaf = 0;
    if (!mobile.matches || reduceMotion) {
      curveEls.forEach(({ el }) => { if (el.classList.contains("curve")) { el.classList.remove("curve"); el.style.transform = el.style.transformOrigin = ""; } });
      return;
    }
    const vh = window.innerHeight, cx = document.documentElement.clientWidth / 2, zone = vh * 0.3, y = window.scrollY;
    curveEls.forEach(({ el, top: docTop, h, left }) => {
      const top = docTop - y, bottom = top + h;
      if (bottom < -60 || top > vh + 60) { if (el.style.transform) el.style.transform = ""; return; }
      const half = Math.min(h, 100) / 2;
      const d = Math.max(0, Math.min(bottom - half, vh - (top + half)));
      const t = Math.max(0, 1 - d / zone), k = t * t;
      if (k < 0.002) { if (el.style.transform) el.style.transform = ""; return; }
      // Arriba se inclina hacia un lado y abajo hacia el otro: el borde que toca la pantalla se acerca
      const side = top + h / 2 < vh / 2 ? -1 : 1;
      // Arriba del todo de la página no hay nada que curvar: así el título y los filtros se ven nítidos
      if (side < 0 && y < 200) { const f = y / 200; if (k * f < 0.002) { if (el.style.transform) el.style.transform = ""; return; } }
      el.classList.add("curve");
      el.style.transformOrigin = `${(cx - left).toFixed(1)}px 50%`;
      const kk = side < 0 ? k * Math.min(1, y / 200) : k;
      el.style.transform = `perspective(620px) rotateX(${(side * 32 * kk).toFixed(2)}deg) scaleX(${(1 + 0.05 * kk).toFixed(4)})`;
    });
  }
  const queueCurve = () => { if (!curveRaf) curveRaf = requestAnimationFrame(updateCurve); };
  let measureT = 0;
  const queueMeasure = (ms = 60) => { clearTimeout(measureT); measureT = setTimeout(() => requestAnimationFrame(measureCurve), ms); };
  window.addEventListener("scroll", queueCurve, { passive: true });
  window.addEventListener("resize", () => queueMeasure());
  window.addEventListener("load", () => queueMeasure(0));
  if (document.fonts) document.fonts.ready.then(() => queueMeasure(0));
  // Al cambiar de página se mide al entrar y otra vez cuando han terminado las animaciones de entrada
  new MutationObserver(() => { queueMeasure(40); setTimeout(() => queueMeasure(0), 900); }).observe(main, { childList: true });
  if ("ResizeObserver" in window) new ResizeObserver(() => queueMeasure()).observe(main);
  measureCurve();

  /* Móvil: al tocar un fotograma de un proyecto, gira 90° y crece hasta ocupar la pantalla,
     como si hubieras tumbado el teléfono. Otro toque (o Escape) lo devuelve a su sitio */
  const TILT_MS = 650;
  const tilt = { el: null, frame: null, box: null, from: null, p: 0, p0: 0, tp: 0, start: 0, raf: 0 };
  const easeInOut = (u) => (u < 0.5 ? 4 * u * u * u : 1 - Math.pow(-2 * u + 2, 3) / 2);
  function tiltOpen(img) {
    if (tilt.el) return;
    const title = (main.querySelector(".project-title") || {}).textContent || "";
    const el = document.createElement("div");
    el.className = "tilt-view";
    el.setAttribute("role", "dialog");
    el.setAttribute("aria-label", img.alt);
    el.innerHTML = `<div class="tilt-shade"></div><figure class="tilt-frame"><img alt=""><figcaption><span class="tilt-title"></span><span class="tilt-meta"></span></figcaption></figure>`;
    el.querySelector("img").src = img.currentSrc || img.src;
    el.querySelector("img").alt = img.alt;
    el.querySelector(".tilt-title").textContent = title;
    el.querySelector(".tilt-meta").textContent = img.alt.replace(/ de .*$/, "");
    el.addEventListener("click", tiltDismiss);
    document.body.appendChild(el);
    tilt.el = el; tilt.frame = el.querySelector(".tilt-frame"); tilt.box = img; tilt.opener = img;
    tilt.from = img.getBoundingClientRect();
    tilt.ratio = img.naturalWidth && img.naturalHeight ? img.naturalWidth / img.naturalHeight : 2.39;
    img.style.visibility = "hidden";
    root.setAttribute("data-tilt", "");
    tiltTo(1);
  }
  function tiltDismiss() { if (tilt.el && tilt.tp !== 0) tiltTo(0); }
  function tiltTo(target) {
    tilt.p0 = tilt.p; tilt.tp = target; tilt.start = performance.now();
    if (reduceMotion) tilt.p0 = target;
    if (!tilt.raf) tilt.raf = requestAnimationFrame(tiltRender);
  }
  function tiltClose() {
    if (!tilt.el) return;
    tilt.el.remove(); tilt.box.style.visibility = "";
    if (tilt.opener && document.activeElement === document.body) tilt.opener.focus({ preventScroll: true });
    tilt.el = tilt.frame = tilt.box = tilt.opener = null; tilt.p = tilt.tp = 0;
    if (tilt.raf) { cancelAnimationFrame(tilt.raf); tilt.raf = 0; }
    root.removeAttribute("data-tilt");
  }
  function tiltRender(now) {
    tilt.raf = 0;
    const { el, frame, from } = tilt;
    if (!el) return;
    const u = Math.min(1, (now - tilt.start) / TILT_MS);
    const p = tilt.p = tilt.p0 + (tilt.tp - tilt.p0) * easeInOut(u);
    const vw = window.innerWidth, vh = window.innerHeight;
    // Tamaño final: la foto entera, tumbada, lo más grande que quepa dejando sitio al pie con el título
    const W = Math.min(vh * 0.92, (vw - 112) * tilt.ratio), H = W / tilt.ratio;
    const w = from.width + (W - from.width) * p, h = from.height + (H - from.height) * p;
    const x = from.left + from.width / 2 + (vw / 2 - from.left - from.width / 2) * p;
    const y = from.top + from.height / 2 + (vh / 2 - from.top - from.height / 2) * p;
    frame.style.width = w + "px"; frame.style.height = h + "px";
    frame.style.transform = `translate(${x - w / 2}px, ${y - h / 2}px) rotate(${(90 * p).toFixed(2)}deg)`;
    el.style.setProperty("--p", p.toFixed(3));
    if (u < 1) tilt.raf = requestAnimationFrame(tiltRender);
    else if (tilt.tp === 0) tiltClose();
  }
  main.addEventListener("click", (e) => {
    const img = e.target.closest(".media > img");
    if (img && mobile.matches) tiltOpen(img);
  });
  main.addEventListener("keydown", (e) => {
    const img = e.target.closest(".media > img");
    if (img && mobile.matches && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); tiltOpen(img); }
  });
  document.addEventListener("keydown", (e) => { if (e.key === "Escape") tiltDismiss(); });
  window.addEventListener("hashchange", tiltClose);
  mobile.addEventListener("change", tiltClose);

  mobile.addEventListener("change", () => { setHidden(0); setMenu(false); });
  window.addEventListener("hashchange", () => { setHidden(0); lastY = window.scrollY; });

  /* ---------- Rueda Offset: color de fondo ---------- */
  const DEFAULT = { x: 0, y: 0, l: 25 / 255 };
  const KEY = "idlc-offset";
  let state = { ...DEFAULT };
  try { const saved = JSON.parse(localStorage.getItem(KEY)); if (saved && typeof saved.l === "number") state = saved; } catch (e) {}

  const wheel = document.getElementById("wheel");
  const puck = document.getElementById("wheel-puck");
  const master = document.getElementById("master");
  const toggleDot = document.getElementById("grade-toggle-dot");
  const out = { r: document.getElementById("rgb-r"), g: document.getElementById("rgb-g"), b: document.getElementById("rgb-b") };

  function hueDir(deg) {
    // Dirección de color para un ángulo (0° arriba, sentido horario, igual que el conic-gradient)
    const f = (n) => { const k = (n + deg / 30) % 12; return 0.5 - 0.5 * Math.max(-1, Math.min(k - 3, 9 - k, 1)); };
    const c = [f(0), f(8), f(4)];
    const mean = (c[0] + c[1] + c[2]) / 3;
    const d = c.map((v) => v - mean);
    const m = Math.max(...d.map(Math.abs)) || 1;
    return d.map((v) => v / m);
  }
  const lin = (c) => (c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4));
  const hex = (rgb) => "#" + rgb.map((v) => Math.round(v * 255).toString(16).padStart(2, "0")).join("");

  function apply(save) {
    const mag = Math.min(1, Math.hypot(state.x, state.y));
    const deg = (Math.atan2(state.x, -state.y) * 180) / Math.PI + 360;
    const dir = hueDir(deg % 360);
    const amount = 0.15 * mag;
    const rgb = dir.map((d) => Math.max(0, Math.min(1, state.l + d * amount)));
    const Y = 0.2126 * lin(rgb[0]) + 0.7152 * lin(rgb[1]) + 0.0722 * lin(rgb[2]);
    const light = Y > 0.2;

    root.style.setProperty("--bg", hex(rgb));
    root.style.setProperty("--fg", light ? "#141414" : "#e9e7e3");
    root.dataset.tone = light ? "light" : "dark";

    out.r.textContent = (rgb[0] * 255).toFixed(2);
    out.g.textContent = (rgb[1] * 255).toFixed(2);
    out.b.textContent = (rgb[2] * 255).toFixed(2);

    const px = 50 + state.x * 50, py = 50 + state.y * 50;
    puck.style.left = px + "%"; puck.style.top = py + "%";
    toggleDot.style.left = px + "%"; toggleDot.style.top = py + "%";
    puck.setAttribute("aria-valuenow", String(Math.round(mag * 100)));
    puck.setAttribute("aria-valuetext", mag < 0.02 ? "Sin tinte" : `Tinte ${Math.round(mag * 100)}%, tono ${Math.round(deg % 360)}°`);
    master.value = String(state.l * 100);

    if (save) { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) {} }
  }

  function setOffset(x, y) {
    const m = Math.hypot(x, y);
    if (m > 1) { x /= m; y /= m; }
    state.x = x; state.y = y;
    apply(true);
  }

  // La zona útil de la rueda es el disco interior (8px de borde)
  function offsetFromPointer(e) {
    const r = wheel.getBoundingClientRect();
    const radius = r.width / 2 - 8;
    setOffset((e.clientX - (r.left + r.width / 2)) / radius, (e.clientY - (r.top + r.height / 2)) / radius);
  }
  let wheelDrag = false;
  wheel.addEventListener("pointerdown", (e) => { wheelDrag = true; wheel.setPointerCapture(e.pointerId); offsetFromPointer(e); });
  wheel.addEventListener("pointermove", (e) => wheelDrag && offsetFromPointer(e));
  wheel.addEventListener("pointerup", () => (wheelDrag = false));
  wheel.addEventListener("pointercancel", () => (wheelDrag = false));
  wheel.addEventListener("dblclick", () => setOffset(0, 0));
  puck.addEventListener("keydown", (e) => {
    const s = e.shiftKey ? 0.15 : 0.04;
    const moves = { ArrowLeft: [-s, 0], ArrowRight: [s, 0], ArrowUp: [0, -s], ArrowDown: [0, s] };
    if (moves[e.key]) { setOffset(state.x + moves[e.key][0], state.y + moves[e.key][1]); e.preventDefault(); }
    if (e.key === "Home") { setOffset(0, 0); e.preventDefault(); }
  });
  master.addEventListener("input", () => { state.l = Number(master.value) / 100; apply(true); });
  document.getElementById("grade-reset").addEventListener("click", () => { state = { ...DEFAULT }; apply(true); });

  const toggle = document.getElementById("grade-toggle");
  const panel = document.getElementById("grade-panel");
  const setOpen = (open) => { panel.hidden = !open; toggle.setAttribute("aria-expanded", String(open)); };
  toggle.addEventListener("click", () => setOpen(panel.hidden));
  document.addEventListener("keydown", (e) => { if (e.key === "Escape" && !panel.hidden) { setOpen(false); toggle.focus(); } });
  document.addEventListener("pointerdown", (e) => { if (!panel.hidden && !document.getElementById("grade").contains(e.target)) setOpen(false); });

  apply(false);
})();
