<?php

namespace Tests\Browser\Assertions;

use Laravel\Dusk\Browser;
use PHPUnit\Framework\Assert as PHPUnit;

class AssertNoConsoleErrors {
    /**
     * Assert that there are no console errors.
     *
     * @param  Browser  $browser
     * @return void
     */
    public function __invoke(Browser $browser) {
        $console = $browser->driver->manage()->getLog('browser');

        $errors = collect($console)->filter(function ($log) {
            return $log['level'] === 'SEVERE' &&
                !str_contains($log['message'], 'favicon.ico') && // Ignore favicon errors
                !str_contains($log['message'], '404 (Not Found)'); // Ignore 404 errors
        });

        PHPUnit::assertEmpty(
            $errors->toArray(),
            'Browser console contains errors: ' . PHP_EOL . PHP_EOL .
                $errors->map(function ($error) {
                    return "Level: {$error['level']}" . PHP_EOL .
                        "Message: {$error['message']}" . PHP_EOL;
                })->implode(PHP_EOL)
        );
    }
}
