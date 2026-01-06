<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Category>
 */
class CategoryFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            // Kita pakai 'words' biar namanya agak keren (misal: "Science Fiction")
            // unique() biar tidak ada nama kategori kembar
            'name' => ucfirst($this->faker->unique()->words(2, true)), 
        ];
    }
}