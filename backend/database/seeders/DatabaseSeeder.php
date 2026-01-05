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

        // 1. Buat User MEMBER - PAKAI PASSWORD SAMA
        User::factory()->create([
            'name' => 'Member User',
            'email' => 'member@example.com',
            'password' => Hash::make('password'), // UBAH KE INI
            'role' => 'member',
        ]);
        echo "Member: member@example.com / password\n";

        // 2. Buat User ADMIN - PAKAI PASSWORD SAMA
        User::factory()->create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'), // UBAH KE INI
            'role' => 'admin',
        ]);
        echo "Admin: admin@example.com / password\n";

        // 3. Buat User LIBRARIAN
        User::factory()->create([
            'name' => 'Librarian User',
            'email' => 'librarian@example.com',
            'password' => Hash::make('password'), // SAMA
            'role' => 'librarian',
        ]);
        echo "Librarian: librarian@example.com / password\n";

        echo "========================\n";

        // 4. Buat 10 Buku Dummy
        Book::factory(10)->create();
        echo "10 books created\n";

        echo "=== Seeding Complete ===\n";
        echo "Use 'password' for all users!\n";
    }
}
