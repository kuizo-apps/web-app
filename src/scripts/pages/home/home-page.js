import {
  createHomePageTemplate,
  createRoomListTemplate,
  createSkeletonRoomItemTemplate,
} from "../../templates/templates.js";
import { getUserName } from "../../utils/auth.js";
import * as Api from "../../data/api.js";
import HomePresenter from "./home-presenter.js";
import Swal from "sweetalert2";

class HomePage {
  render() {
    const userName = getUserName() || "Siswa Rajin";
    return createHomePageTemplate({ name: userName });
  }

  async afterRender() {
    this._presenter = new HomePresenter({
      view: this,
      model: Api,
    });

    this._presenter.loadMyRooms();

    const joinForm = document.getElementById("joinRoomForm");
    joinForm.addEventListener("submit", (event) => {
      event.preventDefault();
      const keypass = event.target.querySelector(".keypass-input").value;
      if (keypass) {
        this._presenter.joinRoom(keypass);
      }
    });
  }

  showLoading() {
    const roomListContainer = document.getElementById("room-list-container");
    roomListContainer.innerHTML = createSkeletonRoomItemTemplate(3);
  }

  showMyRooms(rooms) {
    const roomListContainer = document.getElementById("room-list-container");
    const latestRoom = rooms.slice(0, 6);
    roomListContainer.innerHTML = createRoomListTemplate(latestRoom);
  }

  showError(message) {
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: message,
    });
    const roomListContainer = document.getElementById("room-list-container");
    roomListContainer.innerHTML = `<p class="error-message">Gagal memuat data. Silakan coba lagi nanti.</p>`;
  }

  joinSuccess(roomId) {
    Swal.fire({
      icon: "success",
      title: "Berhasil Bergabung!",
      text: "Anda akan diarahkan ke waiting room.",
      timer: 1500,
      showConfirmButton: false,
    }).then(() => {
      window.location.hash = `/waiting-room/${roomId}`;
    });
  }

  joinFailed(message) {
    Swal.fire({
      icon: "warning",
      title: "Gagal Bergabung",
      text: "Room ini tidak sedang menerima peserta baru. Pastikan keypass sudah benar.",
      confirmButtonColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim(),
    });
  }

  showJoinLoading() {
    const button = document.querySelector("#joinRoomForm .submit-btn");
    button.disabled = true;
    button.innerHTML = `<div class="spinner"></div> <span>Memproses...</span>`;
  }

  hideJoinLoading() {
    const button = document.querySelector("#joinRoomForm .submit-btn");
    button.disabled = false;
    button.innerHTML = `<i class="bi bi-arrow-right-circle"></i> <span>Bergabung</span>`;
  }
}

export default HomePage;
