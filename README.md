Library Management API

Library Management API adalah sistem Manajemen Perpustakaan Digital yang dibangun menggunakan Laravel 10 dan menerapkan konsep Integrasi Aplikasi melalui REST API (serta opsional GraphQL).
Aplikasi ini digunakan untuk mengelola data buku, penulis, pengguna, serta transaksi peminjaman dan pengembalian buku, dengan mekanisme autentikasi berbasis token dan kontrol akses berbasis role.
Proyek ini dikembangkan untuk memenuhi Tugas Besar Mata Kuliah Integrasi Aplikasi.

## Features
Books
- Create, update, delete, search books
- Borrow and return books

Users
- User registration & login
- Role-based access control (Admin, Librarian, Member)

Borrow Records
- Track borrowing and returning transactions

Authentication
- Token-based authentication using Laravel Sanctum

Integration
- REST API communication using JSON

Rate Limiting
- Throttled routes to prevent API abuse

Testing
- Feature and unit tests implemented for API endpoints

Technology Stack
- Backend: Laravel 10
- Frontend: HTML, CSS, JavaScript (Vanilla)
- Language: PHP 8.2
- Database: MySQL
- Authentication: Laravel Sanctum
- API Testing & Documentation: Postman

