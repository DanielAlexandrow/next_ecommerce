<?php

namespace Tests;

use Facebook\WebDriver\Chrome\ChromeOptions;
use Facebook\WebDriver\Remote\DesiredCapabilities;
use Facebook\WebDriver\Remote\RemoteWebDriver;
use Laravel\Dusk\TestCase as BaseTestCase;
use Tests\Browser\Assertions\AssertNoConsoleErrors;

abstract class DuskTestCase extends BaseTestCase {
    use CreatesApplication;

    protected $defaultDatabase = 'sqlite';

    /**
     * Register the base URL with Dusk.
     *
     * Setup the test environment.
     */
    protected function setUp(): void
    {
        parent::setUp();

        config(['database.default' => $this->defaultDatabase]);
    }

    /**
     * Register the base URL with Dusk.
     *
     * @return void
     */
    protected function setUp(): void {
        parent::setUp();
        Browser::$baseUrl = env('APP_URL', 'http://localhost:8000');
        Browser::macro('assertNoConsoleErrors', new AssertNoConsoleErrors);
    }

    /**
     * Create the RemoteWebDriver instance.
     *
     * @return \Facebook\WebDriver\Remote\RemoteWebDriver
     */
    protected function driver() {
        $options = (new ChromeOptions)->addArguments([
            '--disable-gpu',
            '--headless',
            '--window-size=1920,1080',
            '--no-sandbox',
            '--disable-dev-shm-usage',
        ]);

        return RemoteWebDriver::create(
            'http://localhost:9515',
            DesiredCapabilities::chrome()->setCapability(
                ChromeOptions::CAPABILITY,
                $options
            )
        );
    }

    /**
     * Determine the application's base URL.
     *
     * @return string
     */
    protected function baseUrl() {
        return env('APP_URL', 'http://localhost:8000');
    }
}
