(() => {
  const slot = document.getElementById("site-footer");
  if (!slot) return;
  const footerVersion = "20260304-1625";

  fetch(`./footer.html?v=${footerVersion}`)
    .then((res) => (res.ok ? res.text() : ""))
    .then((html) => {
      if (html) slot.innerHTML = html;
    })
    .catch(() => {});
})();

(() => {
  const menuBtn = document.querySelector("[data-menu]");
  const drawer = document.querySelector("[data-drawer]");

  if (menuBtn && drawer) {
    menuBtn.addEventListener("click", () => {
      const open = drawer.classList.toggle("open");
      menuBtn.setAttribute("aria-expanded", String(open));
    });

    drawer.querySelectorAll("a").forEach(a => {
      a.addEventListener("click", () => {
        drawer.classList.remove("open");
        menuBtn.setAttribute("aria-expanded", "false");
      });
    });
  }
})();

(() => {
  const grid = document.getElementById("mainGallery");
  const prev = document.querySelector("[data-gallery-prev]");
  const next = document.querySelector("[data-gallery-next]");
  if (!grid || !prev || !next) return;

  const step = () => {
    const first = grid.firstElementChild;
    if (!first) return grid.clientWidth * 0.9;
    return first.getBoundingClientRect().width + 10;
  };

  prev.addEventListener("click", () => {
    grid.scrollBy({ left: -step(), behavior: "smooth" });
  });

  next.addEventListener("click", () => {
    grid.scrollBy({ left: step(), behavior: "smooth" });
  });
})();

(() => {
  const drawer = document.querySelector("[data-quote-drawer]");
  if (!drawer) return;

  const closeButtons = drawer.querySelectorAll("[data-quote-close]");
  const panel = drawer.querySelector(".quoteDrawer__panel");

  let lastFocus = null;

  const open = () => {
    lastFocus = document.activeElement;

    drawer.hidden = false;
    // allow CSS transition to play
    requestAnimationFrame(() => drawer.classList.add("isOpen"));

    document.body.style.overflow = "hidden";

    // focus first input
    const firstInput = drawer.querySelector('.form--drawer input:not(.hp):not([type="hidden"]), .form--drawer select, .form--drawer textarea, .form--drawer button');
    if (firstInput) window.setTimeout(() => firstInput.focus(), 0);
  };

  const close = () => {
    drawer.classList.remove("isOpen");
    document.body.style.overflow = "";

    // wait for slide-out to finish then hide
    window.setTimeout(() => {
      drawer.hidden = true;
      if (lastFocus && typeof lastFocus.focus === "function") lastFocus.focus();
    }, 220);
  };

  document.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-open-quote]");
    if (!btn) return;
    // keep href as fallback, but prevent jump when JS is active
    e.preventDefault();
    open();
  });

  closeButtons.forEach((btn) => btn.addEventListener("click", close));

  // Click outside panel closes (backdrop already does, but extra safety)
  drawer.addEventListener("click", (e) => {
    if (e.target === drawer) close();
  });

  // ESC closes
  window.addEventListener("keydown", (e) => {
    if (!drawer.hidden && e.key === "Escape") close();
  });

  // Light focus trap: keep tab inside panel while open
  window.addEventListener("keydown", (e) => {
    if (drawer.hidden || e.key !== "Tab") return;

    const focusables = panel.querySelectorAll(
      'a[href], button:not([disabled]), textarea, input, select, [tabindex]:not([tabindex="-1"])'
    );
    const list = Array.from(focusables).filter(el => el.offsetParent !== null);
    if (!list.length) return;

    const first = list[0];
    const last = list[list.length - 1];

    if (e.shiftKey && document.activeElement === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && document.activeElement === last) {
      e.preventDefault();
      first.focus();
    }
  });

  // file hint inside drawer
  drawer.querySelectorAll('input[type="file"]').forEach((input) => {
    const hint = input.parentElement?.querySelector("[data-filehint]");
    if (!hint) return;
    input.addEventListener("change", () => {
      const count = input.files ? input.files.length : 0;
      hint.textContent = count ? `${count} file${count === 1 ? "" : "s"} selected` : "No files selected";
    });
  });

})();

(() => {
  document.querySelectorAll(".form--drawer").forEach((form) => {
    form.addEventListener("submit", async (event) => {
      event.preventDefault();

      const status = form.querySelector("[data-status]");
      const submit = form.querySelector('button[type="submit"]');
      const files = form.querySelector('input[type="file"]')?.files;
      const formData = new FormData(form);

      const payload = Object.fromEntries(formData.entries());
      payload.pageUrl = window.location.href;
      payload.photoNames = files ? Array.from(files).map((file) => file.name) : [];

      if (status) {
        status.textContent = "Sending your request...";
        status.classList.remove("form__status--error", "form__status--success");
      }
      if (submit) submit.disabled = true;

      try {
        const response = await fetch(form.action, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = await response.json().catch(() => ({}));

        if (!response.ok || !result.ok) {
          throw new Error(result.message || "Could not send the quote request.");
        }

        if (status) {
          status.textContent = "Thanks. Your request was sent.";
          status.classList.add("form__status--success");
        }
        window.location.href = "/thank-you.html";
      } catch (error) {
        if (status) {
          status.textContent = error.message || "Something went wrong. Please call us.";
          status.classList.add("form__status--error");
        }
        if (submit) submit.disabled = false;
      }
    });
  });
})();
