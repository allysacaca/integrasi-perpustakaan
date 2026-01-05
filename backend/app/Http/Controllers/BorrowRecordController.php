<?php

namespace App\Http\Controllers;

use App\Http\Requests\StoreBorrowRecordRequest;
use App\Http\Requests\UpdateBorrowRecordRequest;
use App\Models\BorrowRecord;
use App\Models\Book;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class BorrowRecordController extends Controller
{
    /**
     * MELIHAT DAFTAR PEMINJAMAN (INDEX)
     * Update: Menambahkan filter berdasarkan Role
     */
    public function index()
    {
        $limit = request()->limit ?? 15;
        $user = auth()->user(); // Ambil user yang sedang login

        // Siapkan query dasar + load relasi buku & user
        $query = BorrowRecord::with(['book', 'user'])->latest();

        // LOGIKA PRIVASI:
        // Jika role user adalah 'member', paksa filter hanya ID dia sendiri.
        // Jika 'admin', biarkan query mengambil semua data.
        if ($user->role === 'member') {
            $query->where('user_id', $user->id);
        }

        $borrowRecords = $query->paginate($limit);

        return respondSuccess("Data peminjaman berhasil diambil", $borrowRecords);
    }

    /**
     * DETAIL SATU PEMINJAMAN (SHOW)
     * Update: Validasi kepemilikan
     */
    public function show(BorrowRecord $borrowRecord)
    {
        $user = auth()->user();

        // Validasi: Member tidak boleh intip data orang lain
        if ($user->role === 'member' && $borrowRecord->user_id !== $user->id) {
            return respondError("Anda tidak memiliki akses ke data ini", 403);
        }

        return respondSuccess("Detail Peminjaman", $borrowRecord->load(['book', 'user']));
    }

    /**
     * MEMINJAM BUKU (STORE) - Pindahan dari BookController
     */
    public function store(Request $request)
    {
        // Validasi input sederhana
        $request->validate([
            'book_id' => 'required|exists:books,id',
            'due_at'  => 'required|date|after:today', // Jatuh tempo harus masa depan
        ]);

        return DB::transaction(function () use ($request) {
            $user = auth()->user();
            $book = Book::find($request->book_id);

            // 1. Cek Stok Buku
            if ($book->stock < 1) {
                return response()->json([
                    'status' => false,
                    'message' => 'Stok buku habis / tidak tersedia'
                ], 400);
            }

            // 2. Buat Record Peminjaman
            $borrowRecord = BorrowRecord::create([
                'user_id'     => $user->id, // Pakai ID user yang login
                'book_id'     => $book->id,
                'borrowed_at' => now(),
                'due_at'      => $request->due_at,
                'fine_amount' => 0
            ]);

            // 3. Kurangi Stok Buku
            $book->decrement('stock');

            return respondSuccess("Berhasil meminjam buku", $borrowRecord, 201);
        });
    }

    /**
     * MENGEMBALIKAN BUKU & HITUNG DENDA (UPDATE)
     * (Fitur yang kita buat tadi pagi)
     */
    public function update(UpdateBorrowRecordRequest $request, BorrowRecord $borrowRecord)
    {
        return DB::transaction(function () use ($borrowRecord) {
            
            // Cek apakah sudah dikembalikan sebelumnya?
            if ($borrowRecord->returned_at) {
                return response()->json([
                    'status' => false,
                    'message' => 'Buku ini sudah dikembalikan sebelumnya'
                ], 400);
            }

            $returnedAt = now();
            $fineAmount = 0;
            $finePerDay = 1000; // Config denda per hari

            // Hitung Denda jika terlambat
            // Menggunakan startOfDay agar hitungan bulat per hari kalender
            if ($returnedAt->gt($borrowRecord->due_at)) {
                $daysLate = $borrowRecord->due_at->startOfDay()->diffInDays($returnedAt->startOfDay());
                $fineAmount = $daysLate * $finePerDay;
            }

            // Update data
            $borrowRecord->update([
                'returned_at' => $returnedAt,
                'fine_amount' => $fineAmount,
            ]);

            // Kembalikan Stok Buku
            $borrowRecord->book->increment('stock');
            
            // Buat pesan respon
            $message = "Buku berhasil dikembalikan.";
            if ($fineAmount > 0) {
                $formattedFine = number_format($fineAmount, 0, ',', '.');
                $message .= " Terlambat {$daysLate} hari. Denda: Rp {$formattedFine}";
            }

            return respondSuccess($message, $borrowRecord);
        });
    }
}