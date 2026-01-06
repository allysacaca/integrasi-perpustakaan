<?php

namespace App\Http\Controllers;

use App\Http\Requests\LoginRequest;
use App\Http\Requests\StoreUserRequest;
use App\Http\Requests\UpdateUserRequest;
use App\Models\User;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Auth;
use Illuminate\Http\Request;

class UserController extends Controller
{
    // LOGIN
    public function login(LoginRequest $request)
    {
        // Cek email & password
        if (Auth::attempt($request->only('email', 'password'))) {
            $user = auth()->user();
            
            
            $token = $user->createToken('auth_token', [$user->role])->plainTextToken;

            return respondSuccess("Login successful", [
                "user" => $user,
                "token" => $token,
            ]);
        }

        return respondError("Email or password incorrect", 401);
    }

    // REGISTER
    public function register(StoreUserRequest $request)
    {
        $user = User::create([
            "name" => $request->name,
            "email" => $request->email,
            "password" => Hash::make($request->password),
            "role" => 'MEMBER', 
        ]);

        // Berikan token MEMBER
        $token = $user->createToken("auth_token", ['MEMBER'])->plainTextToken;

        return respondSuccess("Registration successful", [
            "user" => $user,
            "token" => $token,
        ], 201);
    }

    // LOGOUT
    public function logout(Request $request)
    {
        $request->user()->currentAccessToken()->delete();
        return respondSuccess("Logout successful");
    }

    // get all users (Librarian only)
    public function index()
    {
        $limit = request("limit", 15);
        $users = User::paginate($limit);
        return respondSuccess("Users list", $users);
    }

    // get user detail (Librarian only)
    public function show(User $user)
    {
        return respondSuccess("User detail", $user);
    }

    // update user (Librarian bisa update semua, Member hanya dirinya sendiri)
    public function update(UpdateUserRequest $request, User $user)
    {
    
        if (auth()->user()->role === 'LIBRARIAN' || auth()->user()->id === $user->id) {
            
            $data = $request->all();
            
            // Jika password diisi, enkripsi 
            if ($request->filled('password')) {
                $data['password'] = Hash::make($request->password);
            }

            // Cegah Member mengubah role dirinya sendiri jadi Librarian
            if (auth()->user()->role !== 'LIBRARIAN' && isset($data['role'])) {
                unset($data['role']); 
            }

            $user->update($data);

            return respondSuccess("User successfully updated", $user);
        }

        // Jika bukan Librarian dan bukan diri sendiri maka ditolak
        return respondError("Forbidden access", 403);
    }

    // delete user (librarian only)
    public function destroy(User $user)
    {
        
        if (auth()->user()->role !== 'LIBRARIAN') {
             return respondError("Forbidden. Only Librarian can delete users.", 403);
        }

        $user->delete();
        return respondSuccess("User successfully deleted");
    }
}