<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatMessage extends Model {
    use HasFactory;

    protected $fillable = [
        'content',
        'sender_id',
        'sender_type',
        'user_id'
    ];

    protected $casts = [
        'created_at' => 'datetime',
        'updated_at' => 'datetime'
    ];

    public function user() {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function sender() {
        return $this->morphTo();
    }
}
