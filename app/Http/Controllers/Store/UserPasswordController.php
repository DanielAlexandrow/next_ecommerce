<?php

namespace App\Http\Controllers\Store;

use Illuminate\Http\Request;
use App\Http\Controllers\Controller;

class UserPasswordController extends Controller
{
	public function index()
	{
		return inertia("store/profile/UserPassword");
	}

	public function update(Request $request)
	{
		$user = auth()->user();

		$request->validate([
			'current_password' => 'required',
			'new_password' => 'required',
			'new_password_repeated' => 'required',
		]);

		$currentPassword = $request->get('current_password');
		$newPassword = $request->get('new_password');

		if (!Hash::check($currentPassword, $user->password)) {
			return response()->json(['message' => 'The current password is incorrect.'], 422);
		}

		$user->password = Hash::make($newPassword);
		$user->save();

		return response()->json([], 200)->xHeader('X-Message', 'Password updated successfully');
	}
}
