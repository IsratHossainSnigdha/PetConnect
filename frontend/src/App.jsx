import React, { useEffect, useState } from "react";
import { Routes, Route } from "react-router-dom";

// ========================================
// LANDING PAGE
// ========================================
import LandingPage from "./pages/LandingPage/landingPage";

// ========================================
// LOGIN
// ========================================
import LoginPage from "./pages/LoginPage/loginPage";

// ========================================
// AUTH GUARD
// ========================================
import RequireAuth from "./components/RequireAuth";

// ========================================
// SIGNUP PAGES
// ========================================
import GlobalSignup from "./pages/SignupPages/globalSignup";
import AdopterSignup from "./pages/SignupPages/adopterSignup";
import ShelterSignup from "./pages/SignupPages/shelterSignup";
import AdminSignup from "./pages/SignupPages/adminSignup";

// ========================================
// DASHBOARDS & PET MANAGEMENT
// ========================================
import AdopterDashboard from "./pages/DashboardPages/adopterDashboard";
import ShelterDashboard from "./pages/DashboardPages/shelterDashboard";
import AdminDashboard from "./pages/DashboardPages/adminDashboard";
import AddPet from "./pages/DashboardPages/AddPet";
import ManagePets from "./pages/DashboardPages/ManagePets";
import PetMedicalRecords from "./pages/DashboardPages/PetMedicalRecords";

// ========================================
// PROFILE PAGES
// ========================================
import MyProfile from "./pages/DashboardPages/MyProfile";
import AdminProfile from "./pages/ProfilePages/adminProfile";
import AdopterProfile from "./pages/ProfilePages/adopterProfile";

// ========================================
// APPLICATION PAGES
// ========================================
import AdopterApplications from "./pages/ApplicationPages/adopterApplications";

// ========================================
// COMPLAINT PAGES
// ========================================
import AdopterComplaints from "./pages/ComplaintPages/adopterComplaints";
import AdminComplaints from "./pages/ComplaintPages/adminComplaints";

// ========================================
// REPORT PAGES
// ========================================
import AdminReports from "./pages/ReportPages/adminReports";

// ========================================
// SHELTER PAGES
// ========================================
import AdminShelters from "./pages/ShelterPages/adminShelters";
import ShelterDetail from "./pages/ShelterPages/shelterDetail";

// ========================================
// SETTINGS
// ========================================
import Settings from "./pages/Settings";

// ========================================
// CHATBOT
// ========================================
import Chatbot from "./components/Chatbot";


export default function App() {

    // ========================================
    // USER
    // ========================================

    const [user, setUser] = useState(() => {
        try {
            // New authentication system
            const savedUser =
                localStorage.getItem("petconnect_user") ||
                // Backward compatibility
                localStorage.getItem("user");

            return savedUser ? JSON.parse(savedUser) : null;

        } catch (error) {

            console.error("Error loading user:", error);

            return null;
        }
    });


    // ========================================
    // DARK MODE
    // ========================================

    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem("darkMode") === "true";
    });


    // ========================================
    // TOGGLE DARK MODE
    // ========================================

    const toggleDarkMode = () => {
        setDarkMode((previous) => !previous);
    };


    // ========================================
    // SAVE DARK MODE
    // ========================================

    useEffect(() => {

        localStorage.setItem(
            "darkMode",
            darkMode.toString()
        );

    }, [darkMode]);


    // ========================================
    // SAVE USER
    // ========================================

    useEffect(() => {

        if (user) {

            // New authentication storage
            localStorage.setItem(
                "petconnect_user",
                JSON.stringify(user)
            );

            // Backward compatibility with older pages
            localStorage.setItem(
                "user",
                JSON.stringify(user)
            );
        }

    }, [user]);


    // ========================================
    // APP
    // ========================================

    return (
        <>
            <Routes>

                {/* ========================================
                    LANDING PAGE
                ======================================== */}

                <Route
                    path="/"
                    element={<LandingPage />}
                />


                {/* ========================================
                    LOGIN
                ======================================== */}

                <Route
                    path="/login"
                    element={
                        <LoginPage setUser={setUser} />
                    }
                />


                {/* ========================================
                    LOGIN COMPATIBILITY ROUTE
                ======================================== */}

                <Route
                    path="/auth/login"
                    element={
                        <LoginPage setUser={setUser} />
                    }
                />


                {/* ========================================
                    SIGNUP
                ======================================== */}

                <Route
                    path="/signup"
                    element={<GlobalSignup />}
                />

                <Route
                    path="/signup/adopter"
                    element={<AdopterSignup />}
                />

                <Route
                    path="/signup/shelter"
                    element={<ShelterSignup />}
                />

                <Route
                    path="/signup/staff"
                    element={<ShelterSignup />}
                />

                <Route
                    path="/signup/admin"
                    element={<AdminSignup />}
                />


                {/* ========================================
                    ADOPTER ROUTES
                ======================================== */}

                {/* ADOPTER DASHBOARD */}

                <Route
                    path="/dashboard/adopter"
                    element={
                        <RequireAuth>
                            <AdopterDashboard
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADOPTER APPLICATIONS */}

                <Route
                    path="/applications/adopter"
                    element={
                        <RequireAuth>
                            <AdopterApplications
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADOPTER COMPLAINTS */}

                <Route
                    path="/complaints/adopter"
                    element={
                        <RequireAuth>
                            <AdopterComplaints
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADOPTER PROFILE */}

                <Route
                    path="/profile/adopter"
                    element={
                        <RequireAuth>
                            <AdopterProfile
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ========================================
                    SHELTER ROUTES
                ======================================== */}

                {/* SHELTER DASHBOARD */}

                <Route
                    path="/shelter/dashboard"
                    element={
                        <RequireAuth role="shelter_staff">
                            <ShelterDashboard
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* OLD SHELTER DASHBOARD ROUTE */}

                <Route
                    path="/dashboard/shelter"
                    element={
                        <RequireAuth role="shelter_staff">
                            <ShelterDashboard
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADD PET */}

                <Route
                    path="/shelter/pets/add"
                    element={
                        <RequireAuth role="shelter_staff">
                            <AddPet
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* OLD ADD PET ROUTE */}

                <Route
                    path="/dashboard/shelter/add-pet"
                    element={
                        <RequireAuth role="shelter_staff">
                            <AddPet
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* MANAGE PETS */}

                <Route
                    path="/shelter/pets"
                    element={
                        <RequireAuth role="shelter_staff">
                            <ManagePets
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* PET MEDICAL RECORDS */}

                <Route
                    path="/shelter/pets/:id/medical-records"
                    element={
                        <RequireAuth role="shelter_staff">
                            <PetMedicalRecords
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* OLD MANAGE PETS ROUTE */}

                <Route
                    path="/dashboard/shelter/manage-pets"
                    element={
                        <RequireAuth role="shelter_staff">
                            <ManagePets
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* SHELTER APPLICATIONS */}

                <Route
                    path="/shelter/applications"
                    element={
                        <RequireAuth role="shelter_staff">
                            <ShelterApplicationsPage />
                        </RequireAuth>
                    }
                />


                {/* SHELTER PROFILE */}

                <Route
                    path="/profile/shelter"
                    element={
                        <RequireAuth role="shelter_staff">
                            <MyProfile
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* GENERIC PROFILE */}

                <Route
                    path="/profile"
                    element={
                        <RequireAuth>
                            <MyProfile
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ========================================
                    SETTINGS
                ======================================== */}

                <Route
                    path="/settings"
                    element={
                        <RequireAuth>
                            <Settings
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ========================================
                    ADMIN ROUTES
                ======================================== */}

                {/* ADMIN DASHBOARD */}

                <Route
                    path="/dashboard/admin"
                    element={
                        <RequireAuth role="platform_admin">
                            <AdminDashboard
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADMIN PROFILE */}

                <Route
                    path="/profile/admin"
                    element={
                        <RequireAuth role="platform_admin">
                            <MyProfile
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADMIN SHELTER MANAGEMENT */}

                <Route
                    path="/shelters/admin"
                    element={
                        <RequireAuth role="platform_admin">
                            <AdminShelters
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* SHELTER DETAILS */}

                <Route
                    path="/shelters/admin/:id"
                    element={
                        <RequireAuth role="platform_admin">
                            <ShelterDetail
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADMIN COMPLAINTS */}

                <Route
                    path="/complaints/admin"
                    element={
                        <RequireAuth role="platform_admin">
                            <AdminComplaints
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ADMIN REPORTS */}

                <Route
                    path="/reports/admin"
                    element={
                        <RequireAuth role="platform_admin">
                            <AdminReports
                                darkMode={darkMode}
                                toggleDarkMode={toggleDarkMode}
                            />
                        </RequireAuth>
                    }
                />


                {/* ========================================
                    404
                ======================================== */}

                <Route
                    path="*"
                    element={
                        <div
                            style={{
                                minHeight: "100vh",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                                flexDirection: "column",
                                fontFamily: "Arial, sans-serif",
                            }}
                        >
                            <h1>404</h1>
                            <p>Page Not Found</p>
                        </div>
                    }
                />

            </Routes>


            {/* ========================================
                PETCONNECT AI CHATBOT
            ======================================== */}

            <Chatbot />

        </>
    );
}


// ========================================
// SHELTER APPLICATIONS PAGE
// ========================================

function ShelterApplicationsPage() {

    return (
        <div
            style={{
                minHeight: "100vh",
                padding: "40px",
                fontFamily: "Arial, sans-serif",
            }}
        >

            <h1>Adoption Requests</h1>

            <p>
                Shelter adoption requests are available
                through the shelter dashboard.
            </p>

        </div>
    );
}
