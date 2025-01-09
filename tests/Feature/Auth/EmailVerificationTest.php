<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class EmailVerificationTest extends TestCase {
    use RefreshDatabase;

    public function test_email_verification_screen_can_be_rendered() {
        $user = \App\Models\User::factory()->create([
            'email_verified_at' => null,
        ]);

        $response = $this->actingAs($user)->get('/verify-email');

        $response->assertStatus(200);
    }
}
