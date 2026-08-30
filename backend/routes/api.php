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
*/

Route::post('/auth/login', [
    AuthController::class,
    'login'
]);

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
| PETS
|--------------------------------------------------------------------------
|
| Used by the adopter when creating an application.
|
*/

Route::get('/pets', [
    PetController::class,
    'index'
]);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware('auth:sanctum')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | AUTH
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
    | ADOPTION APPLICATIONS
    |--------------------------------------------------------------------------
    */

    // Get logged-in adopter's applications
    Route::get('/adopter/applications', [
        AdoptionApplicationController::class,
        'index'
    ]);

    // Create application
    Route::post('/adopter/applications', [
        AdoptionApplicationController::class,
        'store'
    ]);

    // View individual application
    Route::get('/adopter/applications/{id}', [
        AdoptionApplicationController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | COMPLAINTS
    |--------------------------------------------------------------------------
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
| ADMIN ROUTES
|--------------------------------------------------------------------------
*/

Route::middleware([
    'auth:sanctum',
    'admin'
])->group(function () {

    Route::apiResource(
        'admin/shelters',
        ShelterController::class
    );

    // Admin list for the "Assigned Admin" dropdown (issue #17)
    Route::get('/admin/admins', [
        ShelterController::class,
        'admins'
    ]);

    Route::get('/admin/stats', [
        StatsController::class,
        'index'
    ]);
});