export default class HomePresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadMyRooms() {
    this.#view.showLoading();
    try {
      const response = await this.#model.getMyRooms();
      this.#view.showMyRooms(response.data);
    } catch (error) {
      console.error("Load Rooms Error:", error);
      this.#view.showError(error.message);
    }
  }

  async joinRoom(keypass) {
    this.#view.showJoinLoading();
    try {
      const response = await this.#model.joinRoom(keypass);
      this.#view.joinSuccess(response.data.room_id);
    } catch (error) {
      console.error("Join Room Error:", error);
      this.#view.joinFailed(error.message);
    } finally {
      this.#view.hideJoinLoading();
    }
  }
}
