/**
 * @file page-initializers.js
 * @description Inisialisasi spesifik untuk setiap halaman Amazia.
 * @version 1.1.0 (Fix for Turbo race condition causing duplicate content)
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
    const selectedKategori = kategoriFilter.value;
    const sortOrder = sorter.value;

    const filteredData =
      selectedKategori === "semuanya"
        ? [...originalData]
        : originalData.filter((item) => item.kategori === selectedKategori);

    const sortedAndFilteredData = filteredData.sort((a, b) =>
      sortOrder === "terbaru"
        ? new Date(b.tanggal) - new Date(a.tanggal)
        : new Date(a.tanggal) - new Date(b.tanggal)
    );

    App.renderItems(
      container,
      sortedAndFilteredData,
      createKegiatanTemplate,
      "<p>Tidak ada kegiatan yang cocok dengan kriteria Anda.</p>"
    );
  };

  kategoriFilter.addEventListener("change", updateList);
  sorter.addEventListener("change", updateList);
  updateList();
};

// === GALERI PAGE (USING LIGHTGALLERY) ===
App.initializers.galeri = async () => {
  const data = await App.fetchData("galeri", "data/galeri.json");
  if (!data) return;

  const albumContainer = document.getElementById("album-grid");
  if (albumContainer && data.albumFoto) {
    const createAlbumTemplate = (album) => `
    <div class="album-item">
        <div class="album-cover" id="album-cover-${album.id}">
            <img src="${album.cover}" alt="Cover album ${
      album.judul
    }" loading="lazy">
            <div class="album-info"><h4>${album.judul}</h4><p>${
      album.deskripsi
    }</p></div>
            <div class="click-hint-animated">
                <i class="fas fa-hand-pointer"></i>
                <span>Buka Galeri</span>
            </div>
        </div>
        <div id="lightgallery-${album.id}" style="display:none;">
            ${album.foto
              .map(
                (foto) =>
                  `<a href="${foto.src}" data-sub-html="<h4>${
                    foto.title || album.judul
                  }</h4>">
                      <img src="${foto.src}" />
                  </a>`
              )
              .join("")}
        </div>
    </div>`;

    albumContainer.innerHTML = `
      <div class="album-carousel-wrapper">
        <button class="carousel-nav prev" aria-label="Sebelumnya">&lt;</button>
        <div class="album-carousel">
          ${data.albumFoto.map(createAlbumTemplate).join("")}
        </div>
        <button class="carousel-nav next" aria-label="Selanjutnya">&gt;</button>
      </div>
    `;

    data.albumFoto.forEach((album) => {
      const cover = document.getElementById(`album-cover-${album.id}`);
      const gallery = document.getElementById(`lightgallery-${album.id}`);

      const lg = lightGallery(gallery, {
        plugins: [lgThumbnail],
        speed: 500,
        download: false,
        mobileSettings: {
          controls: true,
          showCloseIcon: true,
        },
      });

      cover.addEventListener("click", () => {
        lg.openGallery();
      });
    });

    const wrapper = albumContainer.querySelector(".album-carousel-wrapper");
    const carousel = wrapper.querySelector(".album-carousel");
    const prevBtn = wrapper.querySelector(".prev");
    const nextBtn = wrapper.querySelector(".next");
    let autoPlayInterval;

    const startAutoPlay = () => {
      autoPlayInterval = setInterval(() => {
        const firstItem = carousel.querySelector(".album-item");
        if (!firstItem) return;
        const scrollAmount = firstItem.offsetWidth + 25;
        const isAtEnd =
          carousel.scrollLeft + carousel.clientWidth >=
          carousel.scrollWidth - 1;
        if (isAtEnd) {
          carousel.scrollTo({ left: 0, behavior: "smooth" });
        } else {
          carousel.scrollBy({ left: scrollAmount, behavior: "smooth" });
        }
      }, 3000);
    };
    const stopAutoPlay = () => clearInterval(autoPlayInterval);

    setTimeout(() => {
      const firstItem = carousel.querySelector(".album-item");
      if (!firstItem) return;
      const scrollAmount = firstItem.offsetWidth + 25;
      nextBtn.addEventListener("click", () =>
        carousel.scrollBy({ left: scrollAmount, behavior: "smooth" })
      );
      prevBtn.addEventListener("click", () =>
        carousel.scrollBy({ left: -scrollAmount, behavior: "smooth" })
      );
      wrapper.addEventListener("mouseenter", stopAutoPlay);
      wrapper.addEventListener("mouseleave", startAutoPlay);
      startAutoPlay();
    }, 100);
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
    const sorter = document.getElementById("video-sorter");
    const updateVideos = () => {
      const sortedData = [...data.dokumentasiVideo].sort((a, b) =>
        sorter.value === "terbaru"
          ? new Date(b.tanggal) - new Date(a.tanggal)
          : new Date(a.tanggal) - new Date(b.tanggal)
      );
      renderVideos(sortedData);
    };
    sorter.addEventListener("change", updateVideos);
    updateVideos();
  }
};

// === INFORMASI PAGE ===
App.initializers.informasi = async () => {
  const container = document.getElementById("info-list");
  if (!container) return;

  const kategoriFilter = document.getElementById("informasi-kategori-filter");
  const sorter = document.getElementById("informasi-sorter");

  const getTagClass = (kategori) => {
    switch (kategori.toLowerCase()) {
      case "kutipan":
        return "tag-pengumuman";
      case "twets":
        return "tag-update";
      case "nganu":
        return "tag-penting";
      default:
        return "tag-default";
    }
  };

  const createInformasiTemplate = (info) => `
    <div class="info-item animate-on-scroll">
      <div class="info-header">
        <h3>${info.judul}</h3>
        <span class="info-tag ${getTagClass(info.kategori)}">${
    info.kategori
  }</span>
      </div>
      <p class="info-meta">
        <i class="fas fa-calendar-alt"></i> ${new Date(
          info.tanggal
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        ${info.meta_info ? `<span>| ${info.meta_info}</span>` : ""}
      </p>
      <div class="info-body">${info.konten_html}</div>
    </div>`;

  const jsonData = await App.fetchData("informasi", "data/informasi.json");
  const originalData = jsonData ? jsonData.informasi : [];

  if (!originalData || originalData.length === 0) {
    container.innerHTML = "<p>Gagal memuat atau tidak ada informasi.</p>";
    return;
  }

  const updateList = () => {
    const selectedKategori = kategoriFilter.value;
    const sortOrder = sorter.value;

    const filteredData =
      selectedKategori === "semuanya"
        ? [...originalData]
        : originalData.filter((item) => item.kategori === selectedKategori);

    const sortedAndFilteredData = filteredData.sort((a, b) => {
      const dateA = new Date(a.tanggal);
      const dateB = new Date(b.tanggal);
      return sortOrder === "terbaru" ? dateB - dateA : dateA - dateB;
    });

    App.renderItems(
      container,
      sortedAndFilteredData,
      createInformasiTemplate,
      "<p>Tidak ada kutipan atau catatan yang cocok.</p>"
    );
  };

  kategoriFilter.addEventListener("change", updateList);
  sorter.addEventListener("change", updateList);
  updateList();
};

// === ABOUT PAGE (Tidak ada perubahan) ===
App.initializers.about = async () => {
  // Kode untuk halaman about tetap sama, tidak perlu diubah.
};

// === KONTAK PAGE (Tidak ada perubahan) ===
App.initializers.kontak = async () => {
  // Kode untuk halaman kontak tetap sama, tidak perlu diubah.
};

// === ARTIKEL PAGE (KODE YANG DIPERBAIKI) ===
App.initializers.artikel = async () => {
  const container = document.getElementById("artikel-dinamis-container");
  if (!container) return;

  // --- PERBAIKAN: Tambahkan pengecekan ini ---
  // Jika container sudah memiliki atribut 'data-content-loaded',
  // artinya skrip sudah berjalan. Hentikan eksekusi lebih lanjut.
  if (container.dataset.contentLoaded === "true") {
    return;
  }
  // Tandai bahwa skrip sekarang sedang berjalan untuk mencegah pemanggilan ganda
  container.dataset.contentLoaded = "true";
  // --- AKHIR PERBAIKAN ---

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
        clearInterval(parseInt(container.dataset.intervalId));

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
    const response = await fetch(artikelPath);
    if (!response.ok)
      throw new Error(`Gagal memuat konten artikel: ${response.statusText}`);
    const artikelHTML = await response.text();

    const parser = new DOMParser();
    const doc = parser.parseFromString(artikelHTML, "text/html");

    // Gunakan h1 atau h2 sebagai judul, mana saja yang ada
    const titleElement = doc.querySelector("h1") || doc.querySelector("h2");
    const title = titleElement
      ? titleElement.textContent
      : "Judul Tidak Ditemukan";

    const dateElement = doc.querySelector(".kegiatan-meta");
    const date = dateElement
      ? dateElement.textContent
      : "Tanggal Tidak Ditemukan";

    const contentContainer = doc.querySelector(".artikel-konten");
    if (!contentContainer)
      throw new Error("Struktur konten artikel tidak valid.");

    const words = contentContainer.innerText.split(/\s+/).length;
    const readingTime = Math.ceil(words / 200);

    document.title = `${title} - Amazia Blog`;
    container.innerHTML = `
        <div class="artikel-header">
            <h1>${title}</h1>
            <div class="artikel-meta-info">
                <span><i class="fas fa-calendar-alt"></i> ${date}</span>
                <span><i class="fas fa-clock"></i> Estimasi ${readingTime} menit baca</span>
            </div>
        </div>
        <div class="artikel-konten">${contentContainer.innerHTML}</div>
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
