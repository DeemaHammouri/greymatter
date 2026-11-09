/* Services: IntersectionObserver-driven stage. No scroll-jacking.
   Each mini-UI plays its 2-3s micro-story once per visit; replay on demand. Reduced motion shows the end frame. */
(function () {
  "use strict";
  var SERVICES = window.GM.SERVICES;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var wideMq = matchMedia("(min-width: 901px)");
  var listEl = document.getElementById("svc-list"), stageEl = document.getElementById("stage-inner");
  if (!listEl || !stageEl) return;

  var pad = function (n) { return (n < 10 ? "0" : "") + n; };
  var el = function (html) { var d = document.createElement("div"); d.innerHTML = html.trim(); return d.firstChild; };
  var SAMPLE = '<span class="sample">Sample data</span>';

  /* A mini-UI is { root, play(), finish() }. Timers are cancelled on every restart. */
  function Timeline() {
    var ids = [];
    return { at: function (ms, fn) { ids.push(setTimeout(fn, ms)); }, clear: function () { ids.forEach(clearTimeout); ids = []; } };
  }
  function typeInto(node, text, ms, done) {
    var i = 0, id = setInterval(function () { node.textContent = text.slice(0, ++i); if (i >= text.length) { clearInterval(id); done && done(); } }, ms);
    return id;
  }
  function countTo(node, to, ms, fmt) {
    var t0 = performance.now();
    (function s(t) { var k = Math.min(1, (t - t0) / ms), e = 1 - Math.pow(1 - k, 3); node.textContent = fmt(to * e); if (k < 1) requestAnimationFrame(s); })(t0);
  }
  var jod = function (v) { return v.toFixed(3); };

  var BUILD = {
    website: function () {
      var root = el('<div class="mini mini-web">' + SAMPLE + '<div class="chrome"><i></i><i></i><i></i><span>yourbusiness.jo</span></div>' +
        '<div class="pg"><div class="nv"><b></b><span class="ph"></span><span class="ph"></span><span class="ph"></span></div>' +
        '<h5><span class="typed"></span><u class="caret"></u></h5><div class="cta"></div>' +
        '<div class="blocks"><div class="ph"></div><div class="ph"></div><div class="ph"></div></div></div></div>');
      var pg = root.querySelector(".pg"), typed = root.querySelector(".typed"), caret = root.querySelector(".caret"), tl = Timeline(), tid;
      var TEXT = "Your business, clearly online.";
      return {
        root: root,
        play: function () {
          tl.clear(); clearInterval(tid); pg.classList.remove("wide"); typed.textContent = ""; caret.style.display = "";
          tid = typeInto(typed, TEXT, 45);
          tl.at(1900, function () { pg.classList.add("blink"); });
          tl.at(2040, function () { pg.classList.add("wide"); pg.classList.remove("blink"); });
        },
        finish: function () { tl.clear(); clearInterval(tid); typed.textContent = TEXT; caret.style.display = "none"; pg.classList.add("wide"); },
      };
    },
    ai: function () {
      var root = el('<div class="mini mini-ai">' + SAMPLE + '<div class="msg u fade-up">Which invoices are overdue?</div><div class="msg a fade-up"><span class="stream"></span></div>' +
        '<div class="chips"><span class="fade-up">Send reminders</span><span class="fade-up">Export list</span><span class="fade-up">Open report</span></div></div>');
      var u = root.querySelector(".u"), a = root.querySelector(".a"), s = root.querySelector(".stream"), chips = root.querySelectorAll(".chips span"), tl = Timeline(), tid;
      var TEXT = "Four invoices are overdue. Two are past 30 days. I can draft the reminders.";
      var all = [u, a].concat([].slice.call(chips));
      return {
        root: root,
        play: function () {
          tl.clear(); clearInterval(tid); all.forEach(function (n) { n.classList.remove("on"); }); s.textContent = "";
          tl.at(100, function () { u.classList.add("on"); });
          tl.at(600, function () { a.classList.add("on"); var w = TEXT.split(" "), i = 0; tid = setInterval(function () { s.textContent = w.slice(0, ++i).join(" "); if (i >= w.length) clearInterval(tid); }, 95); });
          [].forEach.call(chips, function (c, i) { tl.at(1700 + i * 140, function () { c.classList.add("on"); }); });
        },
        finish: function () { tl.clear(); clearInterval(tid); all.forEach(function (n) { n.classList.add("on"); }); s.textContent = TEXT; },
      };
    },
    erp: function () {
      var rows = [["Office supplies", 4, 120], ["Packaging", 12, 85.5], ["Equipment", 2, 240], ["Delivery", 3, 64.5]];
      var root = el('<div class="mini mini-erp">' + SAMPLE + '<div class="t hd"><span>Item</span><span>Qty</span><span>JOD</span></div>' +
        rows.map(function (r) { return '<div class="t fade-up"><span>' + r[0] + "</span><span>" + r[1] + "</span><span>" + jod(r[2]) + "</span></div>"; }).join("") +
        '<div class="sum"><span>Total</span><span><b class="tot">0.000</b><small>JOD</small></span></div></div>');
      var trs = root.querySelectorAll(".fade-up"), tot = root.querySelector(".tot"), tl = Timeline();
      var SUM = rows.reduce(function (a, r) { return a + r[2]; }, 0);
      return {
        root: root,
        play: function () {
          tl.clear(); [].forEach.call(trs, function (t) { t.classList.remove("on"); }); tot.textContent = jod(0);
          [].forEach.call(trs, function (t, i) { tl.at(250 + i * 380, function () { t.classList.add("on"); }); });
          tl.at(1500, function () { countTo(tot, SUM, 1000, jod); });
        },
        finish: function () { tl.clear(); [].forEach.call(trs, function (t) { t.classList.add("on"); }); tot.textContent = jod(SUM); },
      };
    },
    shop: function () {
      var root = el('<div class="mini mini-shop">' + SAMPLE + '<div class="top"><span>Shop</span><span class="cart">Cart <b class="cn">0</b></span></div>' +
        '<div class="tiles">' + [1, 2, 3].map(function (i) { return '<div class="tile"><div class="img"></div><span>Item ' + i + '</span><span class="add">Add</span></div>'; }).join("") + "</div>" +
        '<div class="checkout"><span>Checkout</span></div></div>');
      var tile = root.querySelectorAll(".tile")[1], cn = root.querySelector(".cn"), co = root.querySelector(".checkout"), tl = Timeline();
      return {
        root: root,
        play: function () {
          tl.clear(); tile.classList.remove("sel"); co.classList.remove("fill"); cn.textContent = "0";
          tl.at(700, function () { tile.classList.add("sel"); });
          tl.at(1000, function () { cn.textContent = "1"; });
          tl.at(1400, function () { co.classList.add("fill"); });
        },
        finish: function () { tl.clear(); tile.classList.add("sel"); cn.textContent = "1"; co.classList.add("fill"); },
      };
    },
    flow: function () {
      var labels = ["Lead", "Form", "AI", "Report"];
      var root = el('<div class="mini mini-flow">' + SAMPLE + '<div class="track"><div class="line"></div><span class="pulse"></span><div class="nodes">' +
        labels.map(function (l) { return '<span class="node">' + l + "</span>"; }).join("") + '</div></div><p class="caption fade-up">Runs without anyone chasing it.</p></div>');
      var line = root.querySelector(".line"), pulse = root.querySelector(".pulse"), nodes = root.querySelectorAll(".node"), cap = root.querySelector(".caption"), tl = Timeline();
      function travel() { var d = line.offsetWidth - 10; return d > 0 ? d : 0; }
      return {
        root: root,
        play: function () {
          tl.clear(); line.classList.remove("draw"); pulse.style.transition = "none"; pulse.style.transform = "none"; pulse.style.opacity = "0";
          [].forEach.call(nodes, function (n) { n.classList.remove("on"); }); cap.classList.remove("on");
          void pulse.offsetWidth; pulse.style.transition = "";
          tl.at(80, function () { line.classList.add("draw"); nodes[0].classList.add("on"); });
          tl.at(1000, function () { pulse.style.opacity = "1"; pulse.style.transform = "translateX(" + travel() + "px)"; });
          tl.at(1000 + 1100 * 0.33, function () { nodes[1].classList.add("on"); });
          tl.at(1000 + 1100 * 0.66, function () { nodes[2].classList.add("on"); });
          tl.at(2100, function () { nodes[3].classList.add("on"); cap.classList.add("on"); });
        },
        finish: function () { tl.clear(); line.classList.add("draw"); pulse.style.transform = "translateX(" + travel() + "px)"; pulse.style.opacity = "1"; [].forEach.call(nodes, function (n) { n.classList.add("on"); }); cap.classList.add("on"); },
      };
    },
  };

  /* Render rows and mount a mini-UI in both places (stage for desktop, inline for mobile). */
  listEl.innerHTML = SERVICES.map(function (s, i) {
    return '<li class="svc" data-i="' + i + '"><span class="n">' + pad(i + 1) + '</span><h3>' + s.title + '</h3><div class="svc-more"><p>' + s.desc + "</p>" +
      '<h4>Best for</h4><ul>' + s.best.map(function (b) { return "<li>" + b + "</li>"; }).join("") + '</ul></div><div class="svc-inline" aria-hidden="true"><div class="stage"><div class="stage-inner"><div class="slot"></div></div></div></div></li>';
  }).join("");
  var rows = [].slice.call(listEl.children);

  var stageMinis = SERVICES.map(function (s) { var m = BUILD[s.mini](), slot = el('<div class="slot" aria-hidden="true"></div>'); slot.appendChild(m.root); stageEl.appendChild(slot); m.slot = slot; return m; });
  var inlineMinis = SERVICES.map(function (s, i) { var m = BUILD[s.mini](); rows[i].querySelector(".slot").appendChild(m.root); return m; });

  var played = {}, current = -1;
  function set() { return wideMq.matches ? stageMinis : inlineMinis; }
  function run(i, force) {
    var m = set()[i];
    if (reduce) { m.finish(); return; }
    if (force || !played[i + (wideMq.matches ? "s" : "i")]) { played[i + (wideMq.matches ? "s" : "i")] = true; m.play(); }
    else m.finish();
  }
  function activate(i) {
    if (i === current) return;
    current = i;
    rows.forEach(function (r, j) { r.classList.toggle("active", j === i); });
    stageMinis.forEach(function (m, j) { m.slot.classList.toggle("active", j === i); });
    run(i);
  }
  /* Desktop: the row crossing the middle band is active. Mobile: first row that enters plays its inline mini once. */
  var io = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (!e.isIntersecting) return;
      var i = +e.target.dataset.i;
      if (wideMq.matches) activate(i); else if (!played[i + "i"] || reduce) { current = i; run(i); }
    });
  }, { rootMargin: "-42% 0px -42% 0px" });
  rows.forEach(function (r) { io.observe(r); });
  // Mobile rows are short, so use a looser band so each mini plays when it is on screen.
  var ioMobile = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) { if (e.isIntersecting && !wideMq.matches) { var i = +e.target.dataset.i; if (!played[i + "i"]) run(i); } });
  }, { threshold: 0.6 });
  rows.forEach(function (r) { ioMobile.observe(r); });
  // Show the first row and slot in their idle state; the story plays when the section is actually reached.
  rows[0].classList.add("active"); stageMinis[0].slot.classList.add("active");
  new IntersectionObserver(function (es, o) { if (es[0].isIntersecting) { o.disconnect(); activate(0); } }, { threshold: 0.5 }).observe(document.querySelector(".stage-wrap"));
  wideMq.addEventListener("change", function () { var c = current; current = -1; activate(c < 0 ? 0 : c); });

  var rb = document.getElementById("replay");
  if (reduce) rb.hidden = true;
  rb.addEventListener("click", function () { if (current >= 0) run(current, true); });
})();
