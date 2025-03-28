<?php

namespace App\Http\Controllers;

use App\Models\Deal;
use App\Services\DealService;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Validator;

class DealController extends Controller {
    protected $dealService;

    public function __construct(DealService $dealService) {
        $this->middleware('auth');
        $this->middleware('admin')->except(['getActiveDeals']);
        $this->dealService = $dealService;
    }

    public function index(Request $request) {
        $filters = [
            'search' => $request->input('search'),
            'type' => $request->input('type'),
            'active' => $request->boolean('active'),
            'sortKey' => $request->input('sortkey', 'created_at'),
            'sortDirection' => $request->input('sortdirection', 'desc'),
            'limit' => $request->input('limit', 10),
        ];

        $deals = $this->dealService->getDeals($filters);

        return Inertia::render('admin/Deals', [
            'deals' => $deals,
            'filters' => $filters,
        ]);
    }

    public function store(Request $request) {
        $data = $this->validateDeal($request);
        $deal = $this->dealService->createDeal($data);
        
        return response()->json([
            'message' => 'Deal created successfully',
            'deal' => $deal
        ], 201);
    }

    public function update(Request $request, Deal $deal) {
        $data = $this->validateDeal($request);
        $updatedDeal = $this->dealService->updateDeal($deal, $data);
        
        return response()->json([
            'message' => 'Deal updated successfully',
            'deal' => $updatedDeal
        ]);
    }

    public function destroy(Deal $deal) {
        $deal->delete();
        return response()->json(['message' => 'Deal deleted successfully'], 204);
    }

    public function getActiveDeals() {
        $deals = Deal::active()->get();
        return response()->json(['deals' => $deals]);
    }

    protected function validateDeal(Request $request) {
        return Validator::make($request->all(), [
            'name' => 'required|string|max:255',
            'description' => 'nullable|string',
            'discount_amount' => 'required|numeric|min:0',
            'discount_type' => 'required|in:percentage,fixed',
            'start_date' => 'required|date',
            'end_date' => 'required|date|after:start_date',
            'active' => 'sometimes|boolean',
            'deal_type' => 'required|in:product,category,brand,cart',
            'conditions' => 'nullable|array',
            'product_ids' => 'required_if:deal_type,product|array',
            'product_ids.*' => 'exists:products,id',
            'subproduct_ids' => 'nullable|array',
            'subproduct_ids.*' => 'exists:subproducts,id',
            'category_ids' => 'required_if:deal_type,category|array',
            'category_ids.*' => 'exists:categories,id',
            'brand_ids' => 'required_if:deal_type,brand|array',
            'brand_ids.*' => 'exists:brands,id',
            'metadata' => 'nullable|array',
        ])->validate();
    }
}