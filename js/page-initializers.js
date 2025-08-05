/**
 * @file page-initializers.js
 * @description Inisialisasi spesifik untuk setiap halaman Karang Taruna (UI Amazia).
 */

// === KEGIATAN PAGE ===
App.initializers.kegiatan = async () => {
  const container = document.getElementById("kegiatan-list");
  if (!container) return;

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
    const sortOrder = sorter.value;
    const sortedData = [...originalData].sort((a, b) =>
      sortOrder === "terbaru"
        ? new Date(b.tanggal) - new Date(a.tanggal)
        : new Date(a.tanggal) - new Date(b.tanggal)
    );
    App.renderItems(
      container,
      sortedData,
      createKegiatanTemplate,
      "<p>Tidak ada kegiatan untuk ditampilkan.</p>"
    );
  };

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

            <div class="click-hint-animated">
                <i class="fas fa-hand-pointer"></i>
                <span>Buka Galeri</span>
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

  const sorter = document.getElementById("informasi-sorter");
  const kategoriFilter = document.getElementById("informasi-kategori-filter");

  // Fungsi untuk memetakan 'kategori' dari JSON ke kelas CSS untuk tag
  const getTagClass = (kategori) => {
    switch (kategori.toLowerCase()) {
      case "kutipan":
        return "tag-penting"; // Merah
      case "twets":
        return "tag-pengumuman"; // Biru
      case "nganu":
        return "tag-update"; // Hijau
      default:
        return "";
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
        <i class="fas fa-calendar-alt"></i> Diposting pada ${new Date(
          info.tanggal
        ).toLocaleDateString("id-ID", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })}
        ${
          info.meta_info ? `<span>| <em>${info.meta_info}</em></span>` : ""
        } </p>
      <div class="info-body">${info.konten_html}</div>
    </div>`;

  const dataObject = await App.fetchData("informasi", "data/informasi.json");
  if (!dataObject || !dataObject.informasi) {
    container.innerHTML = "<p>Gagal memuat atau tidak ada informasi.</p>";
    return;
  }

  const originalData = dataObject.informasi; // <-- PERBAIKAN 1: Mengakses array 'informasi'

  const updateList = () => {
    let filteredData = [...originalData];

    // 1. Terapkan Filter Kategori
    const selectedKategori = kategoriFilter.value;
    if (selectedKategori !== "semuanya") {
      filteredData = filteredData.filter(
        (item) => item.kategori.toLowerCase() === selectedKategori.toLowerCase()
      );
    }

    // 2. Terapkan Urutan (Sorting)
    const sortOrder = sorter.value;
    filteredData.sort((a, b) =>
      sortOrder === "terbaru"
        ? new Date(b.tanggal) - new Date(a.tanggal)
        : new Date(a.tanggal) - new Date(b.tanggal)
    );

    // 3. Render hasil ke halaman
    App.renderItems(
      container,
      filteredData,
      createInformasiTemplate,
      "<p>Tidak ada informasi yang cocok dengan filter ini.</p>"
    );
  };

  // Tambahkan event listener untuk setiap perubahan pada filter atau sorter
  sorter.addEventListener("change", updateList);
  kategoriFilter.addEventListener("change", updateList);

  // Muat daftar untuk pertama kali
  updateList();
};

// === ABOUT PAGE (STRUKTUR ORGANISASI) ===
// === ABOUT PAGE (STRUKTUR ORGANISASI) ===
App.initializers.about = async () => {
  const container = document.getElementById("pohon-organisasi-container");
  if (!container) return;
  const data = await App.fetchData("pengurus", "data/pengurus.json");
  if (!data) {
    container.innerHTML = "<p>Gagal memuat struktur organisasi.</p>";
    return;
  }
  const createNode = (jabatan, nama, fotoUrl) => {
    const imageTag = fotoUrl
      ? `<img src="${fotoUrl}" alt="Foto ${nama}" class="foto-node" loading="lazy">`
      : `<span class="foto-node foto-node-placeholder fas fa-user"></span>`;
    return `<div>${imageTag}<span class="jabatan">${jabatan}</span><span class="nama">${nama}</span></div>`;
  };
  const createBidangTitleNode = (namaBidang) =>
    `<div><span class="jabatan">${namaBidang}</span></div>`;

  container.innerHTML =
    '<ul class="pohon-organisasi" id="pohon-organisasi-chart"></ul>';
  const chart = document.getElementById("pohon-organisasi-chart");

  const { pengurusInti, bidang } = data;
  const ketua = pengurusInti.find((p) => p.jabatan === "Ketua");
  const sisaPengurusInti = pengurusInti.filter((p) => p.jabatan !== "Ketua");

  // Ketua akan menjadi node paling atas dalam struktur
  let chartContent = `<li>${createNode(
    ketua.jabatan,
    ketua.nama,
    ketua.foto
  )}<ul>`;

  // Membuat kelompok untuk sisa pengurus inti sebagai cabang pertama
  let pengurusIntiHtml = '<ul class="anggota-grid">';
  sisaPengurusInti.forEach((p) => {
    pengurusIntiHtml += `<li>${createNode(p.jabatan, p.nama, p.foto)}</li>`;
  });
  pengurusIntiHtml += "</ul>";
  chartContent += `<li>${createBidangTitleNode(
    "Pengurus Inti"
  )}${pengurusIntiHtml}</li>`;

  // Membuat kelompok untuk setiap bidang sebagai cabang berikutnya
  bidang.forEach((b) => {
    let anggotaHtml = '<ul class="anggota-grid">';
    b.anggota.forEach((a) => {
      anggotaHtml += `<li>${createNode(a.jabatan, a.nama, a.foto)}</li>`;
    });
    anggotaHtml += "</ul>";
    chartContent += `<li>${createBidangTitleNode(
      b.namaBidang
    )}${anggotaHtml}</li>`;
  });

  chartContent += `</ul></li>`;
  chart.innerHTML = chartContent;

  // --- KODE KONTROL ZOOM & GESER (PAN) ---
  const zoomInBtn = document.getElementById("zoom-in-btn");
  const zoomOutBtn = document.getElementById("zoom-out-btn");
  const zoomLevelDisplay = document.getElementById("zoom-level");
  let currentZoom = 1;
  const applyZoom = () => {
    chart.style.transform = `scale(${currentZoom})`;
    zoomLevelDisplay.textContent = `${Math.round(currentZoom * 100)}%`;
  };
  zoomInBtn.addEventListener("click", () => {
    currentZoom = Math.min(2, currentZoom + 0.1);
    applyZoom();
  });
  zoomOutBtn.addEventListener("click", () => {
    currentZoom = Math.max(0.3, currentZoom - 0.1);
    applyZoom();
  });

  let isPanning = false,
    startX,
    scrollLeft;
  container.addEventListener("mousedown", (e) => {
    isPanning = true;
    container.style.cursor = "grabbing";
    startX = e.pageX - container.offsetLeft;
    scrollLeft = container.scrollLeft;
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
    const walk = x - startX;
    container.scrollLeft = scrollLeft - walk;
  });

  // --- BARU: MEMBUAT POSISI DI TENGAH SAAT HALAMAN DIBUKA ---
  // Diberi sedikit jeda untuk memastikan DOM selesai dimuat
  setTimeout(() => {
    const containerWidth = container.offsetWidth;
    const chartWidth = chart.scrollWidth;
    container.scrollLeft = (chartWidth - containerWidth) / 2;
  }, 100);
};

// === KONTAK PAGE ===
App.initializers.kontak = async () => {
  const container = document.getElementById("kontak-grid");
  if (!container) return;
  const data = await App.fetchData("kontak", "data/kontak.json");

  const createKontakTemplate = (kontak) => `
    <div class="kontak-card animate-on-scroll">
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
    </div>`;
  App.renderItems(
    container,
    data,
    createKontakTemplate,
    "Gagal memuat daftar narahubung."
  );
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

    const title = doc.querySelector("h2").textContent;
    const date = doc.querySelector(".kegiatan-meta").textContent;
    const contentContainer = doc.querySelector(".artikel-konten");
    const words = contentContainer.innerText.split(/\s+/).length;
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
            ${doc.querySelector(".slideshow-container")?.outerHTML || ""}
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
