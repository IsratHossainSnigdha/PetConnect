<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\ShelterRegisterController;

use App\Http\Controllers\Admin\ShelterController;
use App\Http\Controllers\Admin\StatsController;

// Aliased because Api\ComplaintController (the adopter one) already uses the
// plain name ComplaintController further down this file.
use App\Http\Controllers\Admin\ComplaintController as AdminComplaintController;
use App\Http\Controllers\Admin\ReportController;
use App\Http\Controllers\Admin\ShelterPetController;

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

    /*
    | The pets living at one shelter.
    |
    | These are NESTED under the shelter, so the URL itself says which shelter
    | the animal belongs to:
    |
    |     GET    /api/admin/shelters/5/pets
    |     POST   /api/admin/shelters/5/pets
    |     PUT    /api/admin/shelters/5/pets/9
    |     DELETE /api/admin/shelters/5/pets/9
    |
    | This is the ER diagram's "lives" relationship expressed as a URL:
    | a pet is always reached through the shelter it lives in.
    */
    Route::get('/admin/shelters/{shelter}/pets', [
        ShelterPetController::class,
        'index'
    ]);

    Route::post('/admin/shelters/{shelter}/pets', [
        ShelterPetController::class,
        'store'
    ]);

    Route::put('/admin/shelters/{shelter}/pets/{pet}', [
        ShelterPetController::class,
        'update'
    ]);

    Route::delete('/admin/shelters/{shelter}/pets/{pet}', [
        ShelterPetController::class,
        'destroy'
    ]);

    // Admin list for the "Assigned Admin" dropdown (issue #17)
    Route::get('/admin/admins', [
        ShelterController::class,
        'admins'
    ]);

    // Admin reports (issue #42)
    Route::get('/admin/reports', [
        ReportController::class,
        'index'
    ]);

    // Admin complaints review (issue #41)
    Route::get('/admin/complaints', [
        AdminComplaintController::class,
        'index'
    ]);

    Route::get('/admin/complaints/{id}', [
        AdminComplaintController::class,
        'show'
    ]);

    Route::put('/admin/complaints/{id}', [
        AdminComplaintController::class,
        'update'
    ]);

    Route::get('/admin/stats', [
        StatsController::class,
        'index'
    ]);
});