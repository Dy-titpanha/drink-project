<?php

use Illuminate\Support\Facades\Route;

// Main Homepage with Swagger Links & Test Credentials
Route::get('/', function () {
    return view('welcome');
});

// Shortcut redirect to Swagger UI
Route::redirect('/swagger-ui', '/api/documentation');
