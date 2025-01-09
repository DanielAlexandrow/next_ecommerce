<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Services\SearchTransitionService;

class CleanSearchCache extends Command {
    protected $signature = 'search:clean-cache';
    protected $description = 'Clean up old search cache entries';

    public function handle(SearchTransitionService $transitionService): int {
        $this->info('Cleaning up old search cache entries...');
        $transitionService->clearOutdatedCache();
        $this->info('Cache cleanup completed.');
        return 0;
    }
}
