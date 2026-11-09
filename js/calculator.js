/* Calculator: presented as a receipt. Odometer total, dotted leaders, VAT 16%.

   TODO(client): EVERY number in PRICING is a placeholder. The original tiers, add-on prices,
   hosting fee and support formula were not available in the repo. Replace before launch.
   The 10%-per-month support rate and 16% VAT come from the brief. */
(function () {
  "use strict";
  var SERVICES = window.GM.SERVICES;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  var PRICING = {
    vat: 0.16,
    supportRatePerMonth: 0.10, // of the build subtotal, per month
    range: 0.15, // estimate shown as total -15% / +15%
    hostingPerYear: 180,
    base: { website: 900, "ai-apps": 2400, erp: 4500, ecommerce: 1800, automation: 1200 },
    tiers: [
      { id: "essential", label: "Essential", note: "Core features", mult: 1 },
      { id: "standard", label: "Standard", note: "Most projects", mult: 1.6 },
      { id: "advanced", label: "Advanced", note: "Complex needs", mult: 2.4 },
    ],
    addons: [
      { id: "bilingual", label: "Arabic and English", price: 250 },
      { id: "payments", label: "Online payments", price: 300 },
      { id: "admin", label: "Admin dashboard", price: 450 },
      { id: "assistant", label: "AI assistant", price: 600 },
      { id: "migration", label: "Data migration", price: 350 },
    ],
    support: [0, 3, 6, 12],
  };

  var form = document.getElementById("calc-form"), receipt = document.getElementById("receipt");
  if (!form || !receipt) return;
  var fmt = function (n) { return n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }); };
  var whole = function (n) { return n.toLocaleString("en-US", { maximumFractionDigits: 0 }); };

  /* ---------- Controls ---------- */
  form.innerHTML =
    '<fieldset><legend>Project type</legend><div class="opts">' + SERVICES.map(function (s, i) {
      return '<label class="opt"><input type="radio" name="type" value="' + s.id + '"' + (i === 0 ? " checked" : "") + '><span class="ind"></span><span class="tx">' + s.title + '</span><span class="pr">from ' + whole(PRICING.base[s.id]) + " JOD</span></label>";
    }).join("") + "</div></fieldset>" +
    '<fieldset><legend>Scope</legend><div class="sbox">' + PRICING.tiers.map(function (t, i) {
      return '<label><input type="radio" name="tier" value="' + t.id + '"' + (i === 1 ? " checked" : "") + '><span>' + t.label + "<small>" + t.note + "</small></span></label>";
    }).join("") + "</div></fieldset>" +
    '<fieldset><legend>Add-ons</legend><div class="opts">' + PRICING.addons.map(function (a) {
      return '<label class="opt"><input type="checkbox" name="addon" value="' + a.id + '"><span class="ind"></span><span class="tx">' + a.label + '</span><span class="pr">+ ' + whole(a.price) + " JOD</span></label>";
    }).join("") + "</div></fieldset>" +
    '<fieldset><legend>Hosting</legend><div class="opts"><label class="opt"><input type="checkbox" name="hosting"><span class="ind"></span><span class="tx">Managed hosting, 1 year<small>Servers, backups and monitoring</small></span><span class="pr">+ ' + whole(PRICING.hostingPerYear) + " JOD</span></label></div></fieldset>" +
    '<fieldset><legend>Support after launch</legend><div class="sbox">' + PRICING.support.map(function (m, i) {
      return '<label><input type="radio" name="support" value="' + m + '"' + (i === 0 ? " checked" : "") + "><span>" + (m ? m + " months" : "None") + "<small>" + (m ? "10% per month" : "No plan") + "</small></span></label>";
    }).join("") + "</div></fieldset>";

  /* ---------- Receipt shell ---------- */
  receipt.innerHTML = '<h3>Your estimate</h3><div id="lines"></div>' +
    '<div class="rl total-l"><span>Total incl. VAT</span></div>' +
    '<div class="total"><span class="odo" id="odo" aria-hidden="true"></span><span class="cur">JOD</span></div>' +
    '<span class="sr-only" id="total-sr" aria-live="polite"></span>' +
    '<p class="range" id="range"></p>' +
    '<a class="btn" id="estimate-btn" href="order.html">Request this estimate <span class="arr" aria-hidden="true">→</span></a>' +
    '<p class="fine">An estimate, not a quote. We confirm a fixed price after scoping.</p>';
  if (window.GM.rollButtons) window.GM.rollButtons(receipt);
  var linesEl = document.getElementById("lines"), odo = document.getElementById("odo"), btn = document.getElementById("estimate-btn");

  function line(label, value, cls) {
    return '<div class="rl ' + (cls || "") + '"><span>' + label + '</span><span class="lead"></span><span class="v">' + value + ' <span class="cur" style="color:var(--ink-mute);font-weight:600">JOD</span></span></div>';
  }

  /* Odometer: digit columns roll with transform; separators stay put. */
  function setOdo(str) {
    if (odo.dataset.len !== String(str.length)) {
      odo.dataset.len = str.length;
      odo.innerHTML = str.split("").map(function (c) {
        return /\d/.test(c) ? '<span class="d"><span class="strip">' + "0123456789".split("").map(function (n) { return "<i>" + n + "</i>"; }).join("") + "</span></span>" : '<span class="sep">' + c + "</span>";
      }).join("");
      void odo.offsetWidth;
    }
    var strips = odo.querySelectorAll(".strip"), k = 0;
    str.split("").forEach(function (c) { if (/\d/.test(c)) strips[k++].style.transform = "translateY(" + (-(+c) * 10) + "%)"; });
  }

  function state() {
    var f = new FormData(form);
    return { type: f.get("type"), tier: f.get("tier"), addons: f.getAll("addon"), hosting: f.get("hosting") === "on", support: +f.get("support") };
  }

  function calc() {
    var s = state(), P = PRICING;
    var svc = SERVICES.filter(function (x) { return x.id === s.type; })[0];
    var tier = P.tiers.filter(function (t) { return t.id === s.tier; })[0];
    var build = P.base[s.type] * tier.mult;
    var adds = P.addons.filter(function (a) { return s.addons.indexOf(a.id) > -1; });
    var addTotal = adds.reduce(function (a, x) { return a + x.price; }, 0);
    var subtotal = build + addTotal;
    var support = s.support * P.supportRatePerMonth * subtotal;
    var hosting = s.hosting ? P.hostingPerYear : 0;
    var net = subtotal + support + hosting, vat = net * P.vat, total = net + vat;

    var h = line(svc.title, fmt(P.base[s.type])) + line(tier.label + " scope (×" + tier.mult + ")", fmt(build - P.base[s.type]), "sub");
    adds.forEach(function (a) { h += line(a.label, fmt(a.price)); });
    if (hosting) h += line("Managed hosting, 1 year", fmt(hosting));
    if (support) h += line("Support, " + s.support + " months × 10%", fmt(support));
    h += line("Subtotal", fmt(net), "sub") + line("VAT " + Math.round(P.vat * 100) + "%", fmt(vat), "sub");
    linesEl.innerHTML = h;

    setOdo(fmt(total));
    document.getElementById("total-sr").textContent = "Estimated total " + fmt(total) + " JOD including VAT";
    document.getElementById("range").textContent = "Likely range " + whole(total * (1 - P.range)) + " to " + whole(total * (1 + P.range)) + " JOD";

    var q = new URLSearchParams({ type: s.type, scope: s.tier, estimate: Math.round(total) });
    if (s.addons.length) q.set("addons", s.addons.join(","));
    if (s.hosting) q.set("hosting", "1");
    if (s.support) q.set("support", s.support);
    btn.href = "order.html?" + q.toString();
  }

  form.addEventListener("change", calc);
  if (reduce) odo.style.setProperty("--none", "1");
  calc();
})();
