<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;

abstract class TestCase extends BaseTestCase {
    use CreatesApplication;
    use RefreshDatabase;

    protected function setUp(): void {
        parent::setUp();
        $this->withoutExceptionHandling();

        // Configure hash driver for testing
        Hash::setRounds(4);
        Hash::driver('bcrypt')->setRounds(4);
    }
}
