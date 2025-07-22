document.addEventListener("DOMContentLoaded", () => {
  // Inisialisasi Partikel Latar Belakang
  initParticles();

  // Inisialisasi Menu Mobile
  initMobileMenu();

  // Inisialisasi Animasi Saat Scroll
  initScrollAnimations();

  // Memuat konten dinamis berdasarkan halaman yang aktif
  loadDynamicContent();
});

/**
 * Inisialisasi animasi partikel dari library tsParticles.
 */
function initParticles() {
  if (document.getElementById("particles-js")) {
    tsParticles.load("particles-js", {
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
}

/**
 * Mengatur fungsionalitas menu mobile (hamburger).
 */
function initMobileMenu() {
  const menuToggle = document.getElementById("menu-toggle");
  const nav = document.querySelector("header nav");

  if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
      nav.classList.toggle("active");
      const icon = menuToggle.querySelector("i");
      icon.classList.toggle("fa-bars");
      icon.classList.toggle("fa-times");
    });
  }
}

/**
 * Menambahkan animasi 'fade-up' pada elemen saat terlihat di layar.
 */
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

  document.querySelectorAll(".animate-on-scroll").forEach((el) => {
    observer.observe(el);
  });
}

/**
 * Memuat konten dari file JSON sesuai halaman.
 */
function loadDynamicContent() {
  const path = window.location.pathname;

  if (path.includes("galeri.html")) {
    loadGaleri();
  } else if (path.includes("kegiatan.html") && !path.includes("kegiatan-")) {
    loadKegiatan();
  } else if (path.includes("informasi.html")) {
    loadInformasi();
  }
}

async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Gagal memuat data:", error);
    return null;
  }
}

async function loadGaleri() {
  const data = await fetchData("data/galeri.json");
  if (!data) return;

  // Load Album Foto
  const albumContainer = document.getElementById("album-grid");
  if (albumContainer) {
    albumContainer.innerHTML = data.albumFoto
      .map(
        (album) => `
            <div class="album-item animate-on-scroll">
                <a href="${album.foto[0].src}" data-lightbox="${
          album.id
        }" data-title="${album.foto[0].title}" class="album-cover">
                    <img src="${album.cover}" alt="${album.judul}">
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

  // Load Video
  const videoContainer = document.getElementById("video-grid");
  if (videoContainer) {
    videoContainer.innerHTML = data.dokumentasiVideo
      .map(
        (video) => `
            <div class="gallery-item video-item animate-on-scroll" data-tanggal="${video.tanggal}">
                <iframe src="${video.src}" title="${video.title}" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>
            </div>
        `
      )
      .join("");
    initSorters("#video-grid", ".video-item", "video-sorter");
  }
}

async function loadKegiatan() {
  const data = await fetchData("data/kegiatan.json");
  if (!data) return;

  const kegiatanContainer = document.getElementById("kegiatan-list");
  if (kegiatanContainer) {
    kegiatanContainer.innerHTML = data
      .map(
        (item) => `
            <article class="kegiatan-item animate-on-scroll" data-tanggal="${
              item.tanggal
            }">
                <div class="kegiatan-foto">
                    <img src="${item.gambar}" alt="${item.judul}">
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
    initSorters("#kegiatan-list", ".kegiatan-item", "kegiatan-sorter");
  }
}

async function loadInformasi() {
  const data = await fetchData("data/informasi.json");
  if (!data) return;

  const infoContainer = document.getElementById("info-list");
  if (infoContainer) {
    infoContainer.innerHTML = data
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
  }
}

/**
 * Inisialisasi fungsi sorting untuk elemen.
 */
function initSorters(containerSelector, itemSelector, sorterId) {
  const sorter = document.getElementById(sorterId);
  const container = document.querySelector(containerSelector);

  if (!sorter || !container) return;

  sorter.addEventListener("change", function () {
    const sortOrder = this.value;
    const items = Array.from(container.querySelectorAll(itemSelector));

    items.sort((a, b) => {
      const dateA = new Date(a.getAttribute("data-tanggal"));
      const dateB = new Date(b.getAttribute("data-tanggal"));
      return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
    });

    items.forEach((item) => container.appendChild(item));
  });
}
