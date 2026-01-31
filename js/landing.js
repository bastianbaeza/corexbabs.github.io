(() => {
  const header = document.getElementById("site-header");
  const toggle = document.getElementById("nav-toggle");
  const menu = document.getElementById("nav-menu");
  const navLinks = Array.from(
    document.querySelectorAll("#nav-links a[href^=\"#\"]")
  );
  const scrollLinks = Array.from(
    document.querySelectorAll('a[href^="#"]:not([href="#"])')
  );
  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  );

  const setHeaderState = () => {
    if (!header) return;
    header.classList.toggle("is-scrolled", window.scrollY > 8);
  };

  setHeaderState();
  window.addEventListener("scroll", setHeaderState, { passive: true });

  if (toggle && menu) {
    toggle.addEventListener("click", () => {
      const isOpen = menu.classList.toggle("is-open");
      toggle.setAttribute("aria-expanded", isOpen ? "true" : "false");
    });
  }

  scrollLinks.forEach((link) => {
    link.addEventListener("click", (event) => {
      const targetId = link.getAttribute("href");
      const target = targetId ? document.querySelector(targetId) : null;

      if (menu?.classList.contains("is-open")) {
        menu.classList.remove("is-open");
        toggle?.setAttribute("aria-expanded", "false");
      }

      if (!target) return;

      event.preventDefault();

      if (prefersReducedMotion.matches) {
        window.location.hash = targetId;
        return;
      }

      target.scrollIntoView({ behavior: "smooth", block: "start" });
      history.pushState(null, "", targetId);
    });
  });

  const setActiveLink = (id) => {
    navLinks.forEach((link) => {
      link.classList.toggle("is-active", link.getAttribute("href") === `#${id}`);
    });
  };

  if ("IntersectionObserver" in window && navLinks.length) {
    const observedSections = navLinks
      .map((link) => document.querySelector(link.getAttribute("href")))
      .filter(Boolean);

    const spyObserver = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          setActiveLink(visible[0].target.id);
        }
      },
      { rootMargin: "-25% 0px -55% 0px", threshold: [0.15, 0.4, 0.6] }
    );

    observedSections.forEach((section) => spyObserver.observe(section));
  }

  const revealItems = document.querySelectorAll(".reveal");
  if (revealItems.length) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    revealItems.forEach((item, index) => {
      item.style.transitionDelay = `${Math.min(index * 0.08, 0.4)}s`;
      observer.observe(item);
    });
  }
})();
