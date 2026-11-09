/* Shared UI: theme switch (circular reveal), CTA label roll, magnetic buttons. Loaded on every page. */
(function () {
  "use strict";
  var GM = (window.GM = window.GM || {});
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var fine = matchMedia("(hover: hover) and (pointer: fine)").matches;
  var root = document.documentElement;

  /* ---------- Theme: system by default, remembered once chosen ---------- */
  var tbtn = document.getElementById("theme-btn");
  function label() { if (tbtn) tbtn.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme"); }
  function apply(t) { root.dataset.theme = t; try { localStorage.setItem("gm-theme", t); } catch (e) {} label(); }
  label();
  if (tbtn) tbtn.addEventListener("click", function () {
    var next = root.dataset.theme === "light" ? "dark" : "light";
    if (reduce || !document.startViewTransition) { apply(next); return; }
    var r = tbtn.getBoundingClientRect(), x = r.left + r.width / 2, y = r.top + r.height / 2;
    var rad = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    var vt = document.startViewTransition(function () { apply(next); });
    vt.ready.then(function () {
      root.animate({ clipPath: ["circle(0px at " + x + "px " + y + "px)", "circle(" + rad + "px at " + x + "px " + y + "px)"] },
        { duration: 700, easing: "cubic-bezier(.22,1,.36,1)", pseudoElement: "::view-transition-new(root)" });
    });
  });
  try {
    matchMedia("(prefers-color-scheme: light)").addEventListener("change", function (e) {
      if (localStorage.getItem("gm-theme")) return;
      root.dataset.theme = e.matches ? "light" : "dark"; label();
    });
  } catch (e) {}

  /* ---------- CTA: duplicate the label so it can roll; the copy is hidden from assistive tech ---------- */
  GM.rollButtons = function (scope) {
    [].slice.call((scope || document).querySelectorAll(".btn")).forEach(function (b) {
      if (b.dataset.rolled) return; b.dataset.rolled = "1";
      var arr = b.querySelector(".arr");
      var text = [].slice.call(b.childNodes).filter(function (n) { return n !== arr; }).map(function (n) { return n.textContent; }).join("").trim();
      if (!text) return;
      var l = document.createElement("span"); l.className = "lbl";
      var a = document.createElement("span"), c = document.createElement("span");
      a.textContent = text; c.textContent = text; c.setAttribute("aria-hidden", "true");
      l.appendChild(a); l.appendChild(c);
      [].slice.call(b.childNodes).forEach(function (n) { if (n !== arr) b.removeChild(n); });
      b.insertBefore(l, arr || null);
    });
  };
  GM.rollButtons();

  /* ---------- Magnetic pull: buttons lean toward the pointer ---------- */
  if (fine && !reduce) {
    document.addEventListener("pointermove", function (e) {
      var b = e.target.closest && e.target.closest(".btn"); if (!b) return;
      var r = b.getBoundingClientRect();
      var dx = (e.clientX - (r.left + r.width / 2)) * 0.16, dy = (e.clientY - (r.top + r.height / 2)) * 0.28;
      b.style.setProperty("--tx", Math.max(-8, Math.min(8, dx)).toFixed(1) + "px");
      b.style.setProperty("--ty", Math.max(-6, Math.min(6, dy)).toFixed(1) + "px");
    });
    document.addEventListener("pointerout", function (e) {
      var b = e.target.closest && e.target.closest(".btn"); if (!b || b.contains(e.relatedTarget)) return;
      b.style.setProperty("--tx", "0px"); b.style.setProperty("--ty", "0px");
    });
  }
})();
