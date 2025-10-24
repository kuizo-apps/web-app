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
  #currentQuestion = null;
  #questionStartTime = null;
  #questionCounter = 0;

  // sistem anti cheating
  #cheatingAttempts = 0;
  #maxAttempts = 3;
  #initialWidth = window.innerWidth;
  #listenersAttached = false;

  render() {
    return createExamSkeletonTemplate();
  }

  async afterRender() {
    const url = parseActivePathname();
    const roomId = url.id;

    this._presenter = new ExamPresenter({
      view: this,
      model: Api,
    });

    document.querySelector(".main-content").innerHTML =
      createExamPageTemplate();
    this._presenter.startExam(roomId);

    document
      .getElementById("next-btn")
      .addEventListener("click", () => this._handleAnswer());

    if (!this.#listenersAttached) {
      this._initAntiCheatingListeners();
      this.#listenersAttached = true;
    }
  }

  _initAntiCheatingListeners() {
    // 1. Deteksi Pindah Tab
    document.addEventListener("visibilitychange", this._handleVisibilityChange);

    // 2. Deteksi Resize Window (Split Screen)
    window.addEventListener("resize", this._handleResize);

    // 3. Mencegah Copy-Paste
    const examContainer = document.querySelector(".exam-container");
    if (examContainer) {
      examContainer.addEventListener("copy", this._handleCopy);
    }
  }

  _handleVisibilityChange = () => {
    if (document.hidden) {
      this._handleCheating("Beralih ke tab atau jendela lain");
    }
  };

  _handleResize = () => {
    // Cek jika ukuran berubah lebih dari 20% dari ukuran awal
    if (
      Math.abs(window.innerWidth - this.#initialWidth) >
      this.#initialWidth * 0.2
    ) {
      this._handleCheating("Ukuran jendela browser diubah");
    }
  };

  _handleCopy = (e) => {
    e.preventDefault();
    this._handleCheating("Mencoba menyalin konten soal");
  };

  _handleCheating(reason) {
    // Jangan proses jika ujian sudah selesai (misalnya saat modal hasil muncul)
    if (this.#cheatingAttempts >= this.#maxAttempts) return;

    this.#cheatingAttempts++;
    console.warn(
      `PELANGGARAN Terdeteksi #${this.#cheatingAttempts}: ${reason}`
    );

    if (this.#cheatingAttempts >= this.#maxAttempts) {
      // Pelanggaran ke-3: Hentikan ujian
      this._removeAntiCheatingListeners(); // Hentikan listener
      Swal.fire({
        icon: "error",
        title: "Batas Pelanggaran Tercapai!",
        text: "Anda telah melakukan 3 kali pelanggaran. Ujian Anda akan dihentikan dan Anda akan dikembalikan ke halaman utama.",
        allowOutsideClick: false,
        confirmButtonColor: "#d33",
        confirmButtonText: "Saya Mengerti",
      }).then(() => {
        window.location.hash = `#/home`;
      });
    } else {
      // Pelanggaran ke-1 atau ke-2: Tampilkan peringatan
      Swal.fire({
        icon: "warning",
        title: `Peringatan Pelanggaran! (${this.#cheatingAttempts}/${
          this.#maxAttempts
        })`,
        text: `Aktivitas mencurigakan terdeteksi. Harap tetap fokus pada jendela ujian.`,
        confirmButtonColor: "#f8bb86",
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
    if (examContainer) {
      examContainer.removeEventListener("copy", this._handleCopy);
    }
    this.#listenersAttached = false;
  }

  beforeUnload() {
    this._removeAntiCheatingListeners();
  }

  showLoading() {
    document.getElementById(
      "exam-content"
    ).innerHTML = `<div class="spinner"></div>`;
  }

  showQuestion(question) {
    this.#currentQuestion = question;
    this.#questionStartTime = Date.now();
    this.#questionCounter++;

    document.getElementById("exam-progress").textContent = `Soal ${
      this.#questionCounter
    }`;
    document.getElementById("exam-content").innerHTML = createQuestionTemplate(
      question,
      this.#questionCounter
    );
  }

  _handleAnswer() {
    const selectedOption = document.querySelector(
      'input[name="option"]:checked'
    );
    if (!selectedOption) {
      Swal.fire({
        icon: "warning",
        title: "Peringatan",
        text: "Anda harus memilih satu jawaban.",
      });
      return;
    }
    const timeTakenSeconds = Math.round(
      (Date.now() - this.#questionStartTime) / 1000
    );
    const payload = {
      room_id: parseActivePathname().id,
      question_id: this.#currentQuestion.id,
      answer: selectedOption.value,
      time_taken_seconds: timeTakenSeconds,
    };
    this._presenter.answerAndNext(payload);
  }

  showResultModal(scores) {
    const overlay = document.getElementById("result-modal-overlay");

    const totalMinutes = Math.floor(scores.total_time_seconds / 60);
    const totalSeconds = scores.total_time_seconds % 60;

    document.getElementById("modal-score").textContent =
      scores.true_score.toFixed(2);
    document.getElementById(
      "modal-correct"
    ).textContent = `${scores.total_correct} / ${scores.total_questions_answered}`;
    document.getElementById("modal-time").textContent = `${String(
      totalMinutes
    ).padStart(2, "0")}:${String(totalSeconds).padStart(2, "0")}`;

    overlay.classList.remove("hidden");
  }

  showNextLoading() {
    const nextBtn = document.getElementById("next-btn");
    nextBtn.disabled = true;
    nextBtn.innerHTML = `<div class="spinner-sm"></div> Memuat...`;
  }

  hideNextLoading() {
    const nextBtn = document.getElementById("next-btn");
    nextBtn.disabled = false;
    nextBtn.innerHTML = `<span>Jawab & Lanjutkan</span> <i class="bi bi-arrow-right"></i>`;
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Terjadi Kesalahan",
      text: message,
    }).then(() => (window.location.hash = "/home"));
  }
}

export default ExamPage;
