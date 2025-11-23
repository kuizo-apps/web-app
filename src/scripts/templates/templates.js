// ===== Shared Maps =====
export const STATUS_MAP = {
  persiapan: { text: "Persiapan", className: "persiapan" },
  berlangsung: { text: "Berlangsung", className: "berlangsung" },
  berakhir: { text: "Berakhir", className: "berakhir" },
};

export const MECHANISM_BADGE_MAP = {
  static: { text: "Statis", className: "static", icon: "bi-card-list" },
  random: { text: "Acak", className: "random", icon: "bi-shuffle" },
  rule_based: {
    text: "Adaptif (Rule)",
    className: "adaptive-fixed", // Kita pakai style adaptive utk rule_based
    icon: "bi-cpu",
  },
};

export const MECHANISM_DESC_MAP = {
  static: "Soal sama untuk semua peserta, urutan tetap.",
  random: "Soal diacak dari bank soal untuk setiap peserta.",
  rule_based: "Soal diberikan bertahap berdasarkan kemampuan jawaban sebelumnya (Wajib dijawab).",
};

// Template Halaman Home
export const createHomePageTemplate = (user) => `
  <div class="page-header">
    <h1 id="welcome-title">Halo, ${user.name}</h1>
    <p id="welcome-message">Semua ruang ujian Anda ada di sini. Bergabunglah ke sesi baru atau lihat riwayat asesmen Anda.</p>
  </div>
  ${createJoinRoomFormTemplate()}
  <div class="room-list-header">
    <h2>Riwayat Asesmen Anda</h2>
  </div>
  <div id="room-list-container">
    ${createSkeletonRoomItemTemplate(3)}
  </div>
`;

const createJoinRoomFormTemplate = () => `
  <div class="join-room-card">
    <h3>Gabung Room Baru</h3>
        <form id="joinRoomForm" class="join-room-form">
      <input type="text" class="keypass-input" placeholder="Contoh: YU299NJN" required />
      <button type="submit" class="submit-btn">
        <span>Bergabung</span>
      </button>
    </form>
      </div>
`;

export const createRoomListTemplate = (rooms) => {
  if (!rooms || rooms.length === 0) {
    return `<p class="empty-message">Anda belum bergabung dengan room ujian manapun.</p>`;
  }
  return `
    <div class="room-list">
      ${rooms.map(createRoomItemTemplate).join("")}
    </div>
  `;
};

const createRoomItemTemplate = (room) => {
  const currentStatus = STATUS_MAP[room.status] || {
    text: room.status,
    className: "default",
  };

  const formattedDate = new Date(room.join_timestamp).toLocaleDateString(
    "id-ID",
    {
      day: "numeric",
      month: "long",
      year: "numeric",
    }
  );

  const currentMechanism = MECHANISM_BADGE_MAP[room.assessment_mechanism] || {
    text: "N/A",
    className: "default",
  };

  const mechanismDescription =
    MECHANISM_DESC_MAP[room.assessment_mechanism] ||
    "Deskripsi mekanisme tidak tersedia.";

  const isDisabled = currentStatus.className !== "berakhir";

  return `
    <div class="room-item">
      <div class="room-item-header">
        <h3>${room.name}</h3>
        <span class="status-badge status-${currentStatus.className}">
          ${currentStatus.text}
        </span>
      </div>
      <p class="room-description">${mechanismDescription}</p>
      <div class="room-details">
        <span><i class="bi bi-card-checklist"></i> ${
          room.question_count
        } Soal</span>
        <span><i class="bi bi-calendar-event"></i> ${formattedDate}</span>
        <a href="#/report/${room.id}" class="action-btn ${
    isDisabled ? "disabled" : ""
  }">
          Lihat Hasil
        </a>
      </div>
    </div>
  `;
};

export const createSkeletonRoomItemTemplate = (count = 1) => {
  let skeletons = "";
  for (let i = 0; i < count; i++) {
    skeletons += `
      <div class="room-item skeleton">
        <div class="skeleton-line title"></div>
        <div class="skeleton-line text"></div>
        <div class="skeleton-line text short"></div>
        <div class="skeleton-line button"></div>
      </div>
    `;
  }
  return `<div class="room-list">${skeletons}</div>`;
};

export const createMainLayoutTemplate = () => `
  <header class="main-header">
    <div class="header-content">
      <div class="header-left">
        <a href="#/home" class="brand-logo">
          <img src="/images/favicon.svg" alt="App Logo" />
          <span>Kuizo Web App</span>
        </a>
      </div>

      <nav class="header-nav">
        <a href="#/home" data-path="#/home">Home</a>
        <a href="#/activity" data-path="#/activity">Activity</a>
        <a href="#/badge" data-path="#/badge">Badge</a>
        <a href="#/setting" data-path="#/setting">Setting</a>
      </nav>

      <div class="header-right">
        <button id="logoutButton" class="logout-btn">
          <i class="bi bi-box-arrow-right"></i>
          <span>Logout</span>
        </button>
        
        <button id="hamburger-btn" class="hamburger-btn">
          <i class="bi bi-list"></i>
        </button>
      </div>
    </div>
  </header>

  <nav id="mobile-nav" class="mobile-nav">
    <a href="#/home" data-path="#/home">Home</a>
    <a href="#/activity" data-path="#/activity">Activity</a>
    <a href="#/badge" data-path="#/badge">Badge</a>
    <a href="#/setting" data-path="#/setting">Setting</a>
    <a href="#" id="mobile-logoutButton">Logout</a>
  </nav>

  <main id="main-content" class="main-content" tabindex="-1"></main>
  ${createCountdownOverlayTemplate()}
`;

// Template countdown overlay
const createCountdownOverlayTemplate = () => `
  <div id="countdown-overlay" class="hidden">
    <div class="countdown-content">
      <h1>Mempersiapkan sesi asesmen Anda...</h1>
      <div id="countdown-timer">5</div>
    </div>
  </div>
`;

// Template untuk Halaman Login
export const createLoginPageTemplate = () => `
  <div class="login-page-container">
    <div class="login-form-wrapper">
      <div class="login-header">
        <h2>Selamat Datang</h2>
        <p>
          Silakan masuk untuk memulai sesi asesmen.
        </p>

      </div>
      <form id="loginForm" class="login-form">
        <div class="form-group">
          <label for="email">Alamat Email</label>
          <div class="input-wrapper">
            <input type="email" id="email" name="email" placeholder="contoh@email.com" required/>
          </div>
        </div>
        <div class="form-group">
          <label for="password">Password</label>
          <div class="input-wrapper password-wrapper">
            <input 
              type="password" 
              id="password" 
              name="password" 
              placeholder="Masukkan password Anda" 
              required
            />
            <button type="button" id="togglePassword" class="toggle-password-btn">
              <i class="bi bi-eye"></i>
            </button>
          </div>
        </div>
        <div id="submit-container">
          <button type="submit" class="submit-btn">
            <span class="btn-text">Masuk</span>
          </button>
        </div>
      </form>
      
    </div>
  </div>
`;

export const createNotFoundPageTemplate = () => `
  <div class="not-found-container">

    <dotlottie-wc 
      src="/animations/not-found.lottie" 
      style="width: 350px; height: 350px;" 
      autoplay 
      loop>
    </dotlottie-wc>

    <p>Oops! Halaman yang Anda cari tidak ditemukan.</p>
    <a href="#/home" class="btn-back">Kembali ke Beranda</a>
  </div>
`;

// Template halaman report siswa
export const createReportPageTemplate = (reportData) => `
  <div class="report-navigation">
    <a href="#/home" class="btn-back"><i class="bi bi-arrow-left"></i> Kembali ke Riwayat</a>
  </div>
  
  ${createReportHeaderSectionTemplate(
    reportData.identity,
    reportData.room_info,
    reportData.summary
  )}

  <div id="report-body">
    ${createReportChartsTemplate(reportData)}
    ${createReportHistoryTemplate(reportData.history)}
  </div>
`;

// Template bagian header pada halaman report siswa
const createReportHeaderSectionTemplate = (identity, roomInfo, summary) => {
  const mechanism = MECHANISM_BADGE_MAP[roomInfo.assessment_mechanism] || {
    text: "Tidak Diketahui",
    icon: "bi-question-circle", 
    className: "default",
  };
  const mechanismDescription =
    MECHANISM_DESC_MAP[roomInfo.assessment_mechanism] ||
    "Deskripsi mekanisme tidak tersedia.";

  const totalMinutes = Math.floor(summary.total_time_seconds / 60);
  const totalSeconds = summary.total_time_seconds % 60;

  return `
    <div class="report-main-info">
      <div class="room-title">
        <h1>${roomInfo.room_name || "Laporan Hasil Asesmen"}</h1>
        <p class="mechanism-badge mechanism-${mechanism.className}">
          <i class="bi ${mechanism.icon}"></i> ${mechanism.text}
        </p>
      </div>

      <div class="student-info">
        <span>${identity.nama}</span>
        <span>•</span>
        <span>${identity.nomer_induk}</span>
      </div>
      <div class="summary-cards">
        <div class="summary-card">
          <span class="icon"><i class="bi bi-trophy"></i></span>
          <div>
            <h3>Skor Akhir</h3>
            <p>${summary.true_score.toFixed(2)}</p>
          </div>
        </div>
        <div class="summary-card">
          <span class="icon"><i class="bi bi-check2-circle"></i></span>
          <div>
            <h3>Jawaban Benar</h3>
            <p>${summary.total_correct} / ${summary.total_questions}</p>
          </div>
        </div>
        <div class="summary-card">
          <span class="icon"><i class="bi bi-clock-history"></i></span>
          <div>
            <h3>Total Waktu</h3>
            <p>${String(totalMinutes).padStart(2, "0")}:${String(
    totalSeconds
  ).padStart(2, "0")}</p>
          </div>
        </div>
      </div>
    </div>
  `;
};

// Template bagian chart pada halaman report siswa
const createReportChartsTemplate = (reportData) => {
  const isAdaptive =
    reportData.room_info.assessment_mechanism.startsWith("adaptive");
  
  if (!isAdaptive) {
    return "";
  }

  const mechanismDescription =
    MECHANISM_DESC_MAP[reportData.room_info.assessment_mechanism] ||
    "Grafik ini menunjukkan bagaimana tingkat kesulitan soal disesuaikan selama asesmen.";

  return `
    <div class="report-section">
        <h2>Grafik Performa Jawaban Siswa</h2>
        <p class="section-subtitle">${mechanismDescription}</p>
        <div class="chart-container">
            <canvas id="adaptivePerformanceChart"></canvas>
        </div>
    </div>
  `;
};

// Template bagian riwayat jawaban pada halaman report siswa
const createReportHistoryTemplate = (history) => `
  <div class="report-section">
    <h2>Riwayat Jawaban</h2>
    <div class="history-list">
      ${history
        .map((item, index) => createHistoryItemTemplate(item, index + 1))
        .join("")}
    </div>
  </div>
`;

// Template untuk setiap item riwayat jawaban
const createHistoryItemTemplate = (item, number) => {
  const itemStatusClass = item.is_correct ? "correct" : "incorrect";

  const optionsHtml = Object.entries(item.options)
    .map(([key, value]) => {
      let optionClass = "option-item";

      if (key === item.student_answer) {
        optionClass += item.is_correct
          ? " selected-correct"
          : " selected-incorrect";
      }

      return `<div class="${optionClass}"><strong>${key}.</strong> ${value}</div>`;
    })
    .join("");

  return `
    <div class="question-item ${itemStatusClass}">
      <div class="question-meta">
        <span class="topic">${item.topic}</span>
        <span><i class="bi bi-clock"></i> ${item.time_taken_seconds} detik</span>
      </div>
      <p class="question-text">${number}. ${item.question}</p>
      <div class="options-list">
        ${optionsHtml}
      </div>
    </div>
  `;
};

// Template skeleton loading untuk halaman report siswa
export const createReportSkeletonTemplate = () => `
  <div class="report-header">
      <a href="#/home" class="btn-back"><i class="bi bi-arrow-left"></i> Kembali</a>
    <h1>Laporan Hasil Asesmen</h1>
  </div>
  <div id="report-content" class="skeleton-report">
      <div class="skeleton-line header"></div>
      <div class="skeleton-line subheader"></div>
      <div class="summary-cards">
          <div class="skeleton-line card"></div>
          <div class="skeleton-line card"></div>
          <div class="skeleton-line card"></div>
      </div>
      <div class="skeleton-line chart"></div>
      <div class="skeleton-line subheader"></div>
      <div class="skeleton-line list-item"></div>
      <div class="skeleton-line list-item"></div>
  </div>
`;

// Template halaman waiting room
export const createWaitingRoomPageTemplate = (data, currentUserId) => `
  <div class="waiting-room-container">
    ${createWaitingRoomInfoTemplate(data.room)}
    ${createParticipantListSectionTemplate(data.participants, currentUserId)}
  </div>
`;

// Template informasi room pada halaman waiting room
const createWaitingRoomInfoTemplate = (room) => {
  const mechanism = MECHANISM_BADGE_MAP[room.assessment_mechanism] || {
    text: "N/A",
    icon: "bi-question-circle",
    className: "default",
  };

  return `
  <div class="waiting-room-info">
    <div class="room-title">
      <h1>${room.name}</h1>
      <span class="mechanism-badge mechanism-${mechanism.className}">
        <i class="bi ${mechanism.icon}"></i> ${mechanism.text}
      </span>
    </div>
    <p class="room-description">${
      MECHANISM_DESC_MAP[room.assessment_mechanism] || ""
    }</p>
    <div class="waiting-room-details">
      <span><i class="bi bi-key-fill"></i><strong>${
        room.keypass
      }</strong></span>
      <span><i class="bi bi-card-checklist"></i> ${
        room.question_count
      } Soal</span>
      <span id="participant-count"><i class="bi bi-people-fill"></i> ${
        room.total_participants
      } Peserta Bergabung</span>
    </div>
    <div class="waiting-instruction">
      <i class="bi bi-hourglass-split"></i>
      <p>Menunggu guru memulai asesmen. Halaman akan diperbarui secara otomatis.</p>
    </div>
    
    <button id="leaveRoomBtn" class="leave-btn">
      Keluar Room
    </button>

  </div>
  `;
};

// Template daftar peserta pada halaman waiting room
export const createParticipantListTemplate = (participants, currentUserId) => `
  <div class="participant-list-section">
    <div class="participant-list">
      ${participants
        .map((p) => createParticipantItemTemplate(p, currentUserId))
        .join("")}
    </div>
  </div>
`;

export const createParticipantItemsTemplate = (participants, currentUserId) => {
  return participants
    .map((p) => createParticipantItemTemplate(p, currentUserId))
    .join("");
};

const createParticipantListSectionTemplate = (participants, currentUserId) => `
  <div class="participant-list-section">
    <h2>Daftar Peserta Ujian</h2> 
    <div class="participant-list">
      ${createParticipantItemsTemplate(participants, currentUserId)}
    </div>
  </div>
`;


// Template item peserta pada halaman waiting room
const createParticipantItemTemplate = (participant, currentUserId) => {
  const initial = participant.full_name.charAt(0).toUpperCase();
  const isSelf = participant.id === currentUserId; // Cek apakah ini siswa saat ini
  return `
    <div class="participant-item ${isSelf ? "is-self" : ""}">
        <div class="participant-avatar">${initial}</div>
        <div class="participant-details">
            <span class="name">${participant.full_name}
            </span>
            <span class="id">${participant.nomer_induk}</span>
        </div>
    </div>
    `;
};

// Skeleton untuk Waiting Room
export const createWaitingRoomSkeletonTemplate = () => `
  <div class="waiting-room-container skeleton-report">
    <div class="waiting-room-info">
        <div class="skeleton-line header" style="width: 50%;"></div>
        <div class="skeleton-line text" style="width: 80%;"></div>
        <div class="skeleton-line text" style="width: 60%;"></div>
    </div>
    <div class="participant-list-section">
        <div class="skeleton-line subheader" style="width: 30%;"></div>
        <div class="participant-list">
            <div class="skeleton-line list-item" style="height: 60px;"></div>
            <div class="skeleton-line list-item" style="height: 60px;"></div>
        </div>
    </div>
  </div>
`;


// Template halaman ujian
export const createExamPageTemplate = (roomName) => `
  <div class="exam-layout">
    <aside id="exam-sidebar" class="exam-sidebar">
       <div class="sidebar-header">
          <h3>Navigasi Soal</h3>
          <p class="sidebar-info">Klik nomor untuk pindah.</p>
       </div>
       <div id="question-navigation-grid" class="navigation-grid">
          </div>
       <div class="sidebar-legend">
          <div class="legend-item"><span class="dot active"></span> Aktif</div>
          <div class="legend-item"><span class="dot answered"></span> Dijawab</div>
          <div class="legend-item"><span class="dot flagged"></span> Ragu</div>
       </div>
    </aside>

    <div class="exam-main-container">
      <div class="exam-header">
        <h1 id="exam-room-name">${roomName || "Asesmen"}</h1>
        <div class="exam-header-right">
           <div id="exam-progress-text" class="progress-badge">Soal - dari -</div>
        </div>
      </div>
      
      <div id="exam-content" class="exam-content">
        </div>
      
      <div class="exam-footer">
        <button id="flag-btn" class="flag-btn">
          <i class="bi bi-flag"></i> <span>Ragu-ragu</span>
        </button>

        <button id="next-btn" class="submit-btn">
          <span>Jawab & Lanjutkan</span> 
          <i class="bi bi-arrow-right"></i>
        </button>
      </div>
    </div>
  </div>
  ${createResultModalTemplate()} 
`;

export const createQuestionTemplate = (question) => `
  <div class="question-area">
    ${
      question.image_url
        ? `<div class="question-image-wrapper">
             <img id="question-image" src="${question.image_url}" alt="Soal">
           </div>`
        : ""
    }
    <div class="question-text-wrapper">
       <p id="question-text">${question.question_text}</p>
    </div>
  </div>
  
  <div id="options-container" class="options-container">
    ${["A", "B", "C", "D", "E"]
      .map((opt) => {
        const key = `option_${opt.toLowerCase()}`;
        if (!question[key]) return "";

        // Cek apakah siswa sudah menjawab soal ini sebelumnya (Pre-fill)
        // Backend harus mengembalikan field 'student_answer' di objek question jika sudah dijawab
        const isChecked = question.student_answer === opt ? "checked" : "";

        return `
        <div class="option-wrapper">
          <input type="radio" name="option" value="${opt}" id="option-${opt}" ${isChecked}>
          <label for="option-${opt}" class="option-label">
            <span class="option-key">${opt}</span>
            <span class="option-value">${question[key]}</span>
          </label>
        </div>`;
      })
      .join("")}
  </div>
`;


// Template untuk opsi jawaban
const createOptionsTemplate = (question) => {
  let optionsHtml = "";
  ["A", "B", "C", "D", "E"].forEach((opt) => {
    const optionKey = `option_${opt.toLowerCase()}`;
    if (question[optionKey]) {
      const optionId = `option-${opt}`;
      optionsHtml += `
        <div class="option-wrapper">
          <input type="radio" name="option" value="${opt}" id="${optionId}">
          <label for="${optionId}" class="option-label">
            <span class="option-key">${opt}</span>
            <span class="option-value">${question[optionKey]}</span>
          </label>
        </div>
      `;
    }
  });
  return optionsHtml;
};

// Template pop-up hasil ujian (summary)
export const createResultModalTemplate = () => `
  <div id="result-modal-overlay" class="hidden">
    <div class="modal-content result-modal">
      <div class="modal-header">
        <div class="finish-icon"><i class="bi bi-check-circle-fill"></i></div>
        <h2>Asesmen Selesai!</h2>
        <p>Jawaban Anda telah berhasil dikumpulkan.</p>
      </div>
      <div class="modal-body">
        <div class="result-summary-cards">
          <div class="summary-card">
            <div>
              <h3>Skor Akhir</h3>
              <p id="modal-score">0</p>
            </div>
          </div>
          <div class="summary-card">
            <div>
              <h3>Benar</h3>
              <p id="modal-correct">0</p>
            </div>
          </div>
          <div class="summary-card">
            <div>
              <h3>Waktu</h3>
              <p id="modal-time">-</p>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer">
        <a href="#/home" id="close-result-btn" class="action-btn">
          <i class="bi bi-house"></i> Kembali ke Home
        </a>
      </div>
    </div>
  </div>
`;



// Skeleton halaman ujian
export const createExamSkeletonTemplate = () => `
  <div class="exam-container skeleton-report">
    <div class="exam-header">
      <div class="skeleton-line header" style="width: 40%; height: 30px;"></div>
    </div>
    <div class="exam-content">
      <div class="skeleton-line subheader" style="width: 20%;"></div>
      <div class="skeleton-line text" style="height: 60px;"></div>
      <div class="skeleton-line list-item" style="height: 50px;"></div>
      <div class="skeleton-line list-item" style="height: 50px;"></div>
    </div>
    <div class="exam-footer">
      <div class="skeleton-line button" style="height: 50px; width: 200px; margin-left: auto;"></div>
    </div>
  </div>
`;