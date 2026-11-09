/* Core chrome: loader, nav, reveal, hero counters, process, FAQ, video poster, WhatsApp. */
(function () {
  "use strict";
  var GM = window.GM;
  var reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return [].slice.call((r || document).querySelectorAll(s)); };

  /* Loader: first visit only, 600ms max, never blocks longer. */
  var hero = $(".hero"), loader = $("#loader");
  function startHero() { hero.classList.add("go"); runCounters(); }
  if (document.documentElement.classList.contains("first-visit") && loader) {
    setTimeout(function () { loader.classList.add("done"); startHero(); setTimeout(function () { loader.remove(); }, 260); }, reduce ? 150 : 600);
  } else { if (loader) loader.remove(); requestAnimationFrame(startHero); }

  /* Nav: compact on scroll, mobile menu, current section */
  var nav = $("#nav"), menuBtn = $("#menu-btn");
  var prog = document.getElementById("progress");
  function onScroll() {
    nav.classList.toggle("compact", scrollY > 24);
    var max = document.documentElement.scrollHeight - innerHeight;
    prog.style.setProperty("--sp", max > 0 ? Math.min(1, scrollY / max).toFixed(4) : 0);
  }
  addEventListener("scroll", onScroll, { passive: true }); onScroll();
  menuBtn.addEventListener("click", function () {
    var o = nav.classList.toggle("open");
    menuBtn.setAttribute("aria-expanded", String(o)); menuBtn.setAttribute("aria-label", o ? "Close menu" : "Open menu");
  });
  $$("#nav-links a").forEach(function (a) { a.addEventListener("click", function () { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.setAttribute("aria-label", "Open menu"); }); });
  document.addEventListener("keydown", function (e) { if (e.key === "Escape" && nav.classList.contains("open")) { nav.classList.remove("open"); menuBtn.setAttribute("aria-expanded", "false"); menuBtn.focus(); } });
  /* Sliding indicator in the centred pill: follows hover/focus, rests on the current section */
  var pill = $("#nav-pill"), ind = $(".ind", pill), pillLinks = $$("#nav-links li:not(.mobile-only) a");
  function moveInd(a) {
    if (!a || getComputedStyle(pill).display === "none") { ind.classList.remove("on"); return; }
    ind.style.setProperty("--x", a.offsetLeft + "px"); ind.style.setProperty("--w", a.offsetWidth + "px"); ind.classList.add("on");
  }
  function restInd() { moveInd(pillLinks.filter(function (a) { return a.getAttribute("aria-current") === "true"; })[0]); }
  pillLinks.forEach(function (a) {
    a.addEventListener("pointerenter", function () { moveInd(a); });
    a.addEventListener("focus", function () { moveInd(a); });
    a.addEventListener("blur", restInd);
  });
  pill.addEventListener("pointerleave", restInd);
  addEventListener("resize", restInd);
  var links = {}; $$("#nav-links a[href^='#']").forEach(function (a) { links[a.getAttribute("href").slice(1)] = a; });
  var secIO = new IntersectionObserver(function (es) {
    es.forEach(function (e) { if (!e.isIntersecting) return; Object.keys(links).forEach(function (k) { links[k].removeAttribute("aria-current"); }); if (links[e.target.id]) links[e.target.id].setAttribute("aria-current", "true"); restInd(); });
  }, { rootMargin: "-45% 0px -50% 0px" });
  ["services", "projects", "story", "process", "why", "calculator", "faq"].forEach(function (id) { var s = document.getElementById(id); if (s) secIO.observe(s); });

  /* Reveal on enter */
  var revIO = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); revIO.unobserve(e.target); } }); }, { threshold: 0.15, rootMargin: "0px 0px -6% 0px" });
  $$("[data-reveal]").forEach(function (n) { if (!n.closest(".hero")) revIO.observe(n); });
  // Hero reveals follow the headline instead of the viewport.
  function revealHero() { $$(".hero [data-reveal]").forEach(function (n) { n.classList.add("in"); }); }

  /* Hero ledger: derive 11 and 5 from the data; count up once with ease-out over 1.4s */
  function runCounters() {
    revealHero();
    $$(".ledger-strip .n").forEach(function (n) {
      var key = n.dataset.count, to = key === "projects" ? GM.PROJECTS.length : key === "services" ? GM.SERVICES.length : +key, suf = n.dataset.suffix || "";
      if (reduce) { n.textContent = to + suf; return; }
      var t0 = performance.now(); n.textContent = "0" + suf;
      (function s(t) { var k = Math.min(1, (t - t0) / 1400), e = 1 - Math.pow(1 - k, 4); n.textContent = Math.round(to * e) + suf; if (k < 1) requestAnimationFrame(s); })(t0);
    });
  }

  /* Process rows: number fills to blue, tick draws */
  var stepIO = new IntersectionObserver(function (es) { es.forEach(function (e) { if (e.isIntersecting) { e.target.classList.add("in"); stepIO.unobserve(e.target); } }); }, { rootMargin: "0px 0px -25% 0px" });
  $$(".step").forEach(function (s) { stepIO.observe(s); });

  /* FAQ: grid-rows expand */
  $$("#faq-list li").forEach(function (li) {
    var b = $("button", li), a = $(".ans", li);
    b.addEventListener("click", function () {
      var on = b.getAttribute("aria-expanded") !== "true";
      b.setAttribute("aria-expanded", String(on)); li.classList.toggle("open", on); a.inert = !on;
    });
  });

  /* Founder video: click-to-play, loaded only on demand */
  var video = $("#video");
  $(".poster", video).addEventListener("click", function () {
    var id = video.dataset.yt;
    if (!id) { $("#video-note").hidden = false; return; }
    var f = document.createElement("iframe");
    f.src = "https://www.youtube-nocookie.com/embed/" + encodeURIComponent(id) + "?autoplay=1&rel=0";
    f.title = "Founder interview"; f.allow = "autoplay; encrypted-media; picture-in-picture"; f.allowFullscreen = true;
    video.innerHTML = ""; video.appendChild(f);
  });

  /* WhatsApp steps aside while the calculator's primary button is on screen (mobile) */
  var est = document.getElementById("estimate-btn"), wa = $("#wa");
  if (est) new IntersectionObserver(function (es) { wa.classList.toggle("away-mobile", es[0].isIntersecting); }, { rootMargin: "0px 0px 80px 0px" }).observe(est);

  var yr = $("#yr"); if (yr) yr.textContent = new Date().getFullYear();
})();
