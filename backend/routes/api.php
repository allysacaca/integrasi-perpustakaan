<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\UserController;
use App\Http\Controllers\BookController;
use App\Http\Controllers\CategoryController;
use App\Http\Controllers\AuthorController;
use App\Http\Controllers\BorrowRecordController;

/*
|--------------------------------------------------------------------------
| API Routes (FINAL FIXED VERSION)
|--------------------------------------------------------------------------
*/

// 1. PUBLIC ROUTES
Route::post('/login', [UserController::class, 'login']);
Route::post('/register', [UserController::class, 'register']);

// 2. PROTECTED ROUTES (Harus Login)
Route::middleware(['auth:sanctum', 'throttle:api'])->group(function () {
    
    // Auth & Profile
    Route::post('/logout', [UserController::class, 'logout']);
    Route::get('/user', function (Request $request) { return $request->user(); });

    
    // Books (Read Only)
    Route::get('/books', [BookController::class, 'index']);
    Route::get('/books/search', [BookController::class, 'search']);
    Route::get('/books/{book}', [BookController::class, 'show']);

    // Authors & Categories (Read Only)
    Route::get('/authors', [AuthorController::class, 'index']);
    Route::get('/authors/{author}', [AuthorController::class, 'show']);
    Route::get('/categories', [CategoryController::class, 'index']);

    // Borrow Records (Controller yang akan filter: Member lihat punya sendiri, Librarian lihat semua)
    Route::get('/borrow-records', [BorrowRecordController::class, 'index']);
    Route::get('/borrow-records/{borrowRecord}', [BorrowRecordController::class, 'show']);

    Route::put('/users/{user}', [UserController::class, 'update']);

    // --- KHUSUS MEMBER ---
    Route::middleware('ability:MEMBER')->group(function () {
        // Member hanya bisa meminjam (POST)
        Route::post('/borrow-records', [BorrowRecordController::class, 'store']);
    });

    
    Route::middleware('ability:LIBRARIAN')->group(function () {
        
        // CRUD Books
        Route::post('/books', [BookController::class, 'store']);
        Route::put('/books/{book}', [BookController::class, 'update']);
        Route::delete('/books/{book}', [BookController::class, 'destroy']);

        // CRUD Authors
        Route::post('/authors', [AuthorController::class, 'store']);
        Route::put('/authors/{author}', [AuthorController::class, 'update']);
        Route::delete('/authors/{author}', [AuthorController::class, 'destroy']);

        // CRUD Categories
        Route::post('/categories', [CategoryController::class, 'store']);

        // CRUD Users
        Route::get('/users', [UserController::class, 'index']);
        Route::get('/users/{user}', [UserController::class, 'show']);
        Route::delete('/users/{user}', [UserController::class, 'destroy']);
        
        // Pengembalian Buku
        Route::put('/borrow-records/{borrowRecord}', [BorrowRecordController::class, 'update']);
    });

    // Route Debugging (Bisa dihapus nanti)
    Route::get('/cek-status-saya', function (Request $request) {
        return response()->json([
            'role_db' => $request->user()->role,
            'token_ability' => $request->user()->currentAccessToken()->abilities
        ]);
    });
});