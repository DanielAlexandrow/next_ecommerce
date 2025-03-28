<?php

use PHPUnit\Framework\TestCase;

class SearchServiceTest extends TestCase
{
    public function testSearchReturnsExpectedResults()
    {
        $searchService = new SearchService();
        $results = $searchService->search('test query');

        $this->assertNotEmpty($results);
        $this->assertContains('expected result', $results);
    }

    public function testSearchHandlesEmptyQuery()
    {
        $searchService = new SearchService();
        $results = $searchService->search('');

        $this->assertEmpty($results);
    }
}