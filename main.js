gsap.registerPlugin(ScrollTrigger);

const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const glow = document.querySelector(".mouse-glow");
const header = document.querySelector(".header");

if (glow && !prefersReducedMotion) {
  gsap.set(glow, { xPercent: -50, yPercent: -50, x: window.innerWidth / 2, y: window.innerHeight / 2 });
  const moveGlow = gsap.quickTo(glow, "x", { duration: 0.85, ease: "power3.out" });
  const moveGlowY = gsap.quickTo(glow, "y", { duration: 0.85, ease: "power3.out" });

  document.addEventListener("mousemove", (e) => {
    moveGlow(e.clientX);
    moveGlowY(e.clientY);
  });
} else if (glow) {
  glow.style.display = "none";
}

function updateHeaderOnScroll() {
  if (!header) return;
  header.classList.toggle("is-scrolled", window.scrollY > 40);
}

updateHeaderOnScroll();
window.addEventListener("scroll", updateHeaderOnScroll, { passive: true });
const navToggle = document.querySelector(".nav-toggle");
const mobileNav = document.getElementById("mobileNav");

function closeMobileMenu() {
  header?.classList.remove("is-menu-open");
  navToggle?.setAttribute("aria-expanded", "false");
  navToggle?.setAttribute("aria-label", "Open menu");
}

function toggleMobileMenu() {
  if (!header || !navToggle) return;
  const isOpen = header.classList.toggle("is-menu-open");
  navToggle.setAttribute("aria-expanded", String(isOpen));
  navToggle.setAttribute("aria-label", isOpen ? "Close menu" : "Open menu");
}

navToggle?.addEventListener("click", toggleMobileMenu);

mobileNav?.querySelectorAll("a").forEach((a) => {
  a.addEventListener("click", () => closeMobileMenu());
});

document.addEventListener("click", (e) => {
  if (!header?.classList.contains("is-menu-open")) return;
  const target = e.target;
  if (!(target instanceof Node)) return;
  if (header.contains(target)) return;
  closeMobileMenu();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeMobileMenu();
});

function scrollReveal(target, trigger, options = {}) {
  const elements = gsap.utils.toArray(target);
  if (!elements.length) return;

  gsap.from(elements, {
    scrollTrigger: {
      trigger,
      start: options.start || "top 85%",
      toggleActions: "play none none none",
    },
    y: options.y ?? 50,
    opacity: 0,
    scale: options.scale ?? 0.96,
    duration: options.duration ?? 1,
    stagger: options.stagger ?? 0,
    ease: options.ease || "power3.out",
    immediateRender: false,
  });
}

function revealSectionHeadings() {
  document.querySelectorAll(".section-heading").forEach((heading) => {
    ScrollTrigger.create({
      trigger: heading,
      start: "top 82%",
      once: true,
      onEnter: () => heading.classList.add("is-revealed"),
    });
  });
}

function initNavSpy() {
  const sections = [...document.querySelectorAll("main section[id]")];
  const links = [...document.querySelectorAll('.navbar a[href^="#"]')];

  if (!sections.length || !links.length) return;

  const setActive = (id) => {
    links.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  sections.forEach((section) => {
    ScrollTrigger.create({
      trigger: section,
      start: "top 45%",
      end: "bottom 45%",
      onEnter: () => setActive(section.id),
      onEnterBack: () => setActive(section.id),
    });
  });

  setActive(sections[0]?.id || "home");
}

function initStatCounters() {
  document.querySelectorAll(".about-stats h3").forEach((stat) => {
    const raw = stat.textContent.trim();
    const match = raw.match(/(\d+)(\+?)/);
    if (!match) return;

    const target = Number(match[1]);
    const suffix = match[2] || "";
    const counter = { value: 0 };

    ScrollTrigger.create({
      trigger: stat,
      start: "top 90%",
      once: true,
      onEnter: () => {
        gsap.to(counter, {
          value: target,
          duration: 1.6,
          ease: "power2.out",
          onUpdate: () => {
            stat.textContent = `${Math.round(counter.value)}${suffix}`;
          },
        });
      },
    });
  });
}

function initPortfolioTilt() {
  if (prefersReducedMotion || window.matchMedia("(max-width: 900px)").matches) return;

  document.querySelectorAll(".portfolio-card").forEach((card) => {
    const media = card.querySelector(".portfolio-media");
    if (!media) return;

    card.addEventListener("mousemove", (e) => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;

      gsap.to(media, {
        rotateY: x * 10,
        rotateX: -y * 8,
        duration: 0.45,
        ease: "power2.out",
        transformPerspective: 900,
      });
    });

    card.addEventListener("mouseleave", () => {
      gsap.to(media, {
        rotateY: 0,
        rotateX: 0,
        duration: 0.7,
        ease: "power3.out",
      });
    });
  });
}

/* Hero */
const heroTl = gsap.timeline({ defaults: { ease: "power3.out" } });

heroTl
  .from(".hero-tag", { y: 40, opacity: 0, duration: 0.9 })
  .from(".hero-content h1", { y: 70, opacity: 0, duration: 1.1 }, "-=0.45")
  .from(".hero-content h1 span", { scale: 0.92, opacity: 0, duration: 0.9 }, "-=0.7")
  .from(".hero-content p", { y: 40, opacity: 0, duration: 0.9 }, "-=0.55")
  .from(".hero-buttons a", { y: 30, opacity: 0, duration: 0.8, stagger: 0.12 }, "-=0.45")
  .from(".hero-avatar-wrap", { x: 80, opacity: 0, scale: 0.94, duration: 1.2 }, "-=0.9")
  .from(".avatar-glow", { scale: 0.6, opacity: 0, duration: 1.4 }, "-=1.1");

if (prefersReducedMotion) {
  heroTl.progress(1);
}

/* Scroll sections */
scrollReveal(".about-left", ".about-section");
scrollReveal(".about-avatar-wrap", ".about-section");
scrollReveal(".video-type-tag", ".about-video-types", { stagger: 0.05, y: 20 });
scrollReveal(".experience-section .section-heading", ".experience-section");
scrollReveal(".experience-section .experience-item", ".experience-section .experience-timeline", { stagger: 0.15 });
scrollReveal(".education-section .section-heading", ".education-section");
scrollReveal(".education-section .experience-item", ".education-timeline", { stagger: 0.15 });
scrollReveal(".skills-section .section-heading", ".skills-section");
scrollReveal(".skill-card", ".skills-grid", { stagger: 0.1, start: "top 88%" });

document.querySelectorAll(".skill-card").forEach((card) => {
  const bar = card.querySelector(".skill-bar-fill");
  const percent = card.querySelector(".skill-percent");
  if (!bar) return;

  const level = Number(bar.dataset.level || 0);

  ScrollTrigger.create({
    trigger: card,
    start: "top 92%",
    once: true,
    onEnter: () => {
      gsap.to(bar, {
        width: `${level}%`,
        duration: 1.4,
        ease: "power2.out",
      });

      if (percent) {
        const obj = { value: 0 };
        gsap.to(obj, {
          value: level,
          duration: 1.4,
          ease: "power2.out",
          onUpdate: () => {
            percent.textContent = `${Math.round(obj.value)}%`;
          },
        });
      }
    },
  });
});
scrollReveal(".portfolio-section .section-heading", ".portfolio-section");
scrollReveal(".portfolio-drive-link", ".portfolio-more", { y: 24 });
scrollReveal(".portfolio-card", ".portfolio-grid", { stagger: 0.15, start: "top 88%" });
scrollReveal(".process-section .section-heading", ".process-section");
scrollReveal(".process-step", ".process-grid", { stagger: 0.12 });
scrollReveal(".testimonial-section .section-heading", ".testimonial-section");
scrollReveal(".testimonial-card", ".testimonial-grid", { stagger: 0.12 });
scrollReveal(".contact-section .section-heading", ".contact-section");
scrollReveal(".contact-form > *", ".contact-form", { stagger: 0.08, y: 28, start: "top 88%" });

revealSectionHeadings();
initNavSpy();
initStatCounters();

/* Scroll to top */
const scrollBtn = document.getElementById("scrollTop");

if (scrollBtn) {
  window.addEventListener("scroll", () => {
    scrollBtn.classList.toggle("is-visible", window.scrollY > 500);
  });

  scrollBtn.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

/* Contact form → WhatsApp */
const contactForm = document.getElementById("contactForm");

if (contactForm) {
  contactForm.addEventListener("submit", (e) => {
    e.preventDefault();

    const whatsappNumber = contactForm.dataset.whatsapp || "917067103876";
    const name = contactForm.name.value.trim();
    const email = contactForm.email.value.trim();
    const message = contactForm.message.value.trim();

    const text = [
      "Hi Mahendra,",
      "",
      "I visited your portfolio and want to discuss a project.",
      "",
      `Name: ${name}`,
      `Email: ${email}`,
      "",
      "Project Details:",
      message,
    ].join("\n");

    const url = `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    contactForm.reset();
  });
}

/* Portfolio videos */
const videoModal = document.getElementById("videoModal");
const modalVideo = document.getElementById("modalVideo");
const modalYoutube = document.getElementById("modalYoutube");

function getYoutubeId(url) {
  if (!url) return null;
  const match = url.match(
    /(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([\w-]{11})/
  );
  return match ? match[1] : null;
}

function getYoutubeEmbed(url) {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/embed/${id}?autoplay=1&rel=0` : null;
}

function getYoutubeWatchUrl(url) {
  const id = getYoutubeId(url);
  return id ? `https://www.youtube.com/watch?v=${id}` : url || "";
}

function getCardVideoSrc(card) {
  const preview = card.querySelector(".portfolio-video");
  if (!preview) return card.dataset.video || "";

  const source = preview.querySelector("source");
  const src =
    source?.getAttribute("src") ||
    preview.currentSrc ||
    preview.getAttribute("src") ||
    card.dataset.video;

  return src || "";
}

function closeVideoModal() {
  if (!videoModal) return;
  videoModal.classList.remove("is-open");
  videoModal.setAttribute("aria-hidden", "true");
  document.body.style.overflow = "";

  if (modalVideo) {
    modalVideo.pause();
    modalVideo.removeAttribute("src");
    modalVideo.load();
    modalVideo.hidden = false;
    modalVideo.muted = false;
    modalVideo.loop = false;
  }
  if (modalYoutube) {
    modalYoutube.src = "";
    modalYoutube.hidden = true;
  }
}

function openVideoModal(card) {
  if (!videoModal || !modalVideo) return;

  const youtubeUrl = card.dataset.youtube;
  const embed = getYoutubeEmbed(youtubeUrl);
  const watchUrl = getYoutubeWatchUrl(youtubeUrl);
  const videoSrc = embed ? "" : getCardVideoSrc(card);
  const preview = card.querySelector(".portfolio-video");

  if (preview) preview.pause();

  const isFileProtocol = window.location.protocol === "file:";
  if (watchUrl && (isFileProtocol || !embed)) {
    window.open(watchUrl, "_blank", "noopener,noreferrer");
    return;
  }

  if (embed && modalYoutube) {
    modalYoutube.src = embed;
    modalYoutube.hidden = false;
    modalVideo.hidden = true;
  } else if (videoSrc) {
    modalYoutube.hidden = true;
    modalVideo.hidden = false;
    modalVideo.muted = false;
    modalVideo.loop = false;
    modalVideo.src = videoSrc;
    modalVideo.load();
  } else if (card.dataset.drive) {
    window.open(card.dataset.drive, "_blank", "noopener,noreferrer");
    return;
  } else {
    return;
  }

  videoModal.classList.add("is-open");
  videoModal.setAttribute("aria-hidden", "false");
  document.body.style.overflow = "hidden";

  if (!prefersReducedMotion) {
    gsap.fromTo(
      videoModal.querySelector(".video-modal-box"),
      { scale: 0.9, y: 30, opacity: 0 },
      { scale: 1, y: 0, opacity: 1, duration: 0.55, ease: "back.out(1.4)" }
    );
  }

  if (!embed) {
    modalVideo.play().catch(() => {});
  }
}

function getCoverImageUrl(card, youtubeId) {
  if (card.dataset.cover) return card.dataset.cover;
  if (!youtubeId) return "";
  return `https://img.youtube.com/vi/${youtubeId}/maxresdefault.jpg`;
}

function ensurePortfolioCover(card, youtubeId, title) {
  const media = card.querySelector(".portfolio-media");
  if (!media) return null;

  let cover = media.querySelector(".portfolio-cover");
  if (cover) return cover;

  const coverUrl = getCoverImageUrl(card, youtubeId);
  if (!coverUrl) return null;

  cover = document.createElement("img");
  cover.className = "portfolio-cover";
  cover.alt = title;
  cover.loading = "lazy";
  cover.decoding = "async";
  cover.src = coverUrl;

  if (youtubeId) {
    cover.addEventListener("error", () => {
      cover.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
    });
  }

  media.prepend(cover);
  return cover;
}

function startCardPreview(card) {
  const preview = card.querySelector(".portfolio-video");
  if (!preview) return;

  card.classList.add("is-previewing");
  preview.play().catch(() => {});
}

function stopCardPreview(card) {
  const preview = card.querySelector(".portfolio-video");
  card.classList.remove("is-previewing");

  if (!preview) return;
  preview.pause();
  preview.currentTime = 0;
}

function initPortfolioCards() {
  document.querySelectorAll(".portfolio-card").forEach((card) => {
    const youtubeId = getYoutubeId(card.dataset.youtube);
    const preview = card.querySelector(".portfolio-video");
    const title =
      card.querySelector(".portfolio-info h3")?.textContent ||
      card.querySelector(".portfolio-overlay h3")?.textContent ||
      "Project video";

    const cover = ensurePortfolioCover(card, youtubeId, title);

    if (cover && youtubeId) {
      cover.addEventListener("error", () => {
        cover.src = `https://img.youtube.com/vi/${youtubeId}/hqdefault.jpg`;
      });
    }

    if (preview && cover) {
      const posterUrl = cover.getAttribute("src") || getCoverImageUrl(card, youtubeId);
      if (posterUrl) preview.setAttribute("poster", posterUrl);
    }

    card.addEventListener("mouseenter", () => startCardPreview(card));
    card.addEventListener("mouseleave", () => stopCardPreview(card));
    card.addEventListener("focusin", () => startCardPreview(card));
    card.addEventListener("focusout", () => stopCardPreview(card));

    card.addEventListener("click", () => openVideoModal(card));
  });
}

initPortfolioCards();
initPortfolioTilt();

modalYoutube?.addEventListener("error", () => {
  const activeCard = document.querySelector(".portfolio-card:hover");
  const url = activeCard?.getAttribute("data-youtube");
  const watchUrl = getYoutubeWatchUrl(url || "");
  if (watchUrl) {
    closeVideoModal();
    window.open(watchUrl, "_blank", "noopener,noreferrer");
  }
});

videoModal?.querySelectorAll("[data-close-modal]").forEach((el) => {
  el.addEventListener("click", closeVideoModal);
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") closeVideoModal();
});

window.addEventListener("load", () => ScrollTrigger.refresh());
