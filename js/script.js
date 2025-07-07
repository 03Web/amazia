tsParticles.load("particles-js", {
  particles: {
    number: {
      value: 80, // GANTI ANGKA INI untuk menambah/mengurangi jumlah bintang
      density: {
        enable: true,
        value_area: 800,
      },
    },
    color: {
      value: "#ffffff", // Warna partikel
    },
    shape: {
      type: "circle", // Bentuk partikel
    },
    opacity: {
      value: 0.5,
      random: true,
      anim: {
        enable: true,
        speed: 1,
        opacity_min: 0.1,
        sync: false,
      },
    },
    size: {
      value: 2, // Ukuran partikel
      random: true,
      anim: {
        enable: false,
      },
    },
    line_linked: {
      enable: true,
      distance: 150,
      color: "#ffffff", // Warna garis antar partikel
      opacity: 0.4,
      width: 1,
    },
    move: {
      enable: true,
      speed: 1, // GANTI ANGKA INI untuk kecepatan gerak partikel
      direction: "none",
      random: false,
      straight: false,
      out_mode: "out",
      bounce: false,
      attract: {
        enable: false,
        rotateX: 600,
        rotateY: 1200,
      },
    },
  },
  interactivity: {
    detect_on: "canvas",
    events: {
      onhover: {
        enable: true,
        mode: "repulse", // Partikel akan menjauh saat kursor mendekat
      },
      onclick: {
        enable: true,
        mode: "push", // Menambah partikel baru saat diklik
      },
      resize: true,
    },
    modes: {
      repulse: {
        distance: 100,
        duration: 0.4,
      },
      push: {
        particles_nb: 4,
      },
    },
  },
  retina_detect: true,
});
/* ========================================= */
/* SCRIPT BARU & BENAR UNTUK MENU RESPONSIVE */
/* ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("header nav");

  // Cek apakah elemen ada untuk menghindari error
  if (menuToggle && nav) {
    menuToggle.addEventListener("click", function () {
      // Toggle kelas 'active' pada navigasi
      nav.classList.toggle("active");

      // Ganti ikon hamburger menjadi 'X' saat menu terbuka
      const icon = menuToggle.querySelector("i");
      if (nav.classList.contains("active")) {
        icon.classList.remove("fa-bars");
        icon.classList.add("fa-times");
      } else {
        icon.classList.remove("fa-times");
        icon.classList.add("fa-bars");
      }
    });
  }
});
/* ========================================= */
/* SCRIPT BARU UNTUK ANIMASI ON-SCROLL       */
/* ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  // Opsi untuk Intersection Observer
  // threshold: 0.1 berarti callback akan berjalan saat 10% elemen terlihat
  const observerOptions = {
    threshold: 0.1,
  };

  // Callback function yang akan dijalankan saat elemen diamati
  const observerCallback = (entries, observer) => {
    entries.forEach((entry) => {
      // Jika elemen masuk ke dalam viewport
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        // Setelah animasi berjalan, kita tidak perlu mengamatinya lagi
        observer.unobserve(entry.target);
      }
    });
  };

  // Buat observer baru
  const observer = new IntersectionObserver(observerCallback, observerOptions);

  // Pilih semua elemen yang ingin diberi animasi
  // Anda bisa menambahkan lebih banyak selector di sini
  const elementsToAnimate = document.querySelectorAll(
    ".container h2, .container p, .container h3, .visi-misi-container, .struktur-container, .gallery-grid, .kegiatan-item, .info-item, .kontak-grid"
  );

  // Tambahkan kelas .animate-on-scroll dan mulai amati setiap elemen
  elementsToAnimate.forEach((el) => {
    el.classList.add("animate-on-scroll");
    observer.observe(el);
  });
});
/* ========================================= */
/* SCRIPT BARU UNTUK FITUR SORTING           */
/* ========================================= */
document.addEventListener("DOMContentLoaded", function () {
  // Fungsi umum untuk mengurutkan item
  function sortItems(containerSelector, itemSelector, sorterId) {
    const sorter = document.getElementById(sorterId);
    const container = document.querySelector(containerSelector);

    // Cek apakah elemen ada di halaman ini
    if (!sorter || !container) {
      return;
    }

    sorter.addEventListener("change", function () {
      const sortOrder = this.value;
      const items = Array.from(container.querySelectorAll(itemSelector));

      items.sort(function (a, b) {
        const dateA = new Date(a.getAttribute("data-tanggal"));
        const dateB = new Date(b.getAttribute("data-tanggal"));

        if (sortOrder === "terbaru") {
          return dateB - dateA; // Urutkan dari tanggal terbaru ke terlama
        } else {
          return dateA - dateB; // Urutkan dari tanggal terlama ke terbaru
        }
      });

      // Hapus item yang ada dari kontainer
      container.innerHTML = "";

      // Tambahkan kembali item yang sudah diurutkan
      items.forEach(function (item) {
        container.appendChild(item);
      });
    });
  }

  // Terapkan fungsi sorting pada halaman Kegiatan
  sortItems(".kegiatan-list", ".kegiatan-item", "kegiatan-sorter");

  // Terapkan fungsi sorting pada halaman Galeri (untuk video)
  sortItems("#video-grid", ".video-item", "video-sorter");
});
