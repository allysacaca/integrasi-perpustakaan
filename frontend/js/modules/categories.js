// js/modules/categories.js
(function () {
  const { ENDPOINTS } = window.APP_CONFIG;
  const { $, toast, showModal, hideModal, escapeHtml } = window.UI;

  let items = [];

  function role() { return (window.Auth.getUser()?.role || "").toLowerCase(); }
  function canCreate() { return role() === "admin" || role() === "librarian"; }

  async function fetchList() {
    try {
      const res = await window.API.get(ENDPOINTS.categories);
      items = res.data || res.items || res || [];
    } catch (e) {
      toast(e.message, "danger");
      items = [];
    }
    render();
    window.DashboardModule?.refresh?.();
  }

  function render() {
    const tbody = $("#categories-table tbody");
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="3" class="text-center">
            <i class="fas fa-tags empty-icon"></i>
            <p>Belum ada kategori</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(c => `
      <tr>
        <td>${escapeHtml(c.id)}</td>
        <td>${escapeHtml(c.name || "-")}</td>
        <td class="text-center">
          <span class="badge badge-muted">Kategori</span>
        </td>
      </tr>
    `).join("");

    $("#add-category-btn").disabled = !canCreate();
  }

  function openModal() {
    if (!canCreate()) return toast("Tambah kategori hanya admin/librarian.", "danger");
    $("#modal-category-title").innerHTML = `<i class="fas fa-plus"></i> Tambah Kategori`;
    $("#category-form").reset();
    showModal("#modal-category");
  }

  function bind() {
    $("#add-category-btn").addEventListener("click", openModal);

    $("#category-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const name = $("#category_name").value.trim();
      if (!name) return toast("Nama kategori wajib.", "warning");

      try {
        await window.API.post(ENDPOINTS.categories, { name });
        toast("Kategori berhasil ditambah.", "success");
        hideModal("#modal-category");
        await fetchList();
      } catch (err) { toast(err.message, "danger"); }
    });
  }

  async function init() {
    bind();
    await fetchList();
  }

  window.CategoriesModule = { init };
})();
