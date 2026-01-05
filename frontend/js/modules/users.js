// js/modules/users.js
(function () {
  const { ENDPOINTS } = window.APP_CONFIG;
  const { $, toast, showModal, hideModal, escapeHtml } = window.UI;

  let items = [];

  function role() { return (window.Auth.getUser()?.role || "").toLowerCase(); }
  function isAdmin() { return role() === "admin"; }

  async function fetchList() {
    // only admin can list users
    if (!isAdmin()) {
      items = [];
      render();
      return;
    }

    try {
      const res = await window.API.get(ENDPOINTS.users);
      items = res.data || res.items || res || [];
    } catch (e) {
      toast(e.message, "danger");
      items = [];
    }
    render();
  }

  function render() {
    const tbody = $("#users-table tbody");
    if (!tbody) return;

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="5" class="text-center">
            <i class="fas fa-users empty-icon"></i>
            <p>${isAdmin() ? "Belum ada data user" : "List user hanya untuk admin"}</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(u => `
      <tr>
        <td>${escapeHtml(u.id)}</td>
        <td>${escapeHtml(u.name || "-")}</td>
        <td>${escapeHtml(u.email || "-")}</td>
        <td>${escapeHtml(u.role || "-")}</td>
        <td class="text-center">
          <button class="btn btn-sm btn-light" data-act="edit" data-id="${u.id}"><i class="fas fa-pen"></i></button>
        </td>
      </tr>
    `).join("");

    tbody.querySelectorAll("[data-act='edit']").forEach(btn => {
      btn.addEventListener("click", () => openModal("edit", btn.dataset.id));
    });
  }

  function openModal(mode, id = null) {
    const form = $("#user-form");
    const title = $("#modal-user-title");
    form.dataset.mode = mode;
    form.dataset.id = id || "";

    if (mode === "edit") {
      const u = items.find(x => String(x.id) === String(id));
      if (!u) return toast("User tidak ditemukan.", "warning");
      title.innerHTML = `<i class="fas fa-pen"></i> Update User`;
      $("#user_name").value = u.name || "";
      $("#user_email").value = u.email || "";
      $("#user_password").value = "";
      $("#user_role").value = u.role || "member";
    } else {
      title.innerHTML = `<i class="fas fa-user-plus"></i> Register Member`;
      form.reset();
      $("#user_role").value = "member";
    }

    showModal("#modal-user");
  }

  function bind() {
    $("#add-user-btn").addEventListener("click", () => openModal("create"));

    $("#user-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      const form = e.currentTarget;
      const mode = form.dataset.mode;
      const id = form.dataset.id;

      const payload = {
        name: $("#user_name").value.trim(),
        email: $("#user_email").value.trim(),
        role: $("#user_role").value,
      };
      const pass = $("#user_password").value.trim();

      try {
        if (mode === "create") {
          // register member baru route: POST /api/users
          if (!pass) return toast("Password wajib saat register.", "warning");
          await window.API.post(ENDPOINTS.users, { ...payload, password: pass });
          toast("Register berhasil.", "success");
        } else {
          // update route: PUT /api/users/{id}
          const body = pass ? { ...payload, password: pass } : payload;
          await window.API.put(`${ENDPOINTS.users}/${id}`, body);
          toast("User berhasil diupdate.", "success");
        }

        hideModal("#modal-user");
        await fetchList();
      } catch (err) {
        toast(err.message, "danger");
      }
    });
  }

  async function init() {
    bind();
    await fetchList();
  }

  window.UsersModule = { init };
})();
