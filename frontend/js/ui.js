// js/ui.js
(function () {
  const $ = (sel, root = document) => root.querySelector(sel);
  const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

  function setActiveTab(tabId) {
    $$(".nav-link").forEach((a) => a.classList.remove("active"));
    $$(".tab-content").forEach((s) => s.classList.remove("active"));

    const link = $(`.nav-link[data-tab="${tabId}"]`);
    const section = $(`#${tabId}`);
    if (link) link.classList.add("active");
    if (section) section.classList.add("active");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function bindTabs() {
    $$(".nav-link").forEach((a) => {
      a.addEventListener("click", (e) => {
        e.preventDefault();
        setActiveTab(a.dataset.tab);
      });
    });
  }

  function showModal(idOrEl) {
    const el = typeof idOrEl === "string" ? $(idOrEl) : idOrEl;
    if (!el) return;
    el.classList.add("show");
    document.body.classList.add("modal-open");
  }

  function hideModal(idOrEl) {
    const el = typeof idOrEl === "string" ? $(idOrEl) : idOrEl;
    if (!el) return;
    el.classList.remove("show");
    document.body.classList.remove("modal-open");
  }

  function bindModalClosers() {
    $$(".modal").forEach((m) => {
      m.addEventListener("click", (e) => {
        if (e.target === m) hideModal(m);
      });
      m.querySelectorAll("[data-close='modal']").forEach((b) => {
        b.addEventListener("click", () => hideModal(m));
      });
    });
  }

  function toast(message, type = "info") {
    const wrap = $("#toast-wrap") || createToastWrap();
    const el = document.createElement("div");
    el.className = `toast toast-${type}`;
    el.innerHTML = `
      <div class="toast-icon">${type === "success" ? "✅" : type === "danger" ? "⚠️" : "ℹ️"}</div>
      <div class="toast-msg">${escapeHtml(message)}</div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;
    wrap.appendChild(el);

    const close = () => {
      el.classList.add("hide");
      setTimeout(() => el.remove(), 220);
    };
    el.querySelector(".toast-close").addEventListener("click", close);
    setTimeout(close, 3200);
  }

  function createToastWrap() {
    const d = document.createElement("div");
    d.id = "toast-wrap";
    document.body.appendChild(d);
    return d;
  }

  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({
      "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
    }[c]));
  }

  window.UI = {
    $, $$,
    bindTabs,
    setActiveTab,
    showModal,
    hideModal,
    bindModalClosers,
    toast,
    escapeHtml,
  };
})();
