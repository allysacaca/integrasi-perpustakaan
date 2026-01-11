Library Management API

Library Management API adalah sistem Manajemen Perpustakaan Digital yang dibangun menggunakan Laravel 10 dan menerapkan konsep Integrasi Aplikasi melalui REST API (serta opsional GraphQL).
Aplikasi ini digunakan untuk mengelola data buku, penulis, pengguna, serta transaksi peminjaman dan pengembalian buku, dengan mekanisme autentikasi berbasis token dan kontrol akses berbasis role.
Proyek ini dikembangkan untuk memenuhi Tugas Besar Mata Kuliah Integrasi Aplikasi serta sebagai implementasi praktis konsep integrasi sistem berbasis API.

Tujuan Pengembangan

Proyek ini bertujuan untuk:

Menerapkan konsep REST API dalam komunikasi antar aplikasi

Mengimplementasikan arsitektur service-oriented / microservices sederhana

Menggunakan JSON sebagai format pertukaran data

Mengimplementasikan GraphQL sebagai alternatif REST API

Menerapkan token-based authentication

Mengembangkan kemampuan problem solving dalam integrasi sistem

## Features
Book Management (CRUD)

Menambah data buku

Mengubah data buku

Menghapus data buku

Melihat daftar buku

Melihat detail buku

Pencarian buku

Borrow & Return Transaction

Peminjaman buku

Pengembalian buku

Pencatatan transaksi peminjaman

Riwayat peminjaman anggota

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

API Characteristics

RESTful endpoints

JSON request & response

Proper HTTP status codes (200, 201, 400, 401, 404, 500)

Secure endpoints using middleware

Role-based access enforcement

Documentation

API Documentation tersedia melalui Postman

Database schema tersedia dalam bentuk migration Laravel

Source code dikelola menggunakan Git dengan commit history yang jelas

