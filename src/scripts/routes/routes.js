import {
  checkAuthenticatedRoute,
  checkUnauthenticatedRouteOnly,
} from "../utils/auth.js";
import LoginPage from "../pages/login/login-page.js";
import HomePage from "../pages/home/home-page.js";
import ReportPage from "../pages/report/report-page.js";
import WaitingRoomPage from "../pages/waiting-room/waiting-room-page.js";
import ExamPage from "../pages/exam/exam-page.js";

const routes = {
  "/": () => checkAuthenticatedRoute(new HomePage()),
  "/login": () => checkUnauthenticatedRouteOnly(new LoginPage()),
  "/home": () => checkAuthenticatedRoute(new HomePage()),
  "/report/:id": () => checkAuthenticatedRoute(new ReportPage()),
  "/waiting-room/:id": () => checkAuthenticatedRoute(new WaitingRoomPage()),
  "/exam/:id": () => checkAuthenticatedRoute(new ExamPage()),
};

export default routes;
