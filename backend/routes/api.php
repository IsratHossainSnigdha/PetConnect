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
use App\Http\Controllers\Auth\Adopter\AdopterDashboardController;

// ========================================
// API CONTROLLERS
// ========================================
use App\Http\Controllers\Api\ComplaintController;
use App\Http\Controllers\Api\AdoptionApplicationController;
use App\Http\Controllers\Api\PetController;
use App\Http\Controllers\Api\ShelterController as ApiShelterController;
use App\Http\Controllers\Api\ProfileController;
use App\Http\Controllers\Api\NotificationController;
use App\Http\Controllers\Api\ShelterApplicationController;


// ========================================
// PUBLIC ROUTES
// ========================================

Route::post('/auth/login', [AuthController::class, 'login']);

Route::post('/auth/register', [RegisterController::class, 'register']);

Route::post('/auth/admin/register', [AdminRegisterController::class, 'register']);

Route::post('/auth/shelter/register', [ShelterRegisterController::class, 'register']);

Route::post('/auth/staff/register', [ShelterRegisterController::class, 'register']);

Route::get('/pets', [PetController::class, 'index']);

Route::get('/shelters', [ApiShelterController::class, 'index']);


// ========================================
// AUTHENTICATED ROUTES
// ========================================

Route::middleware('auth:sanctum')->group(function () {

    // ========================================
    // AUTH
    // ========================================

    Route::get('/auth/me', [AuthController::class, 'me']);

    Route::put('/auth/profile', [AuthController::class, 'updateProfile']);

    Route::put('/auth/password', [AuthController::class, 'updatePassword']);

    Route::post('/auth/logout', [AuthController::class, 'logout']);


    // ========================================
    // USER
    // ========================================

    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/user/profile', [ProfileController::class, 'show']);

    Route::put('/user/profile', [ProfileController::class, 'update']);


    // ========================================
    // ADOPTER DASHBOARD
    // ========================================

    Route::get(
        '/adopter/dashboard',
        [AdopterDashboardController::class, 'index']
    );


    // ========================================
    // ADOPTER APPLICATIONS
    // ========================================

    Route::get(
        '/adopter/applications',
        [AdoptionApplicationController::class, 'index']
    );

    Route::post(
        '/adopter/applications',
        [AdoptionApplicationController::class, 'store']
    );

    // Must be before /adopter/applications/{id}
    Route::get(
        '/adopter/applications/process',
        [AdoptionApplicationController::class, 'processRequests']
    );

    Route::get(
        '/adopter/applications/{id}',
        [AdoptionApplicationController::class, 'show']
    );


    // ========================================
    // NOTIFICATIONS
    // ========================================

    Route::get(
        '/notifications',
        [NotificationController::class, 'index']
    );

    Route::put(
        '/notifications/{id}/read',
        [NotificationController::class, 'markAsRead']
    );


    // ========================================
    // USER COMPLAINTS
    // ========================================

    Route::get(
        '/complaints',
        [ComplaintController::class, 'index']
    );

    Route::post(
        '/complaints',
        [ComplaintController::class, 'store']
    );

    Route::get(
        '/complaints/{complaint}',
        [ComplaintController::class, 'show']
    );


    // ========================================
    // SHELTER DASHBOARD
    // ========================================

    // IMPORTANT:
    // Shelter dashboard now uses ShelterController
    // This ensures dashboard data is filtered by
    // the logged-in shelter staff's shelter_id.

    Route::get(
        '/shelter/dashboard',
        [ApiShelterController::class, 'dashboardStats']
    );


    // ========================================
    // SHELTER PETS
    // ========================================

    Route::get(
        '/shelter/pets/summary',
        [PetController::class, 'getShelterPetSummary']
    );

    Route::get(
        '/shelter/pets',
        [PetController::class, 'index']
    );

    Route::post(
        '/shelter/pets',
        [PetController::class, 'store']
    );

    Route::put(
        '/shelter/pets/{id}',
        [PetController::class, 'update']
    );

    Route::delete(
        '/shelter/pets/{id}',
        [PetController::class, 'destroy']
    );

    // নির্দিষ্ট পেটের মেডিকেল রেকর্ড দেখার জন্য (GET)
    Route::get('/shelter/pets/{id}/medical-records', [PetController::class, 'getMedicalRecords']);

    // নির্দিষ্ট পেটে নতুন মেডিকেল রেকর্ড যোগ করার জন্য (POST)
    Route::post('/shelter/pets/{id}/medical-records', [PetController::class, 'storeMedicalRecord']);


    // ========================================
    // SHELTER ADOPTION APPLICATIONS
    // ========================================

    // Get applications belonging to this shelter
    Route::get(
        '/shelter/applications',
        [ShelterApplicationController::class, 'index']
    );

    // Get one application
    Route::get(
        '/shelter/applications/{id}',
        [ShelterApplicationController::class, 'show']
    );

    // Approve application
    Route::put(
        '/shelter/applications/{id}/approve',
        [ShelterApplicationController::class, 'approve']
    );

    // Reject application
    Route::put(
        '/shelter/applications/{id}/reject',
        [ShelterApplicationController::class, 'reject']
    );
});


// ========================================
// ADMIN ROUTES
// ========================================

Route::middleware([
    'auth:sanctum',
    'admin'
])->prefix('admin')->group(function () {

    // ========================================
    // ADMIN DASHBOARD
    // ========================================

    Route::get(
        '/stats',
        [StatsController::class, 'index']
    );


    // ========================================
    // SHELTER MANAGEMENT
    // ========================================

    Route::apiResource(
        'shelters',
        AdminShelterController::class
    );

    Route::get(
        '/admins',
        [AdminShelterController::class, 'admins']
    );


    // ========================================
    // ADMIN PET MANAGEMENT
    // ========================================

    Route::get(
        '/shelters/{shelter}/pets',
        [ShelterPetController::class, 'index']
    );

    Route::post(
        '/shelters/{shelter}/pets',
        [ShelterPetController::class, 'store']
    );

    Route::put(
        '/shelters/{shelter}/pets/{pet}',
        [ShelterPetController::class, 'update']
    );

    Route::delete(
        '/shelters/{shelter}/pets/{pet}',
        [ShelterPetController::class, 'destroy']
    );


    // ========================================
    // REPORTS
    // ========================================

    Route::get(
        '/reports',
        [ReportController::class, 'index']
    );


    // ========================================
    // ADMIN COMPLAINTS
    // ========================================

    Route::get(
        '/complaints',
        [AdminComplaintController::class, 'index']
    );

    // Runs the sp_escalate_old_complaints loop inside MySQL, which flags every
    // complaint that has been Pending for more than 7 days.
    //
    // POST, not GET, because it CHANGES data. A GET is supposed to be safe to
    // repeat - browsers and proxies pre-fetch them - and this one writes.
    Route::post(
        '/complaints/escalate',
        [AdminComplaintController::class, 'escalateOld']
    );

    Route::get(
        '/complaints/{id}',
        [AdminComplaintController::class, 'show']
    );

    Route::put(
        '/complaints/{id}',
        [AdminComplaintController::class, 'update']
    );
});