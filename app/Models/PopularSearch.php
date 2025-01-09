<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PopularSearch extends Model {
    protected $table = 'popular_searches';

    protected $fillable = [
        'search_term',
        'count',
    ];

    protected $casts = [
        'count' => 'integer',
    ];
}
