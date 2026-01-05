// js/app.js
(async function () {
  function setUserHeader() {
    const u = window.Auth.getUser() || {};
    const nameEl = document.getElementById("user-name");
    const roleEl = document.getElementById("user-role");
    if (nameEl) nameEl.textContent = u.name || u.email || "User";
    if (roleEl) roleEl.textContent = (u.role || "-").toUpperCase();
  }

  function setTime() {
    const el = document.getElementById("server-time");
    if (!el) return;
    el.textContent = new Date().toLocaleString("id-ID");
  }

  function bindLogout() {
    const btn = document.getElementById("logout-btn");
    if (!btn) return;
    btn.addEventListener("click", async () => {
      if (!confirm("Yakin logout?")) return;
      await window.Auth.logout();
      window.location.href = "login.html";
    });
  }

  async function boot() {
    const loading = document.getElementById("loading");

    try {
      if (!window.Auth.requireAuthOrRedirect()) return;

      window.UI.bindTabs();
      window.UI.bindModalClosers();
      bindLogout();
      setUserHeader();
      setTime();
      setInterval(setTime, 30000);

      // jalanin modul paralel, dan jangan bikin loader nyangkut
      const results = await Promise.allSettled([
        window.DashboardModule?.init?.(),
        window.BooksModule?.init?.(),
        window.AuthorsModule?.init?.(),
        window.CategoriesModule?.init?.(),
        window.UsersModule?.init?.(),
        window.BorrowRecordsModule?.init?.(),
      ]);

      // kalau ada yang gagal, tampilkan errornya
      const rejected = results.filter(r => r.status === "rejected");
      if (rejected.length) {
        console.error("Module init failed:", rejected);
        window.UI.toast("Ada modul gagal load. Cek Console/Network.", "danger");
      }
    } catch (e) {
      console.error("BOOT ERROR:", e);
      window.UI.toast(e.message || "Gagal memuat sistem.", "danger");
    } finally {
      // PASTI hide loader apapun kondisinya
      if (loading) loading.style.display = "none";
    }
  }

  document.addEventListener("DOMContentLoaded", boot);
})();
