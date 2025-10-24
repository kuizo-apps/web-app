import Swal from "sweetalert2";
import { createLoginPageTemplate } from "../../templates/templates.js";
import LoginPresenter from "./login-presenter.js";
import * as Api from "../../data/api.js";
import * as Auth from "../../utils/auth.js";

class LoginPage {
  render() {
    return createLoginPageTemplate();
  }

  afterRender() {
    this._presenter = new LoginPresenter({
      view: this,
      model: Api,
      authModel: Auth,
    });

    const loginForm = document.getElementById("loginForm");
    loginForm.addEventListener("submit", async (event) => {
      event.preventDefault();
      const credentials = {
        email: event.target.email.value,
        password: event.target.password.value,
      };
      await this._presenter.login(credentials);
    });
  }

  loginSuccess() {
    Swal.fire({
      icon: "success",
      width: "400px",
      title: "Login Berhasil!",
      timer: 1200,
      showConfirmButton: false,
    }).then(() => {
      window.location.hash = "/home";
    });
  }

  loginFailed(message) {
    Swal.fire({
      icon: "error",
      width: "400px",
      title: "Login Gagal",
      text: message,
      showConfirmButton: true,
      confirmButtonText: 'Coba Lagi',
      confirmButtonColor: getComputedStyle(document.documentElement)
        .getPropertyValue("--primary-color")
        .trim(),
    });
  }

  showLoading() {
    document.getElementById("submit-container").innerHTML = `
      <button class="submit-btn" disabled>
        <div class="spinner"></div>
        <span class="btn-text">Memproses...</span>
      </button>`;
  }

  hideLoading() {
    document.getElementById("submit-container").innerHTML = `
      <button type="submit" class="submit-btn"><span class="btn-text">Masuk</span></button>`;
  }
}

export default LoginPage;
