<?php

namespace App\Models;

use App\Enums\BookStatus;
// use App\Models\Book; // <--- HAPUS INI (Tidak perlu import class diri sendiri)
use App\Models\Author;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Book extends Model
{
    use HasFactory;

    /**
     * The attributes that are mass assignable.
     *
     * @var array
     */
    protected $fillable = [
        'title',
        'isbn',
        'published_date',
        'author_id',
        'status',
        'category_id',
        'stock', // <--- WAJIB DITAMBAHKAN (Agar Factory & Controller bisa ngisi stok)
    ];

    /**
     * The attributes that should be cast to native types.
     *
     * @var array
     */
    protected $casts = [
        'id' => 'integer',
        'published_date' => 'datetime',
        'author_id' => 'integer',
        'stock' => 'integer', // <--- Tambahan (Opsional tapi bagus)
    ];

    public function author(): BelongsTo
    {
        return $this->belongsTo(Author::class);
    }

    /**
     * CATATAN UNTUK METHOD DI BAWAH INI:
     * Karena di Controller kita sudah pakai $book->decrement('stock'),
     * Method borrowMe() ini mungkin jadi duplikat atau perlu disesuaikan.
     * * Jika sistemmu berbasis STOK (banyak kopi), ubah status jadi BORROWED
     * hanya jika stok habis (0).
     */

    public function borrowMe()
    {
        // Logika: Kurangi stok dulu
        $this->decrement('stock');

        // Jika stok habis, baru ubah status jadi tidak tersedia
        if ($this->stock < 1) {
            $this->status = BookStatus::BORROWED; // Atau OUT_OF_STOCK
            $this->save();
        }
        
        return $this;
    }

    public function category(): BelongsTo // Jangan lupa import BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function returnMe() {
        // Logika: Tambah stok
        $this->increment('stock');

        // Jika sebelumnya habis, sekarang jadi tersedia lagi
        if ($this->status === BookStatus::BORROWED) {
            $this->status = BookStatus::AVAILABLE;
            $this->save();
        }
        
        return $this;
    }
}