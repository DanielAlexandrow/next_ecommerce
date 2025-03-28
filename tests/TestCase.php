<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\View;
use Inertia\Testing\AssertableInertia as Assert;
use Tests\CreatesApplication;
use Illuminate\Support\Facades\File;

abstract class TestCase extends BaseTestCase
{
    use CreatesApplication;
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();

        // Create a mock Vite manifest
        $this->mockViteManifest();
    }

    protected function mockViteManifest()
    {
        $manifest = [
            'resources/js/app.tsx' => [
                'file' => 'assets/app.js',
                'src' => 'resources/js/app.tsx',
                'isEntry' => true,
                'css' => ['assets/app.css']
            ],
            // Admin pages
            'resources/js/pages/admin/Orders.tsx' => [
                'file' => 'assets/Orders.js',
                'src' => 'resources/js/pages/admin/Orders.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/OrdersPage.tsx' => [
                'file' => 'assets/OrdersPage.js',
                'src' => 'resources/js/pages/admin/OrdersPage.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/BrandsPage.tsx' => [
                'file' => 'assets/BrandsPage.js',
                'src' => 'resources/js/pages/admin/BrandsPage.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/NavigationPage.tsx' => [
                'file' => 'assets/NavigationPage.js',
                'src' => 'resources/js/pages/admin/NavigationPage.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/DealsPage.tsx' => [
                'file' => 'assets/DealsPage.js',
                'src' => 'resources/js/pages/admin/DealsPage.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/Deals.tsx' => [
                'file' => 'assets/Deals.js',
                'src' => 'resources/js/pages/admin/Deals.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/ProductList.tsx' => [
                'file' => 'assets/ProductList.js',
                'src' => 'resources/js/pages/admin/ProductList.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/NewProduct.tsx' => [
                'file' => 'assets/NewProduct.js',
                'src' => 'resources/js/pages/admin/NewProduct.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/admin/UsersPage.tsx' => [
                'file' => 'assets/UsersPage.js',
                'src' => 'resources/js/pages/admin/UsersPage.tsx',
                'isEntry' => true
            ],
            // Store/customer pages
            'resources/js/pages/CartPage.tsx' => [
                'file' => 'assets/CartPage.js',
                'src' => 'resources/js/pages/CartPage.tsx',
                'isEntry' => true
            ],
            'resources/js/pages/ProductPage.tsx' => [
                'file' => 'assets/ProductPage.js',
                'src' => 'resources/js/pages/ProductPage.tsx',
                'isEntry' => true
            ]
        ];

        // Ensure the build directory exists
        if (!File::exists(public_path('build'))) {
            File::makeDirectory(public_path('build'));
        }

        // Write the manifest file
        File::put(
            public_path('build/manifest.json'),
            json_encode($manifest)
        );
    }

    protected function tearDown(): void
    {
        // Clean up the mock manifest
        if (File::exists(public_path('build/manifest.json'))) {
            File::delete(public_path('build/manifest.json'));
        }
        
        parent::tearDown();
    }
}
