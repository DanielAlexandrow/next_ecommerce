<?php

namespace Tests\Feature\Auth;

use Tests\TestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;

class AuthenticationTest extends TestCase {
    use RefreshDatabase;

    public function test_login_screen_can_be_rendered() {
        $response = $this->get('/login');
        $response->assertStatus(200);
    }
}
