<?php

namespace Tests\Unit\Controllers;

use Tests\TestCase;
use App\Models\User;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

class UserControllerTest extends TestCase
{
    use RefreshDatabase;

    public function test_index_returns_users_with_pagination()
    {
        // Create test users
        User::factory()->count(15)->create();

        // Authenticate as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Make request to index method with correct route
        $response = $this->get('/admin/users');

        // Assert successful response and correct Inertia component
        $response->assertStatus(200);
        $response->assertInertia(fn ($assert) => $assert
            ->component('admin/UsersPage')
            ->has('users.data', 10) // Default pagination is 10
            ->has('sortkey')
            ->has('sortdirection')
        );
    }

    public function test_update_user_updates_user_details()
    {
        // Create a user to update
        $user = User::factory()->create([
            'name' => 'Original Name',
            'email' => 'original@example.com',
            'role' => 'customer'
        ]);

        // Authenticate as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Make request to update user with all required fields
        $response = $this->putJson("/users/{$user->id}", [
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'driver'
        ]);

        // Assert successful response
        $response->assertStatus(200);
        $response->assertJsonStructure(['data', 'message']);
        $response->assertJson([
            'data' => [
                'name' => 'Updated Name',
                'email' => 'updated@example.com',
                'role' => 'driver'
            ],
            'message' => 'User updated successfully'
        ]);

        // Assert database was updated
        $this->assertDatabaseHas('users', [
            'id' => $user->id,
            'name' => 'Updated Name',
            'email' => 'updated@example.com',
            'role' => 'driver'
        ]);
    }

    public function test_update_user_with_password_hashes_password()
    {
        // Create a user to update
        $user = User::factory()->create([
            'name' => 'Password User',
            'email' => 'password@example.com'
        ]);

        // Authenticate as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);

        // Make request to update user with password
        $response = $this->putJson("/users/{$user->id}", [
            'name' => 'Password User',
            'email' => 'password@example.com',
            'password' => 'new-password123'
        ]);

        // Assert successful response
        $response->assertStatus(200);
        
        // Refresh user from database
        $user->refresh();
        
        // Assert password was hashed
        $this->assertTrue(Hash::check('new-password123', $user->password));
    }

    public function test_destroy_user_deletes_user()
    {
        // Create a user to delete
        $user = User::factory()->create();
        
        // Authenticate as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        
        // Make request to delete user
        $response = $this->deleteJson("/users/{$user->id}");
        
        // Assert successful response
        $response->assertStatus(204);
        
        // Assert user was deleted
        $this->assertDatabaseMissing('users', ['id' => $user->id]);
    }
    
    public function test_cannot_delete_own_account()
    {
        // Create and authenticate as admin
        $admin = User::factory()->create(['role' => 'admin']);
        $this->actingAs($admin);
        
        // Try to delete own account
        $response = $this->deleteJson("/users/{$admin->id}");
        
        // Assert forbidden response
        $response->assertStatus(403);
        $response->assertJson(['message' => 'Cannot delete your own account']);
        
        // Assert user was not deleted
        $this->assertDatabaseHas('users', ['id' => $admin->id]);
    }
}