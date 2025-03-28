<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Support\Str;

class CategorySeeder extends Seeder {
    public function run(): void {
        $categories = [
            'Electronics' => [
                'description' => 'Latest electronic devices and gadgets',
                'subcategories' => [
                    'Smartphones' => 'Mobile phones and accessories',
                    'Laptops' => 'Notebooks and laptop accessories',
                    'Tablets' => 'Tablet devices and accessories',
                    'Smartwatches' => 'Wearable smart devices',
                    'Headphones' => 'Audio devices and accessories',
                    'Cameras' => 'Digital cameras and photography equipment',
                    'Gaming Consoles' => 'Gaming systems and accessories',
                ]
            ],
            'Fashion' => [
                'description' => 'Clothing, shoes, and accessories',
                'subcategories' => [
                    'Men\'s Clothing' => 'Apparel for men',
                    'Women\'s Clothing' => 'Apparel for women',
                    'Kids\' Clothing' => 'Apparel for children',
                    'Shoes' => 'Footwear for all ages',
                    'Accessories' => 'Fashion accessories',
                    'Jewelry' => 'Fine and fashion jewelry',
                    'Watches' => 'Timepieces and watch accessories',
                ]
            ],
            'Home & Living' => [
                'description' => 'Home decor and household items',
                'subcategories' => [
                    'Furniture' => 'Home and office furniture',
                    'Home Decor' => 'Decorative items for home',
                    'Kitchen & Dining' => 'Kitchenware and dining essentials',
                    'Bedding' => 'Bed linens and bedding accessories',
                    'Lighting' => 'Home lighting solutions',
                    'Storage & Organization' => 'Storage solutions and organizers',
                ]
            ],
            'Sports & Outdoors' => [
                'description' => 'Sports equipment and outdoor gear',
                'subcategories' => [
                    'Exercise Equipment' => 'Fitness and workout equipment',
                    'Outdoor Recreation' => 'Outdoor activity gear',
                    'Team Sports' => 'Equipment for team sports',
                    'Camping Gear' => 'Camping and hiking equipment',
                    'Cycling' => 'Bikes and cycling accessories',
                    'Swimming' => 'Swimming and water sports gear',
                ]
            ],
            'Books & Media' => [
                'description' => 'Books, movies, and entertainment',
                'subcategories' => [
                    'Fiction' => 'Fiction books of all genres',
                    'Non-Fiction' => 'Non-fiction and educational books',
                    'Children\'s Books' => 'Books for kids and young readers',
                    'Textbooks' => 'Academic and educational textbooks',
                    'Magazines' => 'Periodicals and magazines',
                    'Movies' => 'Films and video content',
                    'Music' => 'Music albums and audio content',
                ]
            ]
        ];

        foreach ($categories as $mainCategory => $data) {
            $parent = Category::create([
                'name' => $mainCategory,
                'description' => $data['description'],
                'slug' => Str::slug($mainCategory)
            ]);

            foreach ($data['subcategories'] as $subCategory => $description) {
                Category::create([
                    'name' => $subCategory,
                    'description' => $description,
                    'parent_id' => $parent->id,
                    'slug' => Str::slug($subCategory)
                ]);
            }
        }
    }
}
