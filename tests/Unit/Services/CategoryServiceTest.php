<?php

use Tests\TestCase;

uses(TestCase::class);

it('has categoryservice page', function () {
    $response = $this->get('/categoryservice');

    $response->assertStatus(200);
});
