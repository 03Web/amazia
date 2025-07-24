/**
 * @file script.js
 * @description Script utama untuk fungsionalitas website Karang Taruna Banjarsari.
 * @author Anda (atau Partner Coding)
 * @version 3.2.1 (Versi dengan Bottom Navigation)
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
async function initArtikelPage() {
  const container = document.getElementById("artikel-dinamis-container");
  if (!container) return;

  try {
    // 1. Ambil 'slug' dari URL (contoh: artikel.html?slug=gebyar-merdeka-2025)
    const urlParams = new URLSearchParams(window.location.search);
    const slug = urlParams.get("slug");

    if (!slug) {
      throw new Error("Slug artikel tidak ditemukan di URL.");
    }

    // 2. Buat path menuju file konten artikel
    const artikelPath = `konten-kegiatan/${slug}.html`;

    // 3. Fetch konten dari file tersebut
    const response = await fetch(artikelPath);
    if (!response.ok) {
      throw new Error(`Gagal memuat konten artikel: ${response.statusText}`);
    }
    const artikelContent = await response.text();

    // 4. Masukkan konten ke dalam kontainer dan perbarui judul halaman
    container.innerHTML = artikelContent;

    // Ambil judul dari H2 pertama di dalam konten yang baru dimuat
    const pageTitle = container.querySelector("h2").textContent;
    document.title = pageTitle + " - Karang Taruna Banjarsari";

    // 5. Inisialisasi ulang fitur seperti slideshow yang mungkin ada di dalam konten
    initSlideshow();
    initScrollAnimations(); // Inisialisasi ulang animasi scroll untuk konten baru
  } catch (error) {
    console.error("Gagal memuat artikel:", error);
    container.innerHTML = `
            <div style="text-align: center;">
                <h2>Gagal Memuat Artikel</h2>
                <p>Maaf, konten yang Anda cari tidak dapat ditemukan atau terjadi kesalahan saat memuat.</p>
                <p><i>${error.message}</i></p>
                <a href="kegiatan.html" class="kegiatan-tombol" style="margin-top: 20px;">
                    <i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan
                </a>
            </div>
        `;
  }
}
/**
 * Memuat komponen HTML (seperti header/footer) dari file eksternal ke dalam elemen target.
 *
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

    // Buat DOM sementara untuk mem-parsing konten
    const parser = new DOMParser();
    const doc = parser.parseFromString(content, "text/html");

    // Sisipkan HTML dari body dokumen sementara ke elemen target
    element.innerHTML = doc.body.innerHTML;

    // Temukan dan eksekusi semua skrip secara manual
    const scripts = doc.head.querySelectorAll("script");
    scripts.forEach((oldScript) => {
      const newScript = document.createElement("script");
      // Salin semua atribut dari skrip lama ke skrip baru
      Array.from(oldScript.attributes).forEach((attr) => {
        newScript.setAttribute(attr.name, attr.value);
      });
      // Salin konten skrip jika ada
      newScript.textContent = oldScript.textContent;
      // Tambahkan skrip baru ke head dokumen utama agar dieksekusi
      document.head.appendChild(newScript);
    });

    // Jalankan callback jika ada
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

/**
 * Mengambil data dari file JSON.
 * @param {string} url - Path menuju file JSON.
 * @returns {Promise<Array|null>} - Mengembalikan data dalam bentuk array atau null jika gagal.
 */
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

/**
 * Inisialisasi untuk halaman Kegiatan.
 */
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

/**
 * Inisialisasi untuk halaman Informasi.
 */
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

/**
 * Menginisialisasi semua slideshow di halaman dengan EFEK FADE.
 */
function initSlideshow() {
  const slideshowContainers = document.querySelectorAll(".slideshow-container");

  slideshowContainers.forEach((container) => {
    const slides = container.querySelectorAll(".slide-image");
    if (slides.length > 1) {
      let currentIndex = 0;

      // Hentikan interval lama jika ada
      if (container.dataset.intervalId) {
        clearInterval(container.dataset.intervalId);
      }

      // 1. Tampilkan gambar pertama saat awal
      slides.forEach((slide) => slide.classList.remove("active-slide"));
      slides[currentIndex].classList.add("active-slide");

      // 2. Buat interval untuk mengganti gambar
      const intervalId = setInterval(() => {
        // Hilangkan kelas aktif dari gambar saat ini
        slides[currentIndex].classList.remove("active-slide");

        // Pindah ke gambar berikutnya
        currentIndex = (currentIndex + 1) % slides.length;

        // Berikan kelas aktif ke gambar baru, membuatnya muncul (fade-in)
        slides[currentIndex].classList.add("active-slide");
      }, 4000); // Ganti gambar setiap 4 detik

      // Simpan ID interval
      container.dataset.intervalId = intervalId;
    } else if (slides.length === 1) {
      // Jika hanya ada satu gambar, langsung tampilkan saja
      slides[0].classList.add("active-slide");
    }
  });
}

/**
 * Inisialisasi semua fitur di header (menu mobile, link aktif).
 * FUNGSI initMobileMenu() TELAH DIHAPUS.
 */
function initHeaderFeatures() {
  setActiveNavLink();
}

/**
 * Menambahkan kelas 'active' pada link navigasi yang sesuai dengan halaman saat ini.
 */
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

  document
    .querySelectorAll(".animate-on-scroll:not(.visible)")
    .forEach((el) => {
      observer.observe(el);
    });
}

/**
 * Inisialisasi fungsi sorting untuk elemen.
 */
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

/**
 * Inisialisasi animasi partikel dari library tsParticles.
 */
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
