<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class BorrowBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Pastikan true agar bisa dipakai
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        return [
            // Validasi User & Buku wajib ada di database
            'user_id' => ['required', 'integer', 'exists:users,id'],
            'book_id' => ['required', 'integer', 'exists:books,id'],

            // Validasi Tanggal (Gunakan 'due_at' sesuai Model kamu)
            'due_at'  => ['required', 'date', 'after:today'], 
        ];
    }
}