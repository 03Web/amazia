// Menunggu seluruh halaman dimuat sebelum menjalankan script
document.addEventListener("DOMContentLoaded", function () {
  /**
   * =============================================
   * FUNGSI UTAMA UNTUK INISIALISASI
   * =============================================
   */
  const initApp = () => {
    // 1. Memuat komponen berulang (header & footer)
    loadComponent("#main-header", "_header.html", initNav); // initNav dijalankan setelah header dimuat
    loadComponent("#main-footer", "_footer.html");

    // 2. Menjalankan partikel animasi di background
    initParticles();

    // 3. Menjalankan fitur yang spesifik untuk halaman tertentu
    initPageSpecificFeatures();
  };

  /**
   * =============================================
   * BAGIAN 1: MEMUAT KOMPONEN DINAMIS (HEADER/FOOTER)
   * =============================================
   */
  const loadComponent = (selector, url, callback) => {
    fetch(url)
      .then((response) => {
        if (!response.ok)
          throw new Error("Network response was not ok " + response.statusText);
        return response.text();
      })
      .then((data) => {
        const element = document.querySelector(selector);
        if (element) {
          element.innerHTML = data;
          if (callback) callback(); // Jalankan callback jika ada
        }
      })
      .catch((error) => console.error("Error loading component:", error));
  };

  /**
   * =============================================
   * BAGIAN 2: INISIALISASI FITUR GLOBAL
   * =============================================
   */
  // Inisialisasi Navigasi Mobile (Hamburger Menu)
  const initNav = () => {
    const menuToggle = document.getElementById("menu-toggle");
    const nav = document.querySelector(".main-nav");

    if (menuToggle && nav) {
      menuToggle.addEventListener("click", () => {
        nav.classList.toggle("active");
        const icon = menuToggle.querySelector("i");
        icon.classList.toggle("fa-bars");
        icon.classList.toggle("fa-times");
      });
    }
  };

  // Inisialisasi Animasi Partikel Latar Belakang
  const initParticles = () => {
    if (
      typeof tsParticles !== "undefined" &&
      document.getElementById("particles-js")
    ) {
      tsParticles.load("particles-js", {
        // ... (konfigurasi partikel Anda, salin dari file asli)
        particles: {
          number: { value: 80, density: { enable: true, value_area: 800 } },
          color: { value: "#ffffff" },
          shape: { type: "circle" },
          opacity: {
            value: 0.5,
            random: true,
            anim: { enable: true, speed: 1, opacity_min: 0.1, sync: false },
          },
          size: { value: 2, random: true },
          line_linked: {
            enable: true,
            distance: 150,
            color: "#ffffff",
            opacity: 0.4,
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
  };

  /**
   * =============================================
   * BAGIAN 3: INISIALISASI FITUR SPESIFIK HALAMAN
   * =============================================
   */
  const initPageSpecificFeatures = () => {
    // Jalankan sorting HANYA jika ada elemen sorter di halaman tersebut
    if (document.getElementById("kegiatan-sorter")) {
      initSorter(".kegiatan-list", ".kegiatan-item", "kegiatan-sorter");
    }
    if (document.getElementById("video-sorter")) {
      initSorter("#video-grid", ".video-item", "video-sorter");
    }

    // Jalankan animasi scroll HANYA jika ada elemen yang perlu dianimasikan
    if (document.querySelector(".animate-on-scroll")) {
      initScrollAnimation();
    }
  };

  // Fungsi untuk Sorting (Kegiatan & Video)
  const initSorter = (containerSelector, itemSelector, sorterId) => {
    const sorter = document.getElementById(sorterId);
    const container = document.querySelector(containerSelector);

    sorter.addEventListener("change", function () {
      const sortOrder = this.value;
      const items = Array.from(container.querySelectorAll(itemSelector));

      items.sort((a, b) => {
        const dateA = new Date(a.dataset.tanggal);
        const dateB = new Date(b.dataset.tanggal);
        return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
      });

      // Kosongkan container dan isi kembali dengan item yang sudah diurutkan
      container.innerHTML = "";
      items.forEach((item) => container.appendChild(item));
    });
  };

  // Fungsi untuk Animasi saat Scroll
  const initScrollAnimation = () => {
    const elementsToAnimate = document.querySelectorAll(
      ".container h2, .container p, .container h3, .visi-misi-container, .struktur-container, .gallery-grid, .kegiatan-item, .info-item, .kontak-grid"
    );

    // Tambahkan class awal untuk persiapan animasi
    elementsToAnimate.forEach((el) => el.classList.add("animate-on-scroll"));

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    elementsToAnimate.forEach((el) => observer.observe(el));
  };

  /**
   * =============================================
   * MULAI APLIKASI
   * =============================================
   */
  initApp();
});
