<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;

class ListModelDetails extends Command {
	protected $signature = 'list:model-details';
	protected $description = 'List all models, their relationships, and fillable properties';

	public function handle() {
		$modelsPath = app_path('Models');
		$modelFiles = File::allFiles($modelsPath);

		foreach ($modelFiles as $file) {
			$modelClass = 'App\\Models\\' . $file->getFilenameWithoutExtension();
			$filePath = $file->getPathname();

			$this->info("Model: $modelClass");

			$fileContent = File::get($filePath);

			// Get fillable properties
			$fillableProperties = $this->getFillableProperties($fileContent);
			$this->line("Fillable Properties:");
			foreach ($fillableProperties as $property) {
				$this->line(" - $property");
			}

			// Get relationships
			$relationships = $this->getRelationships($fileContent);
			$this->line("Relationships:");
			foreach ($relationships as $relationship) {
				$this->line(" - $relationship");
			}
			$this->line("");
		}

		return 0;
	}

	private function getFillableProperties($fileContent) {
		// Use regex to find the fillable array
		if (preg_match('/protected\s+\$fillable\s+=\s+\[(.*?)\];/s', $fileContent, $matches)) {
			$fillableString = $matches[1];
			// Split by commas and trim the values
			$fillableProperties = array_map('trim', explode(',', $fillableString));
			return array_map(function ($item) {
				return trim($item, "'\" ");
			}, $fillableProperties);
		}
		return [];
	}

	private function getRelationships($fileContent) {
		$relationshipMethods = [
			'hasMany',
			'hasOne',
			'belongsTo',
			'belongsToMany',
			'hasManyThrough',
			'morphMany',
			'morphTo',
			'morphToMany',
			'morphedByMany'
		];

		$relationships = [];

		// Use regex to find methods that return a relationship
		foreach ($relationshipMethods as $relationshipMethod) {
			if (preg_match_all('/function\s+\w+\s*\(\)\s*{\s*return\s+\$this->' . $relationshipMethod . '\(.*?\);\s*}/s', $fileContent, $matches)) {
				foreach ($matches[0] as $match) {
					if (preg_match('/function\s+(\w+)\s*\(/', $match, $methodNameMatch)) {
						$relationships[] = $methodNameMatch[1];
					}
				}
			}
		}

		return $relationships;
	}
}
