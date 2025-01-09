<?php

namespace Tests\Feature\Accessibility;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class KeyboardNavigationTest extends TestCase {
    use RefreshDatabase;

    private User $user;
    private const FOCUSABLE_ELEMENTS = [
        'a[href]',
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        '[tabindex="0"]',
        '[contenteditable="true"]'
    ];

    protected function setUp(): void {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function it_has_logical_tab_order() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify tab index values
        $response->assertDontSee('tabindex="-1"', false);
        $response->assertDontSee('tabindex="1"', false);

        // Verify skip links are first in tab order
        $content = $response->getContent();
        $skipLinkPos = strpos($content, 'Skip to main content');
        $mainContentPos = strpos($content, 'role="main"');

        $this->assertLessThan(
            $mainContentPos,
            $skipLinkPos,
            "Skip links should appear before main content"
        );
    }

    /** @test */
    public function it_supports_keyboard_shortcuts() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify keyboard shortcut documentation
        $response->assertSee('aria-keyshortcuts', false);
        $response->assertSee('accesskey', false);

        // Verify common shortcuts
        $response->assertSee('accesskey="s"', false); // Search
        $response->assertSee('accesskey="m"', false); // Menu
        $response->assertSee('accesskey="h"', false); // Home
    }

    /** @test */
    public function it_handles_keyboard_modal_interaction() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify modal focus trap
        $response->assertSee('data-focus-guard', false);
        $response->assertSee('data-focus-lock', false);

        // Verify modal close button
        $response->assertSee('aria-label="Close modal"', false);
        $response->assertSee('data-dismiss="modal"', false);
    }

    /** @test */
    public function it_supports_keyboard_form_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products/create');

        // Verify form field tab order
        foreach (self::FOCUSABLE_ELEMENTS as $selector) {
            $response->assertSee($selector, false);
        }

        // Verify form submission via keyboard
        $response->assertSee('type="submit"', false);
        $response->assertSee('role="button"', false);
    }

    /** @test */
    public function it_supports_keyboard_menu_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify menu role and structure
        $response->assertSee('role="menubar"', false);
        $response->assertSee('role="menuitem"', false);

        // Verify arrow key navigation
        $response->assertSee('aria-orientation="horizontal"', false);
        $response->assertSee('aria-haspopup="true"', false);
    }

    /** @test */
    public function it_supports_keyboard_table_navigation() {
        Product::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify table navigation attributes
        $response->assertSee('role="grid"', false);
        $response->assertSee('role="gridcell"', false);
        $response->assertSee('aria-sort', false);
    }

    /** @test */
    public function it_supports_keyboard_tab_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify tab panel structure
        $response->assertSee('role="tablist"', false);
        $response->assertSee('role="tab"', false);
        $response->assertSee('role="tabpanel"', false);

        // Verify keyboard interaction
        $response->assertSee('aria-selected', false);
        $response->assertSee('aria-controls', false);
    }

    /** @test */
    public function it_supports_keyboard_list_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify list navigation
        $response->assertSee('role="list"', false);
        $response->assertSee('role="listitem"', false);
        $response->assertSee('aria-setsize', false);
        $response->assertSee('aria-posinset', false);
    }

    /** @test */
    public function it_supports_keyboard_tree_navigation() {
        Category::factory()
            ->count(3)
            ->has(Product::factory()->count(3))
            ->create();

        $response = $this->actingAs($this->user)
            ->get('/categories');

        // Verify tree navigation
        $response->assertSee('role="tree"', false);
        $response->assertSee('role="treeitem"', false);
        $response->assertSee('aria-expanded', false);
    }

    /** @test */
    public function it_supports_keyboard_combobox_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products/create');

        // Verify combobox attributes
        $response->assertSee('role="combobox"', false);
        $response->assertSee('aria-expanded', false);
        $response->assertSee('aria-autocomplete', false);
        $response->assertSee('aria-controls', false);
    }

    /** @test */
    public function it_supports_keyboard_dialog_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify dialog navigation
        $response->assertSee('role="dialog"', false);
        $response->assertSee('aria-modal="true"', false);
        $response->assertSee('data-focus-guard', false);
    }

    /** @test */
    public function it_supports_keyboard_tooltip_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify tooltip accessibility
        $response->assertSee('role="tooltip"', false);
        $response->assertSee('aria-describedby', false);
    }

    /** @test */
    public function it_supports_keyboard_accordion_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify accordion structure
        $response->assertSee('role="region"', false);
        $response->assertSee('aria-expanded', false);
        $response->assertSee('aria-controls', false);
    }

    /** @test */
    public function it_supports_keyboard_pagination_navigation() {
        Product::factory()->count(20)->create();

        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify pagination navigation
        $response->assertSee('role="navigation"', false);
        $response->assertSee('aria-label="Pagination"', false);
        $response->assertSee('aria-current="page"', false);
    }

    /** @test */
    public function it_supports_keyboard_search_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify search functionality
        $response->assertSee('role="search"', false);
        $response->assertSee('aria-label="Search"', false);
        $response->assertSee('type="search"', false);
    }

    /** @test */
    public function it_supports_keyboard_slider_navigation() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify slider controls
        $response->assertSee('role="slider"', false);
        $response->assertSee('aria-valuemin', false);
        $response->assertSee('aria-valuemax', false);
        $response->assertSee('aria-valuenow', false);
    }
}
