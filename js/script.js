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
