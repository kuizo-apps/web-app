import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth.js";
import LoginPage from "../pages/login/login-page.js";
import HomePage from "../pages/home/home-page.js";

const routes = {
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/home": () => checkAuthenticatedRoute(new HomePage()),
};

export default routes;
