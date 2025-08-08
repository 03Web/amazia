document.addEventListener("turbo:load", () => {
  // --- PENGATURAN DASAR ---
  const DEEPSEEK_API_KEY = "sk-8c1031d7a6ee4b1e95e8605bc71bcf1e";
  const API_URL = "https://api.deepseek.com/v1/chat/completions";

  // --- "PENGETAHUAN" KHUSUS UNTUK BLOG AMAZIA ---
  const KNOWLEDGE_BASE = `
        - Nama Blog: The Great Apes: Random Thoughts and Everything Else.
        - Penulis/Pemilik: Amazia Kristanto.
        - Deskripsi Penulis: Seorang mahasiswa Teknik Informatika, pengamat paruh waktu, dan manusia yang mencoba memahami 'bug' dan 'fitur' dari program bernama kehidupan.
        - Deskripsi Blog: Blog ini adalah kumpulan pemikiran acak, analisis, dan eksplorasi tentang berbagai topik. Ini adalah tempat untuk menuangkan ide-ide liar dan mencoba memahami dunia dari berbagai sudut pandang, seringkali dengan lensa kritis terhadap sejarah, kekuasaan, dan pengetahuan itu sendiri.

        ---
        

        TENTANG BLOG DAN PENULIS (DARI HALAMAN 'ABOUT'):
        - Siapa Amazia Kristanto?: Seorang warga sipil biasa, mahasiswa Teknik Informatika, dan pengamat paruh waktu. Ia mendeskripsikan dirinya sering terjebak dalam pengamatan absurd terhadap hal-hal di sekitarnya.
        - Isi Kepala Penulis: Pikirannya sering melompat dari konsep rumit seperti entropi ke pertanyaan absurd seperti "apakah benar Hitler mati di Garut?". Blog ini adalah cara untuk menangkap pikiran-pikiran liar tersebut.
        - Filosofi Blog:
            1.  **Pergulatan, Bukan Pencerahan:** Blog ini bukan tentang memberi jawaban, melainkan tentang merayakan indahnya sebuah pertanyaan.
            2.  **Kejujuran yang Mungkin Tidak Nyaman:** Fokus utama blog adalah membongkar banyak hal untuk memahami fondasinya, dengan selalu bertanya "kenapa?".
            3.  **Merayakan "Saya Tidak Tahu":** Blog ini adalah monumen untuk merayakan ketidaktahuan sebagai awal dari pengetahuan sejati.
        - Ajakan untuk Pembaca: "Selamat Datang di Warung Kopi Digital Saya. Ambil kursi. Mari kita bingung bersama-sama."

        ---
        
        TEMA DAN KATEGORI KONTEN UTAMA DI BLOG:
        - Share Education: Membahas konsep dasar dan fundamental dari ekonomi, uang fiat, dan distribusi kekayaan.
        - History (Sejarah): Menganalisis topik seperti pemikiran Tan Malaka (Madilog), pentingnya belajar sejarah, dan dekonstruksi kebencian era Nazi.
        - Keresahan (Social Commentary): Tulisan tentang fenomena sosial seperti pengangguran sarjana, sensor sejarah (analogi One Piece), perbandingan dunia primitif vs modern, dan fenomena 'Brain Rot' di era digital.
        - Science: Penjelasan mengenai apa itu sains, hierarki ilmu pengetahuan, dan konsep-konsep ilmiah lainnya.
        - Notes & Articles Random: Catatan singkat dan pemikiran acak, termasuk tentang Alan Turing dan filsafat F. Budi Hardiman.
        - Philosophy: Pengantar dan diskusi tentang aliran filsafat seperti Stoikisme.
        - Summary Books: Ringkasan dan analisis buku, contohnya "The Two Gods of Leviathan" oleh A.P. Martinich yang membahas pemikiran Hobbes.

        ---

        KUMPULAN KUTIPAN, TWEETS, DAN CATATAN RANDOM (DARI HALAMAN "NGANU"):
        - Judul: Nganu, Kategori: nganu, Tanggal: 2025-02-03, Konten: Lagipula, setiap orang adalah pahlawan dalam kisahnya masing-masing.
        - Judul: Nganu, Kategori: nganu, Tanggal: 2025-02-02, Konten: In the end, life is about being realistic and going with the flow, not about being idealistic and dreaming of a limitless sky.
        - Judul: Nganu, Kategori: nganu, Tanggal: 2025-02-01, Konten: Life is hard, and it’s become harder when you are stupid.
        - Judul: Nganu, Kategori: nganu, Tanggal: 2025-01-30, Konten: You Are What You Eat.
        - Judul: Nganu, Kategori: nganu, Tanggal: 2025-01-29, Konten: You don’t have to prove anything to anyone. You just gotta live your life.
        - Judul: Albert Einstein, Kategori: kutipan, Tanggal: 1955-10-13, Meta: (1879-1955), Konten: Imajinasi lebih penting daripada pengetahuan. Karena pengetahuan itu terbatas, sedangkan imajinasi mencakup seluruh dunia, merangsang kemajuan, melahirkan evolusi. Hal ini, secara tegas, merupakan faktor nyata dalam penelitian ilmiah.
        - Judul: Richard Feynman, Kategori: kutipan, Tanggal: 1988-10-13, Meta: (1918-1988), Konten: Anda tidak memiliki tanggung jawab untuk memenuhi apa yang orang lain pikir harus Anda capai. Saya tidak memiliki tanggung jawab untuk menjadi seperti yang mereka harapkan. Itu adalah kesalahan mereka, bukan kegagalan saya.
        - Judul: Richard Feynman, Kategori: kutipan, Tanggal: 1988-10-14, Meta: (1918-1988), Konten: Jika Anda tidak dapat menjelaskan sesuatu dengan bahasa sederhana, berarti Anda tidak memahaminya.
        - Judul: Richard Feynman, Kategori: kutipan, Tanggal: 1988-10-15, Meta: (1918-1988), Konten: Saya tidak suka penghargaan.
        - Judul: Carl Sagan, Kategori: kutipan, Tanggal: 1994-10-13, Meta: (1939-1996), Konten: Sia-sia meyakinkan orang yang sudah telanjur percaya; karena kepercayaannya tidak bersumber dari bukti, melainkan dari kebutuhan batin yang kuat untuk percaya.
        - Judul: Carl Sagan, Kategori: kutipan, Tanggal: 1996-10-13, Meta: (1939-1996), Konten: “Setiap dari kita, dalam perspektif kosmik, sangatlah berharga. Jika ada manusia yang tidak sependapat denganmu, biarkan dia hidup. Di antara seratus miliar galaksi, kau tidak akan menemukan yang serupa dengannya.”
        - Judul: Carl Sagan (Pale Blue Dot), Kategori: kutipan, Tanggal: 1994-10-14, Meta: (1939-1996), Konten: Dari jarak sejauh ini, Bumi tidak lagi terlihat penting. Namun bagi kita, lain lagi ceritanya... Bumi adalah satu-satunya rumah yang kita kenal selama ini.
        - Judul: Carl Sagan, Kategori: kutipan, Tanggal: 1994-10-15, Meta: (1939-1996), Konten: Nitrogen dalam DNA kita, kalsium dalam gigi kita, zat besi dalam darah kita, karbon dalam pai apel kita dibuat di dalam interior bintang yang runtuh. Kita terbuat dari materi bintang.
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2012-12-06, Meta: 6 Des 2012, Konten: Ilmu pengetahuan yang baik adalah yang menyisakan pertanyaan, sebagai pijakan untuk berkembangan ilmu itu sendiri. Tidak pernah final...
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2020-01-25, Meta: 20 Jan 2020, Konten: Ilmu pengetahuan mengajarkan Anda untuk membuka mata dan menghargai realitas di sekitar Anda. Takhayul mengajarkan Anda untuk menutup mata dan berpegang teguh pada fantasi di dalam diri Anda.
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2020-03-27, Meta: 27 Mar 2020, Konten: Hanya karena Anda ingin hal itu benar, bukan berarti itu benar. Hanya karena miliaran orang percaya, bukan berarti mereka harus percaya. Dan hanya karena kebenaran itu menyakitkan, bukan berarti kebenaran itu tidak benar.
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2020-07-13, Meta: 13 Jul 2020, Konten: Berapa banyak malapetaka yang diawali dengan “niat baik”?
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2019-03-17, Meta: 17 Mar 2019, Konten: “Jika Anda pikir sihir adalah jawaban dari pertanyaan Anda, berarti Anda belum berusaha cukup keras.”
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2019-12-30, Meta: 30 Des 2019, Konten: “Betapa sebuah hukuman yang hebat bagi mereka yang tidak percaya pada kenyataan, mereka dipaksa untuk menerimanya setiap hari.”
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2020-12-15, Meta: 15 Des 2020, Konten: Semesta ini berjalan tidak dengan mengikuti karepe raimu.
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2019-12-15, Meta: 15 Des 2019, Konten: Tidak ada cara yg benar atau cara yg salah dalam menjalani depresi, semua mengalir begitu saja tak bisa dibendung. Kalo dengan menjilat setir mobil bisa membuat merasa lebih nyaman ya lakukan saja.
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2017-04-15, Meta: 15 Apr 2017, Konten: “Apa yang tidak kita ketahui, kita takuti. Apa yang kita takuti, kita benci. Apa yang kita benci, kita hancurkan. Pendidikan adalah jawaban atas semua masalah kehidupan.”
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2020-03-29, Meta: 29 Mar 2020, Konten: “Satu-satunya obat untuk ketidaktahuan adalah pendidikan. Namun, jika ketidaktahuan itu sudah terlalu mengakar, si bodoh akan memilih untuk tidak mencari pendidikan. Beginilah cara otak kita bekerja.”
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2018-10-11, Meta: 11 Okt 2018, Konten: “Kalau menurutmu pendidikan itu mahal, cobalah kebodohan.”
        - Judul: Ryu Hasan, Kategori: Twets, Tanggal: 2018-09-30, Meta: 30 Sep 2018, Konten: “Hidup adalah lelucon bagi bedes-bedes yg berpikir, dan tragedi bagi mereka yg mengandalkan perasaan.”
        - Judul: Stephen Hawking, Kategori: kutipan, Tanggal: 2018-03-14, Meta: (1942-2018), Konten: “Buang-buang waktu saja untuk marah tentang disabilitas saya. Kita harus melanjutkan hidup dan saya tidak melakukan hal yang buruk. Orang tidak akan punya waktu untuk Anda jika Anda selalu marah atau mengeluh.”
        - Judul: Naval Ravikant, Kategori: Twets, Tanggal: 2020-10-30, Meta: Pengusaha, Investor, Konten: “Anda menghabiskan waktu untuk menghemat uang, padahal seharusnya Anda membelanjakan uang untuk menghemat waktu.”
        - Judul: Wendell Berry, Kategori: kutipan, Tanggal: 1980-01-01, Meta: Penyair, Novelis, Konten: Maka aku pun pergi ke hutan. Saat aku masuk ke bawah pepohonan, dengan percaya diri, hampir seketika, tanpa melakukan apa pun, semuanya berjalan sebagaimana mestinya... Aku tak sepenting yang kukira. Aku bersukacita karenanya.
        - Judul: Michael Levitt, Kategori: kutipan, Tanggal: 2013-10-10, Meta: Pemenang Nobel Kimia 2013, Konten: Kecenderungan alami saya dalam hidup adalah selalu memperlakukan hidup sebagai Prasmanan. Ambillah apa yang kamu suka, dan jangan mengeluh terhadap apa yang tidak kamu suka.
        - Judul: Bertrand Russell, Kategori: kutipan, Tanggal: 1950-01-01, Meta: (1872-1970), Konten: Masalahnya dengan dunia ini adalah bahwa orang bodoh dan fanatik selalu begitu yakin dengan diri mereka sendiri, dan orang-orang yang lebih bijaksana begitu penuh keraguan.
        - Judul: George Orwell, Kategori: kutipan, Tanggal: 1949-01-01, Meta: (1903-1950), Konten: Bahasa politik dirancang untuk membuat kebohongan terdengar benar.
        - Judul: Isaac Asimov, Kategori: kutipan, Tanggal: 1988-01-01, Meta: (1920 - 1992), Konten: Pendidikan bukanlah sesuatu yang dapat Anda selesaikan.

        ---

        KONTAK PENULIS:
        - Instagram: @amaz_03
        - Twitter/X: @AmaziaKristanto
        - Email: amaziakristanto003@gmail.com
        - Website Terkait: Karang Taruna Banjarsari (03web.github.io/Karang-Taruna-Banjarsari/)
    `;

  // --- KODE LOGIKA CHATBOT (Sama seperti sebelumnya) ---
  const sendBtn = document.getElementById("send-chat-btn");
  const chatInput = document.getElementById("chat-input");
  const chatWindow = document.getElementById("chat-window");
  const openBtn = document.getElementById("open-chatbot-btn");
  const closeBtn = document.getElementById("close-chatbot");
  const chatbotContainer = document.getElementById("chatbot-container");

  if (!sendBtn) return;

  openBtn.addEventListener("click", () => {
    chatbotContainer.style.display = "flex";
    openBtn.style.display = "none";
  });
  closeBtn.addEventListener("click", () => {
    chatbotContainer.style.display = "none";
    openBtn.style.display = "block";
  });

  async function getAiResponse(userQuestion) {
    const system_prompt = `Anda adalah AmaBot, AI partner yang analitis, reflektif, dan memiliki pemahaman mendalam untuk blog 'The Great Apes'. Anda bukan sekadar asisten, melainkan seorang partner diskusi intelektual bagi pengunjung. Misi Anda adalah membantu pengguna menjelajahi, menghubungkan, dan memahami gagasan-gagasan kompleks yang ada di dalam blog.

================================
PRINSIP KECERDASAN UTAMA (WAJIB DIIKUTI)
================================

1.  **PENALARAN & INFERENSI (Berpikir, Jangan Hanya Mencari):**
    * Tugas utama Anda adalah menghubungkan informasi dari 'KNOWLEDGE_BASE' untuk menjawab pertanyaan yang jawabannya tidak eksplisit.
    * **Contoh Skenario:** Jika pengguna bertanya, "Apa pandangan penulis tentang kekuasaan?", Anda HARUS mampu menyintesis jawaban dari berbagai artikel, seperti ringkasan buku Hobbes ('The Two Gods of Leviathan'), analisis tentang Tan Malaka, dan bahkan dekonstruksi propaganda Nazi. Jangan hanya bilang "tidak ada artikel spesifik tentang itu", tapi RANGKAI jawabannya dari potongan-potongan bukti yang ada.

2.  **SINTESIS & GAMBARAN BESAR (Menyajikan Peta Gagasan):**
    * Saat ditanya pertanyaan umum (misal: "Blog ini tentang apa?"), jangan hanya daftar kategori. Anda HARUS **menyintesis tema-tema utamanya**.
    * **Contoh Jawaban Ideal:** "Blog ini secara garis besar menjelajahi bagaimana kekuasaan, pengetahuan, dan sejarah saling berkelindan. Penulis sering menggunakan lensa kritis untuk membongkar narasi yang sudah mapan, baik dalam politik, seperti pada tulisan tentang Tan Malaka, maupun dalam sains, seperti pada artikel tentang hierarki ilmu pengetahuan."

3.  **KONEKSI TEMATIK (Menjadi Pemandu Intelektual - *IMPROVEMENT*):**
    * Ini adalah kemampuan **paling penting** Anda. Selalu cari benang merah yang menghubungkan berbagai tulisan.
    * Setelah menjawab pertanyaan tentang satu artikel, secara proaktif tawarkan koneksi ke artikel lain yang relevan secara tematik.
    * **Contoh Skenario:** Jika pengguna bertanya tentang artikel 'Brain Rot', setelah Anda menjawab, tambahkan: "Fenomena 'Brain Rot' ini menarik, karena ia menyentuh tema tentang bagaimana pengetahuan dibentuk di era modern. Penulis juga membahas ini dari sudut pandang yang berbeda di artikel 'Hierarki Ilmu Pengetahuan'. Tertarik untuk melihat koneksinya?"

4.  **PROAKTIF & ANTISIPATIF (Memperdalam Diskusi):**
    * Setelah menjawab, selalu antisipasi pertanyaan lanjutan yang lebih dalam.
    * **Contoh:** Setelah menjelaskan kategori 'History', tawarkan: "Tulisan-tulisan di kategori Sejarah seringkali menantang narasi resmi. Apakah ada tokoh atau periode sejarah tertentu yang ingin Anda ketahui dari sudut pandang blog ini?"

5.  **MENANGANI KETIDAKPASTIAN (Secara Cerdas dan Jujur):**
    * Jika informasi benar-benar tidak ada dan tidak bisa disimpulkan, berikan jawaban yang jujur namun tetap bermanfaat.
    * **Contoh Fallback Ideal:** "Maaf, saya sudah menganalisis semua konten yang ada, namun detail spesifik tentang itu tidak dibahas di dalam blog. Namun, topik tersebut sangat relevan dengan kategori 'Keresahan'. Mungkin Anda tertarik membaca tulisan lain di kategori itu?"

================================
FORMAT & GAYA PENYAJIAN
================================

* **Gaya Bahasa:** Analitis, intelektual, namun tetap mudah diakses dan memancing diskusi. Gunakan bahasa Indonesia yang kaya dan terstruktur. Anggap pengguna adalah teman diskusi yang cerdas.
* **Format Jawaban (PENTING):** Gunakan Markdown secara ekstensif untuk keterbacaan maksimal. Gunakan **bold** untuk penekanan, *italic* untuk istilah, dan bullet points (\`-\`) atau numbering (\`1\`) untuk daftar atau rincian.
* **Panduan Penggunaan Emoji (Lebih Dewasa & Kontekstual):**
    * **Diskusi & Analisis:** 🧠, 🤔, 🧐, 📚, 🏛️, 🔬
    * **Menghubungkan Gagasan:** ✨, 🔗, 👉
    * **Poin Penting:** 📌, 🎯
    * **Sapaan & Bantuan:** 👋, 😊
    * **Saat Tidak Menemukan Jawaban:** 😅, 🙏

Tujuan akhir Anda adalah mengubah setiap interaksi dari sekadar sesi tanya-jawab menjadi sebuah perjalanan intelektual yang memperkaya pemahaman pengguna terhadap isi blog.
`;

    const user_prompt = `
            KNOWLEDGE_BASE:
            ${KNOWLEDGE_BASE}

            PERTANYAAN SAYA:
            "${userQuestion}"
        `;

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: system_prompt },
            { role: "user", content: user_prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("API Error:", errorData);
        return `Maaf, terjadi kesalahan dari API: ${errorData.error.message}`;
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error("Gagal menghubungi AI:", error);
      return "Terjadi kesalahan koneksi. Pastikan internet Anda stabil.";
    }
  }

  const handleSendMessage = async () => {
    const question = chatInput.value.trim();
    if (!question) return;

    addMessageToWindow(question, "user-message");
    chatInput.value = "";
    addMessageToWindow("Sedang mengetik...", "bot-message", true);

    const answer = await getAiResponse(question);

    document.getElementById("loading-indicator")?.remove();
    addMessageToWindow(answer, "bot-message");
  };

  const addMessageToWindow = (message, className, isLoading = false) => {
    const messageDiv = document.createElement("div");
    messageDiv.className = className;
    // Menggunakan innerHTML untuk merender Markdown sederhana
    messageDiv.innerHTML = message.replace(/\n/g, "<br>");
    if (isLoading) {
      messageDiv.id = "loading-indicator";
    }
    chatWindow.appendChild(messageDiv);
    chatWindow.scrollTop = chatWindow.scrollHeight;
  };

  sendBtn.addEventListener("click", handleSendMessage);
  chatInput.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      handleSendMessage();
    }
  });
});
