<?php

namespace App\Listeners;

use Illuminate\Auth\Events\Login;
use App\Services\CartService;
use Illuminate\Support\Facades\Session;

class MergeGuestCart
{
    protected $cartService;

    public function __construct(CartService $cartService)
    {
        $this->cartService = $cartService;
    }

    public function handle(Login $event): void
    {
        $sessionId = Session::getId();
        // getOrCreateCart will handle the merging of guest cart into user cart
        $this->cartService->getOrCreateCart($event->user->id);
    }
}