<?php

namespace Tests\Unit\Models;

use Tests\TestCase;
use App\Models\NavigationItem;
use App\Models\Header;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class NavigationItemTest extends TestCase {
    use RefreshDatabase;

    public function test_navigation_item_belongs_to_header() {
        // Arrange
        $header = Header::create([
            'name' => 'Main Menu',
            'order_num' => 1
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Products',
            'order_num' => 1,
            'header_id' => $header->id
        ]);

        // Act & Assert
        $this->assertInstanceOf(Header::class, $navigationItem->header);
        $this->assertEquals($header->id, $navigationItem->header->id);
        $this->assertEquals('Main Menu', $navigationItem->header->name);
    }

    public function test_navigation_item_belongs_to_header_variant() {
        // Arrange
        $header = Header::create([
            'name' => 'Secondary Menu',
            'order_num' => 2
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Categories',
            'order_num' => 3,
            'header_id' => $header->id
        ]);

        // Act & Assert
        $this->assertInstanceOf(Header::class, $navigationItem->header);
        $this->assertEquals($header->id, $navigationItem->header->id);
        $this->assertEquals('Secondary Menu', $navigationItem->header->name);
    }

    public function test_navigation_item_can_have_multiple_categories() {
        // Arrange
        $header = Header::create([
            'name' => 'Main Menu',
            'order_num' => 1
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Products',
            'order_num' => 1,
            'header_id' => $header->id
        ]);

        $category1 = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products',
            'order_num' => 1
        ]);

        $category2 = Category::create([
            'name' => 'Computers',
            'slug' => 'computers',
            'description' => 'Computer products',
            'order_num' => 2
        ]);

        // Act
        $navigationItem->categories()->attach([$category1->id, $category2->id]);

        // Assert
        $this->assertEquals(2, $navigationItem->categories->count());
        $this->assertTrue($navigationItem->categories->contains($category1));
        $this->assertTrue($navigationItem->categories->contains($category2));
    }

    public function test_navigation_item_can_have_multiple_categories_variant() {
        // Arrange
        $header = Header::create([
            'name' => 'Shop Menu',
            'order_num' => 2
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Deals',
            'order_num' => 2,
            'header_id' => $header->id
        ]);

        $category1 = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'description' => 'Fashion items',
            'order_num' => 3
        ]);

        $category2 = Category::create([
            'name' => 'Accessories',
            'slug' => 'accessories',
            'description' => 'Fashion accessories',
            'order_num' => 4
        ]);

        $category3 = Category::create([
            'name' => 'Shoes',
            'slug' => 'shoes',
            'description' => 'Footwear',
            'order_num' => 5
        ]);

        // Act
        $navigationItem->categories()->attach([$category1->id, $category2->id, $category3->id]);

        // Assert
        $this->assertEquals(3, $navigationItem->categories->count());
        $this->assertTrue($navigationItem->categories->contains($category1));
        $this->assertTrue($navigationItem->categories->contains($category2));
        $this->assertTrue($navigationItem->categories->contains($category3));
    }

    public function test_navigation_item_can_update_name_and_order() {
        // Arrange
        $header = Header::create([
            'name' => 'Main Menu',
            'order_num' => 1
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Products',
            'order_num' => 1,
            'header_id' => $header->id
        ]);

        // Act
        $navigationItem->update([
            'name' => 'Featured Products',
            'order_num' => 2
        ]);

        // Assert
        $this->assertEquals('Featured Products', $navigationItem->name);
        $this->assertEquals(2, $navigationItem->order_num);
    }

    public function test_navigation_item_can_update_name_and_order_variant() {
        // Arrange
        $header = Header::create([
            'name' => 'Shop Menu',
            'order_num' => 1
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Sale',
            'order_num' => 3,
            'header_id' => $header->id
        ]);

        // Act
        $navigationItem->update([
            'name' => 'Special Offers',
            'order_num' => 1
        ]);

        // Assert
        $this->assertEquals('Special Offers', $navigationItem->name);
        $this->assertEquals(1, $navigationItem->order_num);
    }

    public function test_navigation_item_can_detach_categories() {
        // Arrange
        $header = Header::create([
            'name' => 'Main Menu',
            'order_num' => 1
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Products',
            'order_num' => 1,
            'header_id' => $header->id
        ]);

        $category1 = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products',
            'order_num' => 1
        ]);

        $category2 = Category::create([
            'name' => 'Computers',
            'slug' => 'computers',
            'description' => 'Computer products',
            'order_num' => 2
        ]);

        $navigationItem->categories()->attach([$category1->id, $category2->id]);

        // Act
        $navigationItem->categories()->detach($category1->id);

        // Assert
        $this->assertEquals(1, $navigationItem->categories()->count());
        $this->assertFalse($navigationItem->categories->contains($category1));
        $this->assertTrue($navigationItem->categories->contains($category2));
    }

    public function test_navigation_item_can_detach_categories_variant() {
        // Arrange
        $header = Header::create([
            'name' => 'Shop Menu',
            'order_num' => 2
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Deals',
            'order_num' => 2,
            'header_id' => $header->id
        ]);

        $category1 = Category::create([
            'name' => 'Clothing',
            'slug' => 'clothing',
            'description' => 'Fashion items',
            'order_num' => 3
        ]);

        $category2 = Category::create([
            'name' => 'Accessories',
            'slug' => 'accessories',
            'description' => 'Fashion accessories',
            'order_num' => 4
        ]);

        $category3 = Category::create([
            'name' => 'Shoes',
            'slug' => 'shoes',
            'description' => 'Footwear',
            'order_num' => 5
        ]);

        $navigationItem->categories()->attach([$category1->id, $category2->id, $category3->id]);

        // Act
        $navigationItem->categories()->detach([$category1->id, $category3->id]);

        // Assert
        $this->assertEquals(1, $navigationItem->categories()->count());
        $this->assertFalse($navigationItem->categories->contains($category1));
        $this->assertTrue($navigationItem->categories->contains($category2));
        $this->assertFalse($navigationItem->categories->contains($category3));
    }

    public function test_navigation_item_can_sync_categories() {
        // Arrange
        $header = Header::create([
            'name' => 'Main Menu',
            'order_num' => 1
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Products',
            'order_num' => 1,
            'header_id' => $header->id
        ]);

        $category1 = Category::create([
            'name' => 'Electronics',
            'slug' => 'electronics',
            'description' => 'Electronic products',
            'order_num' => 1
        ]);

        $category2 = Category::create([
            'name' => 'Computers',
            'slug' => 'computers',
            'description' => 'Computer products',
            'order_num' => 2
        ]);

        $category3 = Category::create([
            'name' => 'Phones',
            'slug' => 'phones',
            'description' => 'Mobile phones',
            'order_num' => 3
        ]);

        // Initial categories
        $navigationItem->categories()->attach([$category1->id, $category2->id]);

        // Act - sync to new set of categories
        $navigationItem->categories()->sync([$category2->id, $category3->id]);

        // Assert
        $this->assertEquals(2, $navigationItem->categories()->count());
        $this->assertFalse($navigationItem->categories->contains($category1));
        $this->assertTrue($navigationItem->categories->contains($category2));
        $this->assertTrue($navigationItem->categories->contains($category3));
    }

    public function test_navigation_item_can_sync_categories_variant() {
        // Arrange
        $header = Header::create([
            'name' => 'Shop Menu',
            'order_num' => 2
        ]);

        $navigationItem = NavigationItem::create([
            'name' => 'Fashion',
            'order_num' => 2,
            'header_id' => $header->id
        ]);

        $category1 = Category::create([
            'name' => 'Men',
            'slug' => 'men',
            'description' => 'Men\'s fashion',
            'order_num' => 1
        ]);

        $category2 = Category::create([
            'name' => 'Women',
            'slug' => 'women',
            'description' => 'Women\'s fashion',
            'order_num' => 2
        ]);

        $category3 = Category::create([
            'name' => 'Kids',
            'slug' => 'kids',
            'description' => 'Kids\' fashion',
            'order_num' => 3
        ]);

        // Initial categories
        $navigationItem->categories()->attach([$category1->id, $category2->id, $category3->id]);

        // Act - sync to new set of categories
        $navigationItem->categories()->sync([$category1->id]);

        // Assert
        $this->assertEquals(1, $navigationItem->categories()->count());
        $this->assertTrue($navigationItem->categories->contains($category1));
        $this->assertFalse($navigationItem->categories->contains($category2));
        $this->assertFalse($navigationItem->categories->contains($category3));
    }
}
