(function () {
  const MAIN_APPS = [
    { key: "home", label: "Home", href: "start.html" },
    { key: "business", label: "Business", href: "business.html" },
    { key: "marketing", label: "Marketing", href: "marketing.html" },
    { key: "crm", label: "CRM", href: "crm.html" },
    { key: "docs", label: "Docs", href: "docs.html" },
    { key: "operations", label: "Operations", href: "operations.html" },
    { key: "accounting", label: "Accounting", href: "accounting.html" },
    { key: "legal", label: "Legal", href: "legal.html" },
    { key: "notes", label: "Notes", href: "notes.html" },
    { key: "settings", label: "Settings", href: "settings.html" },
  ];

  const DEFAULT_SIDE = {
    home: [{ label: "Dashboard", href: "start.html" }],
    business: [{ label: "Overview", href: "business.html" }],
    marketing: [{ label: "Overview", href: "marketing.html" }],
    crm: [
      { label: "Leads", href: "crm.html" },
      { label: "Accounts", href: "accounts.html" },
      { label: "Contacts", href: "contacts.html" },
      { label: "Deals", href: "deals.html" },
      { label: "Activities", href: "activities.html" },
    ],
    docs: [{ label: "Overview", href: "docs.html" }],
    operations: [{ label: "Overview", href: "operations.html" }],
    accounting: [{ label: "Overview", href: "accounting.html" }],
    legal: [{ label: "Overview", href: "legal.html" }],
    notes: [{ label: "Overview", href: "notes.html" }],
    settings: [{ label: "Workspace", href: "settings.html" }],
  };

  function buildHeader(activeKey) {
    const links = MAIN_APPS.map((app) => {
      const cls = ["toplink"];
      if (app.key === activeKey) cls.push("active");
      return `<a class="${cls.join(" ")}" href="${app.href}">${app.label}</a>`;
    }).join("");
    return `
      <div class="inner">
        <button class="hamburger" aria-label="Menu" id="menuToggle">☰</button>
        <div class="brand"><span class="dot"></span> TUSK-OS</div>
        <nav class="topnav">${links}</nav>
      </div>
    `;
  }

  function buildSide(sideItems, currentHref) {
    const items = (sideItems || [])
      .map((it) => {
        const active =
          (location.pathname.split("/").pop() || "") === it.href
            ? "active"
            : "";
        return `<a class="sidelink ${active}" href="${it.href}">${it.label}</a>`;
      })
      .join("");
    return `<div class="sidemenu-inner">${items}</div>`;
  }

  function wrapLayout() {
    // Find existing header and main
    let header = document.querySelector("header.app-header");
    let main = document.querySelector("main.container");
    if (!header) {
      header = document.createElement("header");
      header.className = "app-header";
      document.body.insertBefore(header, document.body.firstChild);
    }
    if (!main) {
      main = document.createElement("main");
      main.className = "container";
      document.body.appendChild(main);
    }

    // Create shell
    const shell = document.createElement("div");
    shell.className = "app-shell";

    // Move header to shell
    header.parentNode.insertBefore(shell, header);
    shell.appendChild(header);

    // Create sidebar + content wrapper
    const aside = document.createElement("aside");
    aside.className = "sidemenu";
    const contentWrap = document.createElement("div");
    contentWrap.className = "app-content";

    // Move existing main into contentWrap
    main.parentNode.removeChild(main);
    contentWrap.appendChild(main);

    // Add to shell
    shell.appendChild(aside);
    shell.appendChild(contentWrap);

    return { header, aside, contentWrap, main };
  }

  function initLayout(opts) {
    const activeMain = (opts && opts.activeMain) || "home";
    const side = (opts && opts.side) || DEFAULT_SIDE[activeMain] || [];

    const { header, aside } = wrapLayout();
    header.innerHTML = buildHeader(activeMain);
    aside.innerHTML = buildSide(side);

    // Set CSS var for header height once content is placed
    requestAnimationFrame(() => {
      const h = header.getBoundingClientRect().height;
      document.documentElement.style.setProperty("--header-h", h + "px");
    });

    // Mobile toggle
    const toggle = header.querySelector("#menuToggle");
    if (toggle) {
      toggle.addEventListener("click", () => {
        document.body.classList.toggle("menu-open");
      });
    }

    // Close menu on nav click (mobile)
    aside.addEventListener("click", (e) => {
      const a = e.target.closest("a");
      if (a) document.body.classList.remove("menu-open");
    });
  }

  window.TuskLayout = { initLayout, DEFAULT_SIDE };
})();
