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
                        'https://cdn.pixabay.com/photo/2015/07/28/09/18/girl-864107_1280.jpg',
                        'https://cdn.pixabay.com/photo/2021/03/22/16/07/woman-6115105_1280.jpg',
                        'https://media.istockphoto.com/id/1912637666/photo/young-asian-woman-on-the-sunset-or-sunrise-in-a-large-field-of-sunflowers-summer-time.jpg',
                        'https://media.istockphoto.com/id/2190024087/photo/portrait-of-a-confident-smiling-businesswoman.jpg'
                    ],
                    'subproducts' => [
                        ['name' => 'Small White', 'price' => 129],
                        ['name' => 'Medium White', 'price' => 129],
                        ['name' => 'Large White', 'price' => 129],
                    ]
                ],
                [
                    'name' => 'Classic Denim Jacket',
                    'description' => 'Timeless denim jacket for any occasion',
                    'photo_ids' => [
                        '1578932750294-c12c9f869cdf', // Denim jacket
                        '1548126032-079f188d247c',
                        '1592878904946-b4b6b336339b',
                        '1583316174775-4e69b1e7a6ea'
                    ],
                    'subproducts' => [
                        ['name' => 'Small Blue', 'price' => 79],
                        ['name' => 'Medium Blue', 'price' => 79],
                        ['name' => 'Large Blue', 'price' => 79],
                    ]
                ],
                [
                    'name' => 'Running Shoes',
                    'description' => 'Comfortable running shoes for athletes',
                    'photo_ids' => [
                        '1542291026-7eec264c27ff', // Running shoes
                        '1556906781-9a412961c28c',
                        '1539185441755-769473a23570',
                        '1460353581641-37baddab0fa2'
                    ],
                    'subproducts' => [
                        ['name' => 'Size 8 Black', 'price' => 129],
                        ['name' => 'Size 9 Black', 'price' => 129],
                        ['name' => 'Size 10 Black', 'price' => 129],
                    ]
                ],
            ],
            'Home & Living' => [
                [
                    'name' => 'Modern Coffee Table',
                    'description' => 'Sleek and modern coffee table for your living room',
                    'photo_ids' => [
                        '1592078615290-7d0148b3d3be', // Coffee table
                        '1586023492125-27b2c045efd7',
                        '1493150134366-cacb0bdc03fe',
                        '1556909114-a1077aa35a53'
                    ],
                    'subproducts' => [
                        ['name' => 'Oak', 'price' => 299],
                        ['name' => 'Walnut', 'price' => 349],
                    ]
                ],
                [
                    'name' => 'Smart LED Bulb Set',
                    'description' => 'WiFi-enabled LED bulbs with app control',
                    'photo_ids' => [
                        '1586473219010-2ffc57b0ea1f', // LED bulb
                        '1563461660057-20a527c55987',
                        '1583394293214-28ded15ee548',
                        '1507146426996-ef05306b995a'
                    ],
                    'subproducts' => [
                        ['name' => '2-Pack', 'price' => 49],
                        ['name' => '4-Pack', 'price' => 89],
                    ]
                ],
            ],
        ];

        foreach ($products as $categoryName => $categoryProducts) {
            $category = Category::where('name', $categoryName)->first();

            foreach ($categoryProducts as $productData) {
                $product = Product::create([
                    'name' => $productData['name'],
                    'description' => $productData['description'],
                    'available' => true,
                ]);

                // Create and attach product images
                if (isset($productData['photo_ids'])) {
                    foreach ($productData['photo_ids'] as $index => $photoId) {
                        $image = Image::create([
                            'name' => $productData['name'] . ' Image ' . ($index + 1),
                            'path' => $this->getUnsplashUrl($photoId),
                        ]);
                        $product->images()->attach($image->id, ['order_num' => $index]);
                    }
                } elseif (isset($productData['external_images'])) {
                    foreach ($productData['external_images'] as $index => $imageUrl) {
                        $image = Image::create([
                            'name' => $productData['name'] . ' Image ' . ($index + 1),
                            'path' => $imageUrl,
                        ]);
                        $product->images()->attach($image->id, ['order_num' => $index]);
                    }
                }

                if ($category) {
                    $product->categories()->attach($category->id);
                }

                foreach ($productData['subproducts'] as $index => $subproductData) {
                    Subproduct::create([
                        'name' => $subproductData['name'],
                        'price' => $subproductData['price'],
                        'product_id' => $product->id,
                        'available' => true,
                        'sku' => strtoupper(
                            preg_replace('/[^A-Za-z0-9]/', '', $product->name) . 
                            '-' . 
                            preg_replace('/[^A-Za-z0-9]/', '', $subproductData['name'])
                        ),
                    ]);
                }
            }
        }
    }
}
