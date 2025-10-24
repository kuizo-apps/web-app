export default class WaitingRoomPresenter {
  #view;
  #model;
  #pollingIntervalId = null;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadWaitingRoom(roomId) {
    this.#view.showLoading();
    try {
      const response = await this.#model.getWaitingRoomDetails(roomId);
      this.#view.showWaitingRoom(response.data);
    } catch (error) {
      console.error("Load Waiting Room Error:", error);
      this.#view.showError(error.message);
    }
  }

  async startPolling(roomId) {
    try {
      const response = await this.#model.getWaitingRoomDetails(roomId);
      this.#view.showWaitingRoom(response.data);
    } catch (error) {
      console.error("Initial Load Error:", error);
      this.#view.showError(error.message);
      return;
    }

    this.#pollingIntervalId = setInterval(async () => {
      try {
        const response = await this.#model.getWaitingRoomDetails(roomId);
        const room = response.data.room;

        if (room.status === "mulai_ujian") {
          this.stopPolling();
          this.#view.redirectToExam(room.id);
        } else {
          // Jika masih 'persiapan', panggil update UI
          this.#view.updateWaitingRoom(response.data);
        }
      } catch (error) {
        console.error("Polling Error:", error);
        this.stopPolling();
        this.#view.showError("Koneksi ke room terputus.");
      }
    }, 5000);
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
      this.#view.showError(error.message);
    }
  }
}
