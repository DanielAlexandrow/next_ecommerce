<?php

namespace Tests\Helpers;

use Illuminate\Support\Facades\Artisan;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Spatie\Permission\Models\Role;
use Spatie\Permission\Models\Permission;

trait WithPermissions
{
    use RefreshDatabase;
    
    /**
     * Run the permissions migrations before each test.
     */
    public function setUpPermissions(): void
    {
        // Publish and run the permission migrations
        Artisan::call('vendor:publish', [
            '--provider' => 'Spatie\\Permission\\PermissionServiceProvider',
            '--tag' => 'migrations',
            '--force' => true,
        ]);
        
        // Run migrations (this will include permission tables)
        Artisan::call('migrate');
        
        // Create the admin role if needed
        if (!Role::where('name', 'admin')->exists()) {
            Role::create(['name' => 'admin', 'guard_name' => 'web']);
        }
        
        // Create driver role if needed
        if (!Role::where('name', 'driver')->exists()) {
            Role::create(['name' => 'driver', 'guard_name' => 'web']);
        }
    }
}