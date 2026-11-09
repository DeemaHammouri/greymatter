/* Project Ledger: render, filter (FLIP), cursor preview, expand in place, deep links. */
(function () {
  "use strict";
  var GM = window.GM, PROJECTS = GM.PROJECTS, STATUS = GM.STATUS;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var finePointer = matchMedia("(hover: hover) and (pointer: fine)").matches;

  var section = document.getElementById("projects");
  var list = document.getElementById("ledger-list");
  if (!section || !list) return;

  /* ---------- Typographic covers: hand-built SVG, 1px blueprint strokes ---------- */
  var S = 'fill="none" stroke="#9A9EA2" stroke-width="1"';
  var B = 'fill="none" stroke="#0061ED" stroke-width="1.5"';
  var pt = function (x, y, r, blue) { return '<circle cx="' + x + '" cy="' + y + '" r="' + r + '" ' + (blue ? 'fill="#0061ED" stroke="none"' : 'fill="#010101" stroke="#9A9EA2"') + "/>"; };

  var SKELETON = (function () {
    var J = [[290,40],[280,52],[300,52],[290,64],[290,74],[290,86],[262,90],[318,90],[244,128],[336,128],[236,164],[344,164],[232,180],[348,180],[290,110],[290,134],[290,158],[290,176],[274,180],[306,180],[268,226],[312,226],[264,268],[316,268],[260,276],[320,276],[248,280],[332,280],[290,98],[276,87],[304,87],[290,48]];
    var E = [[0,1],[0,2],[1,3],[2,3],[3,4],[4,5],[5,29],[5,30],[29,6],[30,7],[6,8],[7,9],[8,10],[9,11],[10,12],[11,13],[5,28],[28,14],[14,15],[15,16],[16,17],[17,18],[17,19],[18,20],[19,21],[20,22],[21,23],[22,24],[23,25],[24,26],[25,27]];
    var s = "";
    E.forEach(function (e) { s += '<line x1="' + J[e[0]][0] + '" y1="' + J[e[0]][1] + '" x2="' + J[e[1]][0] + '" y2="' + J[e[1]][1] + '" ' + S + "/>"; });
    J.forEach(function (p, i) { s += pt(p[0], p[1], i === 17 ? 4 : 2.5, i === 17); });
    return s;
  })();

  var ART = {
    skeleton: SKELETON,
    network: '<path d="M250 60 L330 110 L300 200 L210 170 Z M250 60 L210 170 M330 110 L210 170 M250 60 L300 200" ' + S + "/>" +
      pt(250,60,5) + pt(330,110,5) + pt(300,200,5) + pt(210,170,5) + pt(270,128,7,true),
    modules: '<rect x="210" y="60" width="60" height="60" ' + S + '/><rect x="280" y="60" width="60" height="60" ' + S + '/><rect x="210" y="130" width="60" height="60" ' + S + '/><rect x="288" y="138" width="60" height="60" ' + B + '/><path d="M270 90 H280 M240 120 V130" ' + S + "/>",
    profiles: '<circle cx="250" cy="90" r="18" ' + S + '/><path d="M218 150 q32 -34 64 0" ' + S + '/><path d="M310 80 H350 M310 100 H340 M310 120 H350" ' + S + '/><rect x="204" y="60" width="160" height="110" ' + S + '/><path d="M204 190 H364" ' + B + "/>",
    frame: '<rect x="204" y="54" width="160" height="120" ' + S + '/><circle cx="284" cy="114" r="34" ' + S + '/><circle cx="284" cy="114" r="14" ' + B + '/><path d="M284 54 V80 M284 148 V174 M204 114 H250 M318 114 H364" ' + S + '/><path d="M196 46 h16 M196 46 v16 M372 182 h-16 M372 182 v-16" ' + S + "/>",
    table: '<rect x="204" y="56" width="164" height="136" ' + S + '/><path d="M204 88 H368 M204 120 H368 M204 152 H368 M262 56 V192" ' + S + '/><path d="M274 138 H350" ' + B + '/><path d="M274 106 H320 M274 72 H340 M274 170 H330" ' + S + "/>",
    steps: '<polyline points="204,196 250,196 250,160 296,160 296,124 342,124 342,88 368,88" ' + S + "/>" + pt(368,88,6,true) + '<path d="M204 210 H368" ' + S + "/>",
    cake: '<rect x="224" y="150" width="124" height="44" ' + S + '/><rect x="240" y="110" width="92" height="40" ' + S + '/><rect x="256" y="74" width="60" height="36" ' + S + '/><path d="M286 74 V50" ' + B + '/><path d="M214 194 H358" ' + S + '/><path d="M224 168 q10 10 20 0 t20 0 t20 0 t20 0 t20 0" ' + S + "/>",
    agents: '<path d="M284 120 L284 54 M284 120 L342 90 M284 120 L342 160 M284 120 L284 190 M284 120 L226 160 M284 120 L226 90" ' + S + "/>" + pt(284,54,8) + pt(342,90,8) + pt(342,160,8) + pt(284,190,8) + pt(226,160,8) + pt(226,90,8) + pt(284,120,13,true),
    pipeline: '<path d="M204 124 H364" ' + S + '/><path d="M204 124 V84 H244 M284 124 V164 H324" ' + S + "/>" +
      '<rect x="196" y="112" width="24" height="24" ' + S + '/><rect x="244" y="72" width="24" height="24" ' + S + '/><rect x="272" y="112" width="24" height="24" ' + S + '/><rect x="324" y="152" width="24" height="24" ' + S + '/><rect x="344" y="112" width="24" height="24" ' + B + "/>" + pt(262,124,4,true),
    bubble: '<path d="M214 60 H354 V160 H274 L244 190 V160 H214 Z" ' + S + '/><path d="M232 126 q8 -26 16 0 t16 0 t16 0 t16 0 t16 0 t16 0" ' + B + '/><circle cx="256" cy="98" r="2" fill="#9A9EA2"/><circle cx="262" cy="98" r="2" fill="#9A9EA2"/><circle cx="304" cy="98" r="2" fill="#9A9EA2"/>',
  };

  function cover(p, num, label) {
    return '<svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" width="400" height="300" role="img" aria-label="' + (label || "Cover for " + p.name + ", " + p.type) + '">' +
      '<rect width="400" height="300" fill="#010101"/><rect x="0.5" y="0.5" width="399" height="299" fill="none" stroke="#9A9EA2" stroke-opacity=".22"/>' +
      '<path d="M0 232 H400 M0 40 H400" stroke="#9A9EA2" stroke-opacity=".12"/>' +
      '<text x="20" y="28" fill="#9A9EA2" font-family="Manrope,sans-serif" font-size="10" font-weight="600" letter-spacing="1">' + p.type.toUpperCase() + "</text>" +
      '<text x="20" y="278" fill="none" stroke="#9A9EA2" stroke-width="1" font-family="Manrope,sans-serif" font-size="120" font-weight="800" letter-spacing="-6">' + num + "</text>" +
      (ART[p.art] || "") + "</svg>";
  }

  /* ---------- Render ---------- */
  var ARROW = '<svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><path d="M9 5l7 7-7 7"/></svg>';
  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var esc = function (s) { return String(s).replace(/[&<>"]/g, function (c) { return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]; }); };

  list.innerHTML = PROJECTS.map(function (p, i) {
    var num = pad(i + 1), st = STATUS[p.status];
    return '<li class="proj" id="project-' + p.id + '" data-id="' + p.id + '" data-status="' + p.status + '">' +
      '<h3 class="proj-h"><button class="row" type="button" id="row-' + p.id + '" aria-expanded="false" aria-controls="case-' + p.id + '">' +
      '<span class="idx">' + num + '</span><span class="nm">' + esc(p.name) + '</span><span class="tp">' + esc(p.type) + "</span>" +
      '<span class="st"><i class="dot" data-s="' + p.status + '"></i>' + st.label + "</span><span class=\"ar\">" + ARROW + "</span></button></h3>" +
      '<div class="case" id="case-' + p.id + '" role="region" aria-labelledby="row-' + p.id + '" inert><div class="case-in"><div class="case-body">' +
      '<div class="case-cover">' + cover(p, num) + "</div>" +
      '<div class="case-text"><p>' + esc(p.summary) + "</p>" +
      "<h4 style=\"margin-block-start:24px\">Project focus</h4><ul class=\"tags\">" + p.focus.map(function (f) { return "<li>" + esc(f) + "</li>"; }).join("") + "</ul>" +
      '<dl class="facts"><div><dt>Type</dt><dd>' + esc(p.type) + '</dd></div><div><dt>Status</dt><dd class="status-in-case"><i class="dot" data-s="' + p.status + '"></i>' + st.label + "</dd></div>" +
      "<div><dt>Stack</dt><dd>" + esc(p.stack) + "</dd></div><div><dt>Audience</dt><dd>" + esc(p.audience) + "</dd></div></dl>" +
      '<a class="btn" href="order.html?ref=' + p.id + '">Request a similar project <span class="arr" aria-hidden="true">→</span></a>' +
      "</div></div></div></div></li>";
  }).join("");

  if (GM.rollButtons) GM.rollButtons(list);
  var items = Array.prototype.slice.call(list.children);
  var byId = {}; items.forEach(function (li) { byId[li.dataset.id] = li; });

  /* ---------- Counts: number + status bar + legend (all derived from data) ---------- */
  var bigN = document.getElementById("big-n"), cap = document.getElementById("big-cap");
  var segs = {}; Array.prototype.forEach.call(document.querySelectorAll(".bar i"), function (el) { segs[el.dataset.s] = el; });
  var legendN = {}; Array.prototype.forEach.call(document.querySelectorAll("[data-count]"), function (el) { legendN[el.dataset.count] = el; });
  var shownN = { total: 0, shipped: 0, build: 0, planned: 0 };
  var barLive = false, filter = "all";

  function countsFor(f) {
    var c = { total: 0, shipped: 0, build: 0, planned: 0 };
    PROJECTS.forEach(function (p) { if (f === "all" || p.status === f) { c.total++; c[p.status]++; } });
    return c;
  }
  var instant = true; // first paint is set directly; the count-up runs on enter
  function tween(from, to, ms, fn) {
    if (reduce || instant || from === to) { fn(to); return; }
    var t0 = performance.now();
    (function step(t) {
      var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3);
      fn(Math.round(from + (to - from) * e));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }
  function renderCounts(f) {
    var c = countsFor(f), prev = Object.assign({}, shownN);
    shownN = c;
    tween(prev.total, c.total, 600, function (v) { bigN.textContent = v; });
    ["shipped", "build", "planned"].forEach(function (k) {
      tween(prev[k], c[k], 600, function (v) { legendN[k].textContent = v; });
      var frac = c.total ? c[k] / c.total : 0;
      var off = 0; for (var j = 0; j < ["shipped", "build", "planned"].indexOf(k); j++) off += c.total ? c[["shipped", "build", "planned"][j]] / c.total : 0;
      segs[k].style.setProperty("--f", frac); segs[k].dataset.frac = frac; segs[k].dataset.off = off;
      if (barLive) placeSeg(k);
    });
    cap.textContent = f === "all" ? "projects, one studio" : STATUS[f].label.toLowerCase() + " projects";
    bigN.setAttribute("aria-label", c.total + " projects");
  }
  function placeSeg(k) {
    var el = segs[k], dir = document.dir === "rtl" ? -1 : 1;
    el.style.transform = "translateX(" + dir * el.dataset.off * 100 + "%) scaleX(" + el.dataset.frac + ")";
  }
  renderCounts("all");
  instant = false;
  if (!reduce) bigN.textContent = "0"; // counts up on enter
  new IntersectionObserver(function (es, io) {
    if (!es[0].isIntersecting) return;
    io.disconnect(); barLive = true;
    tween(0, shownN.total, 900, function (v) { bigN.textContent = v; });
    ["shipped", "build", "planned"].forEach(placeSeg);
  }, { threshold: 0.25 }).observe(bigN);

  /* Scroll-driven fill of the giant number (passive; never hijacks the wheel) */
  var ticking = false;
  function fill() {
    ticking = false;
    var r = list.getBoundingClientRect(), vh = innerHeight;
    var p = reduce ? 1 : Math.max(0, Math.min(1, (vh * 0.75 - r.top) / Math.max(1, r.height)));
    bigN.style.setProperty("--p", (p * 100).toFixed(1));
  }
  addEventListener("scroll", function () { if (!ticking) { ticking = true; requestAnimationFrame(fill); } }, { passive: true });
  addEventListener("resize", fill); fill();

  /* ---------- Filter with FLIP ---------- */
  var seg = document.getElementById("proj-filter"), emptyEl = document.getElementById("proj-empty");
  function applyFilter(f) {
    filter = f;
    var firstRects = {};
    items.forEach(function (li) { if (!li.hidden) firstRects[li.dataset.id] = li.getBoundingClientRect(); });
    var shown = 0;
    items.forEach(function (li) {
      var ok = f === "all" || li.dataset.status === f;
      li.hidden = !ok; if (ok) shown++;
    });
    if (openId && byId[openId].hidden) close(openId, true);
    emptyEl.hidden = shown !== 0;
    if (!reduce) items.forEach(function (li) {
      if (li.hidden) return;
      var a = firstRects[li.dataset.id];
      if (!a) { li.animate([{ opacity: 0, transform: "translateY(16px)" }, { opacity: 1, transform: "none" }], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" }); return; }
      var b = li.getBoundingClientRect(), dy = a.top - b.top;
      if (dy) li.animate([{ transform: "translateY(" + dy + "px)" }, { transform: "none" }], { duration: 420, easing: "cubic-bezier(.22,1,.36,1)" });
    });
    Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) { b.setAttribute("aria-pressed", String(b.dataset.f === f)); });
    renderCounts(f);
  }
  var counts = countsFor("all");
  Array.prototype.forEach.call(seg.querySelectorAll("button"), function (b) {
    var f = b.dataset.f, c = f === "all" ? counts.total : counts[f];
    b.querySelector(".c").textContent = c;
    b.addEventListener("click", function () { applyFilter(f); });
  });
  emptyEl.querySelector("button").addEventListener("click", function () { applyFilter("all"); });

  /* ---------- Expand in place ---------- */
  var openId = null;
  function setOpen(id, on) {
    var li = byId[id], btn = li.querySelector(".row"), panel = li.querySelector(".case");
    li.classList.toggle("open", on); btn.setAttribute("aria-expanded", String(on)); panel.inert = !on;
  }
  function open(id, opts) {
    opts = opts || {};
    if (openId && openId !== id) setOpen(openId, false);
    if (byId[id].hidden) applyFilter("all");
    setOpen(id, true); openId = id; hidePeek();
    history.replaceState(null, "", "#project-" + id);
    if (opts.instant) { byId[id].scrollIntoView({ block: "start" }); return; }
    setTimeout(function () {
      var r = byId[id].getBoundingClientRect();
      if (r.top < 80 || r.top > innerHeight * 0.5) scrollTo({ top: scrollY + r.top - 96, behavior: reduce ? "auto" : "smooth" });
    }, reduce ? 0 : 440);
  }
  function close(id, silent) {
    setOpen(id, false); if (openId === id) openId = null;
    if (!silent && location.hash.indexOf("#project-") === 0) history.replaceState(null, "", location.pathname + location.search);
  }
  list.addEventListener("click", function (e) {
    var btn = e.target.closest(".row"); if (!btn) return;
    var id = btn.closest("li").dataset.id;
    openId === id ? close(id) : open(id);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && openId) { var id = openId; close(id); byId[id].querySelector(".row").focus(); return; }
    var btn = e.target.closest && e.target.closest(".row"); if (!btn) return;
    var rows = items.filter(function (li) { return !li.hidden; }).map(function (li) { return li.querySelector(".row"); });
    var i = rows.indexOf(btn), n = null;
    if (e.key === "ArrowDown") n = rows[Math.min(rows.length - 1, i + 1)];
    else if (e.key === "ArrowUp") n = rows[Math.max(0, i - 1)];
    else if (e.key === "Home") n = rows[0];
    else if (e.key === "End") n = rows[rows.length - 1];
    if (n) { e.preventDefault(); n.focus(); }
  });
  function fromHash() {
    var m = location.hash.match(/^#project-([\w-]+)$/);
    if (m && byId[m[1]]) open(m[1], { instant: true });
  }
  addEventListener("hashchange", function () { var m = location.hash.match(/^#project-([\w-]+)$/); if (m && byId[m[1]] && openId !== m[1]) open(m[1]); });

  /* ---------- Cursor-following preview (lerp 0.12, rAF, no touch) ---------- */
  var peek = document.getElementById("peek");
  var tx = 0, ty = 0, cx = 0, cy = 0, raf = 0, kbd = false;
  var PW = 320, PH = 240;
  function loop() {
    cx += (tx - cx) * 0.12; cy += (ty - cy) * 0.12;
    peek.style.transform = "translate3d(" + cx.toFixed(1) + "px," + cy.toFixed(1) + "px,0)";
    raf = (Math.abs(tx - cx) > 0.3 || Math.abs(ty - cy) > 0.3) ? requestAnimationFrame(loop) : 0;
  }
  function place(x, y) {
    tx = Math.max(8, Math.min(innerWidth - PW - 8, x + 28));
    ty = Math.max(8, Math.min(innerHeight - PH - 8, y + 20));
  }
  function showPeek(li) {
    var p = PROJECTS.filter(function (q) { return q.id === li.dataset.id; })[0];
    var n = pad(PROJECTS.indexOf(p) + 1);
    peek.innerHTML = cover(p, n, "");
    peek.firstChild.setAttribute("aria-hidden", "true"); peek.firstChild.removeAttribute("role"); peek.firstChild.removeAttribute("aria-label");
    list.classList.add("dim"); items.forEach(function (x) { x.classList.toggle("is-active", x === li); });
    peek.classList.add("show");
  }
  function hidePeek() {
    peek.classList.remove("show", "kbd"); list.classList.remove("dim"); items.forEach(function (x) { x.classList.remove("is-active"); });
  }
  if (finePointer) {
    list.addEventListener("pointerover", function (e) {
      var btn = e.target.closest(".row"); if (!btn) return;
      var li = btn.closest("li"); if (li.classList.contains("open")) { hidePeek(); return; }
      kbd = false; peek.classList.remove("kbd");
      if (reduce) { tx = cx = innerWidth - PW - 24; ty = cy = innerHeight - PH - 24; peek.style.transform = "translate3d(" + tx + "px," + ty + "px,0)"; }
      else { if (!peek.classList.contains("show")) { cx = e.clientX; cy = e.clientY; } place(e.clientX, e.clientY); if (!raf) raf = requestAnimationFrame(loop); }
      showPeek(li);
    });
    list.addEventListener("pointermove", function (e) {
      if (reduce || kbd || !peek.classList.contains("show")) return;
      place(e.clientX, e.clientY); if (!raf) raf = requestAnimationFrame(loop);
    });
    list.addEventListener("pointerleave", function () { if (!kbd) hidePeek(); });
  }
  list.addEventListener("focusin", function (e) {
    var btn = e.target.closest(".row"); if (!btn || !btn.matches(":focus-visible")) return;
    var li = btn.closest("li"); if (li.classList.contains("open")) return;
    kbd = true; peek.classList.add("kbd");
    tx = cx = innerWidth - PW - 24; ty = cy = innerHeight - PH - 24;
    peek.style.transform = "translate3d(" + tx + "px," + ty + "px,0)";
    showPeek(li);
  });
  list.addEventListener("focusout", function () { kbd = false; hidePeek(); });

  fromHash();
})();
