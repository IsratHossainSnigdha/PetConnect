<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\ShelterRegisterController;

use App\Http\Controllers\Admin\ShelterController;
use App\Http\Controllers\Admin\StatsController;

use App\Http\Controllers\Adopter\AdopterDashboardController;
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\AdoptionApplicationController;
use App\Http\Controllers\Api\PetController;


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
|
| These routes do not require authentication.
|
*/


// Login
Route::post('/auth/login', [
    AuthController::class,
    'login'
]);


// User registration
Route::post('/auth/register', [
    RegisterController::class,
    'register'
]);


// Admin registration
Route::post('/auth/admin/register', [
    AdminRegisterController::class,
    'register'
]);


// Shelter registration
Route::post('/auth/shelter/register', [
    ShelterRegisterController::class,
    'register'
]);


// Get all pets
// This is PUBLIC so it does not require a Sanctum token.
Route::get('/pets', [
    PetController::class,
    'index'
]);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
|
| These routes require a valid Sanctum Bearer token.
|
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTHENTICATION / USER
    |--------------------------------------------------------------------------
    */

    // Get logged-in user
    Route::get('/auth/me', [
        AuthController::class,
        'me'
    ]);


    // Update profile
    Route::put('/auth/profile', [
        AuthController::class,
        'updateProfile'
    ]);


    // Update password
    Route::put('/auth/password', [
        AuthController::class,
        'updatePassword'
    ]);


    // Logout
    Route::post('/auth/logout', [
        AuthController::class,
        'logout'
    ]);


    /*
    |--------------------------------------------------------------------------
    | BACKWARDS COMPATIBILITY
    |--------------------------------------------------------------------------
    */

    Route::get('/user', function (Request $request) {
        return $request->user();
    });


    /*
    |--------------------------------------------------------------------------
    | ADOPTER DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/adopter/dashboard', [
        AdopterDashboardController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ADOPTER APPLICATIONS
    |--------------------------------------------------------------------------
    */

    // Get all applications belonging to logged-in adopter
    Route::get('/adopter/applications', [
        AdoptionApplicationController::class,
        'index'
    ]);


    // Create a new adoption application
    Route::post('/adopter/applications', [
        AdoptionApplicationController::class,
        'store'
    ]);


    // View one application
    Route::get('/adopter/applications/{id}', [
        AdoptionApplicationController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | COMPLAINTS
    |--------------------------------------------------------------------------
    */

    // Get complaints
    Route::get('/complaints', [
        ComplaintController::class,
        'index'
    ]);


    // Create complaint
    Route::post('/complaints', [
        ComplaintController::class,
        'store'
    ]);


    // View one complaint
    Route::get('/complaints/{complaint}', [
        ComplaintController::class,
        'show'
    ]);
});


/*
|--------------------------------------------------------------------------
| ADMIN-ONLY ROUTES
|--------------------------------------------------------------------------
|
| These routes require:
|
| 1. A valid Sanctum token
| 2. The admin middleware
| 3. The user to have the platform_admin role
|
*/

Route::middleware([
    'auth:sanctum',
    'admin'
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | SHELTER MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'admin/shelters',
        ShelterController::class
    );


    /*
    |--------------------------------------------------------------------------
    | ADMIN STATISTICS
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/stats', [
        StatsController::class,
        'index'
    ]);
});