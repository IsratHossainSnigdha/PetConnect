<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ========================================
// AUTH CONTROLLERS
// ========================================
use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\ShelterRegisterController;

// ========================================
// ADMIN CONTROLLERS
// ========================================
use App\Http\Controllers\Admin\ShelterController as AdminShelterController;
use App\Http\Controllers\Admin\StatsController;
use App\Http\Controllers\Admin\ComplaintController as AdminComplaintController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ShelterPetController;

// ========================================
// ADOPTER CONTROLLERS
// ========================================
use App\Http\Controllers\Adopter\AdopterDashboardController;

// ========================================
// API CONTROLLERS
// ========================================
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\AdoptionApplicationController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ShelterController as ApiShelterController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NotificationController;


/*
|--------------------------------------------------------------------------
| PUBLIC ROUTES
|--------------------------------------------------------------------------
*/

// ========================================
// AUTHENTICATION
// ========================================

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

Route::post('/auth/staff/register', [
    ShelterRegisterController::class,
    'register'
]);


/*
|--------------------------------------------------------------------------
| PUBLIC PET & SHELTER ROUTES
|--------------------------------------------------------------------------
*/

Route::get('/pets', [
    PetController::class,
    'index'
]);

Route::get('/shelters', [
    ApiShelterController::class,
    'index'
]);


/*
|--------------------------------------------------------------------------
| AUTHENTICATED ROUTES
|--------------------------------------------------------------------------
|
| All routes inside this group require a valid Sanctum token.
|
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


    /*
    |--------------------------------------------------------------------------
    | CURRENT USER
    |--------------------------------------------------------------------------
    */

    Route::get('/user', function (Request $request) {
        return $request->user();
    });


    /*
    |--------------------------------------------------------------------------
    | USER PROFILE
    |--------------------------------------------------------------------------
    */

    Route::get('/user/profile', [
        ProfileController::class,
        'show'
    ]);

    Route::put('/user/profile', [
        ProfileController::class,
        'update'
    ]);


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

    Route::get('/adopter/applications', [
        AdoptionApplicationController::class,
        'index'
    ]);

    Route::post('/adopter/applications', [
        AdoptionApplicationController::class,
        'store'
    ]);

    // IMPORTANT:
    // This route MUST come before /adopter/applications/{id}
    Route::get('/adopter/applications/process', [
        AdoptionApplicationController::class,
        'processRequests'
    ]);

    Route::get('/adopter/applications/{id}', [
        AdoptionApplicationController::class,
        'show'
    ]);


    /*
    |--------------------------------------------------------------------------
    | NOTIFICATIONS
    |--------------------------------------------------------------------------
    */

    Route::get('/notifications', [
        NotificationController::class,
        'index'
    ]);

    Route::put('/notifications/{id}/read', [
        NotificationController::class,
        'markAsRead'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ADOPTER COMPLAINTS
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


    /*
    |--------------------------------------------------------------------------
    | SHELTER DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/shelter/dashboard', [
        PetController::class,
        'dashboard'
    ]);


    /*
    |--------------------------------------------------------------------------
    | SHELTER PET MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/shelter/pets/summary', [
        PetController::class,
        'getShelterPetSummary'
    ]);

    Route::get('/shelter/pets', [
        PetController::class,
        'index'
    ]);

    Route::post('/shelter/pets', [
        PetController::class,
        'store'
    ]);

    Route::put('/shelter/pets/{id}', [
        PetController::class,
        'update'
    ]);

    Route::delete('/shelter/pets/{id}', [
        PetController::class,
        'destroy'
    ]);

});


/*
|--------------------------------------------------------------------------
| ADMIN ROUTES
|--------------------------------------------------------------------------
|
| Every route inside this group requires:
|
| 1. auth:sanctum
| 2. admin middleware
|
| All routes automatically receive the /admin prefix.
|
*/

Route::middleware([
    'auth:sanctum',
    'admin'
])->prefix('admin')->group(function () {

    /*
    |--------------------------------------------------------------------------
    | ADMIN DASHBOARD
    |--------------------------------------------------------------------------
    */

    Route::get('/stats', [
        StatsController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ADMIN SHELTER MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::apiResource(
        'shelters',
        AdminShelterController::class
    );


    /*
    |--------------------------------------------------------------------------
    | ADMIN LIST
    |--------------------------------------------------------------------------
    */

    Route::get('/admins', [
        AdminShelterController::class,
        'admins'
    ]);


    /*
    |--------------------------------------------------------------------------
    | SHELTER PET MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/shelters/{shelter}/pets', [
        ShelterPetController::class,
        'index'
    ]);

    Route::post('/shelters/{shelter}/pets', [
        ShelterPetController::class,
        'store'
    ]);

    Route::put('/shelters/{shelter}/pets/{pet}', [
        ShelterPetController::class,
        'update'
    ]);

    Route::delete('/shelters/{shelter}/pets/{pet}', [
        ShelterPetController::class,
        'destroy'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ADMIN REPORTS
    |--------------------------------------------------------------------------
    */

    Route::get('/reports', [
        ReportController::class,
        'index'
    ]);


    /*
    |--------------------------------------------------------------------------
    | ADMIN COMPLAINT MANAGEMENT
    |--------------------------------------------------------------------------
    */

    Route::get('/complaints', [
        AdminComplaintController::class,
        'index'
    ]);

    Route::get('/complaints/{id}', [
        AdminComplaintController::class,
        'show'
    ]);

    Route::put('/complaints/{id}', [
        AdminComplaintController::class,
        'update'
    ]);

});