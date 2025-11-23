export default class WaitingRoomPresenter {
  #view;
  #model;
  #pollingIntervalId = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async startPolling(roomId) {
    // 1. Initial Load
    try {
      this.#view.showLoading();
      const response = await this.#model.getWaitingRoomDetails(roomId);
      this.#view.showWaitingRoom(response.data);
    } catch (error) {
      console.error("Initial Load Error:", error);
      this.#view.showError(error.message);
      return; // Stop jika initial load gagal
    }

    // 2. Start Polling (Setiap 3 detik agar lebih responsif)
    this.#pollingIntervalId = setInterval(async () => {
      try {
        const response = await this.#model.getWaitingRoomDetails(roomId);
        const room = response.data.room;

        if (room.status === "berlangsung") {
          this.stopPolling();
          this.#view.redirectToExam(room.id);
        } else if (room.status === "berakhir") {
          this.stopPolling();
          this.#view.showError("Ujian telah berakhir/dibatalkan oleh guru.");
        } else {
          // Status masih "persiapan", update UI
          this.#view.updateWaitingRoom(response.data);
        }
      } catch (error) {
        console.warn("Polling Warning:", error.message);
        // Jangan stop polling jika hanya error jaringan sesaat (fetch failed)
        // Stop hanya jika error spesifik dari backend (misal 401/404)
        if (
          error.message.includes("404") ||
          error.message.includes("401") ||
          error.message.includes("403")
        ) {
          this.stopPolling();
          this.#view.showError(error.message);
        }
      }
    }, 3000);
  }

  stopPolling() {
    if (this.#pollingIntervalId) {
      clearInterval(this.#pollingIntervalId);
      this.#pollingIntervalId = null;
    }
  }

  async leaveRoom(roomId) {
    this.stopPolling();
    this.#view.showLeaveLoading();
    try {
      await this.#model.leaveRoom(roomId);
      this.#view.leaveSuccess();
    } catch (error) {
      // Jika gagal leave, nyalakan polling lagi supaya user tidak stuck
      this.#view.showError(error.message);
      this.startPolling(roomId);
    }
  }
}
