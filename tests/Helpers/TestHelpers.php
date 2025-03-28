<?php

namespace Tests\Helpers;

use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Route;

trait TestHelpers
{
    /**
     * Get the correct login route for tests.
     * This helps fix the redirect assertion issues where we expect '/login' 
     * but the system redirects to '/adminlogin'.
     */
    protected function getLoginRoute(): string
    {
        // Check if the route exists, and prefer 'adminlogin' if available
        if (Route::has('adminlogin')) {
            return '/adminlogin';
        }

        return '/login';
    }

    /**
     * Create a test admin user.
     */
    protected function createAdmin(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'admin'
        ], $attributes));
    }

    /**
     * Create a test customer user.
     */
    protected function createUser(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'customer'
        ], $attributes));
    }

    /**
     * Create a test driver user.
     */
    protected function createDriver(array $attributes = []): User
    {
        return User::factory()->create(array_merge([
            'role' => 'driver'
        ], $attributes));
    }

    /**
     * Assert that the user has the given role.
     */
    protected function assertUserHasRole(User $user, string $role): void
    {
        $this->assertEquals($role, $user->role);
    }

    /**
     * Check if a model was created successfully.
     * This helps avoid "Attempt to read property on null" errors
     */
    protected function assertModelCreated($model, string $errorMessage = null): void
    {
        $this->assertNotNull($model, $errorMessage ?? 'Model creation failed');
    }

    /**
     * Paginates an Eloquent query.
     * This helps avoid "Method Collection::paginate does not exist" errors
     */
    protected function paginateQuery($query, int $perPage = 15)
    {
        // If given a collection, convert to query builder
        if ($query instanceof \Illuminate\Support\Collection) {
            // This is a workaround for collection pagination
            // In real scenarios, you should paginate at the query level
            return new \Illuminate\Pagination\LengthAwarePaginator(
                $query->forPage(request('page', 1), $perPage),
                $query->count(),
                $perPage,
                request('page', 1)
            );
        }
        
        return $query->paginate($perPage);
    }
}