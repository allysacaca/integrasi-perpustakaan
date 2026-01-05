<?php

namespace App\Http\Controllers;

use App\Http\Requests\SearchBookRequest;
use App\Http\Requests\StoreBookRequest;
use App\Http\Requests\UpdateBookRequest;
use App\Models\Author;
use App\Models\Book;
use App\Models\Category;
use Illuminate\Http\Request;

class BookController extends Controller
{
    /**
     * Display a listing of the resource.
     * Menampilkan semua buku dengan data Penulis dan Kategori.
     */
    public function index()
    {
        $limit = request()->limit ?? 15;

        // Eager load 'author' dan 'category' untuk performa (N+1 problem solved)
        $books = Book::with(['author', 'category'])->paginate($limit);

        return respondSuccess("List data buku berhasil diambil", $books);
    }

    /**
     * Store a newly created resource in storage.
     * Menyimpan buku baru.
     */
    public function store(StoreBookRequest $request)
    {
        // 1. Validasi Author (Opsional, karena biasanya sudah divalidasi di Request Rules)
        $author = Author::find($request->author_id);
        if (!$author) return respondError("Author not found", 404);

        // 2. Validasi Category (Jika diinputkan)
        if ($request->has('category_id')) {
            $category = Category::find($request->category_id);
            if (!$category) return respondError("Category not found", 404);
        }

        // 3. Create Buku
        $book = Book::create($request->all());

        return respondSuccess("Buku berhasil ditambahkan", $book, 201);
    }

    /**
     * Display the specified resource.
     * Menampilkan detail satu buku.
     */
    public function show(Book $book)
    {
        // Load relasi agar JSON response lengkap
        return respondSuccess("Detail buku", $book->load(['author', 'category']));
    }

    /**
     * Update the specified resource in storage.
     * Update data buku.
     */
    public function update(UpdateBookRequest $request, Book $book)
    {
        // Validasi Author jika user ingin mengganti penulis
        if ($request->author_id) {
            $author = Author::find($request->author_id);
            if (!$author) return respondError("Author not found", 404);
        }

        // Update data
        $book->update($request->all());

        return respondSuccess("Buku berhasil diupdate", $book->load(['author', 'category']));
    }

    /**
     * Remove the specified resource from storage.
     * Hapus buku.
     */
    public function destroy(Book $book)
    {
        $book->delete();
        return respondSuccess("Buku berhasil dihapus");
    }

    /**
     * PENCARIAN BUKU (OPTIMIZED VERSION)
     * - Mencari berdasarkan Judul / ISBN / Nama Penulis
     * - Bisa difilter berdasarkan Kategori
     * - Menggunakan Pagination Database (Efisien)
     */
    public function search(SearchBookRequest $request)
    {
        $limit = $request->limit ?? 15;

        // 1. Mulai Query Builder + Load Relasi
        $query = Book::with(['author', 'category']);

        // 2. Logika Pencarian Keyword (Judul OR ISBN OR Penulis)
        if ($request->filled('q')) {
            $search = $request->q;

            // Kita bungkus dalam closure function($q) agar logika OR tidak merusak filter Kategori (AND)
            $query->where(function($q) use ($search) {
                $q->where('title', 'like', '%' . $search . '%')
                  ->orWhere('isbn', 'like', $search . '%')
                  ->orWhereHas('author', function($qAuthor) use ($search) {
                      $qAuthor->where('name', 'like', '%' . $search . '%');
                  });
            });
        }

        // 3. Logika Filter Kategori (Optional)
        // Contoh: ?q=Harry Potter&category_id=1
        if ($request->filled('category_id')) {
            $query->where('category_id', $request->category_id);
        }

        // 4. Eksekusi Pagination
        $books = $query->paginate($limit);

        // 5. Cek Hasil
        if ($books->isEmpty()) {
            return respondError('Tidak ditemukan buku dengan kriteria tersebut.', 404);
        }

        return respondSuccess("Hasil pencarian untuk: " . $request->q, $books);
    }
}