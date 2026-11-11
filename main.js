(() => {
  const S = window.SITE, D = window.I18N, E = window.ESTADO;
  const $ = (s, c = document) => c.querySelector(s), $$ = (s, c = document) => [...c.querySelectorAll(s)];
  const TZ = "Europe/Madrid";
  let lang = "es";
  try { lang = localStorage.getItem("ac-lang") || ""; } catch (e) { }
  if (!D[lang]) { const nl = (navigator.language || "es").slice(0, 2); lang = nl === "ca" ? "ca" : /^(es|gl|eu)$/.test(nl) ? "es" : "en"; }
  const t = k => (D[lang] && D[lang][k] !== undefined ? D[lang][k] : D.es[k]) ?? k;
  const fill = (s, o) => s.replace(/\{(\w+)\}/g, (_, k) => o[k] ?? "");
  const pad = n => String(n).padStart(2, "0");
  const wa = msg => `https://wa.me/${S.whatsapp}?text=${encodeURIComponent(msg)}`;
  let estadoActual = null;

  /* ---------- i18n ---------- */
  function applyLang(l) {
    lang = D[l] ? l : "es"; try { localStorage.setItem("ac-lang", lang); } catch (e) { }
    document.documentElement.lang = lang;
    $$("[data-i18n]").forEach(e => e.textContent = t(e.dataset.i18n));
    $$("[data-i18n-html]").forEach(e => e.innerHTML = t(e.dataset.i18nHtml));
    $$("#lang button").forEach(b => b.classList.toggle("on", b.dataset.lang === lang));
    renderMenu(); renderTeam(); renderHours(); renderReviews(); renderGalleryLabels(); renderHeat(); renderRec(); setWaLinks();
    if (estadoActual) renderEstado(estadoActual);
  }
  $$("#lang button").forEach(b => b.addEventListener("click", () => applyLang(b.dataset.lang)));

  /* ---------- enlaces ---------- */
  function setWaLinks() {
    const set = (sel, msg) => $$(sel).forEach(a => { a.href = wa(msg); a.target = "_blank"; a.rel = "noopener"; });
    set(".js-wa", t("wa.hola")); set(".js-wa-cola", t("wa.cola")); set(".js-wa-gift", t("wa.gift"));
  }
  $$(".js-tel").forEach(a => a.href = "tel:+34" + S.telefono);
  $$(".js-ig").forEach(a => a.href = "https://www.instagram.com/" + S.instagram + "/");
  $$(".js-maps").forEach(a => a.href = S.mapsUrl);
  $$(".js-route").forEach(a => a.href = "https://www.google.com/maps/dir/?api=1&destination=" + encodeURIComponent("Arte & Corte, " + S.direccion));
  $("#gReview").href = S.resenaUrl || S.mapsUrl;
  $("#year").textContent = new Date().getFullYear();

  /* ---------- ESPERA EN DIRECTO ---------- */
  const hace = ms => { const m = Math.max(0, Math.round(ms / 60000)); return m < 60 ? m + " min" : Math.floor(m / 60) + " h " + pad(m % 60); };
  function dayWord(p) { return p.dias === 0 ? t("hoyLow") : p.dias === 1 ? t("mananaLow") : t("days")[p.dow].toLowerCase(); }
  function renderEstado(r) {
    estadoActual = r;
    const n = E.now(), ab = E.abierto(n);
    let tag, big, sub, color, short, pct;
    if (r.tipo === "cerrado") {
      tag = t("w.cerradoTag"); big = t("w.cerrado"); color = "#8b8378"; short = t("w.cc"); pct = 0;
      sub = r.prox ? fill(t("w.abre"), { d: dayWord(r.prox), h: r.prox.h }) : "";
    } else {
      const lv = E.NIV[r.nivel] || E.NIV[1];
      color = lv.color; big = t("w.n" + lv.n); short = t("w.c" + lv.n); pct = [8, 35, 62, 92, 0][lv.n];
      if (r.tipo === "vivo") {
        tag = t("w.vivo");
        const ago = Date.now() - r.ts, who = r.b || t("w.equipo");
        sub = t("w.s" + lv.n) + " " + (ago < 90000 ? fill(t("w.actNow"), { b: who }) : fill(t("w.act"), { m: hace(ago), b: who })) + ".";
      } else { tag = t("w.estim"); sub = t("w.estSub"); }
    }
    $$(".js-wait").forEach(c => {
      c.style.setProperty("--wc", color);
      c.classList.toggle("is-est", r.tipo !== "vivo");
      c.classList.toggle("is-closed", r.tipo === "cerrado");
      $$(".js-w-tag", c).forEach(x => x.textContent = tag);
      $$(".js-w-big", c).forEach(x => x.textContent = big);
      $$(".js-w-sub", c).forEach(x => x.textContent = sub);
      $$(".js-w-meter", c).forEach(x => x.style.width = pct + "%");
      $$(".js-w-open", c).forEach(x => x.textContent = ab ? fill(t("w.hasta"), { h: ab[1] }) : "");
    });
    $$(".js-live-short").forEach(x => x.textContent = short);
    $$(".js-live-chip, .mbar-cta").forEach(x => x.style.setProperty("--wc", color));
    $$(".js-live-chip, .mbar-cta").forEach(x => x.classList.toggle("is-est", r.tipo !== "vivo"));
  }
  E.suscribir(renderEstado);
  setInterval(() => estadoActual && renderEstado(estadoActual), 30000);

  /* ---------- mapa de mejores horas ---------- */
  function renderHeat() {
    const order = [1, 2, 3, 4, 5, 6, 0], n = E.now(), curH = Math.floor(n.min / 60);
    let html = `<div class="hg-row hg-hours"><span></span>${Array.from({ length: 11 }, (_, i) => `<span>${9 + i}</span>`).join("")}</div>`;
    for (const d of order) {
      const row = S.afluencia[d] || [];
      html += `<div class="hg-row ${d === n.dow ? "today" : ""}"><b>${t("daysS")[d]}</b>${Array.from({ length: 11 }, (_, i) => {
        const v = row[i]; const now = d === n.dow && curH === 9 + i;
        return `<span class="c ${v == null ? "x" : "h" + v} ${now ? "now" : ""}" title="${t("days")[d]} ${9 + i}:00"></span>`;
      }).join("")}</div>`;
    }
    $("#heat").innerHTML = html;
    // consejo: hueco más tranquilo de hoy (o mañana) desde ahora
    let tip = t("ah.tipClosed");
    for (let k = 0; k < 2; k++) {
      const ymd = E.addDays(n.ymd, k), dw = E.dowOf(ymd); if (E.isClosedDay(ymd)) continue;
      const row = S.afluencia[dw] || []; let best = null;
      row.forEach((v, i) => { const h = 9 + i; if (v == null || (k === 0 && h <= curH)) return; if (best == null || v < row[best - 9]) best = h; });
      if (best != null) { tip = fill(t("ah.tip"), { d: k === 0 ? t("ah.hoy") : t("days")[dw], h: `${best}:00–${best + 1}:00` }); break; }
    }
    $("#heatTip").innerHTML = tip;
  }

  /* ---------- carta ---------- */
  function renderMenu() {
    const row = s => `<li class="menu-item"><span class="nm">${(D[lang].svc || D.es.svc)[s.id]}${s.top ? `<span class="tag">${t("serv.top")}</span>` : ""}</span><span class="dots"></span><span class="pr">${s.precio}<small>€</small></span></li>`;
    $("#menuBarberia").innerHTML = S.servicios.filter(s => s.cat === "barberia").map(row).join("");
    $("#menuTecnicos").innerHTML = S.servicios.filter(s => s.cat === "tecnicos").map(row).join("");
  }

  /* ---------- galería ---------- */
  const GAL = [
    ["g-fade-1", "fade"], ["g-clas-1", "clas"], ["g-barba-1", "barba"], ["g-local-1", "local", 1], ["g-fade-2", "fade"], ["g-color-1", "color"],
    ["g-clas-2", "clas"], ["g-barba-2", "barba"], ["g-fade-5", "fade"], ["g-local-2", "local", 1], ["g-color-2", "color"], ["g-clas-3", "clas"],
    ["g-fade-3", "fade"], ["g-barba-3", "barba"], ["g-local-5", "local"], ["g-clas-5", "clas"], ["g-fade-6", "fade"], ["g-barba-4", "barba"],
    ["g-local-3", "local", 1], ["g-clas-4", "clas"], ["g-color-3", "color"], ["g-fade-4", "fade"], ["g-barba-5", "barba"], ["g-local-4", "local", 1],
    ["g-clas-6", "clas"], ["g-fade-7", "fade"], ["g-color-4", "color"], ["g-barba-6", "barba"], ["g-local-6", "local", 1], ["g-clas-7", "clas"],
    ["g-local-7", "local", 1], ["g-local-8", "local", 1]
  ];
  const catLabel = c => ({ fade: "Fade", clas: t("gal.clas"), barba: t("gal.barba"), color: t("gal.color"), local: t("gal.local") })[c];
  $("#gallery").innerHTML = GAL.map(([f, c, land]) => `<figure class="g-item" data-cat="${c}"><img src="img/${f}.webp" alt="Arte & Corte Sitges – ${c}" loading="lazy" width="${land ? 720 : 480}" height="${land ? 480 : 600}"></figure>`).join("");
  function renderGalleryLabels() { $$(".g-item").forEach(g => g.dataset.label = catLabel(g.dataset.cat)); }
  $$("#filters button").forEach(b => b.addEventListener("click", () => {
    const f = b.dataset.f; $$("#filters button").forEach(x => x.classList.toggle("on", x === b));
    $$(".g-item").forEach(g => g.classList.toggle("hide", f !== "all" && g.dataset.cat !== f));
  }));
  const lb = $("#lb"); let lbList = [], lbI = 0;
  const lbShow = () => { $("#lbImg").src = lbList[lbI].querySelector("img").src; };
  $("#gallery").addEventListener("click", e => { const g = e.target.closest(".g-item"); if (!g) return; lbList = $$(".g-item:not(.hide)"); lbI = lbList.indexOf(g); lbShow(); lb.classList.add("on"); });
  const lbMove = d => { lbI = (lbI + d + lbList.length) % lbList.length; lbShow(); };
  $("#lbP").onclick = () => lbMove(-1); $("#lbN").onclick = () => lbMove(1); $("#lbX").onclick = () => lb.classList.remove("on");
  lb.addEventListener("click", e => { if (e.target === lb) lb.classList.remove("on"); });
  document.addEventListener("keydown", e => {
    if (lb.classList.contains("on")) { if (e.key === "Escape") lb.classList.remove("on"); if (e.key === "ArrowLeft") lbMove(-1); if (e.key === "ArrowRight") lbMove(1); }
    if (e.key === "Escape") $("#modal").classList.remove("on");
  });

  /* ---------- recordatorio de corte ---------- */
  let recW = 3;
  $$("#recFreq button").forEach(b => b.onclick = () => { recW = +b.dataset.w; $$("#recFreq button").forEach(x => x.classList.toggle("on", x === b)); renderRec(); });
  function recFirst() { // primer aviso: hoy + N semanas (fecha de Madrid)
    const ymd = E.addDays(E.now().ymd, recW * 7); return ymd;
  }
  function fechaLarga(ymd) { const [y, m, d] = ymd.split("-").map(Number); const dn = t("days")[E.dowOf(ymd)].toLowerCase(); return lang === "en" ? `${t("days")[E.dowOf(ymd)]}, ${t("months")[m - 1]} ${d}` : `${dn} ${d} ${lang === "ca" ? "" : "de "}${t("months")[m - 1]}`; }
  function renderRec() {
    const ymd = recFirst(), c = ymd.replace(/-/g, "");
    $("#recNext").innerHTML = fill(t("rec.next"), { f: fechaLarga(ymd), n: recW });
    $("#recG").href = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(t("rec.evT"))}&dates=${c}T100000/${c}T101500&ctz=${TZ}&recur=${encodeURIComponent("RRULE:FREQ=WEEKLY;INTERVAL=" + recW)}&location=${encodeURIComponent(S.direccion)}&details=${encodeURIComponent(fill(t("rec.evD"), { u: S.url }))}`;
    const [y, m, d] = ymd.split("-").map(Number);
    $("#phDate").textContent = fechaLarga(ymd);
  }
  $("#recIcs").onclick = () => {
    const c = recFirst().replace(/-/g, ""), stamp = new Date().toISOString().replace(/[-:]/g, "").slice(0, 15) + "Z";
    const esc = s => s.replace(/[,;\\]/g, m => "\\" + m);
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Arte y Corte//Recordatorio//ES", "CALSCALE:GREGORIAN", "BEGIN:VEVENT",
      "UID:" + Date.now() + "@arteycorte", "DTSTAMP:" + stamp, `DTSTART;TZID=Europe/Madrid:${c}T100000`, `DTEND;TZID=Europe/Madrid:${c}T101500`,
      "RRULE:FREQ=WEEKLY;INTERVAL=" + recW, "SUMMARY:" + esc(t("rec.evT")), "LOCATION:" + esc(S.direccion), "DESCRIPTION:" + esc(fill(t("rec.evD"), { u: S.url })), "URL:" + S.url,
      "BEGIN:VALARM", "TRIGGER:PT0M", "ACTION:DISPLAY", "DESCRIPTION:" + esc(t("rec.evT")), "END:VALARM", "END:VEVENT", "END:VCALENDAR"].join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "recordatorio-arte-y-corte.ics";
    document.body.appendChild(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 500);
  };
  const tick = () => { const p = new Intl.DateTimeFormat("es-ES", { timeZone: TZ, hour: "2-digit", minute: "2-digit" }).format(new Date()); $("#phTime").textContent = p.replace(/^0/, ""); };
  tick(); setInterval(tick, 30000);

  /* ---------- equipo ---------- */
  function renderTeam() {
    $("#team").innerHTML = S.barberos.map(n => `<article class="barber"><div class="monogram"><b>${n[0]}</b></div><h3>${n}</h3><p class="role">${t("eq.role")}</p><a class="btn btn-line-light btn-sm" target="_blank" rel="noopener" href="${wa(fill(t("wa.ask"), { n }))}"><svg class="ico"><use href="#i-wa"/></svg> ${t("eq.ask")}</a></article>`).join("");
  }

  /* ---------- horario ---------- */
  function renderHours() {
    const today = E.now().dow;
    $("#hours").innerHTML = [1, 2, 3, 4, 5, 6, 0].map(d => {
      const r = S.horario[d] || []; return `<tr class="${d === today ? "today" : ""}"><td>${t("days")[d]}</td><td>${r.length ? r.map(x => x.join(" – ")).join(" · ") : "—"}</td></tr>`;
    }).join("");
  }

  /* ---------- instagram ---------- */
  const IG = [["ig-1", "DJc07EGocbR", "p"], ["ig-2", "DM5NmvENrob", "reel"], ["ig-3", "DKskwdDNdDI", "reel"], ["ig-4", "DcB2_CLDbVt", "reel"], ["ig-5", "DLzQrndtHAC", "p"], ["ig-6", "DQhlWCYDUIA", "reel"]];
  $("#igGrid").innerHTML = IG.map(([f, c, k]) => `<a href="https://www.instagram.com/${k}/${c}/" target="_blank" rel="noopener" aria-label="Instagram"><img src="img/${f}.webp" alt="Instagram @${S.instagram}" loading="lazy" width="480" height="480"></a>`).join("");

  /* ---------- reseñas ---------- */
  let opI = 0, opTimer;
  function renderReviews() {
    const R = window.REVIEWS;
    $("#opTrack").innerHTML = R.map(r => `<article class="review"><blockquote>${r.t}</blockquote><footer><span class="av">${r.n[0]}</span><div><b>${r.n}</b><small><span class="stars">★★★★★</span> · ${t("op.src")}</small></div></footer></article>`).join("");
    $("#opDots").innerHTML = R.map((_, i) => `<i data-i="${i}"></i>`).join("");
    $$("#opDots i").forEach(d => d.onclick = () => opGo(+d.dataset.i));
    opGo(opI);
  }
  function opGo(i) {
    const n = window.REVIEWS.length; opI = (i + n) % n;
    $("#opTrack").style.transform = `translateX(-${opI * 100}%)`;
    $$("#opDots i").forEach((d, k) => d.classList.toggle("on", k === opI));
    clearInterval(opTimer); opTimer = setInterval(() => opGo(opI + 1), 6500);
  }
  $("#opPrev").onclick = () => opGo(opI - 1); $("#opNext").onclick = () => opGo(opI + 1);

  /* ---------- legal ---------- */
  const LEGAL = {
    aviso: `<h3>Aviso legal</h3><p>Titular: Arte &amp; Corte · Barbería Esquivel. Dirección: ${S.direccion}. Teléfono: ${S.telefono}.</p><p>Este sitio web es informativo. El contenido (textos, fotografías y marca) pertenece a su titular y no puede reproducirse sin autorización.</p>`,
    privacidad: `<h3>Privacidad</h3><p>Esta web no tiene formularios ni pide datos personales. El recordatorio de corte se guarda solo en tu propio calendario: no recibimos ningún dato.</p><p>Si nos escribes por WhatsApp, usaremos tu número solo para contestarte. Puedes pedir que lo borremos en cualquier momento.</p><p>Responsable: Arte &amp; Corte · Barbería Esquivel, ${S.direccion}.</p>`,
    cookies: `<h3>Cookies</h3><p>Esta web no usa cookies propias de análisis ni de publicidad. Solo guarda en tu navegador el idioma elegido. El mapa de Google Maps puede instalar cookies de Google al cargarse (consulta policies.google.com).</p>`
  };
  document.addEventListener("click", e => { const a = e.target.closest("[data-modal]"); if (!a) return; e.preventDefault(); $("#modalBody").innerHTML = LEGAL[a.dataset.modal]; $("#modal").classList.add("on"); });
  $("#modalX").onclick = () => $("#modal").classList.remove("on");
  $("#modal").addEventListener("click", e => { if (e.target.id === "modal") $("#modal").classList.remove("on"); });

  /* ---------- UI general ---------- */
  const nav = $("#nav");
  const onScroll = () => nav.classList.toggle("solid", scrollY > 40);
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  $("#burger").onclick = () => nav.classList.toggle("open");
  $$("#navLinks a").forEach(a => a.onclick = () => nav.classList.remove("open"));

  const io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in"); io.unobserve(e.target); } }), { threshold: .12, rootMargin: "0px 0px -40px" });
  $$(".reveal").forEach(el => io.observe(el));
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return; cio.unobserve(e.target);
    const el = e.target, to = +el.dataset.count, dec = +(el.dataset.dec || 0), t0 = performance.now();
    const step = now => { const p = Math.min(1, (now - t0) / 1600), v = to * (1 - Math.pow(1 - p, 3)); el.textContent = dec ? v.toFixed(dec).replace(".", ",") : Math.round(v); if (p < 1) requestAnimationFrame(step); };
    requestAnimationFrame(step);
  }), { threshold: .6 });
  $$("[data-count]").forEach(el => cio.observe(el));

  const mq = $("#marquee"); mq.innerHTML += mq.innerHTML;
  setTimeout(() => $(".wa-float").classList.add("show-bubble"), 7000);
  setTimeout(() => $(".wa-float").classList.remove("show-bubble"), 14000);
  addEventListener("load", () => setTimeout(() => $("#loader").classList.add("done"), 300));
  setTimeout(() => $("#loader").classList.add("done"), 2500);

  applyLang(lang);
})();
