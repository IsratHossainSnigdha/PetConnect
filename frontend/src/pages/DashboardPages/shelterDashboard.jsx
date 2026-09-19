import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
    Dog,
    LayoutDashboard,
    PawPrint,
    User,
    Bell,
    LogOut,
    Sun,
    Moon,
    Menu,
    X,
    Clock,
    CheckCircle,
    XCircle,
    ChevronRight,
} from "lucide-react";

import { apiFetch } from "../../api/client";
import { logout } from "../../api/auth";

import "./shelterDashboard.css";

export default function ShelterDashboard({
    darkMode,
    toggleDarkMode,
}) {
    const navigate = useNavigate();

    // ========================================
    // STATE
    // ========================================

    const [dashboardData, setDashboardData] = useState({
        stats: {
            total: 0,
            available: 0,
            treatment: 0,
            adopted: 0,
            pending: 0,
        },
        pets: [],
        adoptionRequests: [],
    });

    const [notifications, setNotifications] = useState([]);

    const [loading, setLoading] = useState(true);
    const [notificationLoading, setNotificationLoading] =
        useState(false);

    const [error, setError] = useState("");
    const [notificationError, setNotificationError] =
        useState("");

    const [processingId, setProcessingId] = useState(null);

    const [sidebarOpen, setSidebarOpen] = useState(false);

    // ========================================
    // LOAD DASHBOARD
    // ========================================

    useEffect(() => {
        loadDashboard();
        loadNotifications();
    }, []);

    // ========================================
    // LOAD DASHBOARD DATA
    // ========================================

    const loadDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const data = await apiFetch(
                "/shelter/dashboard"
            );

            setDashboardData({
                stats: {
                    total: data?.stats?.total ?? 0,
                    available:
                        data?.stats?.available ?? 0,
                    treatment:
                        data?.stats?.treatment ?? 0,
                    adopted:
                        data?.stats?.adopted ?? 0,
                    pending:
                        data?.stats?.pending ?? 0,
                },

                pets: Array.isArray(data?.pets)
                    ? data.pets
                    : [],

                adoptionRequests:
                    Array.isArray(
                        data?.adoptionRequests
                    )
                        ? data.adoptionRequests
                        : [],
            });
        } catch (err) {
            console.error(
                "Failed to load shelter dashboard:",
                err
            );

            setError(
                err?.message ||
                    "Failed to load dashboard."
            );
        } finally {
            setLoading(false);
        }
    };

    // ========================================
    // LOAD NOTIFICATIONS
    // ========================================

    const loadNotifications = async () => {
        try {
            setNotificationLoading(true);
            setNotificationError("");

            const data = await apiFetch(
                "/notifications"
            );

            const notificationList = Array.isArray(data)
                ? data
                : Array.isArray(data?.notifications)
                ? data.notifications
                : [];

            setNotifications(notificationList);
        } catch (err) {
            console.error(
                "Failed to load notifications:",
                err
            );

            setNotificationError(
                err?.message ||
                    "Failed to load notifications."
            );
        } finally {
            setNotificationLoading(false);
        }
    };

    // ========================================
    // MARK NOTIFICATION AS READ
    // ========================================

    const markNotificationAsRead = async (
        notificationId
    ) => {
        try {
            await apiFetch(
                `/notifications/${notificationId}/read`,
                {
                    method: "PUT",
                }
            );

            setNotifications((previous) =>
                previous.map((notification) =>
                    notification.id ===
                    notificationId
                        ? {
                              ...notification,
                              is_read: true,
                              read_at:
                                  new Date().toISOString(),
                          }
                        : notification
                )
            );
        } catch (err) {
            console.error(
                "Failed to mark notification as read:",
                err
            );
        }
    };

    // ========================================
    // APPROVE APPLICATION
    // ========================================

    const handleApprove = async (
        applicationId
    ) => {
        if (!applicationId) return;

        try {
            setProcessingId(applicationId);

            await apiFetch(
                `/shelter/applications/${applicationId}/approve`,
                {
                    method: "PUT",
                }
            );

            await loadDashboard();
            await loadNotifications();
        } catch (err) {
            console.error(
                "Failed to approve application:",
                err
            );

            alert(
                err?.message ||
                    "Failed to approve application."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // ========================================
    // REJECT APPLICATION
    // ========================================

    const handleReject = async (
        applicationId
    ) => {
        if (!applicationId) return;

        try {
            setProcessingId(applicationId);

            await apiFetch(
                `/shelter/applications/${applicationId}/reject`,
                {
                    method: "PUT",
                }
            );

            await loadDashboard();
            await loadNotifications();
        } catch (err) {
            console.error(
                "Failed to reject application:",
                err
            );

            alert(
                err?.message ||
                    "Failed to reject application."
            );
        } finally {
            setProcessingId(null);
        }
    };

    // ========================================
    // LOGOUT
    // ========================================

    const handleLogout = async () => {
        try {
            await logout();
        } finally {
            navigate("/login");
        }
    };

    // ========================================
    // NAVIGATION
    // ========================================

    const goTo = (path) => {
        setSidebarOpen(false);
        navigate(path);
    };

    // ========================================
    // STATUS CLASS
    // ========================================

    const getStatusClass = (status) => {
        const normalized =
            String(status || "")
                .toLowerCase();

        if (normalized === "approved") {
            return "status-approved";
        }

        if (normalized === "rejected") {
            return "status-rejected";
        }

        return "status-pending";
    };

    // ========================================
    // FORMAT STATUS
    // ========================================

    const formatStatus = (status) => {
        if (!status) return "Pending";

        return (
            String(status)
                .charAt(0)
                .toUpperCase() +
            String(status)
                .slice(1)
                .toLowerCase()
        );
    };

    // ========================================
    // UNREAD NOTIFICATIONS
    // ========================================

    const unreadCount = notifications.filter(
        (notification) =>
            !notification.is_read &&
            !notification.read_at
    ).length;

    // ========================================
    // SIDEBAR
    // ========================================

    const sidebarItems = [
        {
            label: "Dashboard",
            icon: <LayoutDashboard size={20} />,
            path: "/shelter/dashboard",
        },
        {
            label: "Manage Pets",
            icon: <PawPrint size={20} />,
            path: "/shelter/pets",
        },
        {
            label: "My Profile",
            icon: <User size={20} />,
            path: "/profile",
        },
    ];

    // ========================================
    // LOADING
    // ========================================

    if (loading) {
        return (
            <div
                className={
                    darkMode
                        ? "shelter-dashboard dark"
                        : "shelter-dashboard"
                }
            >
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        );
    }

    // ========================================
    // RENDER
    // ========================================

    return (
        <div
            className={
                darkMode
                    ? "shelter-dashboard dark"
                    : "shelter-dashboard"
            }
        >
            {/* ========================================
                MOBILE OVERLAY
            ======================================== */}

            {sidebarOpen && (
                <div
                    className="sidebar-overlay"
                    onClick={() =>
                        setSidebarOpen(false)
                    }
                />
            )}

            {/* ========================================
                SIDEBAR
            ======================================== */}

            <aside
                className={`shelter-sidebar ${
                    sidebarOpen
                        ? "sidebar-open"
                        : ""
                }`}
            >
                <div className="sidebar-header">
                    <div className="brand">
                        <div className="brand-icon">
                            <Dog size={24} />
                        </div>

                        <span>
                            PetConnect
                        </span>
                    </div>

                    <button
                        className="mobile-close-button"
                        onClick={() =>
                            setSidebarOpen(false)
                        }
                    >
                        <X size={22} />
                    </button>
                </div>

                {/* NAVIGATION */}

                <nav className="sidebar-nav">
                    {sidebarItems.map(
                        (item) => (
                            <button
                                key={item.path}
                                className={
                                    item.path ===
                                    "/shelter/dashboard"
                                        ? "sidebar-item active"
                                        : "sidebar-item"
                                }
                                onClick={() =>
                                    goTo(
                                        item.path
                                    )
                                }
                            >
                                {item.icon}

                                <span>
                                    {item.label}
                                </span>
                            </button>
                        )
                    )}
                </nav>

                {/* SIDEBAR BOTTOM */}

                <div className="sidebar-bottom">
                    <button
                        className="sidebar-item logout-item"
                        onClick={
                            handleLogout
                        }
                    >
                        <LogOut size={20} />

                        <span>
                            Logout
                        </span>
                    </button>
                </div>
            </aside>

            {/* ========================================
                MAIN CONTENT
            ======================================== */}

            <main className="shelter-main">

                {/* ========================================
                    TOP BAR
                ======================================== */}

                <header className="shelter-topbar">
                    <div className="topbar-left">
                        <button
                            className="mobile-menu-button"
                            onClick={() =>
                                setSidebarOpen(
                                    true
                                )
                            }
                        >
                            <Menu size={22} />
                        </button>

                        <div>
                            <h1>
                                Shelter Dashboard
                            </h1>

                            <p>
                                Manage your shelter
                                and adoption
                                activities.
                            </p>
                        </div>
                    </div>

                    <div className="topbar-actions">

                        {/* NOTIFICATIONS */}

                        <div className="notification-wrapper">
                            <button
                                className="icon-button"
                                onClick={() =>
                                    document
                                        .getElementById(
                                            "notifications-section"
                                        )
                                        ?.scrollIntoView(
                                            {
                                                behavior:
                                                    "smooth",
                                            }
                                        )
                                }
                            >
                                <Bell size={20} />

                                {unreadCount >
                                    0 && (
                                    <span className="notification-badge">
                                        {unreadCount >
                                        9
                                            ? "9+"
                                            : unreadCount}
                                    </span>
                                )}
                            </button>
                        </div>

                        {/* DARK MODE */}

                        <button
                            className="icon-button"
                            onClick={
                                toggleDarkMode
                            }
                            title={
                                darkMode
                                    ? "Light mode"
                                    : "Dark mode"
                            }
                        >
                            {darkMode ? (
                                <Sun size={20} />
                            ) : (
                                <Moon size={20} />
                            )}
                        </button>
                    </div>
                </header>

                {/* ========================================
                    CONTENT
                ======================================== */}

                <div className="dashboard-content">

                    {/* ERROR */}

                    {error && (
                        <div className="dashboard-error">
                            <XCircle size={20} />

                            <span>
                                {error}
                            </span>

                            <button
                                onClick={
                                    loadDashboard
                                }
                            >
                                Try Again
                            </button>
                        </div>
                    )}

                    {/* ====================================
                        WELCOME
                    ==================================== */}

                    <section className="welcome-section">
                        <div>
                            <h2>
                                Welcome back!
                            </h2>

                            <p>
                                Here's what's
                                happening at your
                                shelter today.
                            </p>
                        </div>
                    </section>

                    {/* ====================================
                        STAT CARDS
                    ==================================== */}

                    <section className="stats-grid">

                        {/* TOTAL */}

                        <div className="stat-card">
                            <div className="stat-icon total-icon">
                                <PawPrint size={24} />
                            </div>

                            <div className="stat-info">
                                <span>
                                    Total Pets
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .stats
                                            .total
                                    }
                                </strong>
                            </div>
                        </div>

                        {/* AVAILABLE */}

                        <div className="stat-card">
                            <div className="stat-icon available-icon">
                                <CheckCircle
                                    size={24}
                                />
                            </div>

                            <div className="stat-info">
                                <span>
                                    Available
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .stats
                                            .available
                                    }
                                </strong>
                            </div>
                        </div>

                        {/* TREATMENT */}

                        <div className="stat-card">
                            <div className="stat-icon treatment-icon">
                                <Clock size={24} />
                            </div>

                            <div className="stat-info">
                                <span>
                                    In Treatment
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .stats
                                            .treatment
                                    }
                                </strong>
                            </div>
                        </div>

                        {/* ADOPTED */}

                        <div className="stat-card">
                            <div className="stat-icon adopted-icon">
                                <Dog size={24} />
                            </div>

                            <div className="stat-info">
                                <span>
                                    Adopted
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .stats
                                            .adopted
                                    }
                                </strong>
                            </div>
                        </div>

                        {/* PENDING */}

                        <div className="stat-card">
                            <div className="stat-icon pending-icon">
                                <Clock size={24} />
                            </div>

                            <div className="stat-info">
                                <span>
                                    Pending Requests
                                </span>

                                <strong>
                                    {
                                        dashboardData
                                            .stats
                                            .pending
                                    }
                                </strong>
                            </div>
                        </div>

                    </section>

                    {/* ====================================
                        TWO COLUMN CONTENT
                    ==================================== */}

                    <div className="dashboard-grid">

                        {/* ==================================
                            ADOPTION REQUESTS
                        ================================== */}

                        <section className="dashboard-card requests-card">

                            <div className="card-header">
                                <div>
                                    <h3>
                                        Adoption
                                        Requests
                                    </h3>

                                    <p>
                                        Recent
                                        applications
                                        for your
                                        pets.
                                    </p>
                                </div>

                                <span className="card-count">
                                    {
                                        dashboardData
                                            .adoptionRequests
                                            .length
                                    }
                                </span>
                            </div>

                            <div className="requests-list">

                                {dashboardData
                                    .adoptionRequests
                                    .length ===
                                    0 ? (
                                    <div className="empty-state">
                                        <PawPrint
                                            size={36}
                                        />

                                        <h4>
                                            No adoption
                                            requests
                                        </h4>

                                        <p>
                                            There are
                                            currently
                                            no adoption
                                            requests.
                                        </p>
                                    </div>
                                ) : (
                                    dashboardData.adoptionRequests.map(
                                        (
                                            request
                                        ) => {
                                            const status =
                                                String(
                                                    request.status ||
                                                        "pending"
                                                ).toLowerCase();

                                            const isPending =
                                                status ===
                                                "pending";

                                            const isProcessing =
                                                processingId ===
                                                request.id;

                                            return (
                                                <div
                                                    className="request-item"
                                                    key={
                                                        request.id
                                                    }
                                                >
                                                    <div className="request-avatar">
                                                        <User
                                                            size={
                                                                20
                                                            }
                                                        />
                                                    </div>

                                                    <div className="request-info">
                                                        <h4>
                                                            {
                                                                request.name
                                                            }
                                                        </h4>

                                                        <p>
                                                            {
                                                                request.email
                                                            }
                                                        </p>

                                                        <div className="request-pet">
                                                            <PawPrint
                                                                size={
                                                                    15
                                                                }
                                                            />

                                                            <span>
                                                                Applied
                                                                for{" "}
                                                                <strong>
                                                                    {
                                                                        request.pet
                                                                    }
                                                                </strong>
                                                            </span>
                                                        </div>

                                                        <span className="request-date">
                                                            {
                                                                request.date
                                                            }
                                                        </span>
                                                    </div>

                                                    <div className="request-actions">

                                                        <span
                                                            className={`request-status ${getStatusClass(
                                                                status
                                                            )}`}
                                                        >
                                                            {formatStatus(
                                                                status
                                                            )}
                                                        </span>

                                                        {isPending && (
                                                            <div className="approval-buttons">

                                                                <button
                                                                    className="approve-button"
                                                                    disabled={
                                                                        isProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        handleApprove(
                                                                            request.id
                                                                        )
                                                                    }
                                                                >
                                                                    <CheckCircle
                                                                        size={
                                                                            16
                                                                        }
                                                                    />

                                                                    {isProcessing
                                                                        ? "Processing..."
                                                                        : "Approve"}
                                                                </button>

                                                                <button
                                                                    className="reject-button"
                                                                    disabled={
                                                                        isProcessing
                                                                    }
                                                                    onClick={() =>
                                                                        handleReject(
                                                                            request.id
                                                                        )
                                                                    }
                                                                >
                                                                    <XCircle
                                                                        size={
                                                                            16
                                                                        }
                                                                    />

                                                                    Reject
                                                                </button>

                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        }
                                    )
                                )}

                            </div>

                        </section>

                        {/* ==================================
                            RECENT PETS
                        ================================== */}

                        <section className="dashboard-card pets-card">

                            <div className="card-header">
                                <div>
                                    <h3>
                                        Recent Pets
                                    </h3>

                                    <p>
                                        Recently added
                                        pets.
                                    </p>
                                </div>

                                <button
                                    className="view-all-button"
                                    onClick={() =>
                                        goTo(
                                            "/shelter/pets"
                                        )
                                    }
                                >
                                    View All
                                    <ChevronRight
                                        size={16}
                                    />
                                </button>
                            </div>

                            <div className="pets-list">

                                {dashboardData
                                    .pets.length ===
                                0 ? (
                                    <div className="empty-state">
                                        <PawPrint
                                            size={36}
                                        />

                                        <h4>
                                            No pets yet
                                        </h4>

                                        <p>
                                            Add your
                                            first pet
                                            to the
                                            shelter.
                                        </p>

                                        <button
                                            className="add-pet-button"
                                            onClick={() =>
                                                goTo(
                                                    "/shelter/pets/add"
                                                )
                                            }
                                        >
                                            Add Pet
                                        </button>
                                    </div>
                                ) : (
                                    dashboardData.pets.map(
                                        (pet) => (
                                            <div
                                                className="pet-item"
                                                key={
                                                    pet.id
                                                }
                                            >
                                                <div className="pet-image-wrapper">

                                                    {pet.image ? (
                                                        <img
                                                            src={
                                                                pet.image
                                                            }
                                                            alt={
                                                                pet.name
                                                            }
                                                            className="pet-image"
                                                        />
                                                    ) : (
                                                        <div className="pet-image-placeholder">
                                                            <PawPrint
                                                                size={
                                                                    24
                                                                }
                                                            />
                                                        </div>
                                                    )}

                                                </div>

                                                <div className="pet-info">
                                                    <h4>
                                                        {
                                                            pet.name
                                                        }
                                                    </h4>

                                                    <p>
                                                        {pet.type ||
                                                            "Pet"}

                                                        {pet.breed
                                                            ? ` • ${pet.breed}`
                                                            : ""}
                                                    </p>

                                                    <span
                                                        className={`pet-status ${getStatusClass(
                                                            pet.status
                                                        )}`}
                                                    >
                                                        {formatStatus(
                                                            pet.status
                                                        )}
                                                    </span>
                                                </div>
                                            </div>
                                        )
                                    )
                                )}

                            </div>

                        </section>

                    </div>

                    {/* ====================================
                        NOTIFICATIONS
                    ==================================== */}

                    <section
                        id="notifications-section"
                        className="dashboard-card notifications-card"
                    >

                        <div className="card-header">
                            <div>
                                <h3>
                                    Notifications
                                </h3>

                                <p>
                                    Recent updates
                                    and activities.
                                </p>
                            </div>

                            <button
                                className="refresh-button"
                                onClick={
                                    loadNotifications
                                }
                                disabled={
                                    notificationLoading
                                }
                            >
                                {notificationLoading
                                    ? "Loading..."
                                    : "Refresh"}
                            </button>
                        </div>

                        {notificationError && (
                            <div className="notification-error">
                                {notificationError}
                            </div>
                        )}

                        <div className="notifications-list">

                            {notifications.length ===
                            0 ? (
                                <div className="empty-state">
                                    <Bell
                                        size={36}
                                    />

                                    <h4>
                                        No notifications
                                    </h4>

                                    <p>
                                        You're all
                                        caught up.
                                    </p>
                                </div>
                            ) : (
                                notifications
                                    .slice(0, 8)
                                    .map(
                                        (
                                            notification
                                        ) => {
                                            const unread =
                                                !notification.is_read &&
                                                !notification.read_at;

                                            return (
                                                <div
                                                    key={
                                                        notification.id
                                                    }
                                                    className={`notification-item ${
                                                        unread
                                                            ? "unread"
                                                            : ""
                                                    }`}
                                                    onClick={() => {
                                                        if (
                                                            unread
                                                        ) {
                                                            markNotificationAsRead(
                                                                notification.id
                                                            );
                                                        }
                                                    }}
                                                >
                                                    <div className="notification-icon">
                                                        <Bell
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    </div>

                                                    <div className="notification-content">
                                                        <h4>
                                                            {
                                                                notification.title
                                                            }
                                                        </h4>

                                                        <p>
                                                            {
                                                                notification.message
                                                            }
                                                        </p>

                                                        <span>
                                                            {notification.created_at
                                                                ? new Date(
                                                                      notification.created_at
                                                                  ).toLocaleString()
                                                                : ""}
                                                        </span>
                                                    </div>

                                                    {unread && (
                                                        <div className="unread-dot"></div>
                                                    )}
                                                </div>
                                            );
                                        }
                                    )
                            )}

                        </div>

                    </section>

                </div>
            </main>
        </div>
    );
}