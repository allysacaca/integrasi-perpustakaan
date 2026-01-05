// js/api.js
(function () {
  const { API_BASE_URL, STORAGE_KEYS } = window.APP_CONFIG;

  function getToken() {
    return localStorage.getItem(STORAGE_KEYS.token) || "";
  }

  function extractLaravelError(data, fallback) {
    if (!data) return fallback;

    // biasanya: { status:false, message: "...", errors: {field: [..]} }
    if (typeof data === "string") return data;
    if (data.message && !data.errors) return data.message;

    if (data.errors && typeof data.errors === "object") {
      const parts = [];
      for (const k of Object.keys(data.errors)) {
        const arr = data.errors[k];
        if (Array.isArray(arr)) parts.push(`${k}: ${arr.join(", ")}`);
      }
      if (parts.length) return parts.join(" | ");
    }

    return data.message || fallback;
  }

  async function request(path, options = {}) {
    const url = API_BASE_URL.replace(/\/$/, "") + path;

    const headers = {
      Accept: "application/json",
      ...(options.headers || {}),
    };

    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;

    let body = options.body;
    if (body && typeof body === "object" && !(body instanceof FormData)) {
      headers["Content-Type"] = "application/json";
      body = JSON.stringify(body);
    }

    const res = await fetch(url, { ...options, headers, body });

    const ct = res.headers.get("content-type") || "";
    const isJson = ct.includes("application/json");
    let data = null;

    if (isJson) {
      try {
        data = await res.json();
      } catch {
        data = null;
      }
    } else {
      try {
        data = await res.text();
      } catch {
        data = null;
      }
    }

    // ✅ FIX PENTING:
    // Kalau backend kamu balikin {status:false,...} tapi HTTP 200,
    // tetap harus dianggap error biar frontend gak ngira sukses.
    if (res.ok && isJson && data && typeof data === "object" && "status" in data && data.status === false) {
      const fallback = `Request gagal (${res.status})`;
      const msg = extractLaravelError(data, fallback);
      const err = new Error(msg);
      err.status = res.status;
      err.body = data;
      throw err;
    }

    if (!res.ok) {
      const fallback = `Request gagal (${res.status})`;
      const msg = extractLaravelError(data, fallback);
      const err = new Error(msg);
      err.status = res.status;
      err.body = data;
      throw err;
    }

    return data;
  }

  window.API = {
    get: (path) => request(path, { method: "GET" }),
    post: (path, body) => request(path, { method: "POST", body }),
    put: (path, body) => request(path, { method: "PUT", body }),
    del: (path) => request(path, { method: "DELETE" }),
  };
})();
