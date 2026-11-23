(function () {
  "use strict";

  var root = document.documentElement;
  root.classList.add("js");

  var reduceMotion = window.matchMedia &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------------------------------------------------------
     Name transliteration
     The name cycles through scripts, the same idea as the
     Spotify lyrics project: same sounds, different alphabet.
     --------------------------------------------------------- */

  var SCRIPTS = [
    { label: "Latin",    text: "Charles Montluc-Giannopoulou", pool: "abcdefghijklmnopqrstuvwxyz", hold: 5200 },
    { label: "Greek",    text: "Σαρλ Μονλύκ-Γιαννοπούλου",     pool: "αβγδεζηθικλμνξοπρστυφχψω",   hold: 3200 },
    { label: "Cyrillic", text: "Шарль Монлюк-Яннопулу",        pool: "абвгдежзийклмнопрстуфхцчшщюя", hold: 3200 },
    { label: "Katakana", text: "シャルル・モンリュック＝ヤノプール", pool: "アイウエオカキクケコサシスセソタチツテトナニヌネノハヒフヘホマミムメモヤユヨラリルレロワン", hold: 3200 }
  ];

  var nameEl = document.querySelector("[data-name]");
  var labelEl = document.querySelector("[data-script-label]");
  var dotsEl = document.querySelector("[data-script-dots]");

  if (nameEl && labelEl && dotsEl) {
    var dots = SCRIPTS.map(function () {
      var i = document.createElement("i");
      dotsEl.appendChild(i);
      return i;
    });

    var current = 0;
    var timer = null;
    var frame = null;

    var setMeta = function (idx) {
      labelEl.textContent = SCRIPTS[idx].label;
      dots.forEach(function (d, i) { d.classList.toggle("on", i === idx); });
    };

    var escapeChar = function (c) {
      return c === "<" ? "&lt;" : c === ">" ? "&gt;" : c === "&" ? "&amp;" : c;
    };

    // Morph from the current text to the next one, character by character.
    var morph = function (to, done) {
      var from = nameEl.textContent;
      var target = to.text;
      var pool = to.pool;
      var len = Math.max(from.length, target.length);
      var duration = 950;
      var start = null;

      // each position settles at its own moment, roughly left to right
      var settle = [];
      for (var i = 0; i < len; i++) {
        settle.push((i / len) * 0.6 + Math.random() * 0.4);
      }

      var step = function (ts) {
        if (start === null) start = ts;
        var p = Math.min((ts - start) / duration, 1);
        var out = "";
        for (var k = 0; k < len; k++) {
          var t = target.charAt(k);
          if (p >= settle[k]) {
            out += escapeChar(t);
          } else if (t === " " || t === "-" || t === "・" || t === "＝" || t === "") {
            out += p > settle[k] * 0.5 ? escapeChar(t) : escapeChar(from.charAt(k));
          } else {
            out += '<span class="ch-scramble">' + pool.charAt(Math.floor(Math.random() * pool.length)) + "</span>";
          }
        }
        nameEl.innerHTML = out;
        if (p < 1) {
          frame = requestAnimationFrame(step);
        } else {
          nameEl.textContent = target;
          done && done();
        }
      };
      frame = requestAnimationFrame(step);
    };

    var next = function () {
      current = (current + 1) % SCRIPTS.length;
      setMeta(current);
      morph(SCRIPTS[current], schedule);
    };

    var schedule = function () {
      clearTimeout(timer);
      timer = setTimeout(next, SCRIPTS[current].hold);
    };

    setMeta(0);

    if (!reduceMotion) {
      schedule();
      // pause while the tab is hidden, resume on return
      document.addEventListener("visibilitychange", function () {
        if (document.hidden) {
          clearTimeout(timer);
          cancelAnimationFrame(frame);
          nameEl.textContent = SCRIPTS[current].text;
        } else {
          schedule();
        }
      });
    }
  }

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
