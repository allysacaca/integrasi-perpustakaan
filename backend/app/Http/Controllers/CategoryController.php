<?php

namespace App\Http\Controllers;

use App\Models\Category;
use Illuminate\Http\Request;

class CategoryController extends Controller
{
    // Melihat semua kategori
    public function index()
    {
        $categories = Category::all();
        return response()->json([
            'status' => true,
            'message' => 'List Kategori',
            'data' => $categories
        ]);
    }

    // Membuat kategori baru (Hanya Admin/Pustakawan nanti)
    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:categories,name'
        ]);

        $category = Category::create([
            'name' => $request->name
        ]);

        return response()->json([
            'status' => true,
            'message' => 'Kategori berhasil dibuat',
            'data' => $category
        ], 201);
    }
}