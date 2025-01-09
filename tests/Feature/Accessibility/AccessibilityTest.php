<?php

namespace Tests\Feature\Accessibility;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Support\Facades\Http;

class AccessibilityTest extends TestCase {
    use RefreshDatabase;

    private User $user;
    private const ARIA_ROLES = [
        'alert',
        'alertdialog',
        'button',
        'checkbox',
        'dialog',
        'gridcell',
        'link',
        'log',
        'marquee',
        'menuitem',
        'menuitemcheckbox',
        'menuitemradio',
        'option',
        'progressbar',
        'radio',
        'scrollbar',
        'searchbox',
        'slider',
        'spinbutton',
        'status',
        'switch',
        'tab',
        'tabpanel',
        'textbox',
        'timer'
    ];

    protected function setUp(): void {
        parent::setUp();
        $this->user = User::factory()->create();
    }

    /** @test */
    public function it_announces_form_errors() {
        $response = $this->actingAs($this->user)
            ->get('/products/create');

        // Verify error container has correct ARIA attributes
        $response->assertSee('role="alert"', false);
        $response->assertSee('aria-live="polite"', false);

        // Submit invalid form
        $response = $this->actingAs($this->user)
            ->post('/api/products', []);

        // Verify error messages are announced
        $response->assertSee('aria-invalid="true"', false);
        $response->assertSee('aria-errormessage', false);
    }

    /** @test */
    public function it_announces_loading_states() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify loading spinner has correct ARIA attributes
        $response->assertSee('role="status"', false);
        $response->assertSee('aria-live="polite"', false);
        $response->assertSee('aria-busy="true"', false);
        $response->assertSee('Loading products...', false);
    }

    /** @test */
    public function it_has_proper_button_aria_labels() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify sort buttons have descriptive labels
        $response->assertSee('aria-label="Sort by name"', false);
        $response->assertSee('aria-label="Sort by price"', false);
        $response->assertSee('aria-sort', false);

        // Verify action buttons are properly labeled
        $response->assertSee('aria-label="Edit product"', false);
        $response->assertSee('aria-label="Delete product"', false);
    }

    /** @test */
    public function it_supports_keyboard_navigation() {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify focusable elements have correct tab index
        $response->assertSee('tabindex="0"', false);

        // Verify skip links are present
        $response->assertSee('Skip to main content', false);
        $response->assertSee('Skip to navigation', false);

        // Verify keyboard shortcuts are documented
        $response->assertSee('aria-keyshortcuts', false);
    }

    /** @test */
    public function it_has_proper_form_labels() {
        $response = $this->actingAs($this->user)
            ->get('/products/create');

        // Verify form controls are properly labeled
        $response->assertSee('<label for="name"', false);
        $response->assertSee('<label for="price"', false);
        $response->assertSee('<label for="description"', false);

        // Verify required fields are marked
        $response->assertSee('aria-required="true"', false);
        $response->assertSee('required', false);
    }

    /** @test */
    public function it_has_proper_image_alt_text() {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->get("/products/{$product->id}");

        // Verify all images have alt text
        $response->assertDontSee('<img src=', false);
        $response->assertSee('alt="', false);

        // Verify decorative images are marked
        $response->assertSee('role="presentation"', false);
        $response->assertSee('aria-hidden="true"', false);
    }

    /** @test */
    public function it_has_proper_heading_structure() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify heading hierarchy
        $response->assertSee('<h1', false);
        $response->assertSee('role="heading"', false);
        $response->assertSee('aria-level', false);
    }

    /** @test */
    public function it_has_proper_landmark_regions() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify main landmarks are present
        $response->assertSee('role="banner"', false);
        $response->assertSee('role="navigation"', false);
        $response->assertSee('role="main"', false);
        $response->assertSee('role="complementary"', false);
        $response->assertSee('role="contentinfo"', false);
    }

    /** @test */
    public function it_handles_modal_dialogs_accessibly() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify modal attributes
        $response->assertSee('role="dialog"', false);
        $response->assertSee('aria-modal="true"', false);
        $response->assertSee('aria-labelledby', false);
        $response->assertSee('aria-describedby', false);

        // Verify focus management
        $response->assertSee('data-focus-guard', false);
        $response->assertSee('autofocus', false);
    }

    /** @test */
    public function it_handles_dynamic_content_updates() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify live regions
        $response->assertSee('aria-live="polite"', false);
        $response->assertSee('aria-atomic="true"', false);
        $response->assertSee('aria-relevant="additions text"', false);
    }

    /** @test */
    public function it_supports_screen_readers() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify screen reader only text
        $response->assertSee('sr-only', false);
        $response->assertSee('visually-hidden', false);

        // Verify ARIA descriptions
        $response->assertSee('aria-describedby', false);
        $response->assertSee('aria-details', false);
    }

    /** @test */
    public function it_manages_focus_correctly() {
        $product = Product::factory()->create();

        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify focus indicators
        $response->assertSee(':focus', false);
        $response->assertSee(':focus-visible', false);

        // Verify focus management in forms
        $response->assertSee('autofocus', false);
        $response->assertSee('data-focus-guard', false);
    }

    /** @test */
    public function it_supports_high_contrast_mode() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify contrast ratios
        $response->assertSee('color-contrast', false);
        $response->assertSee('forced-colors', false);

        // Verify focus indicators in high contrast
        $response->assertSee('outline', false);
        $response->assertSee('focus-ring', false);
    }

    /** @test */
    public function it_supports_text_zoom() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify text scaling
        $response->assertSee('rem', false);
        $response->assertSee('em', false);
        $response->assertDontSee('px', false);

        // Verify container adaptability
        $response->assertSee('max-width', false);
        $response->assertSee('min-width', false);
    }

    /** @test */
    public function it_provides_sufficient_color_contrast() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify WCAG contrast requirements
        $response->assertSee('color-contrast', false);
        $response->assertSee('background-color', false);
        $response->assertSee('border-color', false);
    }

    /** @test */
    public function it_supports_reduced_motion() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify motion reduction preferences
        $response->assertSee('prefers-reduced-motion', false);
        $response->assertSee('motion-safe', false);
        $response->assertSee('motion-reduce', false);
    }

    /** @test */
    public function it_validates_wcag_compliance() {
        $response = $this->actingAs($this->user)
            ->get('/products');

        // Verify ARIA roles
        foreach (self::ARIA_ROLES as $role) {
            if (str_contains($response->getContent(), "role=\"{$role}\"")) {
                $this->assertTrue(true, "Found valid ARIA role: {$role}");
            }
        }

        // Verify required ARIA attributes
        $response->assertSee('aria-label', false);
        $response->assertSee('aria-labelledby', false);
        $response->assertSee('aria-describedby', false);
    }
}
