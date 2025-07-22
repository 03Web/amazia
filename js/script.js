/**
 * @file script.js
 * @description Script utama untuk fungsionalitas website Karang Taruna Banjarsari.
 * @author Anda (atau Partner Coding)
 * @version 3.1.0 (Versi dengan Slideshow Dinamis)
 */

document.addEventListener("DOMContentLoaded", () => {
  loadComponent("layout/header.html", "main-header", initHeaderFeatures);
  loadComponent("layout/footer.html", "main-footer");

  if (document.getElementById("particles-js")) {
    initParticles();
  }

  initScrollAnimations();
  initPageSpecificScripts();
});

async function loadComponent(url, elementId, callback) {
  const element = document.getElementById(elementId);
  if (!element) return;

  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`Gagal memuat komponen: ${url}`);
    const content = await response.text();
    element.innerHTML = content;
    if (callback) callback();
  } catch (error) {
    console.error(error);
    element.innerHTML = `<p style="color: red; text-align: center;">Gagal memuat ${elementId}.</p>`;
  }
}

function initPageSpecificScripts() {
  const path = window.location.pathname.split("/").pop();

  if (document.getElementById("kegiatan-list")) {
    initKegiatanPage();
  }
  if (document.getElementById("album-grid")) {
    initGaleriPage();
  }
  if (document.getElementById("info-list")) {
    initInformasiPage();
  }
  if (path === "artikel.html") {
    initArtikelPage();
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error("Gagal memuat data:", error);
    return null;
  }
}

// --- FUNGSI SPESIFIK HALAMAN ---

async function initArtikelPage() {
  const container = document.getElementById("artikel-dinamis-container");
  if (!container) return;

  const params = new URLSearchParams(window.location.search);
  const slug = params.get("slug");

  if (!slug) {
    container.innerHTML =
      "<p style='text-align: center;'>Artikel tidak valid atau tidak ditemukan.</p>";
    return;
  }

  const contentUrl = `konten-kegiatan/${slug}.html`;

  try {
    const response = await fetch(contentUrl);
    if (!response.ok)
      throw new Error(`File konten tidak ditemukan: ${contentUrl}`);
    const content = await response.text();

    container.innerHTML = content;

    // Panggil fungsi untuk mengaktifkan slideshow
    initSlideshow();

    const judulArtikel = container.querySelector("h2")?.textContent;
    if (judulArtikel) {
      document.title = `${judulArtikel} - Karang Taruna Banjarsari`;
    }
  } catch (error) {
    console.error("Gagal memuat artikel:", error);
    container.innerHTML = `<p style="color: red; text-align: center;">Maaf, terjadi kesalahan saat memuat artikel. Silakan coba lagi.</p>`;
  }
}

async function initKegiatanPage() {
  const container = document.getElementById("kegiatan-list");
  const data = await fetchData("data/kegiatan.json");

  if (!data || !container) {
    container.innerHTML = "<p>Gagal memuat daftar kegiatan.</p>";
    return;
  }

  const render = (items) => {
    container.innerHTML = items
      .map(
        (item) => `
            <article class="kegiatan-item animate-on-scroll" data-tanggal="${
              item.tanggal
            }">
                <div class="kegiatan-foto">
                    <img src="${item.gambar}" alt="${
          item.judul
        }" loading="lazy">
                </div>
                <div class="kegiatan-konten">
                    <h3>${item.judul}</h3>
                    <p class="kegiatan-meta">
                        <i class="fas fa-calendar-alt"></i> ${new Date(
                          item.tanggal
                        ).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                    </p>
                    <p>${item.deskripsi}</p>
                    <a href="${
                      item.link
                    }" class="kegiatan-tombol">Baca Selengkapnya</a>
                </div>
            </article>
        `
      )
      .join("");
    initScrollAnimations();
  };

  render(data);
  initSorter(data, render, "kegiatan-sorter");
}

async function initGaleriPage() {
  const data = await fetchData("data/galeri.json");
  if (!data) return;

  const albumContainer = document.getElementById("album-grid");
  if (albumContainer && data.albumFoto) {
    albumContainer.innerHTML = data.albumFoto
      .map(
        (album) => `
            <div class="album-item animate-on-scroll">
                <a href="${album.foto[0].src}" data-lightbox="${
          album.id
        }" data-title="${album.foto[0].title}" class="album-cover">
                    <img src="${album.cover}" alt="${
          album.judul
        }" loading="lazy">
                    <div class="album-info">
                        <h4>${album.judul}</h4>
                        <p>${album.deskripsi}</p>
                    </div>
                </a>
                ${album.foto
                  .slice(1)
                  .map(
                    (foto) =>
                      `<a href="${foto.src}" data-lightbox="${album.id}" data-title="${foto.title}"></a>`
                  )
                  .join("")}
            </div>
        `
      )
      .join("");
  }

  const videoContainer = document.getElementById("video-grid");
  if (videoContainer && data.dokumentasiVideo) {
    const renderVideos = (items) => {
      videoContainer.innerHTML = items
        .map(
          (video) => `
                <div class="gallery-item video-item animate-on-scroll" data-tanggal="${video.tanggal}">
                    <iframe src="${video.src}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
                </div>
            `
        )
        .join("");
      initScrollAnimations();
    };
    renderVideos(data.dokumentasiVideo);
    initSorter(data.dokumentasiVideo, renderVideos, "video-sorter");
  }
}

async function initInformasiPage() {
  const container = document.getElementById("info-list");
  const data = await fetchData("data/informasi.json");

  if (!data || !container) {
    container.innerHTML = "<p>Gagal memuat informasi.</p>";
    return;
  }

  container.innerHTML = data
    .map(
      (info) => `
        <div class="info-item animate-on-scroll">
            <div class="info-header">
                <h3>${info.judul}</h3>
                <span class="info-tag ${info.tag_class}">${info.tag}</span>
            </div>
            <p class="info-meta">
                <i class="fas fa-calendar-alt"></i> Diposting pada ${new Date(
                  info.tanggal
                ).toLocaleDateString("id-ID", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })}
            </p>
            <div class="info-body">
                ${info.konten}
            </div>
        </div>
    `
    )
    .join("");
  initScrollAnimations();
}

// --- FUNGSI UTILITAS / HELPERS ---

function initSlideshow() {
  const slideshowContainers = document.querySelectorAll(".slideshow-container");

  slideshowContainers.forEach((container) => {
    const slider = container.querySelector(".slideshow-slider");
    if (slider) {
      const slides = slider.children;
      if (slides.length > 1) {
        let currentIndex = 0;
        if (slider.dataset.intervalId) {
          clearInterval(slider.dataset.intervalId);
        }
        const intervalId = setInterval(() => {
          currentIndex = (currentIndex + 1) % slides.length;
          slider.style.transform = `translateX(-${currentIndex * 100}%)`;
        }, 3000); // Ganti gambar setiap 3 detik
        slider.dataset.intervalId = intervalId;
      }
    }
  });
}

function initHeaderFeatures() {
  initMobileMenu();
  setActiveNavLink();
}

function initMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("header nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", (e) => {
      e.stopPropagation();
      nav.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    });
    document.addEventListener("click", (e) => {
      if (nav.classList.contains("active") && !nav.contains(e.target)) {
        nav.classList.remove("active");
        menuToggle.querySelector("i").classList.remove("fa-times");
        menuToggle.querySelector("i").classList.add("fa-bars");
      }
    });
  }
}

function setActiveNavLink() {
  const currentLocation = window.location.pathname.split("/").pop();
  const navLinks = document.querySelectorAll("header nav a");
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    if (
      linkPath === currentLocation ||
      (currentLocation === "artikel.html" && linkPath === "kegiatan.html")
    ) {
      link.classList.add("active");
    }
  });
}

function initScrollAnimations() {
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

  document
    .querySelectorAll(".animate-on-scroll:not(.visible)")
    .forEach((el) => {
      observer.observe(el);
    });
}

function initSorter(originalData, renderFunction, sorterId) {
  const sorter = document.getElementById(sorterId);
  if (!sorter) return;

  sorter.addEventListener("change", function () {
    const sortOrder = this.value;
    const sortedData = [...originalData].sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
    });
    renderFunction(sortedData);
  });
}

function initParticles() {
  tsParticles.load("particles-js", {
    particles: {
      number: { value: 60, density: { enable: true, value_area: 800 } },
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
        opacity: 0.3,
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
