<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Hash;
use Illuminate\Database\SQLiteConnection;
use Illuminate\Support\Facades\DB;

abstract class TestCase extends BaseTestCase {
    use CreatesApplication;
    use RefreshDatabase;

    protected function setUp(): void {
        parent::setUp();
        $this->withoutExceptionHandling();

        // Configure hash driver for testing
        Hash::setRounds(4);
        Hash::driver('bcrypt')->setRounds(4);

        // Register JSON_LENGTH function for SQLite
        if (DB::connection() instanceof SQLiteConnection) {
            DB::connection()->getPdo()->sqliteCreateFunction('JSON_LENGTH', function ($json) {
                if (is_null($json)) return 0;
                
                // Try to decode the JSON string safely
                $decoded = json_decode($json, true);
                
                // Check if the JSON was valid and is an array or object
                if (json_last_error() === JSON_ERROR_NONE && (is_array($decoded) || is_object($decoded))) {
                    return count($decoded);
                }
                
                // For invalid JSON or non-array/object values, return 0
                return 0;
            });
        }
        // Run all migrations including those for permissions
        $this->artisan('migrate')->run();
    }
}
