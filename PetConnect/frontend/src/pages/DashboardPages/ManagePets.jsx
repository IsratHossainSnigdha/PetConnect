import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Trash2, 
  PawPrint,
  Edit3,
  X
} from "lucide-react";
import "./ManagePets.css";

export default function ManagePets({ darkMode }) {
  const navigate = useNavigate();
  const [pets, setPets] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [loading, setLoading] = useState(true);

 
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [currentPet, setCurrentPet] = useState(null);

  
  const fetchPets = async () => {
    const token = localStorage.getItem("petconnect_token");
    try {
      const response = await axios.get("http://127.0.0.1:8000/api/shelter/pets", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data) {
        const fetchedPets = response.data.pets || response.data;
        setPets(fetchedPets);
        localStorage.setItem("cached_shelter_pets", JSON.stringify(fetchedPets));
        localStorage.setItem("shelter_pets_list", JSON.stringify(fetchedPets));
      }
    } catch (error) {
      console.error("API Fetch Error, falling back to cache:", error);
      
     
      const savedPets = JSON.parse(
        localStorage.getItem("cached_shelter_pets") || 
        localStorage.getItem("shelter_pets_list") || 
        "[]"
      );

      if (savedPets.length === 0) {
        const initialPets = [
          { id: 1, name: "pookie pookie", type: "Cat", breed: "Persian", age: "1 Year", status: "In Treatment", image: "" },
          { id: 2, name: "jk", type: "Dog", breed: "German Shepherd", age: "2 Years", status: "Adopted", image: "" },
          { id: 3, name: "Max", type: "Dog", breed: "Golden Retriever", age: "6 Months", status: "Available", image: "" }
        ];
        setPets(initialPets);
        localStorage.setItem("cached_shelter_pets", JSON.stringify(initialPets));
        localStorage.setItem("shelter_pets_list", JSON.stringify(initialPets));
      } else {
        setPets(savedPets);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPets();
  }, []);

  
  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this pet?")) {
      const token = localStorage.getItem("petconnect_token");
      try {
        await axios.delete(`http://127.0.0.1:8000/api/shelter/pets/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const updatedPets = pets.filter((pet) => pet.id !== id);
        setPets(updatedPets);
        localStorage.setItem("cached_shelter_pets", JSON.stringify(updatedPets));
        localStorage.setItem("shelter_pets_list", JSON.stringify(updatedPets));
      } catch (error) {
        console.error("Delete API Error, updating locally:", error);
       
        const updatedPets = pets.filter((pet) => pet.id !== id);
        setPets(updatedPets);
        localStorage.setItem("cached_shelter_pets", JSON.stringify(updatedPets));
        localStorage.setItem("shelter_pets_list", JSON.stringify(updatedPets));
      }
    }
  };

 
  const handleOpenEdit = (pet) => {
    setCurrentPet({ ...pet });
    setIsEditModalOpen(true);
  };

  
  const handleUpdatePet = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("petconnect_token");

    try {
      const response = await axios.put(`http://127.0.0.1:8000/api/shelter/pets/${currentPet.id}`, currentPet, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const updatedPetData = response.data.pet || currentPet;
      const updatedPets = pets.map((p) => (p.id === updatedPetData.id ? updatedPetData : p));
      
      setPets(updatedPets);
      localStorage.setItem("cached_shelter_pets", JSON.stringify(updatedPets));
      localStorage.setItem("shelter_pets_list", JSON.stringify(updatedPets));
      setIsEditModalOpen(false);
      setCurrentPet(null);
    } catch (error) {
      console.error("Update API Error, updating locally:", error);
      
     
      const updatedPets = pets.map((p) => (p.id === currentPet.id ? currentPet : p));
      setPets(updatedPets);
      localStorage.setItem("cached_shelter_pets", JSON.stringify(updatedPets));
      localStorage.setItem("shelter_pets_list", JSON.stringify(updatedPets));
      setIsEditModalOpen(false);
      setCurrentPet(null);
    }
  };

 
  const getStatusBadge = (status) => {
    switch (status) {
      case "Available":
        return <span className="status available">Available</span>;
      case "Pending":
        return <span className="status pending">Pending</span>;
      case "In Treatment":
        return <span className="status treatment">In Treatment</span>;
      case "Adopted":
        return <span className="status adopted">Adopted</span>;
      default:
        return <span className="status default">{status}</span>;
    }
  };

  
  const filteredPets = pets.filter((pet) => {
    const matchesSearch = pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          pet.type.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "All" || pet.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className={`manage-pets-container ${darkMode ? "dark" : ""}`}>
       
      {/* Top Header & Back Button */}
      <div className="manage-pets-header">
        <button 
          onClick={() => navigate("/dashboard/shelter")}
          className="back-btn"
          type="button"
        >
          <ArrowLeft size={18} /> Back to Dashboard
        </button>

        <button 
          onClick={() => navigate("/dashboard/shelter/add-pet")}
          className="add-pet-btn"
          type="button"
        >
          <Plus size={18} /> Add New Pet
        </button>
      </div>

      {/* Main Container Card */}
      <div className="manage-pets-card">
         
        <div className="card-top-bar">
          <div className="card-title-area">
            <h2>Manage Shelter Pets</h2>
            <p>View, search, and manage all pets registered under your shelter.</p>
          </div>

          {/* Search and Filter Controls */}
          <div className="filter-controls">
            <div className="search-box-wrapper">
              <input 
                type="text" 
                placeholder="Search pets..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <Search size={18} className="search-icon" />
            </div>

            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="status-dropdown"
            >
              <option value="All">All Status</option>
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="In Treatment">In Treatment</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>
        </div>

        {/* Table Section */}
        <div className="table-wrapper">
          <table className="pets-table">
            <thead>
              <tr>
                <th>Pet Info</th>
                <th>Type</th>
                <th>Breed</th>
                <th>Age</th>
                <th>Status</th>
                <th style={{ textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="no-pets-row" style={{ textAlign: 'center', padding: '20px' }}>
                    Loading pets from database...
                  </td>
                </tr>
              ) : filteredPets.length > 0 ? (
                filteredPets.map((pet) => (
                  <tr key={pet.id}>
                    <td>
                      <div className="pet-info-cell">
                        <div className="pet-avatar-box">
                          {pet.image ? (
                            <img src={pet.image} alt={pet.name} className="pet-avatar-img" />
                          ) : (
                            <PawPrint size={18} />
                          )}
                        </div>
                        <span className="pet-name-text">{pet.name}</span>
                      </div>
                    </td>
                    <td>{pet.type}</td>
                    <td>{pet.breed || "N/A"}</td>
                    <td>{pet.age || "N/A"}</td>
                    <td>{getStatusBadge(pet.status)}</td>
                    <td className="action-cell">
                      <div className="action-buttons-group" style={{ display: "flex", gap: "8px", justifyContent: "flex-end" }}>
                        <button 
                          onClick={() => handleOpenEdit(pet)}
                          title="Edit Pet"
                          className="edit-action-btn"
                          type="button"
                          style={{ background: "#e0f2fe", border: "none", padding: "6px", borderRadius: "6px", cursor: "pointer", color: "#0284c7" }}
                        >
                          <Edit3 size={15} />
                        </button>
                        <button 
                          onClick={() => handleDelete(pet.id)}
                          title="Delete Pet"
                          className="delete-action-btn"
                          type="button"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="6" className="no-pets-row">
                    No pets found matching your criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

      </div>

      {/* Edit Pet Modal */}
      {isEditModalOpen && currentPet && (
        <div className="modal-overlay" style={{
          position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh",
          background: "rgba(0,0,0,0.5)", display: "flex", justifyContent: "center", alignItems: "center", zIndex: 1000,
          padding: "16px", boxSizing: "border-box"
        }}>
          <div className="modal-content" style={{
            background: darkMode ? "#101f2b" : "#fff", color: darkMode ? "#fff" : "#102c45",
            padding: "24px", borderRadius: "12px", width: "400px", maxWidth: "100%", 
            maxHeight: "85vh", display: "flex", flexDirection: "column", 
            boxShadow: "0 4px 20px rgba(0,0,0,0.2)", boxSizing: "border-box"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", flexShrink: 0 }}>
              <h3>Edit Pet Information</h3>
              <button onClick={() => setIsEditModalOpen(false)} style={{ background: "none", border: "none", cursor: "pointer", color: "inherit" }}>
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form onSubmit={handleUpdatePet} style={{ display: "flex", flexDirection: "column", gap: "12px", overflowY: "auto", paddingRight: "4px" }}>
              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Pet Name</label>
                <input 
                  type="text" 
                  value={currentPet.name} 
                  onChange={(e) => setCurrentPet({ ...currentPet, name: e.target.value })} 
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Type (e.g. Dog, Cat)</label>
                <input 
                  type="text" 
                  value={currentPet.type} 
                  onChange={(e) => setCurrentPet({ ...currentPet, type: e.target.value })} 
                  required
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Breed</label>
                <input 
                  type="text" 
                  value={currentPet.breed || ""} 
                  onChange={(e) => setCurrentPet({ ...currentPet, breed: e.target.value })} 
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Age</label>
                <input 
                  type="text" 
                  value={currentPet.age || ""} 
                  onChange={(e) => setCurrentPet({ ...currentPet, age: e.target.value })} 
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Pet Picture URL (Optional)</label>
                <input 
                  type="url" 
                  placeholder="https://example.com/pet-image.jpg"
                  value={currentPet.image || ""} 
                  onChange={(e) => setCurrentPet({ ...currentPet, image: e.target.value })} 
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                />
              </div>

              <div>
                <label style={{ fontSize: "13px", fontWeight: "bold" }}>Status</label>
                <select 
                  value={currentPet.status} 
                  onChange={(e) => setCurrentPet({ ...currentPet, status: e.target.value })}
                  style={{ width: "100%", padding: "8px", marginTop: "4px", borderRadius: "6px", border: "1px solid #cbd5e1", boxSizing: "border-box" }}
                >
                  <option value="Available">Available</option>
                  <option value="Pending">Pending</option>
                  <option value="In Treatment">In Treatment</option>
                  <option value="Adopted">Adopted</option>
                </select>
              </div>

              <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px", marginTop: "12px", flexShrink: 0 }}>
                <button 
                  type="button" 
                  onClick={() => setIsEditModalOpen(false)}
                  style={{ padding: "8px 16px", background: "#cbd5e1", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  style={{ padding: "8px 16px", background: "#0284c7", color: "#fff", border: "none", borderRadius: "6px", cursor: "pointer" }}
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}