<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class SearchBookRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     * @return array<string, \Illuminate\Contracts\Validation\ValidationRule|array<mixed>|string>
     */
  public function rules(): array
{
    return [
        'q' => 'nullable|string|min:1', // Keyword pencarian
        'category_id' => 'nullable|integer|exists:categories,id', // Filter kategori (Opsional)
        'page' => 'nullable|integer',
        'limit' => 'nullable|integer',
    ];
}
}
