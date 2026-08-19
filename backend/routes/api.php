<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\RegisterController;

use App\Http\Controllers\Auth\AdminRegisterController;

use App\Http\Controllers\Auth\ShelterRegisterController;

Route::post('/auth/shelter/register', [ShelterRegisterController::class, 'register']);


Route::post('/auth/admin/register', [AdminRegisterController::class, 'register']);

Route::post('/auth/register', [RegisterController::class, 'register']);

Route::get('/user', function (Request $request) {
    return $request->user();
})->middleware('auth:sanctum');
