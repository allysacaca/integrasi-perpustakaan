// js/auth.js
(function () {
  const { ENDPOINTS, STORAGE_KEYS } = window.APP_CONFIG;

  function saveSession(token, user) {
    localStorage.setItem(STORAGE_KEYS.token, token);
    localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(user || {}));
  }

  function clearSession() {
    localStorage.removeItem(STORAGE_KEYS.token);
    localStorage.removeItem(STORAGE_KEYS.user);
  }

  function getUser() {
    const raw = localStorage.getItem(STORAGE_KEYS.user);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch { return null; }
  }

  function isLoggedIn() {
    return !!localStorage.getItem(STORAGE_KEYS.token);
  }

  // login sesuai routes: POST /api/login
  async function login(email, password) {
    const res = await window.API.post(ENDPOINTS.login, { email, password });

    // fleksibel (karena tiap backend beda):
    // bisa {token, user} atau {access_token, user} atau {token, data:{...}}
    const token = res.token || res.access_token || res.data?.token || res.data?.access_token;
    const user = res.user || res.data?.user || res.data || null;

    if (!token) throw new Error("Login tidak mengembalikan token. Pastikan controller login return token.");
    saveSession(token, user);
    return user;
  }

  async function logout() {
    // backend kamu belum ada endpoint revoke token
    clearSession();
  }

  function requireAuthOrRedirect() {
    if (!isLoggedIn()) {
      window.location.href = "login.html";
      return false;
    }
    return true;
  }

  window.Auth = { login, logout, getUser, isLoggedIn, requireAuthOrRedirect, clearSession };
})();
