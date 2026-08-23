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


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
|
| These routes do not require authentication.
|
*/

Route::post('/auth/login', [AuthController::class, 'login']);

Route::post('/auth/register', [
    RegisterController::class,
    'register'
]);

Route::post('/auth/admin/register', [
    AdminRegisterController::class,
    'register'
]);

Route::post('/auth/shelter/register', [
    ShelterRegisterController::class,
    'register'
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
    | Authentication / User
    |--------------------------------------------------------------------------
    */

    Route::get('/auth/me', [
        AuthController::class,
        'me'
    ]);

    Route::put('/auth/profile', [
        AuthController::class,
        'updateProfile'
    ]);

    Route::put('/auth/password', [
        AuthController::class,
        'updatePassword'
    ]);

    Route::post('/auth/logout', [
        AuthController::class,
        'logout'
    ]);

    // Backwards compatibility
    Route::get('/user', function (Request $request) {
        return $request->user();
    });


    /*
    |--------------------------------------------------------------------------
    | Adopter Dashboard
    |--------------------------------------------------------------------------
    */

    Route::get('/adopter/dashboard', [
        AdopterDashboardController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | Complaints
    |--------------------------------------------------------------------------
    |
    | Adopters can:
    | - View their complaints
    | - Submit complaints
    | - View a specific complaint
    |
    */

    Route::get('/complaints', [
        ComplaintController::class,
        'index'
    ]);

    Route::post('/complaints', [
        ComplaintController::class,
        'store'
    ]);

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
| Requires:
|
| 1. Valid Sanctum token
| 2. admin middleware
| 3. role = platform_admin
|
*/

Route::middleware([
    'auth:sanctum',
    'admin'
])->group(function () {

    /*
    |--------------------------------------------------------------------------
    | Shelter Management
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'admin/shelters',
        ShelterController::class
    );


    /*
    |--------------------------------------------------------------------------
    | Admin Statistics
    |--------------------------------------------------------------------------
    */

    Route::get('/admin/stats', [
        StatsController::class,
        'index'
    ]);

});