// js/modules/dashboard.js
(function () {
  const { ENDPOINTS } = window.APP_CONFIG;

  async function init() {
    await refresh();
  }

  async function refresh() {
    const set = (id, v) => {
      const el = document.getElementById(id);
      if (el) el.textContent = String(v ?? 0);
    };

    // books
    try {
      const books = await window.API.get(ENDPOINTS.books);
      const arr = books.data || books.items || books || [];
      set("stat-books", Array.isArray(arr) ? arr.length : 0);
    } catch { set("stat-books", 0); }

    // authors
    try {
      const authors = await window.API.get(ENDPOINTS.authors);
      const arr = authors.data || authors.items || authors || [];
      set("stat-authors", Array.isArray(arr) ? arr.length : 0);
    } catch { set("stat-authors", 0); }

    // categories (public)
    try {
      const categories = await window.API.get(ENDPOINTS.categories);
      const arr = categories.data || categories.items || categories || [];
      set("stat-categories", Array.isArray(arr) ? arr.length : 0);
    } catch { set("stat-categories", 0); }

    // borrow-records (admin/librarian only)
    try {
      const borrow = await window.API.get(ENDPOINTS.borrowRecords);
      const arr = borrow.data || borrow.items || borrow || [];
      set("stat-borrow", Array.isArray(arr) ? arr.length : 0);
    } catch { set("stat-borrow", 0); }
  }

  window.DashboardModule = { init, refresh };
})();
