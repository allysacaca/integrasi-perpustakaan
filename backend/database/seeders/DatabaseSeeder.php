<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Book;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        echo "=== Creating Users ===\n";

        
        User::factory()->create([
            'name' => 'Member User',
            'email' => 'member@example.com',
            'password' => Hash::make('12345678'), 
            'role' => 'member',
        ]);
        echo "Member: member@example.com / 12345678\n";

        User::factory()->create([
            'name' => 'Librarian User',
            'email' => 'librarian@example.com',
            'password' => Hash::make('1234567890'), 
            'role' => 'librarian',
        ]);
        echo "Librarian: librarian@example.com / 1234567890\n";

        echo "========================\n";

        // 4. Buat 10 Buku Dummy
        Book::factory(10)->create();
        echo "10 books created\n";

        echo "=== Seeding Complete ===\n";
    }
}
