(function () {
  "use strict";

  var nav = document.getElementById("site-nav");
  var toggle = document.getElementById("nav-toggle");
  var header = document.querySelector(".site-header");
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function initMotionBackground() {
    var canvas = document.getElementById("motion-bg");
    if (!canvas || !("getContext" in canvas)) return;

    var ctx = canvas.getContext("2d");
    if (!ctx) return;

    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var width = 0;
    var height = 0;
    var particles = [];
    var pointer = { x: 0, y: 0, tx: 0, ty: 0, active: false };
    var scrollProgress = 0;
    var particleCount = 70;

    function resize() {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      createParticles();
      if (!pointer.active) {
        pointer.x = width * 0.5;
        pointer.y = height * 0.35;
        pointer.tx = pointer.x;
        pointer.ty = pointer.y;
      }
    }

    function createParticles() {
      particles = [];
      var count = Math.max(40, Math.floor((width * height) / 26000));
      particleCount = Math.min(120, count);
      for (var i = 0; i < particleCount; i += 1) {
        particles.push({
          x: Math.random() * width,
          y: Math.random() * height,
          vx: (Math.random() - 0.5) * 0.28,
          vy: (Math.random() - 0.5) * 0.28,
          size: Math.random() * 1.8 + 0.6,
          hue: 160 + Math.random() * 95,
          seed: Math.random() * 1000,
        });
      }
    }

    function updatePointer(x, y) {
      pointer.tx = x;
      pointer.ty = y;
      pointer.active = true;
    }

    function updateScroll() {
      var maxScroll = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      scrollProgress = window.scrollY / maxScroll;
    }

    function drawFrame(t) {
      pointer.x += (pointer.tx - pointer.x) * 0.07;
      pointer.y += (pointer.ty - pointer.y) * 0.07;
      updateScroll();

      ctx.clearRect(0, 0, width, height);

      var grad = ctx.createRadialGradient(pointer.x, pointer.y, 0, pointer.x, pointer.y, width * 0.55);
      grad.addColorStop(0, "rgba(31, 125, 255, 0.34)");
      grad.addColorStop(0.45, "rgba(42, 157, 124, 0.24)");
      grad.addColorStop(1, "rgba(31, 125, 255, 0)");
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, width, height);

      var waveY = height * (0.15 + scrollProgress * 0.7);
      ctx.strokeStyle = "rgba(31, 125, 255, 0.28)";
      ctx.lineWidth = 1.2;
      ctx.beginPath();
      for (var x = 0; x <= width; x += 12) {
        var wobble = Math.sin(x * 0.012 + t * 0.0008) * 12 + Math.sin(x * 0.03 + t * 0.0004) * 5;
        var y = waveY + wobble;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      for (var i = 0; i < particles.length; i += 1) {
        var p = particles[i];
        var pulse = Math.sin(t * 0.0006 + p.seed) * 0.4;
        p.x += p.vx + pulse * 0.12;
        p.y += p.vy + Math.cos(t * 0.0005 + p.seed) * 0.08;

        if (p.x < -20) p.x = width + 20;
        if (p.x > width + 20) p.x = -20;
        if (p.y < -20) p.y = height + 20;
        if (p.y > height + 20) p.y = -20;

        var dx = pointer.x - p.x;
        var dy = pointer.y - p.y;
        var dist = Math.sqrt(dx * dx + dy * dy) || 1;
        if (dist < 190) {
          p.x -= (dx / dist) * 0.22;
          p.y -= (dy / dist) * 0.22;
        }

        ctx.fillStyle = "hsla(" + p.hue + ", 88%, 58%, 0.72)";
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }

      for (var a = 0; a < particles.length; a += 1) {
        var pa = particles[a];
        for (var b = a + 1; b < particles.length; b += 1) {
          var pb = particles[b];
          var lx = pa.x - pb.x;
          var ly = pa.y - pb.y;
          var ld = Math.sqrt(lx * lx + ly * ly);
          if (ld < 95) {
            var alpha = (1 - ld / 95) * 0.2;
            ctx.strokeStyle = "rgba(42, 157, 124, " + alpha.toFixed(3) + ")";
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(pa.x, pa.y);
            ctx.lineTo(pb.x, pb.y);
            ctx.stroke();
          }
        }
      }
    }

    function loop(t) {
      drawFrame(t);
      if (!reduceMotion) requestAnimationFrame(loop);
    }

    window.addEventListener("resize", resize);
    window.addEventListener("mousemove", function (e) {
      updatePointer(e.clientX, e.clientY);
    });
    window.addEventListener(
      "touchmove",
      function (e) {
        if (!e.touches || !e.touches[0]) return;
        updatePointer(e.touches[0].clientX, e.touches[0].clientY);
      },
      { passive: true }
    );
    window.addEventListener("scroll", updateScroll, { passive: true });

    resize();
    drawFrame(0);
    if (!reduceMotion) requestAnimationFrame(loop);
  }

  function closeNav() {
    if (!nav || !toggle) return;
    nav.classList.remove("is-open");
    toggle.setAttribute("aria-expanded", "false");
    toggle.setAttribute("aria-label", "Open menu");
  }

  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    });

    nav.querySelectorAll("a[href^=\"#\"]").forEach(function (link) {
      link.addEventListener("click", function () {
        if (window.matchMedia("(max-width: 720px)").matches) closeNav();
      });
    });
  }

  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") closeNav();
  });

  var scrollTick = false;
  window.addEventListener(
    "scroll",
    function () {
      if (!header || scrollTick) return;
      scrollTick = true;
      requestAnimationFrame(function () {
        scrollTick = false;
        header.classList.toggle("is-scrolled", window.scrollY > 12);
      });
    },
    { passive: true }
  );

  initMotionBackground();
  var revealTargets = document.querySelectorAll("main .section, .site-footer");

  function markAllInView() {
    revealTargets.forEach(function (el) {
      el.classList.add("in-view");
    });
  }

  if (!revealTargets.length) {
    /* noop */
  } else if (reduceMotion || !("IntersectionObserver" in window)) {
    markAllInView();
  } else {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("in-view");
          revealObserver.unobserve(entry.target);
        });
      },
      { root: null, rootMargin: "0px 0px 8% 0px", threshold: 0.06 }
    );

    revealTargets.forEach(function (el) {
      revealObserver.observe(el);
    });
  }
})();
