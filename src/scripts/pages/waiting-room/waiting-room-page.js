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
  render() {
    return createWaitingRoomSkeletonTemplate();
  }

  async afterRender() {
    const url = parseActivePathname();
    const roomId = url.id;

    this._presenter = new WaitingRoomPresenter({
      view: this,
      model: Api,
    });

    this._presenter.startPolling(roomId);
  }

  beforeUnload() {
    this._presenter.stopPolling();
  }

  showLoading() {
    document.querySelector(".main-content").innerHTML =
      createWaitingRoomSkeletonTemplate();
  }

  showWaitingRoom(data) {
    const currentUserId = getUserId();
    document.querySelector(".main-content").innerHTML =
      createWaitingRoomPageTemplate(data, currentUserId);

    document.getElementById("leaveRoomBtn").addEventListener("click", () => {
      Swal.fire({
        title: "Anda yakin ingin keluar?",
        text: "Anda bisa bergabung kembali selama sesi masih dalam persiapan.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#3085d6",
        cancelButtonColor: "#d33",
        confirmButtonText: "Ya, keluar!",
        cancelButtonText: "Batal",
      }).then((result) => {
        if (result.isConfirmed) {
          const roomId = parseActivePathname().id;
          this._presenter.leaveRoom(roomId);
        }
      });
    });
  }

  updateWaitingRoom(data) {
    const participantListContainer =
      document.querySelector(".participant-list");
    const participantCountEl = document.getElementById("participant-count");
    const currentUserId = getUserId();

    if (participantListContainer) {
      participantListContainer.innerHTML = createParticipantItemsTemplate(
        data.participants,
        currentUserId
      );
    }
    if (participantCountEl) {
      participantCountEl.innerHTML = `<i class="bi bi-people-fill"></i> ${data.room.total_participants} Peserta Bergabung`;
    }
  }

  redirectToExam(roomId) {
    const overlay = document.getElementById("countdown-overlay");
    const timerEl = document.getElementById("countdown-timer");

    const countdownContent = overlay.querySelector(".countdown-content");

    if (!overlay || !timerEl || !countdownContent) return;

    overlay.classList.remove("hidden");
    let count = 5;
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
          setTimeout(() => overlay.classList.add("hidden"), 500);
        }, 1500);
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
      title: "Gagal Memuat Room",
      text: message,
      confirmButtonText: "Kembali ke Home",
    }).then(() => {
      window.location.hash = "/home";
    });
  }
}

export default WaitingRoomPage;
