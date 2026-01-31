// ===========================
// SIKURA LANDING - JAVASCRIPT
// ===========================

(function () {
  "use strict";

  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  function init() {
    initNavigation();
    initSmoothScroll();
    initScrollEffects();
    initAccessibility();
  }

  // ===========================
  // NAVIGATION
  // ===========================
  function initNavigation() {
    const navToggle = document.getElementById("navToggle");
    const navMenu = document.getElementById("navMenu");
    const navLinks = document.querySelectorAll(".sk-nav-links a");

    if (!navToggle || !navMenu) return;

    // Toggle menu
    navToggle.addEventListener("click", () => {
      const isOpen = navMenu.classList.toggle("active");
      navToggle.setAttribute("aria-expanded", isOpen);

      // Prevent body scroll when menu is open
      document.body.style.overflow = isOpen ? "hidden" : "";
    });

    // Close menu when clicking a link
    navLinks.forEach((link) => {
      link.addEventListener("click", () => {
        navMenu.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      });
    });

    // Close menu when clicking outside
    document.addEventListener("click", (e) => {
      if (!navMenu.contains(e.target) && !navToggle.contains(e.target)) {
        navMenu.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });

    // Close menu on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && navMenu.classList.contains("active")) {
        navMenu.classList.remove("active");
        navToggle.setAttribute("aria-expanded", "false");
        document.body.style.overflow = "";
      }
    });

    // Navbar scroll effect
    const nav = document.getElementById("sk-nav");
    let lastScroll = 0;

    window.addEventListener("scroll", () => {
      const currentScroll = window.pageYOffset;

      if (currentScroll > 100) {
        nav.style.boxShadow = "0 2px 8px rgba(0, 0, 0, 0.1)";
      } else {
        nav.style.boxShadow = "none";
      }

      lastScroll = currentScroll;
    });
  }

  // ===========================
  // SMOOTH SCROLL
  // ===========================
  function initSmoothScroll() {
    // Only if user hasn't specified reduced motion preference
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    document.querySelectorAll('a[href^="#"]').forEach((anchor) => {
      anchor.addEventListener("click", function (e) {
        const href = this.getAttribute("href");

        // Skip if href is just "#"
        if (href === "#") {
          e.preventDefault();
          return;
        }

        const target = document.querySelector(href);

        if (target) {
          e.preventDefault();

          const navHeight = document.querySelector(".sk-nav").offsetHeight;
          const targetPosition = target.offsetTop - navHeight - 20;

          window.scrollTo({
            top: targetPosition,
            behavior: "smooth",
          });
        }
      });
    });
  }

  // ===========================
  // SCROLL EFFECTS
  // ===========================
  function initScrollEffects() {
    // Skip if user prefers reduced motion
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      return;
    }

    // Observe elements for fade-in animation
    const observerOptions = {
      threshold: 0.1,
      rootMargin: "0px 0px -50px 0px",
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.style.opacity = "1";
          entry.target.style.transform = "translateY(0)";
        }
      });
    }, observerOptions);

    // Animate cards and sections
    const animateElements = document.querySelectorAll(
      ".sk-service-card, .sk-benefit-card, .sk-customer-logo",
    );

    animateElements.forEach((el) => {
      el.style.opacity = "0";
      el.style.transform = "translateY(30px)";
      el.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      observer.observe(el);
    });

    // Parallax effect on hero
    const hero = document.querySelector(".sk-hero");
    if (hero) {
      window.addEventListener("scroll", () => {
        const scrollY = window.pageYOffset;
        if (scrollY < window.innerHeight) {
          const heroContent = hero.querySelector(".sk-hero-content");
          if (heroContent) {
            const offset = scrollY * 0.3;
            heroContent.style.transform = `translateY(${offset}px)`;
            heroContent.style.opacity =
              1 - (scrollY / window.innerHeight) * 0.5;
          }
        }
      });
    }
  }

  // ===========================
  // ACCESSIBILITY
  // ===========================
  function initAccessibility() {
    // Detect keyboard navigation
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

    // Handle prefers-reduced-motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const handleMotionChange = (e) => {
      if (e.matches) {
        document.body.classList.add("reduce-motion");
      } else {
        document.body.classList.remove("reduce-motion");
      }
    };

    motionQuery.addEventListener("change", handleMotionChange);
    handleMotionChange(motionQuery);
  }

  // ===========================
  // BUTTON INTERACTIONS
  // ===========================
  function initButtons() {
    const buttons = document.querySelectorAll(".sk-btn");

    buttons.forEach((btn) => {
      btn.addEventListener("click", function (e) {
        // Visual feedback
        this.style.transform = "scale(0.98)";
        setTimeout(() => {
          this.style.transform = "";
        }, 150);
      });
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

  // Initialize buttons
  initButtons();
})();

// ===========================
// PERFORMANCE OPTIMIZATION
// ===========================

// Lazy load images (if needed in the future)
if ("IntersectionObserver" in window) {
  const imageObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        const img = entry.target;
        if (img.dataset.src) {
          img.src = img.dataset.src;
          img.removeAttribute("data-src");
          imageObserver.unobserve(img);
        }
      }
    });
  });

  document.querySelectorAll("img[data-src]").forEach((img) => {
    imageObserver.observe(img);
  });
}
