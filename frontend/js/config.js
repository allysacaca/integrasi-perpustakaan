// js/config.js
window.APP_CONFIG = {
  API_BASE_URL: "http://127.0.0.1:8000", // ganti sesuai laravel kamu

  ENDPOINTS: {
    login: "/api/login",

    categories: "/api/categories",
    books: "/api/books",
    booksSearch: "/api/books/search",
    authors: "/api/authors",

    users: "/api/users",
    borrowRecords: "/api/borrow-records",
  },

  STORAGE_KEYS: {
    token: "libraryToken",
    user: "libraryUser",
  },
};
