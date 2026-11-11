/* Espera en directo: lógica compartida por la web (index) y el panel del barbero */
(() => {
  const S = window.SITE, TZ = "Europe/Madrid", KEY = "ac-estado";
  const pad = n => String(n).padStart(2, "0");
  const toMin = h => { const [a, b] = h.split(":").map(Number); return a * 60 + b; };

  // niveles: n = 0 entra ya · 1 ~15 · 2 ~30 · 3 +45 · 4 pausa
  const NIV = [
    { n: 0, min: 0, color: "#3ecf74" },
    { n: 1, min: 15, color: "#c9d84a" },
    { n: 2, min: 30, color: "#f0a43a" },
    { n: 3, min: 45, color: "#e8613c" },
    { n: 4, min: null, color: "#8b8378" }
  ];

  function now() {
    const p = Object.fromEntries(new Intl.DateTimeFormat("en-GB", { timeZone: TZ, year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", hour12: false }).formatToParts(new Date()).map(x => [x.type, x.value]));
    const ymd = `${p.year}-${p.month}-${p.day}`;
    const [y, m, d] = ymd.split("-").map(Number);
    return { ymd, min: (+p.hour % 24) * 60 + +p.minute, dow: new Date(Date.UTC(y, m - 1, d)).getUTCDay() };
  }
  const addDays = (ymd, n) => { const [y, m, d] = ymd.split("-").map(Number); const x = new Date(Date.UTC(y, m - 1, d + n)); return `${x.getUTCFullYear()}-${pad(x.getUTCMonth() + 1)}-${pad(x.getUTCDate())}`; };
  const dowOf = ymd => { const [y, m, d] = ymd.split("-").map(Number); return new Date(Date.UTC(y, m - 1, d)).getUTCDay(); };
  const isClosedDay = ymd => S.cerrado.includes(ymd) || !(S.horario[dowOf(ymd)] || []).length;

  function abierto(n = now()) {
    if (isClosedDay(n.ymd)) return null;
    return (S.horario[n.dow] || []).find(([a, b]) => n.min >= toMin(a) && n.min < toMin(b)) || null;
  }
  function proximaApertura(n = now()) {
    const r = isClosedDay(n.ymd) ? [] : S.horario[n.dow];
    const later = r.find(([a]) => toMin(a) > n.min);
    if (later) return { dias: 0, h: later[0], dow: n.dow };
    for (let i = 1; i < 8; i++) { const y = addDays(n.ymd, i); if (!isClosedDay(y)) return { dias: i, h: S.horario[dowOf(y)][0][0], dow: dowOf(y) }; }
    return null;
  }
  function afluenciaAhora(n = now()) {
    const row = S.afluencia[n.dow]; if (!row) return null;
    const i = Math.floor(n.min / 60) - 9; return i >= 0 && i < row.length ? row[i] : null;
  }

  // --- lectura / escritura ---
  function leerLocal() { try { return JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { return null; } }
  async function leer() {
    if (S.estadoEndpoint) {
      try { const r = await fetch(S.estadoEndpoint + "?action=estado&t=" + Date.now()); const j = await r.json(); if (j && j.ok && j.estado) return j.estado; } catch (e) { }
      return null;
    }
    return leerLocal();
  }
  async function guardar(estado, pin) {
    const e = { ...estado, ts: Date.now() };
    if (S.estadoEndpoint) {
      const r = await fetch(S.estadoEndpoint, { method: "POST", body: JSON.stringify({ action: "set", pin, estado: e }) });
      const j = await r.json(); if (!j.ok) throw new Error(j.error || "error");
      return j.estado || e;
    }
    try { localStorage.setItem(KEY, JSON.stringify(e)); } catch (err) { }
    try { new BroadcastChannel("ac-estado").postMessage(e); } catch (err) { }
    return e;
  }
  async function comprobarPin(pin) {
    if (!S.estadoEndpoint) return pin === S.panelPinDemo;
    try { const r = await fetch(S.estadoEndpoint, { method: "POST", body: JSON.stringify({ action: "pin", pin }) }); const j = await r.json(); return !!j.ok; } catch (e) { return false; }
  }

  /* Devuelve lo que hay que enseñar al cliente:
     {tipo:'cerrado', prox} | {tipo:'vivo', nivel, ts, b} | {tipo:'estimado', nivel} */
  function resolver(est) {
    const n = now();
    if (!abierto(n)) return { tipo: "cerrado", prox: proximaApertura(n) };
    const fresco = est && est.ts && (Date.now() - est.ts) < S.caducaMin * 60000;
    if (fresco) return { tipo: "vivo", nivel: est.n, ts: est.ts, b: est.b || "" };
    const a = afluenciaAhora(n);
    const nivel = a == null ? 1 : [0, 1, 2, 3][a];
    return { tipo: "estimado", nivel };
  }

  function suscribir(fn) {
    const go = async () => fn(resolver(await leer()));
    go();
    setInterval(go, S.refrescoSeg * 1000);
    document.addEventListener("visibilitychange", () => { if (!document.hidden) go(); });
    addEventListener("storage", e => { if (e.key === KEY) go(); });
    try { new BroadcastChannel("ac-estado").onmessage = go; } catch (e) { }
  }

  window.ESTADO = { NIV, now, abierto, proximaApertura, afluenciaAhora, leer, guardar, comprobarPin, resolver, suscribir, dowOf, addDays, isClosedDay, toMin };
})();
