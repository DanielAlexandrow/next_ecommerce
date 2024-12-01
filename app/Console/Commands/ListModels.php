<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use Illuminate\Support\Facades\File;
use ReflectionClass;

class ListModels extends Command
{
	protected $signature = 'list:models';
	protected $description = 'List all models and their properties';

	public function handle()
	{
		$modelsPath = app_path('Models');
		$modelFiles = File::allFiles($modelsPath);

		foreach ($modelFiles as $file) {
			$modelClass = 'App\\Models\\' . $file->getFilenameWithoutExtension();
			$reflection = new ReflectionClass($modelClass);
			$properties = $reflection->getDefaultProperties();

			$this->info("Model: $modelClass");
			foreach ($properties as $property => $value) {
				$this->line(" - $property");
			}
			$this->line("");
		}

		return 0;
	}
}
