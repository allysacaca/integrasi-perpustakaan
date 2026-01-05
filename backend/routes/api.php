<?php

use App\Http\Controllers\CategoryController;
use App\Enums\UserRole;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\BorrowRecordController;
use App\Http\Controllers\UserController;
use Illuminate\Support\Facades\Route;

$sanctumAUTH = 'auth:sanctum';
$mustBeAdminOrLibrarian = 'ability:' . UserRole::ADMIN . ',' . UserRole::LIBRARIAN;
$mustBeAdminOrMember = 'ability:' . UserRole::ADMIN . ',' . UserRole::MEMBER;
$mustBeAdmin = 'ability:' . UserRole::ADMIN;
$mustBeMember = 'ability:' . UserRole::MEMBER;

Route::prefix('categories')->middleware('throttle:api')->group(function () use ($sanctumAUTH, $mustBeAdminOrLibrarian) {
    Route::get('/', [CategoryController::class, 'index']); // Siapapun bisa lihat list kategori
    Route::post('/', [CategoryController::class, 'store'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian); // Cuma admin yg bisa nambah
});

// --- BOOKS ROUTES ---
Route::prefix('books')->middleware('throttle:api')->group(function () use ($sanctumAUTH, $mustBeAdminOrLibrarian, $mustBeAdmin) {
    Route::get('/', [BookController::class, 'index']);
    Route::get('/search', [BookController::class, 'search']);
    Route::get('/{book}', [BookController::class, 'show']);
    
    Route::post('/', [BookController::class, 'store'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);
    Route::put('/{book}', [BookController::class, 'update'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);
    Route::delete('/{book}', [BookController::class, 'destroy'])->middleware($sanctumAUTH, $mustBeAdmin);
    
    // SAYA HAPUS route borrow/return disini karena sudah dipindah ke borrow-records
});

// --- AUTHORS ROUTES ---
Route::prefix('authors')->middleware('throttle:api')->group(function () use ($sanctumAUTH, $mustBeAdminOrLibrarian, $mustBeAdmin) {
    Route::get('/', [AuthorController::class, 'index']);
    Route::get('/{author}', [AuthorController::class, 'show']);
    Route::post('/', [AuthorController::class, 'store'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);
    Route::put('/{author}', [AuthorController::class, 'update'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);
    Route::delete('/{author}', [AuthorController::class, 'destroy'])->middleware($sanctumAUTH, $mustBeAdmin);
});

// --- USERS ROUTES ---
Route::prefix('users')->middleware('throttle:api')->group(function () use ($sanctumAUTH, $mustBeAdmin, $mustBeAdminOrMember) {
    Route::get('/', [UserController::class, 'index'])->middleware($sanctumAUTH, $mustBeAdmin);
    Route::get('/{user}', [UserController::class, 'show'])->middleware($sanctumAUTH, $mustBeAdmin);
    Route::post('/', [UserController::class, 'store']); // Register member baru
    Route::put('/{user}', [UserController::class, 'update'])->middleware($sanctumAUTH, $mustBeAdminOrMember);
    Route::delete('/{user}', [UserController::class, 'destroy'])->middleware($sanctumAUTH, $mustBeAdmin);
});

// --- AUTH ROUTES ---
Route::post('/login', [UserController::class, 'login'])->middleware('throttle:api');
Route::post('/create-librarian', [UserController::class, 'createLibrarian'])->middleware($sanctumAUTH, $mustBeAdmin);

// --- BORROW RECORDS ROUTES (YANG KITA KERJAKAN TADI) ---
Route::prefix('borrow-records')->middleware('throttle:api')->group(function () use ($sanctumAUTH, $mustBeAdminOrLibrarian, $mustBeMember) {
    
    // 1. Melihat Data Peminjaman (Admin/Pustakawan)
    Route::get('/', [BorrowRecordController::class, 'index'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);
    Route::get('/{borrowRecord}', [BorrowRecordController::class, 'show'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);

    // 2. Meminjam Buku (POST) -> Biasanya dilakukan Member
    Route::post('/', [BorrowRecordController::class, 'store'])->middleware($sanctumAUTH, $mustBeMember);

    // 3. Mengembalikan Buku (PUT) -> Biasanya dilakukan Pustakawan untuk cek denda & fisik buku
    Route::put('/{borrowRecord}', [BorrowRecordController::class, 'update'])->middleware($sanctumAUTH, $mustBeAdminOrLibrarian);
});