/**
 * @file app-core.js
 * @description Script inti untuk fungsionalitas website. Mengelola state, komponen, dan inisialisasi dasar.
 * @version 8.2.7 (Final Guest Pass Logic)
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
    lastScrollTop: 0,
  };

  // === KUNCI SESI UNIK ===
  const SESSION_KEY = "isAmaziaLoggedIn";
  const GUEST_PASS_KEY = "amaziaGuestPass"; // Kunci untuk tiket sementara

  // === PENGATURAN SESI & INAKTIVITAS ===
  const TIMEOUT_DURATION = 20 * 60 * 1000;
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
    sessionStorage.removeItem(SESSION_KEY);
    sessionStorage.removeItem(GUEST_PASS_KEY); // Hapus juga tiket jika ada
    sessionStorage.removeItem("lastActivityTimestamp");
    window.location.href = "index.html";
  }

  function initWelcomeScreen() {
    const overlay = document.getElementById("welcome-overlay");
    if (!overlay) return;
    const form = document.querySelector("#welcome-form");
    if (form) {
      const uname = document.querySelector("#uname");
      const isBanjarsari = document.querySelector("#is_banjarsari");
      const btnContainer = document.querySelector(".btn-container");
      const btn = document.querySelector("#login-btn");
      const msg = document.querySelector(".msg");

      if (!uname || !isBanjarsari || !btn || !form || !msg) return;

      btn.disabled = true;

      function shiftButton() {
        if (btn.disabled) {
          const positions = [
            "shift-left",
            "shift-top",
            "shift-right",
            "shift-bottom",
          ];
          const currentPosition = positions.find((dir) =>
            btn.classList.contains(dir)
          );
          const nextPosition =
            positions[
              (positions.indexOf(currentPosition) + 1) % positions.length
            ];
          btn.classList.remove(currentPosition || "no-shift");
          btn.classList.add(nextPosition);
        }
      }

      function showMsg() {
        const isEmpty = uname.value === "" || isBanjarsari.value === "";
        btn.classList.toggle("no-shift", !isEmpty);
        if (isEmpty) {
          btn.disabled = true;
          msg.style.color = "rgb(218 49 49)";
          msg.innerText =
            "Untuk Form Pastikan Semua Terisi⚠! Terserah Mau di Isi Apa Saja Bebas.";
        } else {
          msg.innerText =
            "Thank! Anda Bisa masuk My Blog Random Thoughts And Everything Else ";
          msg.style.color = "#92ff92";
          btn.disabled = false;
          btn.classList.add("no-shift");
        }
      }

      btnContainer.addEventListener("mouseover", shiftButton);
      form.addEventListener("input", showMsg);

      form.addEventListener("submit", async function (e) {
        e.preventDefault();
        if (btn.disabled) return;
        msg.innerText = "Processing...";
        msg.style.color = "#92ff92";
        btn.value = "Mengirim...";
        btn.disabled = true;
        const formData = new FormData(form);
        const FORMSPREE_URL = "https://formspree.io/f/mpwllonq";
        try {
          const response = await fetch(FORMSPREE_URL, {
            method: "POST",
            body: formData,
            headers: { Accept: "application/json" },
          });
          if (response.ok) {
            msg.innerText = "Anda di ijinkan Masuk! Anda akan dialihkan...";
            setTimeout(() => {
              sessionStorage.setItem(SESSION_KEY, "true");
              overlay.classList.add("hidden");
              startInactivityTracker();
            }, 1500);
          } else {
            throw new Error("Gagal mengirim data.");
          }
        } catch (error) {
          console.error("Formspree error:", error);
          msg.innerText = "Gagal mengirim data. Silakan coba lagi.";
          msg.style.color = "rgb(218 49 49)";
          btn.value = "Login";
          btn.disabled = false;
        }
      });
    }
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
    if (typeof tsParticles === "undefined") return;
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

  function handleMobileHeaderScroll() {
    const topHeader = document.querySelector(".mobile-top-header");
    if (!topHeader) return;
    let currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;
    if (currentScroll > state.lastScrollTop && currentScroll > 50) {
      topHeader.classList.add("hidden");
    } else {
      topHeader.classList.remove("hidden");
    }
    state.lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
  }

  // === MAIN INITIALIZER ===
  const initPage = () => {
    // === LOGIKA KONTROL AKSES FINAL ===
    const isLoggedIn = sessionStorage.getItem(SESSION_KEY);
    const hasGuestPass = sessionStorage.getItem(GUEST_PASS_KEY) === "true";
    const isIndexPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.includes("index.html");
    const isArticlePage = document.body.dataset.pageId === "artikel";

    // Aturan 1: Jika pengguna ada di halaman artikel dengan tiket, mereka boleh masuk.
    // Jika mereka pindah ke halaman LAIN (bukan artikel) tapi masih punya tiket,
    // tiketnya hangus dan mereka dipaksa login.
    if (hasGuestPass && !isArticlePage) {
      sessionStorage.removeItem(GUEST_PASS_KEY);
      logoutUser();
      return;
    }

    // Aturan 2: Pengguna akan dipaksa login JIKA SEMUA kondisi ini terpenuhi:
    // - Mereka BELUM login
    // - Mereka TIDAK di halaman index
    // - Mereka TIDAK punya tiket (atau tiketnya sudah hangus oleh Aturan 1)
    if (!isLoggedIn && !isIndexPage && !hasGuestPass) {
      logoutUser();
      return;
    }

    // Jika pengguna sudah login, tiket tidak diperlukan lagi.
    if (isLoggedIn) {
      sessionStorage.removeItem(GUEST_PASS_KEY);
      startInactivityTracker();
    } else if (isIndexPage) {
      // Jika belum login dan di halaman index, tampilkan form.
      const overlay = document.getElementById("welcome-overlay");
      if (overlay) overlay.classList.remove("hidden");
    }
    // === AKHIR LOGIKA KONTROL AKSES ===

    if (!document.querySelector(".mobile-top-header")) {
      const mobileHeader = document.createElement("header");
      mobileHeader.className = "mobile-top-header";
      mobileHeader.innerHTML = `
            <div class="mobile-header-container">
                <div class="logo">
                    <a href="index.html">
                        <img src="foto/logoneutrontransparan.png" alt="Logo The Great Apes" />
                        <div class="logo-text">
                            <h1>The Great Apes</h1>
                        </div>
                    </a>
                </div>
                <div class="social-media">
                     <a href="https://www.instagram.com/kartarbanjarr" target="_blank" aria-label="Instagram"><i class="fab fa-instagram"></i></a>
                     <a href="https://github.com/username-anda" target="_blank" aria-label="GitHub"><i class="fab fa-github"></i></a>
                     <a href="https://x.com/AmaziaKristanto" target="_blank" aria-label="Twitter"><i class="fab fa-twitter"></i></a>
                </div>
            </div>
        `;
      document.body.prepend(mobileHeader);
    }

    loadComponent("layout/header.html", "main-header", () => {
      const mainHeaderNav = document.querySelector("#main-header nav");
      if (mainHeaderNav && window.innerWidth <= 768) {
        document.querySelector("#main-header").append(mainHeaderNav);
      }
      setActiveNavLink();
    });

    loadComponent("layout/footer.html", "main-footer");

    if (document.getElementById("welcome-overlay")) {
      initWelcomeScreen();
    }

    if (window.innerWidth <= 768) {
      window.addEventListener("scroll", handleMobileHeaderScroll, {
        passive: true,
      });
    }

    initScrollAnimations();
    if (document.getElementById("particles-js")) {
      setTimeout(initParticles, 500);
    }

    const pageId = document.body.dataset.pageId;
    if (pageId && typeof App.initializers[pageId] === "function") {
      App.initializers[pageId]();
    }
  };

  return {
    init: initPage,
    fetchData,
    renderItems,
    initScrollAnimations,
    cache,
    initializers: {},
  };
})();

document.addEventListener("turbo:load", App.init);
