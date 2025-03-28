<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Product;
use App\Models\Category;
use App\Models\Subproduct;
use App\Models\Image;

class ProductSeeder extends Seeder {
    private function getUnsplashUrl($photoId, $width = 800, $height = 600): string {
        return "https://images.unsplash.com/photo-{$photoId}?w={$width}&h={$height}&fit=crop";
    }

    public function run(): void {
        $products = [
            'Electronics' => [
                [
                    'name' => 'iPhone 15 Pro',
                    'description' => 'Latest iPhone with advanced features',
                    'photo_ids' => [
                        '1511707171634-5f897ff02aa9', // iPhone photo
                        '1592899677977-9c10ca588bfd',
                        '1581993870991-21dbaf0c7d13',
                        '1512499617640-c74ae3a79d37'
                    ],
                    'subproducts' => [
                        ['name' => '128GB Space Black', 'price' => 999],
                        ['name' => '256GB Natural Titanium', 'price' => 1099],
                        ['name' => '512GB White Titanium', 'price' => 1299],
                    ]
                ],
                [
                    'name' => 'MacBook Pro 16"',
                    'description' => 'Powerful laptop for professionals',
                    'photo_ids' => [
                        '1517336714731-489689fd1ca8', // MacBook photo
                        '1611078489935-0b07a1808a31',
                        '1498050108023-c5249f4df085',
                        '1531297484001-80022131f5a1'
                    ],
                    'subproducts' => [
                        ['name' => 'M2 Pro 512GB', 'price' => 2499],
                        ['name' => 'M2 Max 1TB', 'price' => 3299],
                    ]
                ],
            ],
            'Fashion' => [
                [
                    'name' => 'Summer Floral Dress',
                    'description' => 'Elegant floral dress perfect for summer occasions',
                    'external_images' => [
                        'https://cdn.pixabay
