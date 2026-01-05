// js/modules/books.js
(function () {
  const { ENDPOINTS } = window.APP_CONFIG;

  const tbody = document.querySelector("#books-table tbody");
  const countEl = document.getElementById("book-count");

  const btnAdd = document.getElementById("add-book-btn");
  const btnRefresh = document.getElementById("btn-book-refresh");
  const searchInput = document.getElementById("search-book");
  const statusFilter = document.getElementById("filter-status-book");

  const modal = document.getElementById("modal-book");
  const modalTitle = document.getElementById("modal-book-title");
  const form = document.getElementById("book-form");

  const fTitle = document.getElementById("book_title");
  const fIsbn = document.getElementById("book_isbn");

  // penulis ketik + hidden id
  const fAuthorName = document.getElementById("book_author_name");
  const fAuthorId = document.getElementById("book_author_id");

  const fCategory = document.getElementById("book_category_id");
  const fYear = document.getElementById("book_year");
  const fStock = document.getElementById("book_stock");
  const fStatus = document.getElementById("book_status");

  if (!btnAdd || !form || !modal || !fAuthorName || !fAuthorId || !fCategory) {
    console.error("Books module: elemen DOM tidak lengkap. Cek id pada index.html.");
    return;
  }

  let allBooks = [];
  let editingId = null;

  // ✅ simpan data asli saat edit (buat cek field berubah / tidak)
  let original = {
    title: "",
    isbn: "",
    author_id: "",
    category_id: "",
    published_date: "",
    stock: "",
    status: "",
  };

  const openModal = () => modal.classList.add("open");
  const closeModal = () => modal.classList.remove("open");

  function bindCloseButtons() {
    modal.querySelectorAll('[data-close="modal"]').forEach((b) => {
      b.addEventListener("click", (e) => {
        e.preventDefault();
        closeModal();
      });
    });
  }

  function escapeHtml(str) {
    return String(str ?? "")
      .replaceAll("&", "&amp;")
      .replaceAll("<", "&lt;")
      .replaceAll(">", "&gt;")
      .replaceAll('"', "&quot;")
      .replaceAll("'", "&#039;");
  }

  // ✅ Normalisasi status backend -> UI (available/borrowed)
  function normalizeStatus(raw) {
    const st = String(raw ?? "").toLowerCase().trim();
    if (!st) return "available";
    if (st === "available" || st === "tersedia" || st === "1") return "available";
    if (st === "borrowed" || st === "dipinjam" || st === "0" || st === "2") return "borrowed";
    return st;
  }

  function badge(statusUi) {
    const s = normalizeStatus(statusUi);
    if (s === "available") return `<span class="badge success">available</span>`;
    if (s === "borrowed") return `<span class="badge warning">borrowed</span>`;
    return `<span class="badge">${escapeHtml(s || "-")}</span>`;
  }

  // ✅ support respondSuccess + paginate
  function extractArray(res) {
    if (Array.isArray(res)) return res;

    const d = res?.data ?? res;
    if (!d) return [];

    if (Array.isArray(d)) return d;
    if (Array.isArray(d.data)) return d.data;
    if (Array.isArray(d.data?.data)) return d.data.data;

    return [];
  }

  function getErrText(err) {
    if (!err) return "Unknown error";
    if (err.body?.errors) {
      const parts = [];
      for (const k of Object.keys(err.body.errors)) {
        const arr = err.body.errors[k];
        parts.push(`${k}: ${Array.isArray(arr) ? arr.join(", ") : String(arr)}`);
      }
      return parts.join(" | ");
    }
    return err.message || "Unknown error";
  }

  async function loadCategories(selected = "") {
    fCategory.innerHTML = `<option value="">Memuat kategori...</option>`;
    const res = await API.get(ENDPOINTS.categories);
    const cats = extractArray(res);

    fCategory.innerHTML =
      `<option value="">Pilih kategori</option>` +
      cats.map((c) => `<option value="${c.id}">${escapeHtml(c.name)}</option>`).join("");

    if (selected !== "" && selected !== null && selected !== undefined) {
      fCategory.value = String(selected);
    }
  }

  // ✅ ambil detail buku
  async function fetchBookDetail(id) {
    const res = await API.get(`${ENDPOINTS.books}/${id}`);
    return res?.data ?? res;
  }

  function render(list) {
    tbody.innerHTML = "";

    list.forEach((b) => {
      const id = b.id;
      const title = b.title || "";
      const isbn = b.isbn || "";
      const authorName = b.author?.name || "-";
      const catName = b.category?.name || "-";

      const pub = b.published_date || b.publishedDate || "";
      const yearFromPub = pub ? String(pub).slice(0, 4) : "";
      const year = yearFromPub || b.year || "-";

      const stock = b.stock ?? 0;
      const statusUi = normalizeStatus(b.status);

      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${escapeHtml(String(id))}</td>
        <td>
          <div style="font-weight:600">${escapeHtml(title)}</div>
          <div class="muted" style="font-size:12px">Kategori: ${escapeHtml(catName)}</div>
        </td>
        <td>${escapeHtml(authorName)}</td>
        <td class="mono">${escapeHtml(isbn)}</td>
        <td class="text-center">${escapeHtml(String(year))}</td>
        <td class="text-center">${escapeHtml(String(stock))}</td>
        <td class="text-center">${badge(statusUi)}</td>
        <td class="text-center">
          <button type="button" class="btn btn-light btn-sm" data-action="edit" data-id="${id}">
            <i class="fas fa-pen"></i>
          </button>
          <button type="button" class="btn btn-danger btn-sm" data-action="delete" data-id="${id}">
            <i class="fas fa-trash"></i>
          </button>
        </td>
      `;
      tbody.appendChild(tr);
    });

    if (countEl) countEl.textContent = String(list.length);

    tbody.querySelectorAll("[data-action='edit']").forEach((btn) => {
      btn.addEventListener("click", () => onEdit(btn.dataset.id));
    });

    tbody.querySelectorAll("[data-action='delete']").forEach((btn) => {
      btn.addEventListener("click", () => onDelete(btn.dataset.id));
    });
  }

  function applyFilters() {
    const q = (searchInput?.value || "").toLowerCase().trim();
    const status = statusFilter?.value || "all";

    let list = [...allBooks];

    if (status !== "all") {
      list = list.filter((b) => normalizeStatus(b.status) === status);
    }

    if (q) {
      list = list.filter((b) => {
        const hay = `${b.title || ""} ${b.isbn || ""} ${b.author?.name || ""}`.toLowerCase();
        return hay.includes(q);
      });
    }

    render(list);
  }

  async function fetchBooks() {
    const res = await API.get(ENDPOINTS.books);
    allBooks = extractArray(res);
    applyFilters();
  }

  function resetForm() {
    form.reset();
    fStatus.value = "available";
    fStock.value = 1;
    fAuthorName.value = "";
    fAuthorId.value = "";

    original = {
      title: "",
      isbn: "",
      author_id: "",
      category_id: "",
      published_date: "",
      stock: "",
      status: "",
    };
  }

  // ✅ cari author_id dari nama (TIDAK CREATE author)
  async function ensureAuthorIdFromName() {
    const name = (fAuthorName.value || "").trim();
    if (!name) throw new Error("Nama penulis wajib diisi.");

    // kalau sudah ada id hidden -> pakai (tapi return STRING)
    if (fAuthorId.value) return String(fAuthorId.value);

    const res = await API.get(ENDPOINTS.authors);
    const authors = extractArray(res);

    const found = authors.find(
      (a) => String(a.name || "").trim().toLowerCase() === name.toLowerCase()
    );

    if (!found?.id) {
      throw new Error(
        `Penulis "${name}" belum terdaftar. Tambahkan dulu di menu Penulis, lalu coba simpan lagi.`
      );
    }

    fAuthorId.value = String(found.id);
    return String(found.id);
  }

  async function onAdd(e) {
    e?.preventDefault();
    editingId = null;
    modalTitle.textContent = "Tambah Buku";
    resetForm();

    openModal();
    try {
      await loadCategories("");
    } catch (err) {
      alert(`Gagal load kategori: ${getErrText(err)}`);
    }
  }

  // ✅ EDIT: ambil detail dari API
  async function onEdit(id) {
    try {
      const b = await fetchBookDetail(id);
      if (!b?.id) {
        alert("Detail buku tidak ditemukan. Coba klik Refresh.");
        return;
      }

      editingId = b.id;
      modalTitle.textContent = `Edit Buku #${b.id}`;

      fTitle.value = b.title || "";
      fIsbn.value = b.isbn || "";

      const pub = b.published_date || b.publishedDate || "";
      const yearFromPub = pub ? Number(String(pub).slice(0, 4)) : null;
      fYear.value = yearFromPub || b.year || "";

      fStock.value = b.stock ?? 1;
      fStatus.value = normalizeStatus(b.status);

      fAuthorName.value = b.author?.name || "";
      fAuthorId.value = String(b.author_id || b.author?.id || "");

      const catId = b.category_id || b.category?.id || "";
      await loadCategories(catId);

      // ✅ simpan nilai asli buat dibandingkan saat update
      const safeYear = Number(fYear.value) || 2000;
      original = {
        title: String(b.title || ""),
        isbn: String(b.isbn || ""),
        author_id: String(b.author_id || b.author?.id || ""),
        category_id: String(catId || ""),
        published_date: String(b.published_date || `${safeYear}-01-01`),
        stock: String(b.stock ?? ""),
        status: normalizeStatus(b.status),
      };

      openModal();
    } catch (err) {
      alert(`Gagal buka edit: ${getErrText(err)}`);
    }
  }

  async function onDelete(id) {
    const b = allBooks.find((x) => String(x.id) === String(id));
    if (!confirm(`Yakin hapus buku "${b?.title || id}"?`)) return;

    try {
      await API.del(`${ENDPOINTS.books}/${id}`);
      alert("Buku berhasil dihapus ✅");
      await fetchBooks();
    } catch (e) {
      if (e?.status === 403) {
        alert("Gagal hapus: akses ditolak (403). Biasanya DELETE hanya untuk ADMIN.");
        return;
      }
      alert(`Gagal hapus: ${getErrText(e)}`);
    }
  }

  async function buildPayload() {
    const author_id = await ensureAuthorIdFromName();

    const yearNum = Number(fYear.value);
    const safeYear = Number.isFinite(yearNum) && yearNum >= 1900 ? yearNum : 2000;

    const published_date = `${safeYear}-01-01`;
    const statusUi = fStatus.value; // available/borrowed

    return {
      title: (fTitle.value || "").trim(),
      isbn: (fIsbn.value || "").trim(),
      author_id: String(author_id),               // ✅ STRING
      category_id: String(fCategory.value),       // ✅ STRING
      published_date,
      year: safeYear,
      stock: String(fStock.value),                // ✅ string aman
      status: statusUi,
    };
  }

  async function onSubmit(e) {
    e.preventDefault();

    try {
      const payload = await buildPayload();

      if (!payload.title || !payload.isbn || !payload.author_id || !payload.category_id) {
        alert("Mohon isi semua field wajib (*)");
        return;
      }

      const candidates = (payload.status === "borrowed")
        ? ["borrowed", "dipinjam", "BORROWED", 0, 2]
        : ["available", "tersedia", "AVAILABLE", 1, 0];

      let lastErr = null;

      for (const st of candidates) {
        const tryPayload = { ...payload, status: st };

        try {
          if (editingId) {
            // ✅ UPDATE: payload minimal, dan jangan kirim isbn kalau tidak berubah
            const minimalPayload = {
              stock: String(tryPayload.stock),
              status: tryPayload.status,
              published_date: tryPayload.published_date,

              // backend kamu sempat error "author_id must be a string"
              author_id: String(tryPayload.author_id),
              category_id: String(tryPayload.category_id),
            };

            // hanya kirim title kalau berubah
            if (String(tryPayload.title) !== String(original.title)) {
              minimalPayload.title = tryPayload.title;
            }

            // ✅ hanya kirim isbn kalau user bener2 ganti isbn
            if (String(tryPayload.isbn) !== String(original.isbn)) {
              minimalPayload.isbn = tryPayload.isbn;
            }

            await API.put(`${ENDPOINTS.books}/${editingId}`, minimalPayload);
          } else {
            // ✅ CREATE tetap kirim full
            await API.post(ENDPOINTS.books, tryPayload);
          }

          alert(editingId ? "Buku berhasil diupdate ✅" : "Buku berhasil ditambah ✅");
          closeModal();
          editingId = null;
          await fetchBooks();
          return;
        } catch (err) {
          lastErr = err;

          const msg = (err?.message || "").toLowerCase();

          if (err?.status === 403) {
            throw new Error("Akses ditolak (403). Role kamu tidak punya izin UPDATE buku.");
          }
          if (err?.status === 405) {
            throw new Error("Method UPDATE tidak diizinkan (405). Backend mungkin minta PATCH, bukan PUT.");
          }

          // retry hanya kalau error status/published_date
          if (!msg.includes("status") && !msg.includes("published_date") && !msg.includes("published date")) {
            throw err;
          }
        }
      }

      throw lastErr;
    } catch (err) {
      alert(`Gagal simpan: ${getErrText(err)}`);
      console.error(err);
    }
  }

  function init() {
    bindCloseButtons();

    btnAdd.addEventListener("click", onAdd);
    btnRefresh?.addEventListener("click", () => fetchBooks().catch((e) => alert(getErrText(e))));

    searchInput?.addEventListener("input", applyFilters);
    statusFilter?.addEventListener("change", applyFilters);

    // kalau user ngetik ulang nama, reset hidden id
    fAuthorName.addEventListener("input", () => {
      fAuthorId.value = "";
    });

    form.addEventListener("submit", onSubmit);

    fetchBooks().catch((e) => alert(`Gagal load buku: ${getErrText(e)}`));
  }

  document.addEventListener("DOMContentLoaded", init);
})();
