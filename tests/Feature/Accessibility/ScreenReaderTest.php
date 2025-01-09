<?php

namespace Tests\Feature\Accessibility;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;

class ScreenReaderTest extends TestCase {
    use RefreshDatabase;

    private User $user;
    private const SCREEN_READER_CLASSES = [
        'sr-only',
        'visually-hidden',
        'screen-reader-text',
        'visually-hidden-focusable'
    ];

    protected function setUp(): void {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function it_provides_descriptive_headings() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify heading hierarchy
        $content = $response->getContent();
        preg_match_all('/<h[1-6].*?>.*?<\/h[1-6]>/i', $content, $matches);
        $headings = $matches[0];

        $this->assertNotEmpty($headings, "No headings found on page");

        // Verify heading order
        $previousLevel = 0;
        foreach ($headings as $heading) {
            preg_match('/<h([1-6]).*?>/i', $heading, $level);
            $currentLevel = (int) $level[1];

            if ($previousLevel > 0) {
                $this->assertLessThanOrEqual(
                    $previousLevel + 1,
                    $currentLevel,
                    "Heading levels should not skip"
                );
            }
            $previousLevel = $currentLevel;
        }
    }

    /** @test */
    public function it_provides_descriptive_links() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify link text
        $response->assertDontSee('>click here<', false);
        $response->assertDontSee('>read more<', false);
        $response->assertDontSee('>learn more<', false);

        // Verify aria-label for icon links
        $response->assertSee('aria-label=', false);
    }

    /** @test */
    public function it_announces_dynamic_content() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify live regions
        $response->assertSee('aria-live="polite"', false);
        $response->assertSee('aria-live="assertive"', false);
        $response->assertSee('role="status"', false);
        $response->assertSee('role="alert"', false);
    }

    /** @test */
    public function it_provides_form_feedback() {
        $response = $this->actingAs($this->user)
            ->get('/products/create');

        // Verify error announcements
        $response->assertSee('aria-invalid', false);
        $response->assertSee('aria-errormessage', false);

        // Verify success announcements
        $response->assertSee('role="alert"', false);
        $response->assertSee('aria-live="assertive"', false);
    }

    /** @test */
    public function it_describes_images() {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->get("/products/{$product->id}");

        // Verify alt text
        $response->assertSee('alt="', false);

        // Verify complex image descriptions
        $response->assertSee('aria-describedby', false);
        $response->assertSee('longdesc', false);
    }

    /** @test */
    public function it_provides_table_context() {
        Product::factory()->count(5)->create();

        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify table structure
        $response->assertSee('<th scope=', false);
        $response->assertSee('role="columnheader"', false);
        $response->assertSee('role="rowheader"', false);
    }

    /** @test */
    public function it_provides_list_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify list structure
        $response->assertSee('role="list"', false);
        $response->assertSee('role="listitem"', false);

        // Verify list item count
        $response->assertSee('aria-setsize', false);
        $response->assertSee('aria-posinset', false);
    }

    /** @test */
    public function it_provides_form_instructions() {
        $response = $this->actingAs($this->user)
            ->get('/products/create');

        // Verify form field descriptions
        $response->assertSee('aria-describedby', false);
        $response->assertSee('aria-required', false);

        // Verify help text
        foreach (self::SCREEN_READER_CLASSES as $class) {
            $response->assertSee("class=\"{$class}\"", false);
        }
    }

    /** @test */
    public function it_announces_loading_states() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify loading indicators
        $response->assertSee('aria-busy="true"', false);
        $response->assertSee('role="progressbar"', false);
        $response->assertSee('aria-valuemin', false);
        $response->assertSee('aria-valuemax', false);
    }

    /** @test */
    public function it_provides_button_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify button descriptions
        $response->assertSee('aria-pressed', false);
        $response->assertSee('aria-expanded', false);
        $response->assertSee('aria-haspopup', false);
    }

    /** @test */
    public function it_announces_sort_states() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify sort indicators
        $response->assertSee('aria-sort="ascending"', false);
        $response->assertSee('aria-sort="descending"', false);
        $response->assertSee('aria-sort="none"', false);
    }

    /** @test */
    public function it_provides_modal_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify modal structure
        $response->assertSee('role="dialog"', false);
        $response->assertSee('aria-modal="true"', false);
        $response->assertSee('aria-labelledby', false);
    }

    /** @test */
    public function it_provides_tab_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify tab structure
        $response->assertSee('role="tablist"', false);
        $response->assertSee('role="tab"', false);
        $response->assertSee('aria-selected', false);
    }

    /** @test */
    public function it_provides_menu_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify menu structure
        $response->assertSee('role="menu"', false);
        $response->assertSee('role="menuitem"', false);
        $response->assertSee('aria-haspopup', false);
    }

    /** @test */
    public function it_provides_accordion_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify accordion structure
        $response->assertSee('role="region"', false);
        $response->assertSee('aria-expanded', false);
        $response->assertSee('aria-controls', false);
    }

    /** @test */
    public function it_provides_tooltip_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify tooltip structure
        $response->assertSee('role="tooltip"', false);
        $response->assertSee('aria-describedby', false);
    }

    /** @test */
    public function it_provides_complementary_content_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify complementary content
        $response->assertSee('role="complementary"', false);
        $response->assertSee('aria-labelledby', false);
    }

    /** @test */
    public function it_provides_search_context() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify search structure
        $response->assertSee('role="search"', false);
        $response->assertSee('aria-label="Search"', false);
    }

    /** @test */
    public function it_provides_pagination_context() {
        Product::factory()->count(20)->create();

        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify pagination structure
        $response->assertSee('role="navigation"', false);
        $response->assertSee('aria-label="Pagination"', false);
        $response->assertSee('aria-current="page"', false);
    }
}
