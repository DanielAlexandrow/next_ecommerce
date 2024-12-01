<?php

namespace App\Interfaces;

use Illuminate\Http\Request;

interface SubproductServiceInterface
{
	public function create(Request $request);
	public function update(Request $request, $id);
	public function deleteSubproduct($id);
}
