<?php

namespace App\Exceptions;

use Exception;

class ProductHasOrdersException extends Exception {
    public function __construct(string $message = "Cannot delete product with existing orders") {
        parent::__construct($message);
    }
}
