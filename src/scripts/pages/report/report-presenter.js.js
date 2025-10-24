export default class ReportPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async loadReport(roomId) {
    this.#view.showLoading();
    try {
      const response = await this.#model.getStudentReport(roomId);
      this.#view.showReport(response.data);
    } catch (error) {
      console.error("Load Report Error:", error);
      this.#view.showError(error.message);
    }
  }
}
