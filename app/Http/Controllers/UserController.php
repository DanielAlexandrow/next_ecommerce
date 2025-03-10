<?php

namespace App\Http\Controllers;

use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Http\Resources\UserResource;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $sortKey = $request->input('sortkey', 'name');
        $sortDirection = $request->input('sortdirection', 'asc');
        $users = User::orderBy($sortKey, $sortDirection)
            ->paginate(10);

        return inertia('admin/UsersPage', [
            'users' => $users,
            'sortkey' => $sortKey,
            'sortdirection' => $sortDirection,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'email' => 'sometimes|required|email|unique:users,email,' . $user->id,
            'role' => 'sometimes|required|in:admin,driver,customer',
            'password' => 'nullable|min:8',
        ]);

        if (isset($validated['password'])) {
            $validated['password'] = Hash::make($validated['password']);
        }

        $user->update($validated);

        return response()->json([
            'data' => $validated,
            'message' => 'User updated successfully'
        ]);
    }

    public function destroy(User $user)
    {
        if ($user->id === auth()->id()) {
            return response()->json(['message' => 'Cannot delete your own account'], 403);
        }

        $user->delete();
        return response()->noContent()->header('X-Message', 'User deleted successfully');
    }
}