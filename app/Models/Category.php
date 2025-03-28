<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

/**
 * READ-ONLY: This model has verified tests and should not be modified without approval.
 * @see API_DOCUMENTATION.md#categories-read-only for details
 */
class Category extends Model {
	use HasFactory;

	protected $fillable = [
		'name',
		'description',
		'slug',
		'parent_id'
	];

	public function products(): BelongsToMany {
		return $this->belongsToMany(Product::class, 'product_categories');
	}

	public function navigationItems(): BelongsToMany {
		return $this->belongsToMany(NavigationItem::class, 'category_navigation_item');
	}

	public function parent(): BelongsTo {
		return $this->belongsTo(Category::class, 'parent_id');
	}

	public function children(): HasMany {
		return $this->hasMany(Category::class, 'parent_id');
	}

	public function getAllChildrenIds(): array {
		$ids = [$this->id];
		foreach ($this->children as $child) {
			$ids = array_merge($ids, $child->getAllChildrenIds());
		}
		return $ids;
	}
}
