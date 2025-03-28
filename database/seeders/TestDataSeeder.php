<?php

namespace Database\Seeders;

use App\Models\Brand;
use App\Models\Category;
use App\Models\Header;
use App\Models\NavigationItem;
use App\Models\Product;
use App\Models\Role;
use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;

class TestDataSeeder extends Seeder {
    public function run(): void {
        // Create roles
        $roles = [
            ['name' => 'admin', 'description' => 'Administrator role'],
            ['name' => 'user', 'description' => 'Regular user role'],
        ];

        foreach ($roles as $role) {
            Role::create($role);
        }

        // Create admin user
        User::create([
            'name' => 'Admin User',
            'email' => 'admin@example.com',
            'password' => Hash::make('password'),
            'role_id' => Role::where('name', 'admin')->first()->id,
        ]);

        // Create test brands
        $brands = [];
        $brandNames = ['TechPro', 'FashionStyle', 'BookMaster', 'HomeDecor'];
        foreach ($brandNames as $name) {
            $brands[] = Brand::create([
                'name' => $name,
                'description' => "Brand for {$name} products",
            ]);
        }

        // Create test categories
        $categories = [];
        $categoryNames = ['Electronics', 'Clothing', 'Books', 'Home & Garden'];
        foreach ($categoryNames as $index => $name) {
            $categories[] = Category::create([
                'name' => $name,
                'description' => "Category for {$name}",
                'order_num' => $index + 1,
                'slug' => Str::slug($name)
            ]);
        }

        // Create navigation structure
        $headers = [
            [
                'name' => 'Shop',
                'order_num' => 1,
                'items' => [
                    [
                        'name' => 'Electronics',
                        'order_num' => 1,
                        'categories' => [$categories[0]->id]
                    ],
                    [
                        'name' => 'Fashion',
                        'order_num' => 2,
                        'categories' => [$categories[1]->id]
                    ]
                ]
            ],
            [
                'name' => 'Categories',
                'order_num' => 2,
                'items' => [
                    [
                        'name' => 'All Books',
                        'order_num' => 1,
                        'categories' => [$categories[2]->id]
                    ],
                    [
                        'name' => 'Home Decor',
                        'order_num' => 2,
                        'categories' => [$categories[3]->id]
                    ]
                ]
            ]
        ];

        foreach ($headers as $headerData) {
            $header = Header::create([
                'name' => $headerData['name'],
                'order_num' => $headerData['order_num']
            ]);

            foreach ($headerData['items'] as $itemData) {
                $item = NavigationItem::create([
                    'name' => $itemData['name'],
                    'header_id' => $header->id,
                    'order_num' => $itemData['order_num']
                ]);

                $item->categories()->attach($itemData['categories']);
            }
        }

        // Create test products
        $products = [
            [
                'name' => 'Test Product 1',
                'description' => 'Description for test product 1',
                'price' => 99.99,
                'category_id' => $categories[0]->id,
                'brand_id' => $brands[0]->id
            ],
            [
                'name' => 'Test Product 2',
                'description' => 'Description for test product 2',
                'price' => 149.99,
                'category_id' => $categories[1]->id,
                'brand_id' => $brands[1]->id
            ]
        ];

        foreach ($products as $productData) {
            $product = Product::create([
                'name' => $productData['name'],
                'description' => $productData['description'],
                'available' => true,
                'brand_id' => $productData['brand_id']
            ]);

            $product->categories()->attach($productData['category_id']);

            $product->subproducts()->create([
                'name' => 'Standard',
                'price' => $productData['price'],
                'available' => true
            ]);
        }
    }
}
