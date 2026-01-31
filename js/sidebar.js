(() => {
  const SIDEBAR_OPEN_CLASS = "sidebar-open";

  function getSidebar() {
    return document.getElementById("sidebar") || document.querySelector(".sidebar");
  }

  function getToggleButton() {
    return document.querySelector(".nav-toggle");
  }

  function ensureBackdrop() {
    let backdrop = document.querySelector(".sidebar-backdrop");
    if (backdrop) return backdrop;

    backdrop = document.createElement("div");
    backdrop.className = "sidebar-backdrop";
    backdrop.hidden = true;
    document.body.appendChild(backdrop);
    return backdrop;
  }

  function isMobileLayout() {
    return window.matchMedia("(max-width: 1023px)").matches;
  }

  function setOpen(isOpen) {
    const sidebar = getSidebar();
    if (!sidebar) return;

    const toggle = getToggleButton();
    const backdrop = ensureBackdrop();

    sidebar.classList.toggle("active", isOpen && isMobileLayout());
    document.body.classList.toggle(SIDEBAR_OPEN_CLASS, isOpen && isMobileLayout());

    if (toggle) toggle.setAttribute("aria-expanded", String(isOpen && isMobileLayout()));

    backdrop.hidden = !(isOpen && isMobileLayout());
    backdrop.classList.toggle("active", isOpen && isMobileLayout());
  }

  function toggle() {
    const sidebar = getSidebar();
    if (!sidebar) return;
    setOpen(!sidebar.classList.contains("active"));
  }

  function close() {
    setOpen(false);
  }

  function setActiveLink() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    const current = (location.pathname.split("/").pop() || "").toLowerCase();
    if (!current) return;

    const links = sidebar.querySelectorAll("a[href]");
    for (const link of links) {
      const href = (link.getAttribute("href") || "").split("#")[0].toLowerCase();
      if (!href) continue;
      if (href === current) {
        link.classList.add("active");
        link.setAttribute("aria-current", "page");
      } else {
        link.classList.remove("active");
        link.removeAttribute("aria-current");
      }
    }
  }

  function prioritizePersonalDevelopment() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    const menu = sidebar.querySelector(".menu");
    if (!menu) return;

    const groups = Array.from(menu.querySelectorAll(".menu-group"));
    const personalGroup = groups.find((group) => {
      const summaryText = (
        group.querySelector("summary")?.textContent || ""
      ).trim().toLowerCase();
      return summaryText === "desarrollo personal";
    });

    if (personalGroup && menu.firstElementChild !== personalGroup) {
      menu.insertBefore(personalGroup, menu.firstElementChild);
      personalGroup.classList.add("menu-priority");
    }
  }

  function init() {
    const sidebar = getSidebar();
    if (!sidebar) return;

    const toggle = getToggleButton();
    if (toggle) {
      toggle.setAttribute("aria-controls", sidebar.id || "sidebar");
      toggle.setAttribute("aria-expanded", "false");
    }

    const backdrop = ensureBackdrop();
    backdrop.addEventListener("click", close);

    window.addEventListener("keydown", (event) => {
      if (event.key === "Escape") close();
    });

    window.addEventListener("resize", () => {
      if (!isMobileLayout()) close();
    });

    prioritizePersonalDevelopment();
    setActiveLink();

    if (toggle) {
      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        toggle();
      });
    }
  }

  window.toggleMenu = toggle;
  window.toggleSidebar = toggle;
  window.closeMenu = close;

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
