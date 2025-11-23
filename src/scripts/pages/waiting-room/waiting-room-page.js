import * as Api from "../../data/api.js";
import {
  createWaitingRoomPageTemplate,
  createWaitingRoomSkeletonTemplate,
  createParticipantItemsTemplate,
} from "../../templates/templates.js";
import { parseActivePathname } from "../../routes/url-parser.js";
import { getUserId } from "../../utils/auth.js";
import WaitingRoomPresenter from "./waiting-room-presenter.js";
import Swal from "sweetalert2";

class WaitingRoomPage {
  #presenter = null;

  render() {
    return createWaitingRoomSkeletonTemplate();
  }

  async afterRender() {
    const url = parseActivePathname();
    const roomId = url.id;

    this.#presenter = new WaitingRoomPresenter({
      view: this,
      model: Api,
    });

    // Mulai polling data
    await this.#presenter.startPolling(roomId);
  }

  beforeUnload() {
    if (this.#presenter) {
      this.#presenter.stopPolling();
    }
  }

  showLoading() {
    const content = document.querySelector(".main-content");
    if (content) content.innerHTML = createWaitingRoomSkeletonTemplate();
  }

  showWaitingRoom(data) {
    const currentUserId = getUserId();
    const content = document.querySelector(".main-content");

    if (content) {
      content.innerHTML = createWaitingRoomPageTemplate(data, currentUserId);
    }

    // Listener Tombol Keluar
    const leaveBtn = document.getElementById("leaveRoomBtn");
    if (leaveBtn) {
      leaveBtn.addEventListener("click", () => {
        Swal.fire({
          title: "Anda yakin ingin keluar?",
          text: "Anda harus memasukkan Keypass lagi jika ingin bergabung kembali.",
          icon: "warning",
          showCancelButton: true,
          confirmButtonColor: "#d33",
          cancelButtonColor: "#3085d6",
          confirmButtonText: "Ya, keluar!",
          cancelButtonText: "Batal",
        }).then((result) => {
          if (result.isConfirmed) {
            const roomId = parseActivePathname().id;
            this.#presenter.leaveRoom(roomId);
          }
        });
      });
    }
  }

  updateWaitingRoom(data) {
    const currentUserId = getUserId();

    // Update List Peserta
    const participantListContainer =
      document.querySelector(".participant-list");
    if (participantListContainer) {
      participantListContainer.innerHTML = createParticipantItemsTemplate(
        data.participants,
        currentUserId
      );
    }

    // Update Counter Jumlah Peserta
    const participantCountEl = document.getElementById("participant-count");
    if (participantCountEl && data.room) {
      // Pastikan backend mengirim field total_participants (yg kita fix di atas)
      participantCountEl.innerHTML = `<i class="bi bi-people-fill"></i> ${data.room.total_participants} Peserta Bergabung`;
    }
  }

  redirectToExam(roomId) {
    const overlay = document.getElementById("countdown-overlay");
    const timerEl = document.getElementById("countdown-timer");
    const countdownContent = overlay
      ? overlay.querySelector(".countdown-content")
      : null;

    if (!overlay || !timerEl || !countdownContent) return;

    overlay.classList.remove("hidden");
    let count = 3; // Ubah ke 3 detik biar lebih cepat (opsional)
    timerEl.textContent = count;

    const intervalId = setInterval(() => {
      count--;
      if (count > 0) {
        timerEl.textContent = count;
      } else {
        clearInterval(intervalId);
        countdownContent.innerHTML =
          '<div class="final-message">Ujian Dimulai!</div>';

        setTimeout(() => {
          window.location.hash = `/exam/${roomId}`;
          // Cleanup overlay setelah pindah halaman (supaya tidak nyangkut saat back)
          setTimeout(() => {
            overlay.classList.add("hidden");
            countdownContent.innerHTML = `<h1>Mempersiapkan sesi asesmen Anda...</h1><div id="countdown-timer">5</div>`;
          }, 1000);
        }, 1000);
      }
    }, 1000);
  }

  leaveSuccess() {
    Swal.fire({
      title: "Berhasil Keluar",
      icon: "success",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.hash = "/home";
    });
  }

  showLeaveLoading() {
    const leaveBtn = document.getElementById("leaveRoomBtn");
    if (leaveBtn) {
      leaveBtn.disabled = true;
      leaveBtn.innerHTML = `<div class="spinner-sm"></div> Keluar...`;
    }
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
      confirmButtonText: "Kembali",
    }).then(() => {
      // Jangan paksa redirect ke home jika error polling sesaat (koneksi buruk)
      // Redirect hanya jika fatal
      if (
        message.includes("Room tidak ditemukan") ||
        message.includes("Anda bukan peserta")
      ) {
        window.location.hash = "/home";
      }
    });
  }
}

export default WaitingRoomPage;
