<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class UpdateBorrowRecordRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true; // Pastikan true agar request diizinkan
    }

    /**
     * Get the validation rules that apply to the request.
     */
    public function rules(): array
    {
        // Kosongkan saja array ini.
        // Karena di Controller, kita tidak mengambil input dari user,
        // melainkan otomatis mengisi 'returned_at' dengan waktu sekarang.
        return [
            //
        ];
    }
}