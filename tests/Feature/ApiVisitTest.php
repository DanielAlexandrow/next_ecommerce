<?php

namespace Tests\Feature;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ApiVisitTest extends TestCase {
    use RefreshDatabase;

    public function test_invalid_endpoint_returns_404() {
        $response = $this->getJson('/api/invalid-endpoint');
        $response->assertNotFound();
    }

    public function test_successful_authentication() {
        // Arrange
        $user = \App\Models\User::factory()->create([
            'password' => bcrypt('password123')
        ]);

        // Act
        $response = $this->postJson('/api/login', [
            'email' => $user->email,
            'password' => 'password123'
        ]);

        // Assert
        $response->assertOk();
    }
}
