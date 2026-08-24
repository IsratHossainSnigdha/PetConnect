import { apiFetch } from "./client";

/**
 * Get complaints of the logged-in adopter.
 */
export const getComplaints = async () => {
  return await apiFetch("/complaints");
};

/**
 * Submit a new complaint.
 */
export const createComplaint = async (complaintData) => {
  return await apiFetch("/complaints", {
    method: "POST",
    body: JSON.stringify(complaintData),
  });
};