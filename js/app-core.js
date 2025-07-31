/**
 * @file app-core.js
 * @description Script inti untuk fungsionalitas website. Mengelola state, komponen, dan inisialisasi dasar.
 * @version 8.0.0 (Optimized with Code Splitting & Turbo)
 */

const App = (() => {
  // === STATE & CACHE ===
  const cache = new Map();
  const state = {
    kegiatan: [],
    galeri: {},
    informasi: [],
    pengurus: [],
    kontak: [],
  };

  // === PENGATURAN SESI & INAKTIVITAS ===
  const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 menit
  let inactivityTimer;

  function resetInactivityTimer() {
    clearTimeout(inactivityTimer);
    inactivityTimer = setTimeout(logoutUser, TIMEOUT_DURATION);
    sessionStorage.setItem("lastActivityTimestamp", Date.now());
  }

  function startInactivityTracker() {
    const events = [
      "mousemove",
      "mousedown",
      "keypress",
      "scroll",
      "touchstart",
    ];
    events.forEach((event) => {
      window.addEventListener(event, resetInactivityTimer, { passive: true });
    });
    resetInactivityTimer();
  }

  function logoutUser() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("lastActivityTimestamp");
    window.location.href = "index.html";
  }

  function initWelcomeScreen() {
    const overlay = document.getElementById("welcome-overlay");
    if (!overlay) return;

    const form = document.getElementById("welcome-form");
    const messageEl = document.getElementById("form-message");
    const submitButton = document.getElementById("submit-button");
    const FORMSPREE_URL = "https://formspree.io/f/mpwllonq";

    const isIndexPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.includes("index.html");

    if (sessionStorage.getItem("isLoggedIn")) {
      overlay.classList.add("hidden");
      startInactivityTracker();
    } else if (isIndexPage) {
      overlay.classList.remove("hidden");
    } else {
      logoutUser();
    }

    form.addEventListener("submit", async function (e) {
      e.preventDefault();
      const formData = new FormData(form);
      const data = Object.fromEntries(formData.entries());
      messageEl.textContent = "Mengirim data...";
      messageEl.classList.remove("hidden", "success", "error");
      submitButton.disabled = true;

      try {
        const response = await fetch(FORMSPREE_URL, {
          method: "POST",
          body: JSON.stringify(data),
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        });
        if (response.ok) {
          messageEl.textContent = "Terima kasih! Anda akan dialihkan...";
          messageEl.classList.add("success");
          sessionStorage.setItem("isLoggedIn", "true");
          setTimeout(() => {
            overlay.classList.add("hidden");
            startInactivityTracker();
          }, 1500);
        } else {
          throw new Error("Gagal mengirim data. Coba lagi.");
        }
      } catch (error) {
        messageEl.textContent = error.message;
        messageEl.classList.add("error");
        submitButton.disabled = false;
      }
    });
  }

  // === UTILITIES & HELPERS (SHARED) ===
  const loadComponent = async (url, elementId, callback) => {
    const element = document.getElementById(elementId);
    if (!element) return;
    try {
      if (cache.has(url)) {
        element.innerHTML = cache.get(url);
      } else {
        const response = await fetch(url);
        if (!response.ok)
          throw new Error(`Gagal memuat ${url}: Status ${response.status}`);
        const content = await response.text();
        cache.set(url, content);
        element.innerHTML = content;
      }
      if (callback) callback();
    } catch (error) {
      console.error(error);
      element.innerHTML = `<p style="color: red; text-align: center;">Gagal memuat komponen.</p>`;
    }
  };

  const fetchData = async (key, url) => {
    if (
      state[key] &&
      (state[key].length > 0 || Object.keys(state[key]).length > 0)
    ) {
      return state[key];
    }
    try {
      if (cache.has(url)) {
        state[key] = cache.get(url);
        return state[key];
      }
      const response = await fetch(url);
      if (!response.ok)
        throw new Error(`HTTP error! status: ${response.status}`);
      const data = await response.json();
      cache.set(url, data);
      state[key] = data;
      return data;
    } catch (error) {
      console.error(`Gagal memuat data dari ${url}:`, error);
      return null;
    }
  };

  const renderItems = (container, items, templateFn, errorMessage) => {
    if (!container) return;
    if (!items || items.length === 0) {
      container.innerHTML = `<p>${errorMessage}</p>`;
      return;
    }
    const fragment = document.createDocumentFragment();
    items.forEach((item) => {
      const element = document.createElement("div");
      element.innerHTML = templateFn(item);
      while (element.firstChild) {
        fragment.appendChild(element.firstChild);
      }
    });
    container.innerHTML = "";
    container.appendChild(fragment);
    initScrollAnimations();
  };

  const initScrollAnimations = () => {
    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );
    document
      .querySelectorAll(".animate-on-scroll:not(.visible)")
      .forEach((el) => observer.observe(el));
  };

  function setActiveNavLink() {
    const currentLocation =
      window.location.pathname.split("/").pop() || "index.html";
    const navContainer = document.querySelector("nav ul");
    if (!navContainer) return;
    let activeLinkElement = null;
    navContainer.querySelectorAll("a").forEach((link) => {
      const parentLi = link.parentElement;
      const linkPath = link.getAttribute("href");
      parentLi.classList.remove("active");
      const isCurrentPage = linkPath === currentLocation;
      const isArtikelPageAndKegiatanLink =
        currentLocation === "artikel.html" && linkPath === "kegiatan.html";
      if (isCurrentPage || isArtikelPageAndKegiatanLink) {
        parentLi.classList.add("active");
        activeLinkElement = parentLi;
      }
    });
    if (activeLinkElement && window.innerWidth <= 768) {
      const scrollLeftPosition =
        activeLinkElement.offsetLeft -
        navContainer.offsetWidth / 2 +
        activeLinkElement.offsetWidth / 2;
      navContainer.scrollTo({ left: scrollLeftPosition, behavior: "smooth" });
    }
  }

  function initParticles() {
    if (typeof tsParticles === "undefined") {
      console.warn(
        "tsParticles library not loaded. Skipping particle initialization."
      );
      return;
    }
    tsParticles.load("particles-js", {
      particles: {
        number: { value: 50, density: { enable: true, value_area: 800 } },
        color: { value: "#ffffff" },
        shape: { type: "circle" },
        opacity: {
          value: 0.4,
          random: true,
          anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
        },
        size: { value: 2, random: true },
        line_linked: {
          enable: true,
          distance: 150,
          color: "#ffffff",
          opacity: 0.2,
          width: 1,
        },
        move: {
          enable: true,
          speed: 1,
          direction: "none",
          random: false,
          straight: false,
          out_mode: "out",
        },
      },
      interactivity: {
        detect_on: "canvas",
        events: {
          onhover: { enable: true, mode: "repulse" },
          onclick: { enable: true, mode: "push" },
          resize: true,
        },
        modes: {
          repulse: { distance: 100, duration: 0.4 },
          push: { particles_nb: 4 },
        },
      },
      retina_detect: true,
    });
  }

  // === MAIN INITIALIZER ===
  const initPage = () => {
    const isIndexPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.includes("index.html");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (!isLoggedIn && !isIndexPage) {
      logoutUser();
      return;
    }

    loadComponent("layout/header.html", "main-header", setActiveNavLink);
    loadComponent("layout/footer.html", "main-footer");

    if (document.getElementById("welcome-overlay")) {
      initWelcomeScreen();
    } else if (isLoggedIn) {
      startInactivityTracker();
    }

    initScrollAnimations();
    if (document.getElementById("particles-js")) {
      setTimeout(initParticles, 500);
    }

    // Jalankan inisialisasi spesifik halaman
    const pageId = document.body.dataset.pageId;
    if (pageId && typeof App.initializers[pageId] === "function") {
      App.initializers[pageId]();
    }
  };

  // expose functions to be used by other files
  return {
    init: initPage,
    fetchData,
    renderItems,
    initScrollAnimations,
    cache,
    initializers: {}, // Namespace for page-specific initializers
  };
})();

// Event listener untuk Turbo
document.addEventListener("turbo:load", App.init);
