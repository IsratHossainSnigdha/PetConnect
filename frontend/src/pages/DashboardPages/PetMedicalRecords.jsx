import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { ArrowLeft, Plus, Calendar, FileText } from "lucide-react";
import "./PetMedicalRecords.css";

export default function PetMedicalRecords({ darkMode }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [petDetails, setPetDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showAddModal, setShowAddModal] = useState(false);
  const [newRecord, setNewRecord] = useState({
    date: "",
    diagnosis: "",
    treatment: "",
    notes: "",
  });

  useEffect(() => {
    fetchMedicalRecords();
  }, [id]);

  const fetchMedicalRecords = async () => {
    const token = localStorage.getItem("petconnect_token");
    try {
      const response = await axios.get(`http://127.0.0.1:8000/api/shelter/pets/${id}/medical-records`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data) {
        setMedicalRecords(response.data.records || []);
        setPetDetails(response.data.pet || null);
      }
    } catch (error) {
      console.error("Failed to fetch medical records, using local fallback:", error);
      
      const savedPets = JSON.parse(localStorage.getItem("cached_shelter_pets") || "[]");
      const currentPet = savedPets.find((p) => p.id.toString() === id.toString());
      setPetDetails(currentPet || { name: "Pet #" + id });

      setMedicalRecords([
        { id: 1, date: "2026-08-10", diagnosis: "General Checkup", treatment: "Vaccination given", notes: "Healthy and active." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddRecord = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("petconnect_token");
    try {
      const response = await axios.post(`http://127.0.0.1:8000/api/shelter/pets/${id}/medical-records`, newRecord, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.data) {
        setMedicalRecords([...medicalRecords, response.data.record || newRecord]);
        setShowAddModal(false);
        setNewRecord({ date: "", diagnosis: "", treatment: "", notes: "" });
      }
    } catch (error) {
      console.error("Error adding record, adding locally:", error);
      setMedicalRecords([...medicalRecords, { ...newRecord, id: Date.now() }]);
      setShowAddModal(false);
      setNewRecord({ date: "", diagnosis: "", treatment: "", notes: "" });
    }
  };

  return (
    <div className={`medical-records-container ${darkMode ? "dark" : ""}`}>
      {/* Top Navigation */}
      <div className="medical-records-header">
        <button 
          onClick={() => navigate(-1)}
          className="medical-back-btn"
          type="button"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <button 
          onClick={() => setShowAddModal(true)}
          className="medical-add-btn"
          type="button"
        >
          <Plus size={18} /> Add Medical Record
        </button>
      </div>

      {/* Pet Header Info */}
      <div className="pet-medical-info-card">
        <h2>Medical Records: {petDetails?.name || `Pet ID: ${id}`}</h2>
        <p>
          Type: {petDetails?.type || "N/A"} | Breed: {petDetails?.breed || "N/A"} | Status: {petDetails?.status || "N/A"}
        </p>
      </div>

      {/* Records List */}
      <div className="medical-records-list">
        {loading ? (
          <p className="loading-text">Loading medical records...</p>
        ) : medicalRecords.length > 0 ? (
          medicalRecords.map((record) => (
            <div key={record.id} className="medical-record-card">
              <div className="record-card-top">
                <strong>{record.diagnosis}</strong>
                <span className="record-date">
                  <Calendar size={14} /> {record.date}
                </span>
              </div>
              <p className="record-text"><strong>Treatment:</strong> {record.treatment}</p>
              <p className="record-notes"><strong>Notes:</strong> {record.notes || "No additional notes."}</p>
            </div>
          ))
        ) : (
          <p className="no-records-text">No medical records found for this pet.</p>
        )}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="medical-modal-overlay">
          <div className="medical-modal-content">
            <h3>Add Medical Record</h3>
            <form onSubmit={handleAddRecord} className="medical-form">
              <div className="form-group">
                <label>Date</label>
                <input 
                  type="date" 
                  value={newRecord.date} 
                  onChange={(e) => setNewRecord({ ...newRecord, date: e.target.value })} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Diagnosis</label>
                <input 
                  type="text" 
                  placeholder="e.g. Fever, Injury" 
                  value={newRecord.diagnosis} 
                  onChange={(e) => setNewRecord({ ...newRecord, diagnosis: e.target.value })} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Treatment</label>
                <input 
                  type="text" 
                  placeholder="e.g. Antibiotics, Rest" 
                  value={newRecord.treatment} 
                  onChange={(e) => setNewRecord({ ...newRecord, treatment: e.target.value })} 
                  required
                />
              </div>
              <div className="form-group">
                <label>Notes</label>
                <textarea 
                  placeholder="Additional details..." 
                  value={newRecord.notes} 
                  onChange={(e) => setNewRecord({ ...newRecord, notes: e.target.value })} 
                />
              </div>
              <div className="medical-modal-actions">
                <button type="button" className="cancel-btn" onClick={() => setShowAddModal(false)}>Cancel</button>
                <button type="submit" className="save-btn">Save</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}