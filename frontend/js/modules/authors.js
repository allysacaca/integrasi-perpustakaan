// js/modules/authors.js
(function () {
  const { ENDPOINTS } = window.APP_CONFIG;
  const { $, toast, showModal, hideModal, escapeHtml } = window.UI;

  let items = [];

  function role() { return (window.Auth.getUser()?.role || "").toLowerCase(); }
  function canCreateUpdate() { return role() === "admin" || role() === "librarian"; }
  function canDelete() { return role() === "admin"; }

  async function fetchList() {
    try {
      const res = await window.API.get(ENDPOINTS.authors);
      items = res.data || res.items || res || [];
    } catch (e) {
      toast(e.message, "danger");
      items = [];
    }
    render();
    window.DashboardModule?.refresh?.();
  }

  function render() {
    const tbody = $("#authors-table tbody");
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="3" class="text-center">
            <i class="fas fa-user-edit empty-icon"></i>
            <p>Belum ada data penulis</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(a => `
      <tr>
        <td>${escapeHtml(a.id)}</td>
        <td>${escapeHtml(a.name || "-")}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-light" data-act="edit" data-id="${a.id}"><i class="fas fa-pen"></i></button>
          <button class="btn btn-sm btn-danger" data-act="del" data-id="${a.id}"><i class="fas fa-trash"></i></button>
        </td>
      </tr>
    `).join("");

    $("#add-author-btn").disabled = !canCreateUpdate();
    tbody.querySelectorAll("[data-act='edit']").forEach(b => b.disabled = !canCreateUpdate());
    tbody.querySelectorAll("[data-act='del']").forEach(b => b.disabled = !canDelete());

    tbody.querySelectorAll("[data-act='edit']").forEach(btn => btn.addEventListener("click", () => openModal("edit", btn.dataset.id)));
    tbody.querySelectorAll("[data-act='del']").forEach(btn => btn.addEventListener("click", () => confirmDelete(btn.dataset.id)));
  }

  function openModal(mode, id = null) {
    if (!canCreateUpdate()) return toast("Akses ditolak (admin/librarian).", "danger");

    const form = $("#author-form");
    const title = $("#modal-author-title");
    form.dataset.mode = mode;
    form.dataset.id = id || "";

    if (mode === "edit") {
      const a = items.find(x => String(x.id) === String(id));
      if (!a) return toast("Penulis tidak ditemukan.", "warning");
      title.innerHTML = `<i class="fas fa-pen"></i> Edit Penulis`;
      $("#author_name").value = a.name || "";
    } else {
      title.innerHTML = `<i class="fas fa-plus"></i> Tambah Penulis`;
      form.reset();
    }

    showModal("#modal-author");
  }

  function confirmDelete(id) {
    if (!canDelete()) return toast("Hapus penulis hanya admin.", "danger");
    $("#confirm-message").textContent = `Yakin hapus penulis ID #${id}?`;
    $("#confirm-ok").onclick = async () => {
      try {
        await window.API.del(`${ENDPOINTS.authors}/${id}`);
        toast("Penulis dihapus.", "success");
        hideModal("#modal-confirm");
        await fetchList();
      } catch (e) { toast(e.message, "danger"); }
    };
    showModal("#modal-confirm");
  }

  function bind() {
    $("#add-author-btn").addEventListener("click", () => openModal("create"));

    $("#author-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const mode = form.dataset.mode;
      const id = form.dataset.id;

      const payload = { name: $("#author_name").value.trim() };

      try {
        if (mode === "edit") await window.API.put(`${ENDPOINTS.authors}/${id}`, payload);
        else await window.API.post(ENDPOINTS.authors, payload);

        toast("Berhasil disimpan.", "success");
        hideModal("#modal-author");
        await fetchList();
      } catch (err) { toast(err.message, "danger"); }
    });
  }

  async function init() {
    bind();
    await fetchList();
  }

  window.AuthorsModule = { init };
})();
