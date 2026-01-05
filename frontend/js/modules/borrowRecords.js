// js/modules/borrowRecords.js
(function () {
  const { ENDPOINTS } = window.APP_CONFIG;
  const { $, toast, showModal, hideModal, escapeHtml } = window.UI;

  let items = [];

  function role() { return (window.Auth.getUser()?.role || "").toLowerCase(); }
  function isMember() { return role() === "member"; }
  function isAdminOrLibrarian() { return role() === "admin" || role() === "librarian"; }

  async function fetchList() {
    if (!isAdminOrLibrarian()) {
      items = [];
      render();
      return;
    }

    try {
      const res = await window.API.get(ENDPOINTS.borrowRecords);
      items = res.data || res.items || res || [];
    } catch (e) {
      toast(e.message, "danger");
      items = [];
    }
    render();
    window.DashboardModule?.refresh?.();
  }

  function statusLabel(r) {
    // sesuaikan jika controller punya field beda
    // contoh umum: returned_at / return_date / status
    const returnedAt = r.returned_at || r.return_date || r.returnedAt;
    if (returnedAt) return { txt: "Returned", cls: "badge-success" };
    return { txt: "Borrowed", cls: "badge-warning" };
  }

  function render() {
    const tbody = $("#borrow-table tbody");
    if (!tbody) return;

    // tombol borrow untuk member
    $("#add-borrow-btn").disabled = !isMember();
    $("#btn-borrow-refresh").disabled = !isAdminOrLibrarian();

    if (!items.length) {
      tbody.innerHTML = `
        <tr class="empty-row">
          <td colspan="7" class="text-center">
            <i class="fas fa-exchange-alt empty-icon"></i>
            <p>${isAdminOrLibrarian() ? "Belum ada borrow record" : "List borrow record hanya admin/librarian"}</p>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = items.map(r => {
      const st = statusLabel(r);
      const book = r.book?.title || r.book_title || (r.book_id ? `Book#${r.book_id}` : "-");
      const user = r.user?.email || r.user_email || (r.user_id ? `User#${r.user_id}` : "-");
      const borrowedAt = r.borrowed_at || r.borrow_date || r.created_at || "-";
      const due = r.due_date || r.due || "-";

      return `
        <tr>
          <td>${escapeHtml(r.id)}</td>
          <td>${escapeHtml(book)}</td>
          <td>${escapeHtml(user)}</td>
          <td>${escapeHtml(borrowedAt)}</td>
          <td>${escapeHtml(due)}</td>
          <td><span class="badge ${st.cls}">${st.txt}</span></td>
          <td class="text-center">
            <button class="btn btn-sm btn-light" data-act="return" data-id="${r.id}">
              <i class="fas fa-undo"></i>
            </button>
          </td>
        </tr>
      `;
    }).join("");

    // return/update only admin/librarian
    tbody.querySelectorAll("[data-act='return']").forEach(btn => {
      btn.disabled = !isAdminOrLibrarian();
      btn.addEventListener("click", () => doReturn(btn.dataset.id));
    });
  }

  async function doReturn(id) {
    if (!isAdminOrLibrarian()) return toast("Return hanya admin/librarian.", "danger");

    $("#confirm-message").textContent = `Proses return untuk record #${id}? (PUT /borrow-records/${id})`;
    $("#confirm-ok").onclick = async () => {
      try {
        // payload kosong → biasanya controller update akan set returned_at
        await window.API.put(`${ENDPOINTS.borrowRecords}/${id}`, {});
        toast("Return berhasil diproses.", "success");
        hideModal("#modal-confirm");
        await fetchList();
      } catch (e) { toast(e.message, "danger"); }
    };
    showModal("#modal-confirm");
  }

  function openBorrowModal() {
    if (!isMember()) return toast("Borrow hanya untuk member.", "danger");
    $("#modal-borrow-title").innerHTML = `<i class="fas fa-book-reader"></i> Borrow Buku`;
    $("#borrow-form").reset();
    showModal("#modal-borrow");
  }

  function bind() {
    $("#add-borrow-btn").addEventListener("click", openBorrowModal);
    $("#btn-borrow-refresh").addEventListener("click", fetchList);

    $("#borrow-form").addEventListener("submit", async (e) => {
      e.preventDefault();
      if (!isMember()) return toast("Borrow hanya untuk member.", "danger");

      const payload = {
        book_id: Number($("#borrow_book_id").value),
        due_date: $("#borrow_due_date").value,
      };

      try {
        await window.API.post(ENDPOINTS.borrowRecords, payload);
        toast("Borrow berhasil.", "success");
        hideModal("#modal-borrow");
      } catch (err) {
        toast(err.message, "danger");
      }
    });
  }

  async function init() {
    bind();
    await fetchList();
  }

  window.BorrowRecordsModule = { init };
})();
