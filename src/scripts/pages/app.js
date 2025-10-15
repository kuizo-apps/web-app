import { getActiveRoute } from "../routes/url-parser.js";
import routes from "../routes/routes.js";
import NotFoundPage from "./not-found-page.js";
import { getLogout } from "../utils/auth.js";
import { createMainLayoutTemplate } from "../templates/templates.js";

class App {
  constructor({ appContainer }) {
    this._appContainer = appContainer;
  }

  _initialMainLayoutShell() {
    document.getElementById("logoutButton").addEventListener("click", (e) => {
      e.preventDefault();
      getLogout();
    });

    this._updateActiveMenu();
  }

  _updateActiveMenu() {
    const currentHash = window.location.hash || "#/home";
    const headerNav = document.querySelector(".header-nav");
    if (!headerNav) return;

    headerNav.querySelectorAll(".active").forEach((el) => {
      el.classList.remove("active");
    });

    const activeLink = headerNav.querySelector(`a[data-path="${currentHash}"]`);
    if (activeLink) {
      activeLink.classList.add("active");
    }
  }

  async renderPage() {
    const url = getActiveRoute() || "/";
    const page = routes[url] ? routes[url]() : new NotFoundPage();

    if (page) {
      const isSpecialPage = url === "/login" || page instanceof NotFoundPage;
      if (isSpecialPage) {
        this._appContainer.innerHTML = await page.render();
      } else {
        this._appContainer.innerHTML = createMainLayoutTemplate();
        const mainContent = document.getElementById("main-content");
        mainContent.innerHTML = await page.render();
        this._initialMainLayoutShell();
      }
      await page.afterRender();
    }
  }
}

export default App;
