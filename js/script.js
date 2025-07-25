/**
 * @file script.js
 * @description Script utama untuk fungsionalitas website Karang Taruna Banjarsari.
 * @author Anda (atau Partner Coding)
 * @version 4.0.0 (Versi Profesional)
 */

// Menjalankan semua fungsi inisialisasi setelah konten halaman (DOM) selesai dimuat.
document.addEventListener("DOMContentLoaded", () => {
  // Muat komponen header dan footer secara dinamis
  loadComponent("layout/header.html", "main-header", initHeaderFeatures);
  loadComponent("layout/footer.html", "main-footer");

  // Inisialisasi partikel latar belakang jika elemennya ada
  if (document.getElementById("particles-js")) {
    initParticles();
  }

  // Inisialisasi animasi saat scroll
  initScrollAnimations();

  // Jalankan fungsi spesifik untuk halaman tertentu
  initPageSpecificScripts();
});

/**
 * Memuat komponen HTML (seperti header/footer) dari file eksternal ke dalam elemen target.
 * @param {string} url - Path menuju file komponen (e.g., "layout/header.html").
 * @param {string} elementId - ID dari elemen target tempat komponen akan disisipkan.
 * @param {function} [callback] - Fungsi opsional yang akan dijalankan setelah komponen berhasil dimuat.
 */
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

/**
 * Menjalankan fungsi yang relevan untuk halaman yang sedang aktif.
 */
function initPageSpecificScripts() {
  const path = window.location.pathname.split("/").pop();

  if (document.getElementById("kegiatan-list")) initKegiatanPage();
  if (document.getElementById("album-grid")) initGaleriPage();
  if (document.getElementById("info-list")) initInformasiPage();
  if (path === "artikel.html") initArtikelPage();
}

/**
 * Mengambil data dari file JSON.
 * @param {string} url - Path menuju file JSON.
 * @returns {Promise<any>} - Mengembalikan data dalam bentuk array/objek atau null jika gagal.
 */
async function fetchData(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Gagal memuat data dari ${url}:`, error);
    return null;
  }
}

/**
 * Inisialisasi untuk halaman Artikel.
 */
async function initArtikelPage() {
  const container = document.getElementById("artikel-dinamis-container");
  if (!container) return;

  try {
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");
    if (!slug) throw new Error("Slug artikel tidak ditemukan di URL.");

    const artikelPath = `konten-kegiatan/${slug}.html`;
    const response = await fetch(artikelPath);
    if (!response.ok)
      throw new Error(`Gagal memuat konten artikel: ${response.statusText}`);
    const artikelHTML = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(artikelHTML, "text/html");
    const title = doc.querySelector("h2").textContent;
    const date = doc.querySelector(".kegiatan-meta").textContent;
    const content = doc.querySelector(".artikel-konten").innerHTML;
    const slideshow =
      doc.querySelector(".slideshow-container")?.outerHTML || "";

    // Hitung waktu baca
    const words = doc
      .querySelector(".artikel-konten")
      .innerText.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200); // Rata-rata 200 kata per menit

    document.title = `${title} - Karang Taruna Banjarsari`;
    container.innerHTML = `
      <div class="artikel-header">
        <h2>${title}</h2>
        <div class="artikel-meta-info">
            <span>
                <i class="fas fa-calendar-alt"></i> ${date}
            </span>
            <span>
                <i class="fas fa-clock"></i> Estimasi ${readingTime} menit baca
            </span>
        </div>
      </div>
      ${slideshow}
      <div class="artikel-konten">
        ${content}
      </div>
      <a href="kegiatan.html" class="tombol-kembali">
        <i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan
      </a>
    `;

    initSlideshow();
    initScrollAnimations();
  } catch (error) {
    console.error("Gagal memuat artikel:", error);
    container.innerHTML = `
      <div style="text-align: center;">
        <h2>Gagal Memuat Artikel</h2>
        <p>Maaf, konten yang Anda cari tidak dapat ditemukan atau terjadi kesalahan.</p>
        <p><i>${error.message}</i></p>
        <a href="kegiatan.html" class="kegiatan-tombol" style="margin-top: 20px;">
          <i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan
        </a>
      </div>
    `;
  }
}

/**
 * Inisialisasi untuk halaman Kegiatan.
 */
async function initKegiatanPage() {
  const container = document.getElementById("kegiatan-list");
  const data = await fetchData("data/kegiatan.json");
  if (!data || !container) {
    if (container) container.innerHTML = "<p>Gagal memuat daftar kegiatan.</p>";
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
          <img src="${item.gambar}" alt="Gambar untuk ${
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
          <a href="${item.link}" class="kegiatan-tombol">Baca Selengkapnya</a>
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

/**
 * Inisialisasi untuk halaman Galeri.
 */
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
        }" data-title="${
          album.foto[0].title || album.judul
        }" class="album-cover">
          <img src="${album.cover}" alt="Cover album ${
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
              `<a href="${foto.src}" data-lightbox="${album.id}" data-title="${
                foto.title || album.judul
              }"></a>`
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
        <div class="gallery-item video-item animate-on-scroll" data-tanggal="${
          video.tanggal
        }">
          <iframe src="${video.src.replace("watch?v=", "embed/")}" title="${
            video.title
          }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
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

/**
 * Inisialisasi untuk halaman Informasi.
 */
async function initInformasiPage() {
  const container = document.getElementById("info-list");
  const data = await fetchData("data/informasi.json");
  if (!data || !container) {
    if (container) container.innerHTML = "<p>Gagal memuat informasi.</p>";
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
  document.querySelectorAll(".slideshow-container").forEach((container) => {
    const slides = container.querySelectorAll(".slide-image");
    if (slides.length <= 1) {
      if (slides.length === 1) slides[0].classList.add("active-slide");
      return;
    }

    let currentIndex = 0;
    slides[currentIndex].classList.add("active-slide");

    if (container.dataset.intervalId)
      clearInterval(container.dataset.intervalId);

    const intervalId = setInterval(() => {
      slides[currentIndex].classList.remove("active-slide");
      currentIndex = (currentIndex + 1) % slides.length;
      slides[currentIndex].classList.add("active-slide");
    }, 4000);
    container.dataset.intervalId = intervalId;
  });
}

function initHeaderFeatures() {
  setActiveNavLink();
}

function setActiveNavLink() {
  // Menentukan halaman saat ini, default ke index.html jika kosong
  const currentLocation =
    window.location.pathname.split("/").pop() || "index.html";

  // Mengambil elemen navigasi utama
  const navContainer = document.querySelector("nav ul");
  if (!navContainer) return; // Keluar jika elemen tidak ditemukan

  const navLinks = navContainer.querySelectorAll("a");
  let activeLink = null;

  // Loop melalui semua tautan untuk menemukan yang aktif
  navLinks.forEach((link) => {
    const linkPath = link.getAttribute("href");
    link.parentElement.classList.remove("active"); // Hapus kelas aktif dari elemen <li>

    // Logika untuk menentukan tautan mana yang aktif
    if (
      linkPath === currentLocation ||
      (currentLocation === "artikel.html" && linkPath === "kegiatan.html")
    ) {
      link.parentElement.classList.add("active"); // Terapkan kelas aktif ke elemen <li>
      activeLink = link.parentElement; // Simpan elemen <li> yang aktif
    }
  });

  // --- LOGIKA PERBAIKAN ---
  // Jika ada link aktif dan layar adalah mobile (lebar <= 768px), geser menu
  if (activeLink && window.innerWidth <= 768) {
    // Hitung posisi yang diperlukan untuk menengahkan menu aktif
    const scrollLeftPosition =
      activeLink.offsetLeft -
      navContainer.offsetWidth / 2 +
      activeLink.offsetWidth / 2;

    // Lakukan scroll dengan animasi halus (smooth)
    navContainer.scrollTo({
      left: scrollLeftPosition,
      behavior: "smooth",
    });
  }
}

function initScrollAnimations() {
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
}

function initSorter(originalData, renderFunction, sorterId) {
  const sorter = document.getElementById(sorterId);
  if (!sorter) return;

  sorter.addEventListener("change", function () {
    const sortedData = [...originalData].sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      return this.value === "terbaru" ? dateB - dateA : dateA - dateB;
    });
    renderFunction(sortedData);
  });
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
