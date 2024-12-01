<?php

namespace App\Interfaces;


interface ProductServiceInterface
{
	public function create($data);
	public function update($data, $id);
	public function getPaginatedProducts($sortkey, $sortDirection, $limit): array;
	public function delete($id);
	public function getPaginatedStoreProducts(array $filters): array;

}
