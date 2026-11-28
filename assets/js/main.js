(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Theme toggle (dark by default, choice remembered)
     --------------------------------------------------------- */

  var toggle = document.querySelector(".theme-toggle");
  var themeMeta = document.querySelector('meta[name="theme-color"]');

  var applyTheme = function (theme) {
    root.setAttribute("data-theme", theme);
    if (themeMeta) themeMeta.setAttribute("content", theme === "dark" ? "#0c0d10" : "#f5f3ee");
  };
  applyTheme(root.getAttribute("data-theme") || "dark");

  if (toggle) {
    toggle.addEventListener("click", function () {
      var nextTheme = root.getAttribute("data-theme") === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try { localStorage.setItem("theme", nextTheme); } catch (e) {}
    });
  }

  /* ---------------------------------------------------------
     Top bar border once scrolled
     --------------------------------------------------------- */

  var topbar = document.querySelector(".topbar");
  var onScroll = function () {
    if (topbar) topbar.classList.toggle("scrolled", window.scrollY > 8);
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------------------------------------------------------
     Reveal on scroll + active section in the nav
     --------------------------------------------------------- */

  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window && !reduceMotion) {
    var revealer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add("in");
          revealer.unobserve(entry.target);
        }
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
    revealEls.forEach(function (el) { revealer.observe(el); });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  var links = document.querySelectorAll(".nav a");
  var byId = {};
  links.forEach(function (a) { byId[a.getAttribute("href").slice(1)] = a; });

  if ("IntersectionObserver" in window) {
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        links.forEach(function (a) { a.classList.remove("active"); });
        var link = byId[entry.target.id];
        if (link) link.classList.add("active");
      });
    }, { rootMargin: "-45% 0px -50% 0px" });
    document.querySelectorAll("main section[id]").forEach(function (s) { spy.observe(s); });
  }

  /* ---------------------------------------------------------
     Footer year
     --------------------------------------------------------- */

  var year = document.querySelector("[data-year]");
  if (year) year.textContent = new Date().getFullYear();
})();
