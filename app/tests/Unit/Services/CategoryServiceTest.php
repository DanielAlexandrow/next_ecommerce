<?php

it('has categoryservice page', function () {
    $response = $this->get('/categoryservice');

    $response->assertStatus(200);
});
