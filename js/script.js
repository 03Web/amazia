/**
 * @file script.js
 * @description Script utama untuk fungsionalitas website Karang Taruna Banjarsari.
 * @author Partner Coding
 * @version 7.0.0 (Login dengan Timeout Inaktivitas)
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

  // === BAGIAN BARU: PENGATURAN SESI & INAKTIVITAS ===
  const TIMEOUT_DURATION = 20 * 60 * 1000; // 20 menit dalam milidetik
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
    resetInactivityTimer(); // Mulai timer saat halaman dimuat
  }

  function logoutUser() {
    sessionStorage.removeItem("isLoggedIn");
    sessionStorage.removeItem("lastActivityTimestamp");
    // Paksa kembali ke halaman index untuk login ulang
    window.location.href = "index.html";
  }

  function checkLoginStatus() {
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");
    const lastActivity = sessionStorage.getItem("lastActivityTimestamp");

    if (!isLoggedIn || !lastActivity) {
      // Jika tidak ada status login atau catatan aktivitas, paksa logout
      logoutUser();
      return false;
    }

    if (Date.now() - parseInt(lastActivity, 10) > TIMEOUT_DURATION) {
      // Jika waktu inaktivitas terlampaui sejak tab terakhir ditutup
      logoutUser();
      return false;
    }

    return true;
  }

  // === FUNGSI UNTUK WELCOME SCREEN (LOGIN) ===
  function initWelcomeScreen() {
    const overlay = document.getElementById("welcome-overlay");
    const form = document.getElementById("welcome-form");
    const messageEl = document.getElementById("form-message");
    const submitButton = document.getElementById("submit-button");
    const FORMSPREE_URL = "https://formspree.io/f/mpwllonq"; // URL Formspree Anda

    // Cek apakah halaman saat ini adalah index.html
    const isIndexPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.includes("index.html");

    // Jika sudah login dan aktif, sembunyikan overlay.
    // Jika belum login, tampilkan overlay hanya di halaman index.
    if (sessionStorage.getItem("isLoggedIn")) {
      overlay.classList.add("hidden");
      startInactivityTracker();
    } else if (isIndexPage) {
      overlay.classList.remove("hidden");
    } else {
      // Jika belum login dan mencoba akses halaman lain, paksa ke index
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
            startInactivityTracker(); // Mulai pelacak setelah login berhasil
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

  // === UTILITIES & HELPERS (TIDAK PERLU DIUBAH) ===
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

  const createKegiatanTemplate = (item) => `
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
  `;

  const createKontakTemplate = (kontak) => `
    <div class="kontak-card">
      <img src="${kontak.foto}" alt="${
    kontak.alt
  }" class="foto-pengurus" loading="lazy" />
      <h4>${kontak.nama}</h4>
      <p class="jabatan">${kontak.jabatan}</p>
      <p class="info-kontak">${kontak.deskripsi}</p>
      <a href="https://wa.me/${kontak.whatsapp}?text=${encodeURIComponent(
    kontak.pesan_wa
  )}" target="_blank" class="wa-button">
        <i class="fab fa-whatsapp"></i> Hubungi via WhatsApp
      </a>
    </div>
  `;

  const createInformasiTemplate = (info) => `
    <div class="info-item animate-on-scroll">
      <div class="info-header">
        <h3>${info.judul}</h3>
        <span class="info-tag tag-pengumuman">${info.kategori}</span>
      </div>
      <p class="info-meta">
        <i class="fas fa-calendar-alt"></i> Diposting pada ${new Date(
          info.tanggal
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        <span>- ${info.meta_info}</span>
      </p>
      <div class="info-body">${info.konten_html}</div>
    </div>
  `;

  async function initKegiatanPage() {
    const container = document.getElementById("kegiatan-list");
    const kategoriFilter = document.getElementById("kategori-filter");
    const sorter = document.getElementById("kegiatan-sorter");

    const originalData = await fetchData("kegiatan", "data/kegiatan.json");
    if (!originalData) {
      container.innerHTML = "<p>Gagal memuat daftar kegiatan.</p>";
      return;
    }

    const updateList = () => {
      const selectedCategory = kategoriFilter.value;
      const sortOrder = sorter.value;

      let filteredData = originalData;
      if (selectedCategory !== "semuanya") {
        filteredData = originalData.filter(
          (item) => item.kategori === selectedCategory
        );
      }

      const sortedData = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
      });

      renderItems(
        container,
        sortedData,
        createKegiatanTemplate,
        "<p>Tidak ada artikel dalam kategori ini.</p>"
      );
    };

    if (kategoriFilter && sorter) {
      kategoriFilter.addEventListener("change", updateList);
      sorter.addEventListener("change", updateList);
    }

    updateList();
  }

  async function initKontakPage() {
    const container = document.getElementById("kontak-grid");
    const data = await fetchData("kontak", "data/kontak.json");
    renderItems(
      container,
      data,
      createKontakTemplate,
      "Gagal memuat daftar narahubung."
    );
  }

  async function initAboutPage() {
    const container = document.getElementById("pohon-organisasi-container");
    if (!container) return;
    const data = await fetchData("pengurus", "data/pengurus.json");
    if (!data) {
      container.innerHTML = "<p>Gagal memuat struktur organisasi.</p>";
      return;
    }
    const createNode = (jabatan, nama, fotoUrl) => {
      const imageTag = fotoUrl
        ? `<img src="${fotoUrl}" alt="Foto ${nama}" class="foto-node">`
        : `<span class="foto-node foto-node-placeholder fas fa-user"></span>`;
      return `<div>${imageTag}<span class="jabatan">${jabatan}</span><span class="nama">${nama}</span></div>`;
    };
    const createBidangTitleNode = (namaBidang) =>
      `<div><span class="jabatan">${namaBidang}</span></div>`;
    container.innerHTML =
      '<ul class="pohon-organisasi" id="pohon-organisasi-chart"></ul>';
    const chart = document.getElementById("pohon-organisasi-chart");
    let chartContent = "";
    const pengurusInti = data.pengurusInti;

    // === PERUBAHAN DIMULAI DI SINI ===
    // Mengambil data pengurus inti berdasarkan urutan/indeks, bukan nama jabatan
    const penasehat = pengurusInti[0];
    const penanggungJawab = pengurusInti[1];
    const ketua = pengurusInti[2];
    const wakil = pengurusInti[3];
    const sekretaris = pengurusInti[4];
    const bendahara = pengurusInti[5];
    // === PERUBAHAN SELESAI DI SINI ===

    if (penasehat)
      chartContent += `<li>${createNode(
        penasehat.jabatan,
        penasehat.nama,
        penasehat.foto
      )}</li>`;
    if (penanggungJawab)
      chartContent += `<li>${createNode(
        penanggungJawab.jabatan,
        penanggungJawab.nama,
        penanggungJawab.foto
      )}</li>`;
    if (ketua) {
      let bawahanHtml = "<ul>";
      if (sekretaris)
        bawahanHtml += `<li>${createNode(
          sekretaris.jabatan,
          sekretaris.nama,
          sekretaris.foto
        )}</li>`;
      if (bendahara)
        bawahanHtml += `<li>${createNode(
          bendahara.jabatan,
          bendahara.nama,
          bendahara.foto
        )}</li>`;
      let bidangHtml = '<ul class="bidang-group">';
      data.bidang.forEach((b) => {
        let anggotaHtml = '<ul class="anggota-grid">';
        if (b.anggota) {
          b.anggota.forEach((a) => {
            anggotaHtml += `<li>${createNode(a.jabatan, a.nama, a.foto)}</li>`;
          });
        }
        anggotaHtml += "</ul>";
        bidangHtml += `<li>${createBidangTitleNode(
          b.namaBidang
        )}${anggotaHtml}</li>`;
      });
      bidangHtml += "</ul>";
      bawahanHtml += `<li><div class="jabatan">Bidang-Bidang</div>${bidangHtml}</li>`;
      bawahanHtml += "</ul>";
      chartContent += `<li>${createNode(
        ketua.jabatan,
        ketua.nama,
        ketua.foto
      )}${bawahanHtml}</li>`;
    }
    if (wakil)
      chartContent += `<li>${createNode(
        wakil.jabatan,
        wakil.nama,
        wakil.foto
      )}</li>`;
    chart.innerHTML = chartContent;
    initScrollAnimations();
    const zoomInBtn = document.getElementById("zoom-in-btn");
    const zoomOutBtn = document.getElementById("zoom-out-btn");
    const zoomLevelDisplay = document.getElementById("zoom-level");
    let currentZoom = 1;
    const ZOOM_STEP = 0.1;
    const MIN_ZOOM = 0.3;
    const MAX_ZOOM = 2;
    const applyZoom = () => {
      chart.style.transform = `scale(${currentZoom})`;
      zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
    };
    zoomInBtn.addEventListener("click", () => {
      currentZoom = Math.min(MAX_ZOOM, currentZoom + ZOOM_STEP);
      applyZoom();
    });
    zoomOutBtn.addEventListener("click", () => {
      currentZoom = Math.max(MIN_ZOOM, currentZoom - ZOOM_STEP);
      applyZoom();
    });
    let isPanning = false;
    let startX, startY, scrollLeft, scrollTop;
    container.addEventListener("mousedown", (e) => {
      e.preventDefault();
      isPanning = true;
      container.style.cursor = "grabbing";
      startX = e.pageX - container.offsetLeft;
      startY = e.pageY - container.offsetTop;
      scrollLeft = container.scrollLeft;
      scrollTop = container.scrollTop;
    });
    container.addEventListener("mouseleave", () => {
      isPanning = false;
      container.style.cursor = "grab";
    });
    container.addEventListener("mouseup", () => {
      isPanning = false;
      container.style.cursor = "grab";
    });
    container.addEventListener("mousemove", (e) => {
      if (!isPanning) return;
      e.preventDefault();
      const x = e.pageX - container.offsetLeft;
      const y = e.pageY - container.offsetTop;
      const walkX = x - startX;
      const walkY = y - startY;
      container.scrollLeft = scrollLeft - walkX;
      container.scrollTop = scrollTop - walkY;
    });
    setTimeout(() => {
      if (container.scrollWidth > container.clientWidth) {
        container.scrollLeft =
          (container.scrollWidth - container.clientWidth) / 2;
      }
    }, 100);
  }

  async function initInformasiPage() {
    const container = document.getElementById("info-list");
    const kategoriFilter = document.getElementById("informasi-kategori-filter");
    const sorter = document.getElementById("informasi-sorter");

    const dataObject = await fetchData("informasi", "data/informasi.json");
    const originalData = dataObject ? dataObject.informasi : [];

    if (originalData.length === 0) {
      container.innerHTML = "<p>Gagal memuat atau tidak ada informasi.</p>";
      return;
    }

    const updateList = () => {
      const selectedCategory = kategoriFilter.value;
      const sortOrder = sorter.value;

      let filteredData = originalData;
      if (selectedCategory !== "semuanya") {
        filteredData = originalData.filter(
          (item) => item.kategori === selectedCategory
        );
      }

      const sortedData = [...filteredData].sort((a, b) => {
        const dateA = new Date(a.tanggal);
        const dateB = new Date(b.tanggal);
        return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
      });

      renderItems(
        container,
        sortedData,
        createInformasiTemplate,
        "<p>Tidak ada item dalam kategori ini.</p>"
      );
    };

    if (kategoriFilter && sorter) {
      kategoriFilter.addEventListener("change", updateList);
      sorter.addEventListener("change", updateList);
    }

    updateList();
  }

  async function initGaleriPage() {
    const data = await fetchData("galeri", "data/galeri.json");
    if (!data) return;
    const albumContainer = document.getElementById("album-grid");
    if (albumContainer && data.albumFoto) {
      renderItems(
        albumContainer,
        data.albumFoto,
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
            <div class="album-info"><h4>${album.judul}</h4><p>${
          album.deskripsi
        }</p></div>
          </a>
          ${album.foto
            .slice(1)
            .map(
              (foto) =>
                `<a href="${foto.src}" data-lightbox="${
                  album.id
                }" data-title="${foto.title || album.judul}"></a>`
            )
            .join("")}
        </div>`,
        "Gagal memuat album foto."
      );
    }
    const videoContainer = document.getElementById("video-grid");
    if (videoContainer && data.dokumentasiVideo) {
      const renderVideos = (items) =>
        renderItems(
          videoContainer,
          items,
          (video) => `
          <div class="gallery-item video-item animate-on-scroll" data-tanggal="${
            video.tanggal
          }">
            <iframe src="${video.src.replace("watch?v=", "embed/")}" title="${
            video.title
          }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
          </div>`,
          "Gagal memuat video."
        );
      renderVideos(data.dokumentasiVideo);
      initSorter(data.dokumentasiVideo, renderVideos, "video-sorter");
    }
  }

  async function initArtikelPage() {
    const container = document.getElementById("artikel-dinamis-container");
    if (!container) return;
    try {
      const slug = new URLSearchParams(window.location.search).get("slug");
      if (!slug) throw new Error("Slug artikel tidak ditemukan di URL.");
      const artikelPath = `konten-kegiatan/${slug}.html`;
      let artikelHTML;
      if (cache.has(artikelPath)) {
        artikelHTML = cache.get(artikelPath);
      } else {
        const response = await fetch(artikelPath);
        if (!response.ok)
          throw new Error(
            `Gagal memuat konten artikel: ${response.statusText}`
          );
        artikelHTML = await response.text();
        cache.set(artikelPath, artikelHTML);
      }
      const parser = new DOMParser();
      const doc = parser.parseFromString(artikelHTML, "text/html");
      const title = doc.querySelector("h2").textContent;
      const date = doc.querySelector(".kegiatan-meta").textContent;
      const content = doc.querySelector(".artikel-konten").innerHTML;
      const slideshow =
        doc.querySelector(".slideshow-container")?.outerHTML || "";
      const words = doc
        .querySelector(".artikel-konten")
        .innerText.split(/\s+/).length;
      const readingTime = Math.ceil(words / 200);
      document.title = `${title} - Karang Taruna Banjarsari`;
      container.innerHTML = `
        <div class="artikel-header">
          <h2>${title}</h2>
          <div class="artikel-meta-info">
            <span><i class="fas fa-calendar-alt"></i> ${date}</span>
            <span><i class="fas fa-clock"></i> Estimasi ${readingTime} menit baca</span>
          </div>
        </div>
        ${slideshow}
        <div class="artikel-konten">${content}</div>
        <a href="kegiatan.html" class="tombol-kembali"><i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan</a>
      `;
      initSlideshow();
    } catch (error) {
      console.error("Gagal memuat artikel:", error);
      container.innerHTML = `<div style="text-align: center;"><h2>Gagal Memuat Artikel</h2><p>Maaf, konten yang Anda cari tidak dapat ditemukan atau terjadi kesalahan.</p><p><i>${error.message}</i></p><a href="kegiatan.html" class="kegiatan-tombol" style="margin-top: 20px;"><i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan</a></div>`;
    } finally {
      initScrollAnimations();
    }
  }

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
      navContainer.scrollTo({
        left: scrollLeftPosition,
        behavior: "smooth",
      });
    }
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
  const init = () => {
    // Pindahkan pengecekan ke bagian atas
    const isIndexPage =
      window.location.pathname.endsWith("/") ||
      window.location.pathname.includes("index.html");
    const isLoggedIn = sessionStorage.getItem("isLoggedIn");

    if (!isLoggedIn && !isIndexPage) {
      // Jika belum login dan mencoba mengakses halaman selain index, paksa logout (redirect)
      logoutUser();
      return; // Hentikan eksekusi lebih lanjut
    }

    // Jika sudah login, atau jika ini adalah halaman index, lanjutkan
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

    const pageInitializers = {
      "kegiatan-list": initKegiatanPage,
      "album-grid": initGaleriPage,
      "info-list": initInformasiPage,
      "artikel-dinamis-container": initArtikelPage,
      "pohon-organisasi-container": initAboutPage,
      "kontak-grid": initKontakPage,
    };
    for (const [id, initializer] of Object.entries(pageInitializers)) {
      if (document.getElementById(id)) {
        initializer();
        break;
      }
    }
  };

  return {
    init: init,
  };
})();

document.addEventListener("DOMContentLoaded", App.init);
