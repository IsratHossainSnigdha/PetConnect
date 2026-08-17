<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

use App\Http\Controllers\Auth\AuthController;
use App\Http\Controllers\Auth\RegisterController;
use App\Http\Controllers\Auth\AdminRegisterController;
use App\Http\Controllers\Auth\ShelterRegisterController;

use App\Http\Controllers\Admin\ShelterController;
use App\Http\Controllers\Admin\StatsController;

/*
|==============================================================================
| PUBLIC ROUTES - no token required
|==============================================================================
|
| Signing up and logging in obviously cannot require you to be logged in
| already, so these sit outside the protected group below.
*/

Route::post('/auth/login', [AuthController::class, 'login']);

Route::post('/auth/register', [RegisterController::class, 'register']);
Route::post('/auth/admin/register', [AdminRegisterController::class, 'register']);
Route::post('/auth/shelter/register', [ShelterRegisterController::class, 'register']);


/*
|==============================================================================
| AUTHENTICATED ROUTES - a valid Bearer token is required
|==============================================================================
|
| The auth:sanctum middleware takes the token from the
|     Authorization: Bearer <token>
| header, looks up its hash in the `personal_access_tokens` table, and loads
| the owning user row. If no row matches, the request is rejected with 401 and
| the controller never runs.
|
| Any role may reach these - they only ever touch your OWN user row.
*/
Route::middleware('auth:sanctum')->group(function () {

    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);
    Route::put('/auth/password', [AuthController::class, 'updatePassword']);
    Route::post('/auth/logout', [AuthController::class, 'logout']);

    // Kept for backwards compatibility with anything already calling it.
    Route::get('/user', fn (Request $request) => $request->user());
});


/*
|==============================================================================
| ADMIN-ONLY ROUTES - valid token AND role = 'platform_admin'
|==============================================================================
|
| TWO middleware run in order, and each answers a different question:
|
|     auth:sanctum -> "who are you?"     (401 if the token is missing/invalid)
|     admin        -> "are you allowed?" (403 if role is not platform_admin)
|
| apiResource() registers all five CRUD routes in one line:
|
|   GET    /api/admin/shelters        -> index()    SELECT every shelter
|   POST   /api/admin/shelters        -> store()    INSERT one
|   GET    /api/admin/shelters/{id}   -> show()     SELECT one
|   PUT    /api/admin/shelters/{id}   -> update()   UPDATE one
|   DELETE /api/admin/shelters/{id}   -> destroy()  DELETE one
|
| Run `php artisan route:list` to see them all printed out.
*/
Route::middleware(['auth:sanctum', 'admin'])->group(function () {

    Route::apiResource('admin/shelters', ShelterController::class);

    Route::get('/admin/stats', [StatsController::class, 'index']);
});
