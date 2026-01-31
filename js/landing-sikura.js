// ===========================
// SIKURA HERO - INTERACCIONES
// ===========================

(function () {
  "use strict";

  // Esperar a que el DOM esté listo
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initSikuraHero);
  } else {
    initSikuraHero();
  }

  function initSikuraHero() {
    const ctaButton = document.querySelector(".sikura-cta");

    if (ctaButton) {
      ctaButton.addEventListener("click", handleCTAClick);
    }

    // Efecto parallax suave en el hero (opcional)
    if (!window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      window.addEventListener("scroll", handleHeroScroll);
    }

    // Inicializar accesibilidad
    initAccessibility();

    // Animar entrada del hero (opcional)
    setTimeout(animateHeroEntrance, 100);
  }

  // ===========================
  // HERO INTERACTIONS
  // ===========================
  function handleCTAClick(e) {
    // Si es un enlace, dejar que funcione normalmente
    if (e.currentTarget.tagName === "A" && e.currentTarget.href) {
      return;
    }

    e.preventDefault();

    // Feedback visual
    const button = e.currentTarget;
    button.style.transform = "scale(0.98)";

    setTimeout(() => {
      button.style.transform = "";
    }, 150);

    // Acción del botón
    console.log("Sikura CTA clicked");

    // Aquí puedes agregar lógica personalizada
    // Ejemplo: redirigir a una página de registro
    // window.location.href = '/signup';
  }

  function handleHeroScroll() {
    const scrollY = window.scrollY;
    const hero = document.querySelector(".hero-sikura");

    if (hero && scrollY < window.innerHeight) {
      // Efecto parallax muy sutil en el contenido
      const heroContainer = hero.querySelector(".hero-sikura-container");
      if (heroContainer) {
        const offset = scrollY * 0.3;
        heroContainer.style.transform = `translateY(${offset}px)`;
        heroContainer.style.opacity = 1 - (scrollY / window.innerHeight) * 0.5;
      }
    }
  }

  // ===========================
  // ACCESIBILIDAD
  // ===========================
  function initAccessibility() {
    // Detección de navegación por teclado
    let isTabbing = false;

    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        isTabbing = true;
        document.body.classList.add("user-is-tabbing");
      }
    });

    document.addEventListener("mousedown", () => {
      isTabbing = false;
      document.body.classList.remove("user-is-tabbing");
    });

    // Detectar preferencias de movimiento reducido
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (e) => {
      if (e.matches) {
        // Usuario prefiere movimiento reducido
        document.body.classList.add("reduce-motion");
        window.removeEventListener("scroll", handleHeroScroll);
      } else {
        document.body.classList.remove("reduce-motion");
        window.addEventListener("scroll", handleHeroScroll);
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);
    handleMotionChange(motionQuery);
  }

  // ===========================
  // ANIMACIONES
  // ===========================
  function animateHeroEntrance() {
    const heroContainer = document.querySelector(".hero-sikura-container");

    if (!heroContainer) return;

    // Solo animar si el usuario no prefiere movimiento reducido
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    const elements = [
      heroContainer.querySelector(".sikura-pill"),
      heroContainer.querySelector(".sikura-title"),
      heroContainer.querySelector(".sikura-subtitle"),
      heroContainer.querySelector(".sikura-cta"),
    ];

    elements.forEach((el, index) => {
      if (el) {
        el.style.opacity = "0";
        el.style.transform = "translateY(20px)";

        setTimeout(
          () => {
            el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
            el.style.opacity = "1";
            el.style.transform = "translateY(0)";
          },
          100 * (index + 1),
        );
      }
    });
  }

  // ===========================
  // VIEWPORT HEIGHT FIX (Mobile)
  // ===========================
  function setVH() {
    const vh = window.innerHeight * 0.01;
    document.documentElement.style.setProperty("--vh", `${vh}px`);
  }

  setVH();
  window.addEventListener("resize", setVH);
  window.addEventListener("orientationchange", setVH);
})();
