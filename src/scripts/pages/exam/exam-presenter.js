export default class ExamPresenter {
  #view;
  #model;

  constructor({ view, model }) {
    this.#view = view;
    this.#model = model;
  }

  async startExam(roomId) {
    this.#view.showLoading();
    try {
      const response = await this.#model.startExam(roomId);
      if (response.data.done) {
        this.loadFinalResult(roomId); // Jika tidak ada soal, langsung ke hasil
      } else {
        this.#view.showQuestion(response.data.question);
      }
    } catch (error) {
      this.#view.showError(error.message);
    }
  }

  async answerAndNext(payload) {
    this.#view.showNextLoading();
    try {
      const response = await this.#model.answerAndNext(payload);
      if (response.data.done) {
        this.loadFinalResult(payload.room_id);
      } else {
        this.#view.showQuestion(response.data.question);
      }
    } catch (error) {
      this.#view.showError(error.message);
    } finally {
      this.#view.hideNextLoading();
    }
  }

  async loadFinalResult(roomId) {
    try {
      const response = await this.#model.getResult(roomId);
      this.#view.showResultModal(response.data);
    } catch (error) {
      this.#view.showError(error.message);
    }
  }
}
