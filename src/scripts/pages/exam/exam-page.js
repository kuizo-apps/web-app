import * as Api from "../../data/api.js";
import {
  createExamPageTemplate,
  createQuestionTemplate,
  createExamSkeletonTemplate,
} from "../../templates/templates.js";
import { parseActivePathname } from "../../routes/url-parser.js";
import ExamPresenter from "./exam-presenter.js";
import Swal from "sweetalert2";

class ExamPage {
  // State Internal
  #currentQuestion = null;
  #questionStartTime = null;
  #questionMap = [];
  #answeredIds = [];
  #flaggedIds = new Set(); // Set untuk menampung ID soal ragu-ragu
  #mechanism = "";
  #roomId = null;

  // Sistem Anti Cheating
  #cheatingAttempts = 0;
  #maxAttempts = 3;
  #initialWidth = window.innerWidth;
  #listenersAttached = false;
  #lastViolationTime = 0;
  #presenter = null;

  render() {
    return createExamSkeletonTemplate();
  }

  async afterRender() {
    const url = parseActivePathname();
    this.#roomId = parseInt(url.id);

    if (isNaN(this.#roomId)) {
      this.showError("ID Room tidak valid");
      return;
    }

    this.#presenter = new ExamPresenter({ view: this, model: Api });

    try {
      const apiResponse = await Api.startExam(this.#roomId);
      const response = apiResponse.data || apiResponse;

      if (!response) throw new Error("Data ujian tidak ditemukan.");

      if (response.done) {
        this._renderFinishState(response, this.#roomId);
        return;
      }

      const {
        mechanism,
        question_map,
        current_question,
        answered_ids,
        room_name,
      } = response;

      this.#mechanism = mechanism;
      this.#currentQuestion = current_question;
      this.#questionMap = question_map || [];
      this.#answeredIds = answered_ids || [];

      // Load flagged ids from localStorage jika ingin persistent per browser (opsional)
      // this.#flaggedIds = new Set(JSON.parse(localStorage.getItem(`flagged_${this.#roomId}`)) || []);

      // Render Layout
      document.querySelector(".main-content").innerHTML =
        createExamPageTemplate(room_name || "Ujian");

      // Event Listeners
      const nextBtn = document.getElementById("next-btn");
      if (nextBtn)
        nextBtn.addEventListener("click", () => this._handleNextAction());

      const flagBtn = document.getElementById("flag-btn");
      if (flagBtn) flagBtn.addEventListener("click", () => this._toggleFlag());

      // Setup UI
      this._setupMechanismUI();

      // Tampilkan Soal Pertama
      // Cek apakah ini soal terakhir di map untuk setup button
      const isLast =
        this.#mechanism !== "rule_based" &&
        this.#questionMap[this.#questionMap.length - 1] ===
          this.#currentQuestion.id;

      this.showQuestion(this.#currentQuestion, isLast);

      // Anti Cheating
      if (!this.#listenersAttached) {
        this._initAntiCheatingListeners();
        this.#listenersAttached = true;
      }
    } catch (error) {
      console.error(error);
      this.showError(error.message);
    }
  }

  /* ================= UI SETUP & NAVIGATION ================= */

  _setupMechanismUI() {
    const sidebar = document.getElementById("exam-sidebar");
    const flagBtn = document.getElementById("flag-btn");

    if (!sidebar) return;

    if (this.#mechanism === "rule_based") {
      sidebar.classList.add("hidden"); // Rule based tidak ada navigasi bebas
      if (flagBtn) flagBtn.style.display = "none"; // Rule based tidak ada ragu-ragu
    } else {
      sidebar.classList.remove("hidden");
      this._renderNavigationGrid();
    }
  }

  _renderNavigationGrid() {
    const grid = document.getElementById("question-navigation-grid");
    if (!grid) return;
    grid.innerHTML = "";

    this.#questionMap.forEach((qId, index) => {
      const btn = document.createElement("div");
      btn.className = "nav-item";
      btn.innerText = index + 1;

      const isActive =
        this.#currentQuestion && qId === this.#currentQuestion.id;

      // 2. Cek apakah soal ini SUDAH dijawab?
      const isAnswered = this.#answeredIds.includes(qId);

      // 3. Cek apakah ditandai ragu?
      const isFlagged = this.#flaggedIds.has(qId);

      if (isActive) btn.classList.add("active");
      if (isAnswered) btn.classList.add("answered");
      if (isFlagged) btn.classList.add("flagged");

      // Listener Klik Navigasi (Hanya Static/Random)
      btn.addEventListener("click", () => {
        if (this.#mechanism === "rule_based") return;
        if (qId === this.#currentQuestion.id) return; // Klik diri sendiri

        // Pindah soal
        this._navigateAndSave(qId);
      });

      grid.appendChild(btn);
    });
  }

  _toggleFlag() {
    const currentId = this.#currentQuestion.id;
    if (this.#flaggedIds.has(currentId)) {
      this.#flaggedIds.delete(currentId);
    } else {
      this.#flaggedIds.add(currentId);
    }
    // Update UI Navigasi
    this._renderNavigationGrid();
    // Opsional: Simpan ke localStorage
    // localStorage.setItem(`flagged_${this.#roomId}`, JSON.stringify([...this.#flaggedIds]));
  }

  /* ================= CORE LOGIC ================= */

  showQuestion(question, isLast = false) {
    this.#currentQuestion = question;
    this.#questionStartTime = Date.now();

    // Hitung nomor soal saat ini
    let currentNum = 0;
    if (this.#mechanism === "rule_based") {
      currentNum = (this.#answeredIds.length || 0) + 1;
    } else {
      currentNum = this.#questionMap.indexOf(question.id) + 1;
    }

    const totalText =
      this.#mechanism === "rule_based" ? "?" : this.#questionMap.length;

    // Update Header
    const progressEl = document.getElementById("exam-progress-text");
    if (progressEl)
      progressEl.textContent = `Soal ${currentNum} dari ${totalText}`;

    // Render Konten
    const contentEl = document.getElementById("exam-content");
    if (contentEl) {
      contentEl.innerHTML = createQuestionTemplate(question);
    }

    // Update Flag Button Style
    const flagBtn = document.getElementById("flag-btn");
    if (flagBtn) {
      if (this.#flaggedIds.has(question.id)) {
        flagBtn.classList.add("active");
        flagBtn.innerHTML = `<i class="bi bi-flag-fill"></i> <span>Ditandai</span>`;
      } else {
        flagBtn.classList.remove("active");
        flagBtn.innerHTML = `<i class="bi bi-flag"></i> <span>Ragu-ragu</span>`;
      }
    }

    // === PERBAIKAN UTAMA DI SINI ===
    // Update Tombol Next/Finish
    const nextBtn = document.getElementById("next-btn");
    if (nextBtn) {
      // Kita langsung set innerHTML, jangan cari span dulu karena mungkin hilang saat loading
      if (isLast) {
        nextBtn.classList.add("finish-state");
        nextBtn.innerHTML = `<span>Selesai & Kumpulkan</span> <i class="bi bi-check-circle"></i>`;
      } else {
        nextBtn.classList.remove("finish-state");
        nextBtn.innerHTML = `<span>Jawab & Lanjutkan</span> <i class="bi bi-arrow-right"></i>`;
      }

      // Pastikan tombol di-enable jika loading selesai cepat
      nextBtn.disabled = false;
    }

    // Update Grid Navigasi (Highlight active)
    if (this.#mechanism !== "rule_based") {
      this._renderNavigationGrid();
    }
  }

  // Navigasi lewat Sidebar: Simpan -> Fetch Target
  async _navigateAndSave(targetQuestionId) {
    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );
    const answerVal = selectedOption ? selectedOption.value : null;

    this.showLoading(); // Tampilkan loading spinner di area soal

    const timeTakenSeconds = Math.round(
      (Date.now() - this.#questionStartTime) / 1000
    );

    const payload = {
      room_id: this.#roomId,
      question_id: parseInt(this.#currentQuestion.id),
      answer: answerVal,
      time_taken_seconds: parseInt(timeTakenSeconds),
    };

    try {
      // 1. Simpan jawaban soal SAAT INI dulu
      const apiResponse = await Api.answerAndNext(payload);
      const response = apiResponse.data || apiResponse;

      // FIX: Update answered_ids LANGSUNG dari response backend
      // Jangan pakai logika manual push() karena bisa salah jika jawaban kosong
      if (response.answered_ids) {
        this.#answeredIds = response.answered_ids;
      }

      // 2. Fetch soal TARGET yang diklik
      const targetQResponse = await Api.getQuestionDetail(
        this.#roomId,
        targetQuestionId
      );
      const targetData = targetQResponse.data || targetQResponse;

      // Cek apakah target ini soal terakhir?
      const isLast =
        this.#questionMap[this.#questionMap.length - 1] === targetQuestionId;

      // 3. Tampilkan soal baru (ini akan memanggil _renderNavigationGrid otomatis)
      this.showQuestion(targetData, isLast);
    } catch (error) {
      console.error(error);
      this.showError(error.message);
    }
  }

  // Navigasi lewat tombol Next
  async _handleNextAction() {
    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );
    const answerVal = selectedOption ? selectedOption.value : "";

    if (this.#mechanism === "rule_based" && !answerVal) {
      const result = await Swal.fire({
        title: "Yakin melewati soal?",
        text: "Di mode Adaptif, melewati soal dianggap jawaban salah.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonText: "Ya, Lanjut",
        cancelButtonText: "Batal",
      });
      if (!result.isConfirmed) return;
    }

    this._processAnswer(answerVal);
  }

  async _processAnswer(answer) {
    this.showNextLoading(); // Loading di tombol

    const timeTakenSeconds = Math.round(
      (Date.now() - this.#questionStartTime) / 1000
    );

    const payload = {
      room_id: this.#roomId,
      question_id: parseInt(this.#currentQuestion.id),
      answer: answer,
      time_taken_seconds: parseInt(timeTakenSeconds),
    };

    try {
      const apiResponse = await Api.answerAndNext(payload);
      const response = apiResponse.data || apiResponse;

      // FIX: Selalu update answered_ids dari backend source of truth
      if (response.answered_ids) {
        this.#answeredIds = response.answered_ids;
      }

      if (response.done) {
        if (response.result || response.score !== undefined) {
          this._renderFinishState(response, this.#roomId);
        } else {
          const finishRes = await Api.finishExam(this.#roomId);
          this._renderFinishState(finishRes.data || finishRes, this.#roomId);
        }
      } else {
        if (!response.question) {
          const finishRes = await Api.finishExam(this.#roomId);
          this._renderFinishState(finishRes.data || finishRes, this.#roomId);
          return;
        }
        // Tampilkan soal berikutnya (Sequential default dari backend)
        this.showQuestion(response.question, response.is_last_question);
      }
    } catch (error) {
      console.error(error);
      this.showError(error.message);
    } finally {
      this.hideNextLoading();
    }
  }

  async _renderFinishState(response, roomId) {
    const mainContent = document.querySelector(".main-content");
    if (mainContent) {
      mainContent.innerHTML = createExamPageTemplate();
    }

    // Hide UI Elements
    const contentEl = document.getElementById("exam-content");
    const footerEl = document.querySelector(".exam-footer");
    const sidebarEl = document.getElementById("exam-sidebar");

    if (contentEl) contentEl.style.display = "none";
    if (footerEl) footerEl.style.display = "none";
    if (sidebarEl) sidebarEl.style.display = "none";

    // Show Result
    const resData = response.result || response.data || response;

    // Jika data result belum lengkap, fetch lagi
    if (!resData.true_score && !resData.score) {
      try {
        const apiRes = await Api.getResult(roomId);
        this.showResultModal(apiRes.data || apiRes);
      } catch (e) {
        console.error(e);
      }
    } else {
      this.showResultModal(resData);
    }
  }

  /* ================= UTILS & ANTI CHEAT (Sama seperti sebelumnya) ================= */

  showLoading() {
    const el = document.getElementById("exam-content");
    if (el)
      el.innerHTML = `<div class="spinner-container"><div class="spinner"></div></div>`;
  }

  showNextLoading() {
    const nextBtn = document.getElementById("next-btn");
    if (!nextBtn) return;
    nextBtn.disabled = true;
    nextBtn.innerHTML = `<div class="spinner-sm"></div> Proses...`;
  }

  hideNextLoading() {
    const nextBtn = document.getElementById("next-btn");
    if (!nextBtn) return;
    nextBtn.disabled = false;
    const isFinishState = nextBtn.classList.contains("finish-state");
    nextBtn.innerHTML = isFinishState
      ? `<span>Selesai & Kumpulkan</span> <i class="bi bi-check-circle"></i>`
      : `<span>Jawab & Lanjutkan</span> <i class="bi bi-arrow-right"></i>`;
  }

  showResultModal(scores) {
    const overlay = document.getElementById("result-modal-overlay");
    if (!overlay) return;

    // Normalisasi data (kadang backend kirim 'score', kadang 'true_score')
    const scoreVal =
      scores.true_score !== undefined ? scores.true_score : scores.score;
    const correctVal =
      scores.total_correct !== undefined
        ? scores.total_correct
        : scores.correct;

    // Waktu
    let timeStr = "-";
    if (scores.total_time_seconds) {
      const m = Math.floor(scores.total_time_seconds / 60);
      const s = scores.total_time_seconds % 60;
      timeStr = `${m}m ${s}d`;
    }

    document.getElementById("modal-score").textContent =
      Number(scoreVal).toFixed(2);
    document.getElementById("modal-correct").textContent = correctVal;
    document.getElementById("modal-time").textContent = timeStr;

    overlay.classList.remove("hidden");
    this._removeAntiCheatingListeners();
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
    }).then(() => (window.location.hash = "/home"));
  }

  // --- ANTI CHEATING CODE (KEEP EXISTING) ---
  _initAntiCheatingListeners() {
    document.addEventListener("visibilitychange", this._handleVisibilityChange);
    window.addEventListener("resize", this._handleResize);
    const examContainer = document.querySelector(".exam-container");
    if (examContainer) examContainer.addEventListener("copy", this._handleCopy);
  }

  _handleVisibilityChange = () => {
    if (document.hidden) this._handleCheating("Beralih tab/aplikasi");
  };

  _handleResize = () => {
    if (
      Math.abs(window.innerWidth - this.#initialWidth) >
      this.#initialWidth * 0.25
    ) {
      this._handleCheating("Resize layar");
    }
  };

  _handleCopy = (e) => {
    e.preventDefault();
    this._handleCheating("Percobaan copy-paste");
  };

  _handleCheating(reason) {
    if (this.#cheatingAttempts >= this.#maxAttempts) return;
    const now = Date.now();
    if (now - this.#lastViolationTime < 2000) return;
    this.#lastViolationTime = now;
    this.#cheatingAttempts++;

    if (this.#cheatingAttempts >= this.#maxAttempts) {
      this._removeAntiCheatingListeners();
      Swal.fire({
        icon: "error",
        title: "Pelanggaran Berat!",
        text: "Anda didiskualifikasi karena melanggar aturan ujian.",
        allowOutsideClick: false,
        confirmButtonColor: "#d33",
        confirmButtonText: "Keluar",
      }).then(() => {
        window.location.hash = `#/home`;
      });
    } else {
      Swal.fire({
        icon: "warning",
        title: `Peringatan (${this.#cheatingAttempts}/${this.#maxAttempts})`,
        text: `${reason}. Jangan lakukan lagi!`,
        timer: 3000,
        showConfirmButton: false,
      });
    }
  }

  _removeAntiCheatingListeners() {
    document.removeEventListener(
      "visibilitychange",
      this._handleVisibilityChange
    );
    window.removeEventListener("resize", this._handleResize);
    const examContainer = document.querySelector(".exam-container");
    if (examContainer)
      examContainer.removeEventListener("copy", this._handleCopy);
  }
}

export default ExamPage;
