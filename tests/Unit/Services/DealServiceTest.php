<?php

namespace Tests\Unit\Services;

use Tests\TestCase;
use App\Services\DealService;
use App\Models\Deal;
use App\Models\Product;
use App\Models\Category;
use App\Models\Brand;
use App\Models\Cart;
use App\Models\CartItem;
use App\Models\Subproduct;
use Carbon\Carbon;
use Illuminate\Foundation\Testing\RefreshDatabase;

class DealServiceTest extends TestCase {
    use RefreshDatabase;

    private DealService $dealService;
    private Product $product;
    private Category $category;
    private Brand $brand;
    private Subproduct $subproduct;

    protected function setUp(): void {
        parent::setUp();
        $this->dealService = new DealService();
        
        // Create test data
        $this->product = Product::factory()->create();
        $this->category = Category::factory()->create();
        $this->brand = Brand::factory()->create();
        $this->subproduct = Subproduct::factory()->create([
            'product_id' => $this->product->id,
            'name' => 'Test Variant',
            'price' => 100.00,
            'stock' => 10
        ]);
    }

    /** @test */
    public function it_creates_product_deal() {
        $data = [
            'name' => 'Test Deal',
            'description' => 'Test Description',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product',
            'product_ids' => [$this->product->id]
        ];

        $deal = $this->dealService->createDeal($data);

        $this->assertInstanceOf(Deal::class, $deal);
        $this->assertEquals('Test Deal', $deal->name);
        $this->assertEquals(10.00, $deal->discount_amount);
        $this->assertTrue($deal->products->contains($this->product->id));
    }

    /** @test */
    public function it_creates_category_deal() {
        $data = [
            'name' => 'Category Deal',
            'description' => 'Category Deal Description',
            'discount_amount' => 15.00,
            'discount_type' => 'fixed',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'category',
            'category_ids' => [$this->category->id]
        ];

        $deal = $this->dealService->createDeal($data);

        $this->assertInstanceOf(Deal::class, $deal);
        $this->assertEquals('fixed', $deal->discount_type);
        $this->assertTrue($deal->categories->contains($this->category->id));
    }

    /** @test */
    public function it_applies_deals_to_product() {
        // Create a deal
        $deal = Deal::create([
            'name' => 'Test Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product'
        ]);

        $deal->products()->attach($this->product->id);

        $result = $this->dealService->applyDealsToProduct($this->subproduct);

        $this->assertEquals(100.00, $result['original_price']);
        $this->assertEquals(10.00, $result['discount_amount']);
        $this->assertEquals(90.00, $result['final_price']);
        $this->assertEquals($deal->id, $result['applied_deal']->id);
    }

    /** @test */
    public function test_applies_best_deal_when_multiple_available()
    {
        // Create two deals
        $deal1 = Deal::create([
            'name' => 'Deal 1',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'product'
        ]);

        $deal2 = Deal::create([
            'name' => 'Deal 2',
            'discount_amount' => 20.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'category'
        ]);

        $deal1->products()->attach($this->product->id);
        $deal2->categories()->attach($this->category->id);
        $this->product->categories()->attach($this->category->id);

        // Create subproduct with price
        $subproduct = Subproduct::create([
            'product_id' => $this->product->id,
            'name' => 'Test Variant',
            'price' => 100.00,
            'available' => true,
            'stock' => 10
        ]);

        $result = $this->dealService->applyDealsToProduct($subproduct);

        // Should apply the better deal (20%)
        $this->assertEquals(100.00, $result['original_price']);
        $this->assertEquals(20.00, $result['discount_amount']);
        $this->assertEquals(80.00, $result['final_price']);
        $this->assertEquals($deal2->id, $result['applied_deal']->id);
    }

    public function test_applies_cart_level_deals()
    {
        // Create a cart deal
        $deal = Deal::create([
            'name' => 'Cart Deal',
            'discount_amount' => 10.00,
            'discount_type' => 'percentage',
            'start_date' => Carbon::now(),
            'end_date' => Carbon::now()->addDays(7),
            'active' => true,
            'deal_type' => 'cart',
            'conditions' => [
                'minimum_amount' => 100.00,
                'required_items' => 2
            ]
        ]);

        // Create cart with qualifying items
        $cart = Cart::create();
        
        // Create product and subproduct first
        $product = Product::create([
            'name' => 'Test Product',
            'available' => true
        ]);
        
        $subproduct = Subproduct::create([
            'product_id' => $product->id,
            'name' => 'Test Variant',
            'price' => 60.00,
            'available' => true,
            'stock' => 10
        ]);
        
        CartItem::create([
            'cart_id' => $cart->id,
            'subproduct_id' => $subproduct->id,
            'quantity' => 2
        ]);

        $cart->total = 120.00;
        $cart->save();

        $result = $this->dealService->applyDealsToCart($cart);

        $this->assertEquals(120.00, $result['original_total']);
        $this->assertEquals(12.00, $result['discount_amount']);
        $this->assertEquals(108.00, $result['final_total']);
        $this->assertEquals($deal->id, $result['applied_deal']->id);
    }
}