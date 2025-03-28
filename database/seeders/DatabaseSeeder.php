<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Header;
use App\Models\NavigationItem;
use App\Models\Image;
use Illuminate\Support\Facades\Hash;
use Spatie\Permission\Models\Role;
use Illuminate\Support\Str;

class DatabaseSeeder extends Seeder {
    public function run(): void {
        // Call RoleSeeder first
        $this->call(RoleSeeder::class);

        // Create admin user
        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => Hash::make('password123'),
                'email_verified_at' => now(),
                'role' => 'admin'
            ]
        );
        $admin->assignRole('admin');

        // Create categories
        $categories = [
            ['name' => 'Electronics', 'description' => 'Electronic devices and gadgets'],
            ['name' => 'Clothing', 'description' => 'Fashion and apparel'],
            ['name' => 'Books', 'description' => 'Books and literature'],
            ['name' => 'Home & Garden', 'description' => 'Home decor and gardening'],
            ['name' => 'Sports', 'description' => 'Sports equipment and gear'],
        ];

        foreach ($categories as $category) {
            Category::firstOrCreate(
                ['name' => $category['name']],
                [
                    'description' => $category['description'],
                    'slug' => Str::slug($category['name'])
                ]
            );
        }

        // Create brands
        $brands = [
            ['name' => 'TechPro', 'description' => 'High-quality electronics'],
            ['name' => 'FashionStyle', 'description' => 'Trendy fashion'],
            ['name' => 'BookMaster', 'description' => 'Premium books'],
            ['name' => 'HomeDecor', 'description' => 'Beautiful home items'],
            ['name' => 'SportsFit', 'description' => 'Professional sports gear'],
        ];

        foreach ($brands as $brand) {
            Brand::firstOrCreate(
                ['name' => $brand['name']],
                ['description' => $brand['description']]
            );
        }

        // Create navigation headers
        $headers = [
            [
                'name' => 'Shop by Category',
                'items' => ['Electronics', 'Clothing', 'Books', 'Home & Garden', 'Sports']
            ],
            [
                'name' => 'Featured',
                'items' => ['New Arrivals', 'Best Sellers', 'Deals', 'Clearance']
            ],
        ];

        foreach ($headers as $index => $header) {
            $navHeader = Header::firstOrCreate(
                ['name' => $header['name']],
                ['order_num' => $index + 1]
            );

            foreach ($header['items'] as $itemIndex => $itemName) {
                NavigationItem::firstOrCreate(
                    ['name' => $itemName, 'header_id' => $navHeader->id],
                    ['order_num' => $itemIndex + 1]
                );
            }
        }

        // Create sample products
        $products = [
            [
                'name' => 'Smartphone Pro',
                'description' => 'Latest smartphone with advanced features',
                'category' => 'Electronics',
                'brand' => 'TechPro',
                'price' => 999.99,
            ],
            [
                'name' => 'Designer T-Shirt',
                'description' => 'Comfortable cotton t-shirt',
                'category' => 'Clothing',
                'brand' => 'FashionStyle',
                'price' => 29.99,
            ],
            [
                'name' => 'Best Seller Novel',
                'description' => 'Award-winning fiction novel',
                'category' => 'Books',
                'brand' => 'BookMaster',
                'price' => 19.99,
            ],
            [
                'name' => 'Garden Set',
                'description' => 'Complete gardening tool set',
                'category' => 'Home & Garden',
                'brand' => 'HomeDecor',
                'price' => 149.99,
            ],
            [
                'name' => 'Tennis Racket Pro',
                'description' => 'Professional tennis racket',
                'category' => 'Sports',
                'brand' => 'SportsFit',
                'price' => 199.99,
            ],
        ];

        foreach ($products as $product) {
            $category = Category::where('name', $product['category'])->first();
            $brand = Brand::where('name', $product['brand'])->first();

            $newProduct = $brand->products()->firstOrCreate(
                ['name' => $product['name']],
                [
                    'description' => $product['description'],
                    'available' => true
                ]
            );

            // Create standard subproduct for each product
            $newProduct->subproducts()->firstOrCreate(
                ['name' => 'Standard'],
                [
                    'price' => $product['price'],
                    'available' => true,
                    'stock' => $product['stock'] ?? 100
                ]
            );
        }

        // Create placeholder image
        Image::firstOrCreate(
            ['name' => 'placeholder'],
            ['path' => 'placeholder.jpg']
        );
    }
}
