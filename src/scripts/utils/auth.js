import { getActiveRoute } from "../routes/url-parser.js";
import { ACCESS_TOKEN_KEY, USER_NAME_KEY } from "../config.js";

export function getAccessToken() {
  try {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);

    if (accessToken === "null" || accessToken === "undefined") {
      return null;
    }

    return accessToken;
  } catch (error) {
    console.error("getAccessToken: error:", error);
    return null;
  }
}

export function putAccessToken(token) {
  try {
    localStorage.setItem(ACCESS_TOKEN_KEY, token);
    return true;
  } catch (error) {
    console.error("putAccessToken: error:", error);
    return false;
  }
}

export function isTokenExpired(token) {
  if (!token) return true;

  const decodedToken = parseJwt(token);
  if (!decodedToken || !decodedToken.exp) return true;

  const expirationTimeInSeconds = decodedToken.exp;
  const currentTimeInSeconds = Math.floor(Date.now() / 1000);

  return expirationTimeInSeconds < currentTimeInSeconds;
}

export function removeAccessToken() {
  try {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

export function removeUserName() {
  try {
    localStorage.removeItem(USER_NAME_KEY);
    return true;
  } catch (error) {
    return false;
  }
}

const unauthenticatedRoutesOnly = ["/login"];

export function checkUnauthenticatedRouteOnly(page) {
  const url = getActiveRoute();
  const isLogin = !!getAccessToken();

  if (unauthenticatedRoutesOnly.includes(url) && isLogin) {
    location.hash = "/";
    return null;
  }

  return page;
}

export function checkAuthenticatedRoute(page) {
  const token = getAccessToken();
  if (token && !isTokenExpired(token)) return page;
  getLogout();
  return null;
}

export function getLogout() {
  removeAccessToken();
  removeUserName();
  window.location.hash = "/login";
}

export function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );

    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

export function capitalizeEachWord(str) {
  if (!str) return "";
  return str
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function putUserName(name) {
  try {
    localStorage.setItem(USER_NAME_KEY, name);
    return true;
  } catch (error) {
    return false;
  }
}

export function getUserName() {
  try {
    const userName = localStorage.getItem(USER_NAME_KEY);
    return userName === "null" || userName === "undefined" ? null : userName;
  } catch (error) {
    return null;
  }
}

export function getUserId() {
  try {
    const token = getAccessToken();
    if (!token) return null;
    const decoded = parseJwt(token);
    return decoded ? decoded.id : null;
  } catch (error) {
    return null;
  }
}
