<?php

namespace App\Models;

interface HasRoles
{
    public function isAdmin(): bool;
    public function isDriver(): bool;
}