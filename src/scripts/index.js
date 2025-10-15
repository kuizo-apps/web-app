import "../styles/style.css";
import "../styles/responsive-style.css";
import App from "./pages/app.js";

const app = new App({
  appContainer: document.getElementById("app"),
});

window.addEventListener("load", () => {
  app.renderPage();
});

window.addEventListener("hashchange", () => {
  app.renderPage();
});
