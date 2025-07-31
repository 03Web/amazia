/**
 * @file page-initializers.js
 * @description Inisialisasi spesifik untuk setiap halaman.
 */

// === KEGIATAN PAGE ===
App.initializers.kegiatan = async () => {
  const container = document.getElementById("kegiatan-list");
  if (!container) return;

  const kategoriFilter = document.getElementById("kategori-filter");
  const sorter = document.getElementById("kegiatan-sorter");

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
        <p class="kegiatan-meta"><i class="fas fa-calendar-alt"></i> ${new Date(
          item.tanggal
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}</p>
        <p>${item.deskripsi}</p>
        <a href="${item.link}" class="kegiatan-tombol">Baca Selengkapnya</a>
      </div>
    </article>`;

  const originalData = await App.fetchData("kegiatan", "data/kegiatan.json");
  if (!originalData) {
    container.innerHTML = "<p>Gagal memuat daftar kegiatan.</p>";
    return;
  }

  const updateList = () => {
    const selectedCategory = kategoriFilter.value;
    const sortOrder = sorter.value;
    let filteredData =
      selectedCategory !== "semuanya"
        ? originalData.filter((item) => item.kategori === selectedCategory)
        : originalData;
    const sortedData = [...filteredData].sort((a, b) =>
      sortOrder === "terbaru"
        ? new Date(b.tanggal) - new Date(a.tanggal)
        : new Date(a.tanggal) - new Date(b.tanggal)
    );
    App.renderItems(
      container,
      sortedData,
      createKegiatanTemplate,
      "<p>Tidak ada artikel dalam kategori ini.</p>"
    );
  };

  kategoriFilter.addEventListener("change", updateList);
  sorter.addEventListener("change", updateList);
  updateList();
};

// === GALERI PAGE ===
App.initializers.galeri = async () => {
  const data = await App.fetchData("galeri", "data/galeri.json");
  if (!data) return;

  const albumContainer = document.getElementById("album-grid");
  if (albumContainer && data.albumFoto) {
    const createAlbumTemplate = (album) => `
        <div class="album-item animate-on-scroll">
            <a href="${album.foto[0].src}" data-lightbox="${
      album.id
    }" data-title="${album.foto[0].title || album.judul}" class="album-cover">
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
        </div>`;
    App.renderItems(
      albumContainer,
      data.albumFoto,
      createAlbumTemplate,
      "Gagal memuat album foto."
    );
  }

  const videoContainer = document.getElementById("video-grid");
  if (videoContainer && data.dokumentasiVideo) {
    const createVideoTemplate = (video) => `
        <div class="gallery-item video-item animate-on-scroll" data-tanggal="${
          video.tanggal
        }">
            <iframe src="${video.src.replace("watch?v=", "embed/")}" title="${
      video.title
    }" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen loading="lazy"></iframe>
        </div>`;
    const renderVideos = (items) =>
      App.renderItems(
        videoContainer,
        items,
        createVideoTemplate,
        "Gagal memuat video."
      );
    renderVideos(data.dokumentasiVideo);

    const sorter = document.getElementById("video-sorter");
    if (sorter) {
      sorter.addEventListener("change", function () {
        const sortedData = [...data.dokumentasiVideo].sort((a, b) =>
          this.value === "terbaru"
            ? new Date(b.tanggal) - new Date(a.tanggal)
            : new Date(a.tanggal) - new Date(b.tanggal)
        );
        renderVideos(sortedData);
      });
    }
  }
};

// === INFORMASI PAGE ===
App.initializers.informasi = async () => {
  const container = document.getElementById("info-list");
  if (!container) return;

  const createInformasiTemplate = (info) => `
    <div class="info-item animate-on-scroll">
      <div class="info-header">
        <h3>${info.judul}</h3>
        <span class="info-tag tag-pengumuman">${info.kategori}</span>
      </div>
      <p class="info-meta"><i class="fas fa-calendar-alt"></i> Diposting pada ${new Date(
        info.tanggal
      ).toLocaleDateString("id-ID", {
        day: "numeric",
        month: "long",
        year: "numeric",
      })}<span>- ${info.meta_info}</span></p>
      <div class="info-body">${info.konten_html}</div>
    </div>`;

  const dataObject = await App.fetchData("informasi", "data/informasi.json");
  const originalData = dataObject ? dataObject.informasi : [];
  if (originalData.length === 0) {
    container.innerHTML = "<p>Gagal memuat atau tidak ada informasi.</p>";
    return;
  }

  const kategoriFilter = document.getElementById("informasi-kategori-filter");
  const sorter = document.getElementById("informasi-sorter");

  const updateList = () => {
    const selectedCategory = kategoriFilter.value;
    const sortOrder = sorter.value;
    let filteredData =
      selectedCategory !== "semuanya"
        ? originalData.filter((item) => item.kategori === selectedCategory)
        : originalData;
    const sortedData = [...filteredData].sort((a, b) =>
      sortOrder === "terbaru"
        ? new Date(b.tanggal) - new Date(a.tanggal)
        : new Date(a.tanggal) - new Date(b.tanggal)
    );
    App.renderItems(
      container,
      sortedData,
      createInformasiTemplate,
      "<p>Tidak ada item dalam kategori ini.</p>"
    );
  };

  kategoriFilter.addEventListener("change", updateList);
  sorter.addEventListener("change", updateList);
  updateList();
};

// === ABOUT PAGE (STRUKTUR ORGANISASI) ===
App.initializers.about = async () => {
  // Kosongkan untuk about.html, karena kontennya statis
};

// === KONTAK PAGE ===
App.initializers.kontak = async () => {
  // Kosongkan untuk kontak.html, karena kontennya statis
};

// === ARTIKEL PAGE ===
App.initializers.artikel = async () => {
  const container = document.getElementById("artikel-dinamis-container");
  if (!container) return;

  const initSlideshow = () => {
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
  };

  try {
    const slug = new URLSearchParams(window.location.search).get("slug");
    if (!slug) throw new Error("Slug artikel tidak ditemukan di URL.");

    const artikelPath = `konten-kegiatan/${slug}.html`;
    let artikelHTML;
    if (App.cache.has(artikelPath)) {
      artikelHTML = App.cache.get(artikelPath);
    } else {
      const response = await fetch(artikelPath);
      if (!response.ok)
        throw new Error(`Gagal memuat konten artikel: ${response.statusText}`);
      artikelHTML = await response.text();
      App.cache.set(artikelPath, artikelHTML);
    }

    const parser = new DOMParser();
    const doc = parser.parseFromString(artikelHTML, "text/html");

    // Coba h1 dulu, kalau tidak ada baru h2
    const titleElement = doc.querySelector("h1") || doc.querySelector("h2");
    const title = titleElement
      ? titleElement.textContent
      : "Judul Tidak Ditemukan";

    const dateElement = doc.querySelector(".kegiatan-meta");
    const date = dateElement
      ? dateElement.textContent
      : "Tanggal Tidak Ditemukan";

    const contentElement = doc.querySelector(".artikel-konten");
    const content = contentElement
      ? contentElement.innerHTML
      : "<p>Konten tidak ditemukan.</p>";

    const words = contentElement
      ? contentElement.innerText.split(/\s+/).length
      : 0;
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
            <div class="artikel-konten">${content}</div>
            <a href="kegiatan.html" class="tombol-kembali"><i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan</a>
        `;
    initSlideshow();
  } catch (error) {
    console.error("Gagal memuat artikel:", error);
    container.innerHTML = `<div style="text-align: center;"><h2>Gagal Memuat Artikel</h2><p>Maaf, konten yang Anda cari tidak dapat ditemukan.</p><p><i>${error.message}</i></p><a href="kegiatan.html" class="kegiatan-tombol" style="margin-top: 20px;"><i class="fas fa-arrow-left"></i> Kembali ke Daftar Kegiatan</a></div>`;
  } finally {
    App.initScrollAnimations();
  }
};
