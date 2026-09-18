import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon } from "lucide-react";
import axios from "axios";

export default function AddPet({ darkMode }) {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    type: "Dog",
    breed: "",
    age: "",
    status: "Available",
    image: "", 
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg("");

    const token = localStorage.getItem("petconnect_token");

    const payload = {
      ...formData,
      image: formData.image.trim() !== "" ? formData.image : null,
    };

    try {
      const response = await axios.post("http://127.0.0.1:8000/api/shelter/pets", payload, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      });

      console.log("Pet added successfully:", response.data);
      
     
      navigate("/dashboard/shelter");
    } catch (error) {
      console.error("Error adding pet:", error.response?.data);
      setErrorMsg(
        error.response?.data?.message || 
        JSON.stringify(error.response?.data?.errors) || 
        "Failed to add pet. Please check your inputs or backend."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "30px", maxWidth: "600px", margin: "0 auto" }}>
      <button 
        onClick={() => navigate("/dashboard/shelter")}
        style={{ display: "flex", alignItems: "center", gap: "8px", background: "none", border: "none", cursor: "pointer", marginBottom: "20px", fontSize: "14px", fontWeight: "600", color: darkMode ? "#fff" : "#333" }}
        type="button"
      >
        <ArrowLeft size={18} /> Back to Dashboard
      </button>

      <div style={{ background: darkMode ? "#101f2b" : "#fff", padding: "30px", borderRadius: "16px", boxShadow: "0 4px 20px rgba(0,0,0,0.05)" }}>
        <h2 style={{ marginBottom: "20px", color: darkMode ? "#fff" : "#1a202c" }}>Add New Shelter Pet</h2>
        
        {errorMsg && (
          <div style={{ background: "#fed7d7", color: "#9b2c2c", padding: "10px 14px", borderRadius: "8px", marginBottom: "16px", fontSize: "13px" }}>
            {errorMsg}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: darkMode ? "#cbd5e0" : "#4a5568" }}>Pet Name</label>
            <input 
              type="text" 
              name="name" 
              value={formData.name} 
              onChange={handleChange} 
              required 
              placeholder="e.g. Max"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e0", background: darkMode ? "#0b1721" : "#fff", color: darkMode ? "#fff" : "#000" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: darkMode ? "#cbd5e0" : "#4a5568" }}>Type</label>
            <select 
              name="type" 
              value={formData.type} 
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e0", background: darkMode ? "#0b1721" : "#fff", color: darkMode ? "#fff" : "#000" }}
            >
              <option value="Dog">Dog</option>
              <option value="Cat">Cat</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: darkMode ? "#cbd5e0" : "#4a5568" }}>Breed</label>
            <input 
              type="text" 
              name="breed" 
              value={formData.breed} 
              onChange={handleChange} 
              placeholder="e.g. Golden Retriever"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e0", background: darkMode ? "#0b1721" : "#fff", color: darkMode ? "#fff" : "#000" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: darkMode ? "#cbd5e0" : "#4a5568" }}>Age</label>
            <input 
              type="text" 
              name="age" 
              value={formData.age} 
              onChange={handleChange} 
              placeholder="e.g. 2 Years"
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e0", background: darkMode ? "#0b1721" : "#fff", color: darkMode ? "#fff" : "#000" }}
            />
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: darkMode ? "#cbd5e0" : "#4a5568" }}>Status</label>
            <select 
              name="status" 
              value={formData.status} 
              onChange={handleChange}
              style={{ width: "100%", padding: "10px 14px", borderRadius: "8px", border: "1px solid #cbd5e0", background: darkMode ? "#0b1721" : "#fff", color: darkMode ? "#fff" : "#000" }}
            >
              <option value="Available">Available</option>
              <option value="Pending">Pending</option>
              <option value="In Treatment">In Treatment</option>
              <option value="Adopted">Adopted</option>
            </select>
          </div>

          <div>
            <label style={{ display: "block", fontSize: "13px", fontWeight: "600", marginBottom: "6px", color: darkMode ? "#cbd5e0" : "#4a5568" }}>
              Pet Picture URL <span style={{ fontWeight: "400", color: "#a0aec0" }}>(Optional)</span>
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              <input 
                type="url" 
                name="image" 
                value={formData.image} 
                onChange={handleChange} 
                placeholder="https://example.com/pet-image.jpg"
                style={{ width: "100%", padding: "10px 14px 10px 38px", borderRadius: "8px", border: "1px solid #cbd5e0", background: darkMode ? "#0b1721" : "#fff", color: darkMode ? "#fff" : "#000" }}
              />
              <ImageIcon size={18} style={{ position: "absolute", left: "12px", color: "#a0aec0" }} />
            </div>
          </div>

          <button 
            type="submit"
            disabled={loading}
            style={{ background: "#38a169", color: "#fff", border: "none", padding: "12px", borderRadius: "8px", fontWeight: "600", cursor: loading ? "not-allowed" : "pointer", marginTop: "10px", opacity: loading ? 0.7 : 1 }}
          >
            {loading ? "Saving..." : "Save Pet"}
          </button>
        </form>
      </div>
    </div>
  );
}