export default class LoginPresenter {
  #view;
  #model;
  #authModel;

  constructor({ view, model, authModel }) {
    this.#view = view;
    this.#model = model;
    this.#authModel = authModel;
  }

  async login({ email, password }) {
    this.#view.showLoading();
    try {
      const response = await this.#model.loginUser({ email, password });
      this.#authModel.putAccessToken(response.data.accessToken);
      this.#authModel.putUserName(response.data.name);
      this.#view.loginSuccess();
    } catch (error) {
      console.error("Login Error:", error);
      this.#view.loginFailed(error.message);
    } finally {
      this.#view.hideLoading();
    }
  }
}
