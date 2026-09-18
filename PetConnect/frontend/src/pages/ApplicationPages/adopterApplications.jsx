import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  Dog,
  LayoutDashboard,
  FileText,
  Settings,
  User,
  Search,
  Bell,
  Moon,
  Sun,
  LogOut,
  Clock,
  CheckCircle,
  XCircle,
  Heart,
  Flag,
  Plus,
  X,
  PawPrint,
} from "lucide-react";

import {
  apiFetch,
  clearSession,
} from "../../api/client";

import "./adopterApplications.css";

export default function AdopterApplications({
  darkMode,
  toggleDarkMode,
}) {
  const navigate = useNavigate();

  /* =========================
     STATE
  ========================= */

  const [search, setSearch] = useState("");

  const [applications, setApplications] = useState([]);

  const [pets, setPets] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [showModal, setShowModal] = useState(false);

  const [selectedPet, setSelectedPet] = useState("");

  const [submitting, setSubmitting] = useState(false);

  const [submitError, setSubmitError] = useState("");

  const [successMessage, setSuccessMessage] = useState("");

  /* =========================
     FETCH APPLICATIONS
  ========================= */

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch(
        "/adopter/applications"
      );

      setApplications(
        Array.isArray(data.applications)
          ? data.applications
          : []
      );
    } catch (error) {
      console.error(
        "Failed to fetch applications:",
        error
      );

      if (error.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      setError(
        error.message ||
          "Unable to load applications."
      );
    } finally {
      setLoading(false);
    }
  };

  /* =========================
     FETCH AVAILABLE PETS
  ========================= */

  const fetchPets = async () => {
    try {
      setSubmitError("");

      const data = await apiFetch("/pets");

      console.log(
        "Pets API response:",
        data
      );

      const petList = Array.isArray(data)
        ? data
        : data.pets || [];

      const availablePets = petList.filter(
        (pet) => {
          if (!pet.status) {
            return true;
          }

          return (
            String(pet.status).toLowerCase() ===
            "available"
          );
        }
      );

      console.log(
        "Available pets:",
        availablePets
      );

      setPets(availablePets);
    } catch (error) {
      console.error(
        "Failed to fetch pets:",
        error
      );

      if (error.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      setSubmitError(
        error.message ||
          "Unable to load available pets."
      );
    }
  };

  /* =========================
     OPEN CREATE MODAL
  ========================= */

  const openCreateModal = async () => {
    setSelectedPet("");
    setSubmitError("");
    setSuccessMessage("");
    setPets([]);

    setShowModal(true);

    await fetchPets();
  };

  /* =========================
     CLOSE MODAL
  ========================= */

  const closeModal = () => {
    if (submitting) {
      return;
    }

    setShowModal(false);
    setSelectedPet("");
    setSubmitError("");
    setSuccessMessage("");
    setPets([]);
  };

  /* =========================
     CREATE APPLICATION
  ========================= */

  const createApplication = async (event) => {
    event.preventDefault();

    if (!selectedPet) {
      setSubmitError(
        "Please select a pet."
      );

      return;
    }

    try {
      setSubmitting(true);
      setSubmitError("");
      setSuccessMessage("");

      const data = await apiFetch(
        "/adopter/applications",
        {
          method: "POST",

          body: JSON.stringify({
            pet_id: Number(selectedPet),
          }),
        }
      );

      if (data.application) {
        setApplications((previous) => [
          data.application,
          ...previous,
        ]);
      }

      setSuccessMessage(
        "Application submitted successfully!"
      );

      setSelectedPet("");

      await fetchApplications();

      setTimeout(() => {
        setShowModal(false);
        setSuccessMessage("");
        setPets([]);
      }, 1000);
    } catch (error) {
      console.error(
        "Failed to create application:",
        error
      );

      if (error.status === 401) {
        clearSession();
        navigate("/login");
        return;
      }

      setSubmitError(
        error.message ||
          "Unable to submit application."
      );
    } finally {
      setSubmitting(false);
    }
  };

  /* =========================
     SEARCH
  ========================= */

  const filteredApplications =
    applications.filter(
      (application) => {
        const searchValue =
          search.toLowerCase();

        const petName =
          application.pet?.name ||
          application.petName ||
          application.pet_name ||
          "";

        const petType =
          application.pet?.type ||
          application.type ||
          application.pet_type ||
          "";

        const breed =
          application.pet?.breed ||
          application.breed ||
          "";

        const shelter =
          application.pet?.shelter?.name ||
          application.shelter?.name ||
          application.shelter_name ||
          application.shelter ||
          "";

        const status =
          application.status || "";

        return (
          petName
            .toLowerCase()
            .includes(searchValue) ||

          petType
            .toLowerCase()
            .includes(searchValue) ||

          breed
            .toLowerCase()
            .includes(searchValue) ||

          shelter
            .toLowerCase()
            .includes(searchValue) ||

          status
            .toLowerCase()
            .includes(searchValue)
        );
      }
    );

  /* =========================
     APPLICATION HELPERS
  ========================= */

  const getPetName = (application) => {
    return (
      application.pet?.name ||
      application.petName ||
      application.pet_name ||
      "Unknown Pet"
    );
  };

  const getPetType = (application) => {
    return (
      application.pet?.type ||
      application.type ||
      application.pet_type ||
      application.pet?.breed ||
      application.breed ||
      "Pet"
    );
  };

  const getShelterName = (application) => {
    return (
      application.pet?.shelter?.name ||
      application.shelter?.name ||
      application.shelter_name ||
      application.shelter ||
      "Unknown Shelter"
    );
  };

  const formatDate = (date) => {
    if (!date) {
      return "N/A";
    }

    const parsedDate = new Date(date);

    if (
      Number.isNaN(
        parsedDate.getTime()
      )
    ) {
      return date;
    }

    return parsedDate.toLocaleDateString(
      "en-US",
      {
        month: "short",
        day: "numeric",
        year: "numeric",
      }
    );
  };

  /* =========================
     STATUS ICON
  ========================= */

  const getStatusIcon = (status) => {
    const normalizedStatus =
      (status || "").toLowerCase();

    if (
      normalizedStatus ===
      "approved"
    ) {
      return (
        <CheckCircle size={16} />
      );
    }

    if (
      normalizedStatus ===
      "rejected"
    ) {
      return (
        <XCircle size={16} />
      );
    }

    return (
      <Clock size={16} />
    );
  };

  /* =========================
     LOGOUT
  ========================= */

  const logout = async () => {
    try {
      await apiFetch(
        "/auth/logout",
        {
          method: "POST",
        }
      );
    } catch (error) {
      console.error(
        "Logout error:",
        error
      );
    } finally {
      clearSession();
      navigate("/login");
    }
  };

  /* =========================
     NAVIGATION
  ========================= */

  const goToComplaints = () => {
    navigate(
      "/complaints/adopter"
    );
  };

  /* =========================
     STATISTICS
  ========================= */

  const totalApplications =
    applications.length;

  const pendingApplications =
    applications.filter(
      (application) =>
        (
          application.status ||
          ""
        ).toLowerCase() ===
        "pending"
    ).length;

  const approvedApplications =
    applications.filter(
      (application) =>
        (
          application.status ||
          ""
        ).toLowerCase() ===
        "approved"
    ).length;

  /* =========================
     PAGE
  ========================= */

  return (
    <div
      className={`app-container ${
        darkMode ? "dark" : ""
      }`}
    >

      {/* =========================
          SIDEBAR
      ========================= */}

      <aside className="sidebar">

        {/* LOGO */}

        <div
          className="logo"
          onClick={() =>
            navigate(
              "/dashboard/adopter"
            )
          }
        >
          <div className="logo-icon">
            <Dog size={23} />
          </div>

          <div className="logo-text">
            PET
            <br />
            CONNECT
          </div>
        </div>

        {/* MENU */}

        <div className="menu">

          {/* DASHBOARD */}

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              navigate(
                "/dashboard/adopter"
              )
            }
          >
            <LayoutDashboard
              size={18}
            />

            <span>
              Dashboard
            </span>
          </button>

          {/* APPLICATIONS */}

          <button
            type="button"
            className="menu-item active"
            onClick={() =>
              navigate(
                "/applications/adopter"
              )
            }
          >
            <FileText
              size={18}
            />

            <span>
              My Applications
            </span>
          </button>

          {/* PROFILE */}

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              navigate(
                "/profile/adopter"
              )
            }
          >
            <User size={18} />

            <span>
              Profile
            </span>
          </button>

          {/* COMPLAINTS */}

          <button
            type="button"
            className="menu-item"
            onClick={
              goToComplaints
            }
          >
            <Flag size={18} />

            <span>
              Complaints
            </span>
          </button>

          {/* SETTINGS */}

          <button
            type="button"
            className="menu-item"
            onClick={() =>
              navigate(
                "/settings/adopter"
              )
            }
          >
            <Settings
              size={18}
            />

            <span>
              Settings
            </span>
          </button>

        </div>

        {/* LOGOUT */}

        <div className="sidebar-bottom">

          <button
            type="button"
            className="menu-item"
            onClick={logout}
          >
            <LogOut
              size={18}
            />

            <span>
              Logout
            </span>
          </button>

        </div>

      </aside>

      {/* =========================
          MAIN CONTENT
      ========================= */}

      <main className="main">

        {/* TOPBAR */}

        <header className="topbar">

          <div className="page-title">

            <h1>
              My Applications
            </h1>

            <p>
              Track your pet adoption
              applications
            </p>

          </div>

          <div className="top-actions">

            {/* DARK MODE */}

            <button
              type="button"
              className="icon-btn"
              onClick={
                toggleDarkMode
              }
              title="Toggle theme"
            >
              {darkMode ? (
                <Sun size={18} />
              ) : (
                <Moon size={18} />
              )}
            </button>

            {/* NOTIFICATION */}

            <button
              type="button"
              className="icon-btn"
              title="Notifications"
            >
              <Bell size={18} />
            </button>

            {/* PROFILE */}

            <button
              type="button"
              className="profile-btn"
              onClick={() =>
                navigate(
                  "/profile/adopter"
                )
              }
            >

              <div className="profile-avatar">
                <User size={18} />
              </div>

              <div className="profile-info">

                <div className="profile-name">
                  Adopter
                </div>

                <div className="profile-role">
                  Pet Adopter
                </div>

              </div>

            </button>

          </div>

        </header>

        {/* =========================
            PAGE CONTENT
        ========================= */}

        <section className="content">

          {/* PAGE HEADER */}

          <div className="applications-heading">

            <div>

              <h2>
                Adoption Applications
              </h2>

              <p>
                View and track all your
                submitted applications.
              </p>

            </div>

            {/* CREATE APPLICATION */}

            <button
              type="button"
              className="create-application-btn"
              onClick={
                openCreateModal
              }
            >
              <Plus size={18} />

              <span>
                Create Application
              </span>
            </button>

          </div>

          {/* =========================
              STATISTICS
          ========================= */}

          <div className="stats">

            {/* TOTAL */}

            <div className="stat-card">

              <div className="stat-icon">
                <FileText
                  size={21}
                />
              </div>

              <div>

                <div className="stat-number">
                  {
                    totalApplications
                  }
                </div>

                <div className="stat-label">
                  Total Applications
                </div>

              </div>

            </div>

            {/* PENDING */}

            <div className="stat-card">

              <div className="stat-icon">
                <Clock
                  size={21}
                />
              </div>

              <div>

                <div className="stat-number">
                  {
                    pendingApplications
                  }
                </div>

                <div className="stat-label">
                  Pending
                </div>

              </div>

            </div>

            {/* APPROVED */}

            <div className="stat-card">

              <div className="stat-icon">
                <Heart
                  size={21}
                />
              </div>

              <div>

                <div className="stat-number">
                  {
                    approvedApplications
                  }
                </div>

                <div className="stat-label">
                  Approved
                </div>

              </div>

            </div>

          </div>

          {/* =========================
              APPLICATION SECTION
          ========================= */}

          <div className="application-section">

            {/* SECTION HEADER */}

            <div className="section-header">

              <div className="section-title">

                <h2>
                  Your Applications
                </h2>

                <p>
                  Search and manage your
                  adoption applications.
                </p>

              </div>

              {/* SEARCH */}

              <div className="search-box">

                <Search
                  size={17}
                />

                <input
                  type="text"
                  placeholder="Search applications..."
                  value={search}
                  onChange={(event) =>
                    setSearch(
                      event.target.value
                    )
                  }
                />

              </div>

            </div>

            {/* =========================
                APPLICATION LIST
            ========================= */}

            <div className="application-list">

              {/* TABLE HEADER */}

              <div className="application-row table-header">

                <div>
                  Pet
                </div>

                <div>
                  Shelter
                </div>

                <div>
                  Application Date
                </div>

                <div>
                  Status
                </div>

              </div>

              {/* LOADING */}

              {loading && (
                <div className="empty">
                  Loading applications...
                </div>
              )}

              {/* ERROR */}

              {!loading &&
                error && (
                  <div className="empty error-message">
                    {error}
                  </div>
                )}

              {/* EMPTY */}

              {!loading &&
                !error &&
                filteredApplications.length ===
                  0 && (
                  <div className="empty">

                    <PawPrint
                      size={30}
                    />

                    <span>
                      {search
                        ? "No applications match your search."
                        : "No applications found."}
                    </span>

                  </div>
                )}

              {/* APPLICATION DATA */}

              {!loading &&
                !error &&
                filteredApplications.length >
                  0 &&
                filteredApplications.map(
                  (application) => (

                    <div
                      className="application-row"
                      key={
                        application.id
                      }
                    >

                      {/* PET */}

                      <div className="pet-info">

                        <div className="pet-avatar">
                          <Dog
                            size={21}
                          />
                        </div>

                        <div>

                          <div className="pet-name">
                            {
                              getPetName(
                                application
                              )
                            }
                          </div>

                          <div className="pet-type">
                            {
                              getPetType(
                                application
                              )
                            }
                          </div>

                        </div>

                      </div>

                      {/* SHELTER */}

                      <div className="text">

                        {
                          getShelterName(
                            application
                          )
                        }

                      </div>

                      {/* DATE */}

                      <div className="date">

                        {formatDate(
                          application.created_at ||
                            application.date ||
                            application.application_date
                        )}

                      </div>

                      {/* STATUS */}

                      <div>

                        <span
                          className={`status ${
                            (
                              application.status ||
                              "pending"
                            ).toLowerCase()
                          }`}
                        >

                          {getStatusIcon(
                            application.status
                          )}

                          {
                            application.status ||
                            "Pending"
                          }

                        </span>

                      </div>

                    </div>
                  )
                )}

            </div>

          </div>

        </section>

      </main>

      {/* =========================
          CREATE APPLICATION MODAL
      ========================= */}

      {showModal && (

        <div
          className="modal-overlay"
          onClick={closeModal}
        >

          <div
            className="application-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >

            {/* MODAL HEADER */}

            <div className="modal-header">

              <div>

                <div className="modal-icon">
                  <PawPrint
                    size={22}
                  />
                </div>

                <div>

                  <h2>
                    Create Application
                  </h2>

                  <p>
                    Choose a pet you would
                    like to adopt.
                  </p>

                </div>

              </div>

              <button
                type="button"
                className="modal-close"
                onClick={
                  closeModal
                }
                disabled={
                  submitting
                }
              >
                <X size={20} />
              </button>

            </div>

            {/* FORM */}

            <form
              onSubmit={
                createApplication
              }
            >

              {/* ERROR */}

              {submitError && (

                <div className="modal-error">
                  {submitError}
                </div>

              )}

              {/* SUCCESS */}

              {successMessage && (

                <div className="modal-success">
                  {successMessage}
                </div>

              )}

              {/* PET */}

              <div className="form-group">

                <label htmlFor="pet">
                  Select Pet
                </label>

                <select
                  id="pet"
                  value={
                    selectedPet
                  }
                  onChange={(event) =>
                    setSelectedPet(
                      event.target.value
                    )
                  }
                  disabled={
                    submitting
                  }
                >

                  <option value="">

                    {pets.length === 0
                      ? "No available pets"
                      : "Choose a pet..."}

                  </option>

                  {pets.map(
                    (pet) => (

                      <option
                        key={pet.id}
                        value={pet.id}
                      >

                        {pet.name}

                        {pet.breed
                          ? ` — ${pet.breed}`
                          : ""}

                      </option>

                    )
                  )}

                </select>

              </div>

              {/* SELECTED PET */}

              {selectedPet && (

                <div className="selected-pet">

                  {(() => {

                    const pet =
                      pets.find(
                        (item) =>
                          String(
                            item.id
                          ) ===
                          String(
                            selectedPet
                          )
                      );

                    if (!pet) {
                      return null;
                    }

                    return (
                      <>

                        <div className="selected-pet-icon">
                          <Dog
                            size={24}
                          />
                        </div>

                        <div>

                          <strong>
                            {pet.name}
                          </strong>

                          <span>

                            {pet.breed ||
                              pet.type ||
                              "Pet"}

                            {pet.age
                              ? ` • ${pet.age} years`
                              : ""}

                          </span>

                        </div>

                      </>
                    );

                  })()}

                </div>

              )}

              {/* ACTIONS */}

              <div className="modal-actions">

                <button
                  type="button"
                  className="cancel-btn"
                  onClick={
                    closeModal
                  }
                  disabled={
                    submitting
                  }
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="submit-application-btn"
                  disabled={
                    submitting ||
                    !selectedPet
                  }
                >

                  {submitting ? (
                    "Submitting..."
                  ) : (
                    <>
                      <CheckCircle
                        size={17}
                      />

                      Submit Application
                    </>
                  )}

                </button>

              </div>

            </form>

          </div>

        </div>

      )}

    </div>
  );
}