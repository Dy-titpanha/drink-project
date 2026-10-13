<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ProjectController;
use App\Http\Controllers\Api\OrderController;
use App\Http\Controllers\Api\DashboardController;
use Illuminate\Support\Facades\Route;

// Health check
Route::get('/health', fn() => response()->json([
    'status'  => 'OK',
    'message' => "Vat' Milktea Backend API (Laravel) is healthy",
]));

// ─── AUTH ──────────────────────────────────────────────────────────────────
Route::post('/auth/register', [AuthController::class, 'register']);
Route::post('/auth/login',    [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/auth/profile',  [AuthController::class, 'profile']);
    Route::put('/auth/profile',  [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout',  [AuthController::class, 'logout']);
});

// ─── CATEGORIES ─────────────────────────────────────────────────────────────
Route::get('/categories', [CategoryController::class, 'index']);
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/categories', [CategoryController::class, 'store']);
});

// ─── PROJECTS (PRODUCTS) ────────────────────────────────────────────────────
// Public: returns only approved; Authenticated admin: returns all
Route::get('/projects', [ProjectController::class, 'index'])->middleware('optional.auth');

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/projects',              [ProjectController::class, 'store']);
    Route::put('/projects/{id}',          [ProjectController::class, 'update']);
    Route::delete('/projects/{id}',       [ProjectController::class, 'destroy']);
    Route::post('/projects/{id}/status',  [ProjectController::class, 'updateStatus'])
         ->middleware('admin');
});

// ─── ORDERS ─────────────────────────────────────────────────────────────────
// Public: EZorder QR scan-to-order (guests order without an account).
Route::post('/orders', [OrderController::class, 'store']);

Route::middleware('auth:sanctum')->group(function () {
    Route::post('/checkout', [OrderController::class, 'checkout']);
});

// ─── DASHBOARD (Admin only) ─────────────────────────────────────────────────
Route::middleware(['auth:sanctum', 'admin'])->group(function () {
    Route::get('/dashboard/stats', [DashboardController::class, 'stats']);
});
