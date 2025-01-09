<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class SearchHistory extends Model {
    protected $table = 'search_history';

    protected $fillable = [
        'user_id',
        'search_term',
    ];

    public function user(): BelongsTo {
        return $this->belongsTo(User::class);
    }
}
