<?php

use App\Enums\UserRole;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowRecordController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

// Middleware untuk User Role (Gunakan middleware custom Anda)
$mustBeAdminOrLibrarian = 'role:' . UserRole::ADMIN . ',' . UserRole::LIBRARIAN;
$mustBeAdminOrMember = 'role:' . UserRole::ADMIN . ',' . UserRole::MEMBER;
$mustBeAdmin = 'role:' . UserRole::ADMIN;
$mustBeMember = 'role:' . UserRole::MEMBER;

// --- Public Routes (Bisa diakses tanpa login) ---
Route::get('/', function () {
    return view('welcome');
});

Route::prefix('books')->group(function () {
    Route::get('/', [BookController::class, 'index'])->name('books.index');
    Route::get('/search', [BookController::class, 'search'])->name('books.search');
    Route::get('/{book}', [BookController::class, 'show'])->name('books.show');
});

Route::prefix('authors')->group(function () {
    Route::get('/', [AuthorController::class, 'index'])->name('authors.index');
    Route::get('/{author}', [AuthorController::class, 'show'])->name('authors.show');
});

// --- Auth Routes (Login, Register, Logout) ---
Route::get('/login', [UserController::class, 'showLoginForm'])->name('login');
Route::post('/login', [UserController::class, 'login']);
Route::post('/logout', [UserController::class, 'logout'])->middleware('auth')->name('logout');
Route::get('/register', [UserController::class, 'showRegisterForm'])->name('register');
Route::post('/register', [UserController::class, 'store']);


// --- Protected Routes (Membutuhkan Login) ---
Route::middleware(['auth'])->group(function () use ($mustBeAdminOrLibrarian, $mustBeAdmin, $mustBeMember, $mustBeAdminOrMember) {

    // Manajemen Buku (Admin & Pustakawan)
    Route::prefix('books')->group(function () use ($mustBeAdminOrLibrarian, $mustBeAdmin, $mustBeMember) {
        Route::post('/', [BookController::class, 'store'])->middleware($mustBeAdminOrLibrarian);
        Route::put('/{book}', [BookController::class, 'update'])->middleware($mustBeAdminOrLibrarian);
        Route::delete('/{book}', [BookController::class, 'destroy'])->middleware($mustBeAdmin);
        
        // Peminjaman (Hanya Member)
        Route::post('/{book}/borrow', [BookController::class, 'borrowBook'])->middleware($mustBeMember);
        Route::post('/{book}/return', [BookController::class, 'returnBook'])->middleware($mustBeMember);
    });

    // Manajemen Penulis (Admin & Pustakawan)
    Route::prefix('authors')->group(function () use ($mustBeAdminOrLibrarian, $mustBeAdmin) {
        Route::post('/', [AuthorController::class, 'store'])->middleware($mustBeAdminOrLibrarian);
        Route::put('/{author}', [AuthorController::class, 'update'])->middleware($mustBeAdminOrLibrarian);
        Route::delete('/{author}', [AuthorController::class, 'destroy'])->middleware($mustBeAdmin);
    });

    // Manajemen User
    Route::prefix('users')->group(function () use ($mustBeAdmin, $mustBeAdminOrMember) {
        Route::get('/', [UserController::class, 'index'])->middleware($mustBeAdmin);
        Route::get('/{user}', [UserController::class, 'show'])->middleware($mustBeAdmin);
        Route::put('/{user}', [UserController::class, 'update'])->middleware($mustBeAdminOrMember);
        Route::delete('/{user}', [UserController::class, 'destroy'])->middleware($mustBeAdmin);
    });

    // Route Khusus Admin
    Route::post('/create-librarian', [UserController::class, 'createLibrarian'])->middleware($mustBeAdmin);

    // Riwayat Peminjaman (Admin & Librarian)
    Route::prefix('borrow-records')->middleware($mustBeAdminOrLibrarian)->group(function () {
        Route::get('/', [BorrowRecordController::class, 'index'])->name('borrow.index');
        Route::get('/{borrowRecord}', [BorrowRecordController::class, 'show'])->name('borrow.show');
    });
});