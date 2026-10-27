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
    const sub = [{ value: "Ficción", label: "Toda la ficción" }, ...fiction.map((c) => ({ value: c, label: PLURAL[c] || c }))];
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

  /* ---------- Dial: las opciones van sobre el borde de una rueda que se gira arrastrando ---------- */
  function makeDial(host, items, value, label, onChange) {
    host.innerHTML = `<div class="dial" role="radiogroup" aria-label="${esc(label)}">
        <div class="dial-wheel">
          <div class="dial-ticks" aria-hidden="true"></div>
          ${items.map((it, i) => `<button type="button" class="dial-item" role="radio" aria-checked="false" tabindex="-1" data-i="${i}"><span>${esc(it.label)}</span></button>`).join("")}
        </div>
        <span class="dial-mark" aria-hidden="true"></span>
      </div>`;
    const dial = host.firstElementChild, wheel = dial.querySelector(".dial-wheel");
    const buttons = [...dial.querySelectorAll(".dial-item")];
    let R = 600, step = 10, phi = 0, index = Math.max(0, items.findIndex((it) => it.value === value)), near = index;
    const deg = 180 / Math.PI;

    function layout() {
      const w = dial.clientWidth || 360;
      // Rueda grande para que la curva sea suave
      R = Math.max(950, w * 2.6);
      // Separación: la etiqueta más larga más un margen, convertida en grados sobre la rueda
      const widest = Math.max(...buttons.map((b) => b.firstElementChild.offsetWidth));
      step = ((widest + 44) / R) * deg;
      wheel.style.setProperty("--r", R + "px");
      wheel.style.setProperty("--step", step + "deg");
      wheel.style.setProperty("--tw", (1.3 / R) * deg + "deg"); // marcas de 1,3 px de ancho, sea cual sea el radio
      buttons.forEach((b, i) => { b.style.transform = `translateX(-50%) rotate(${i * step}deg)`; });
      setPhi(index * step, false);
    }
    function setPhi(p, animate) {
      phi = p;
      wheel.classList.toggle("is-snapping", !!animate);
      wheel.style.transform = `rotate(${-phi}deg)`;
      const n = Math.max(0, Math.min(items.length - 1, Math.round(phi / step)));
      if (n !== near) {
        near = n;
        if (dragging && navigator.vibrate) navigator.vibrate(4); // un "clic" del dial en Android
      }
      buttons.forEach((b, i) => b.classList.toggle("is-near", i === near));
    }
    function select(i, focus) {
      i = Number.isFinite(i) ? Math.max(0, Math.min(items.length - 1, i)) : index;
      const changed = i !== index;
      index = i;
      buttons.forEach((b, j) => { b.setAttribute("aria-checked", String(j === i)); b.tabIndex = j === i ? 0 : -1; });
      setPhi(i * step, true);
      if (focus) buttons[i].focus({ preventScroll: true });
      if (changed) onChange(items[i].value);
    }

    // Arrastrar: la rueda sigue al dedo y al soltar se encaja en la opción más cercana
    let dragging = false, x0 = 0, phi0 = 0, moved = 0, lastX = 0, lastT = 0, vel = 0;
    dial.addEventListener("pointerdown", (e) => {
      if (e.button) return;
      dragging = true; moved = 0; x0 = lastX = e.clientX; phi0 = phi; lastT = e.timeStamp; vel = 0;
      wheel.classList.remove("is-snapping");
    });
    dial.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - x0;
      if (Math.abs(dx) > 4 && !dial.hasPointerCapture(e.pointerId)) dial.setPointerCapture(e.pointerId);
      moved = Math.max(moved, Math.abs(dx));
      const dt = Math.max(1, e.timeStamp - lastT);
      vel = vel * 0.6 + ((e.clientX - lastX) / dt) * 0.4; lastX = e.clientX; lastT = e.timeStamp;
      let p = phi0 - (dx / R) * deg;
      const max = (items.length - 1) * step;
      // Más allá de los extremos se resiste, como un tope con muelle
      if (p < 0) p *= 0.3; else if (p > max) p = max + (p - max) * 0.3;
      setPhi(p, false);
    });
    const end = (e) => {
      if (!dragging) return;
      dragging = false;
      if (moved < 6) {
        const hit = document.elementFromPoint(e.clientX, e.clientY);
        const b = hit && hit.closest(".dial-item");
        select(b && dial.contains(b) ? +b.dataset.i : index);
        return;
      }
      // Un poco de inercia según la velocidad al soltar
      const projected = phi - ((vel * 160) / R) * deg;
      select(Math.round(projected / step));
    };
    dial.addEventListener("pointerup", end);
    dial.addEventListener("pointercancel", end);
    dial.addEventListener("click", (e) => { const b = e.target.closest(".dial-item"); if (b && e.detail === 0) select(+b.dataset.i); });
    dial.addEventListener("keydown", (e) => {
      const k = { ArrowLeft: -1, ArrowUp: -1, ArrowRight: 1, ArrowDown: 1 }[e.key];
      if (k) { e.preventDefault(); select(index + k, true); }
      else if (e.key === "Home") { e.preventDefault(); select(0, true); }
      else if (e.key === "End") { e.preventDefault(); select(items.length - 1, true); }
    });
    // Trackpad: desplazamiento horizontal
    let wheelAcc = 0, wheelT = 0;
    dial.addEventListener("wheel", (e) => {
      if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
      e.preventDefault();
      wheelAcc += e.deltaX;
      clearTimeout(wheelT);
      wheelT = setTimeout(() => { wheelAcc = 0; }, 180);
      if (Math.abs(wheelAcc) > 60) { select(index + Math.sign(wheelAcc)); wheelAcc = 0; }
    }, { passive: false });

    // Que el foco o el navegador nunca desplacen el interior del dial
    dial.addEventListener("scroll", () => { dial.scrollTop = dial.scrollLeft = 0; });
    buttons.forEach((b, j) => { b.setAttribute("aria-checked", String(j === index)); b.tabIndex = j === index ? 0 : -1; });
    layout();
    if ("ResizeObserver" in window) new ResizeObserver(() => layout()).observe(dial);
    if (document.fonts) document.fonts.ready.then(layout);
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
      el.classList.add("curve");
      el.style.transformOrigin = `${(cx - left).toFixed(1)}px 50%`;
      el.style.transform = `perspective(620px) rotateX(${(side * 32 * k).toFixed(2)}deg) scaleX(${(1 + 0.05 * k).toFixed(4)})`;
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
