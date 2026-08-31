import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  Dog,
  ArrowLeft,
  MapPin,
  Mail,
  Phone,
  UserCog,
  Users,
  PawPrint,
  Star,
  FileText,
  Plus,
  Edit,
  Trash2,
  X,
  RefreshCw,
} from 'lucide-react';

import { fetchShelter } from '../../api/shelters';
import {
  createShelterPet,
  updateShelterPet,
  deleteShelterPet,
} from '../../api/shelters';

/*
|==============================================================================
| SHELTER DETAIL PAGE
|==============================================================================
|
| One page showing everything the ER diagram hangs off a single shelter:
|
|                        ┌─────────────┐
|          admin ───────►│   shelter   │◄─────── staff (users.shelter_id)
|     (admin_id)         └──────┬──────┘
|                               │ lives
|                    ┌──────────┼──────────┐
|                    ▼                     ▼
|                  pets                 reviews
|                (m—1 shelter)        (m—1 shelter)
|
| It is filled by ONE request - GET /api/admin/shelters/{id} - which returns
| the shelter, its pets, its staff, its reviews, and a summary block of
| COUNT/AVG figures. One round trip instead of five.
|
| The pet section is the part that makes a shelter genuinely functional: until
| now the API had no way to create a pet at all.
*/

const EMPTY_PET = {
  name: '',
  type: '',
  breed: '',
  age: '',
  gender: '',
  health_status: '',
  vaccine_status: '',
  status: 'available',
  description: '',
};

export default function ShelterDetail() {
  const navigate = useNavigate();

  // useParams reads the :id out of the URL /shelters/admin/:id
  const { id } = useParams();

  const [shelter, setShelter] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // the add / edit pet popup
  const [petModal, setPetModal] = useState(false);
  const [editingPetId, setEditingPetId] = useState(null);
  const [petForm, setPetForm] = useState(EMPTY_PET);
  const [petErrors, setPetErrors] = useState({});
  const [saving, setSaving] = useState(false);

  /*
  | Load the shelter and everything attached to it.
  */
  const load = useCallback(async () => {
    setError('');

    try {
      const data = await fetchShelter(id);
      setShelter(data.shelter);
    } catch (err) {
      setError(err.message || 'Could not load this shelter.');
    } finally {
      setLoading(false);
    }
  }, [id]);

  /*
  | Runs once when the page opens, and again if the :id in the URL changes.
  |
  | This does not call load() directly on mount for the same reason as the
  | reports page: load() would set state synchronously inside the effect.
  | `loading` already starts true, so the first pass just fetches.
  */
  useEffect(() => {
    let cancelled = false;

    fetchShelter(id)
      .then((data) => {
        if (!cancelled) setShelter(data.shelter);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not load this shelter.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id]);

  /*
  |--------------------------------------------------------------------------
  | PET ADD / EDIT / DELETE
  |--------------------------------------------------------------------------
  */
  const openAddPet = () => {
    setEditingPetId(null);
    setPetForm(EMPTY_PET);
    setPetErrors({});
    setPetModal(true);
  };

  const openEditPet = (pet) => {
    setEditingPetId(pet.id);

    // Every NULL column becomes '' so the inputs stay "controlled". Passing
    // null into a React input makes it switch between controlled and
    // uncontrolled, which React warns about.
    setPetForm({
      name: pet.name ?? '',
      type: pet.type ?? '',
      breed: pet.breed ?? '',
      age: pet.age ?? '',
      gender: pet.gender ?? '',
      health_status: pet.health_status ?? '',
      vaccine_status: pet.vaccine_status ?? '',
      status: pet.status ?? 'available',
      description: pet.description ?? '',
    });
    setPetErrors({});
    setPetModal(true);
  };

  const handlePetChange = (e) => {
    const { name, value } = e.target;
    setPetForm((prev) => ({ ...prev, [name]: value }));
  };

  const savePet = async (e) => {
    e.preventDefault();
    setSaving(true);
    setPetErrors({});

    /*
    | An HTML input always gives a STRING. The age column is an integer and
    | the optional columns are NULLable, so convert before sending:
    |
    |     ''    ->  null   (nothing chosen)
    |     '3'   ->  3      (a real number)
    */
    const payload = {
      ...petForm,
      age: petForm.age === '' ? null : Number(petForm.age),
      breed: petForm.breed || null,
      gender: petForm.gender || null,
      health_status: petForm.health_status || null,
      vaccine_status: petForm.vaccine_status || null,
      description: petForm.description || null,
    };

    try {
      if (editingPetId) {
        await updateShelterPet(id, editingPetId, payload);
      } else {
        await createShelterPet(id, payload);
      }

      setPetModal(false);
      await load();     // re-read, so the list and the counts both refresh
    } catch (err) {
      if (err.status === 422) {
        setPetErrors(err.errors || {});
      } else {
        alert(err.message);
      }
    } finally {
      setSaving(false);
    }
  };

  const removePet = async (pet) => {
    const ok = window.confirm(
      `Remove "${pet.name}" from this shelter?\n\n` +
      `This deletes the row from the pets table. Any adoption applications ` +
      `for this pet are deleted too, because the foreign key uses ON DELETE CASCADE.`
    );

    if (!ok) return;

    try {
      const result = await deleteShelterPet(id, pet.id);
      await load();

      if (result.deleted_applications > 0) {
        alert(`Pet removed. ${result.deleted_applications} application(s) were deleted with it.`);
      }
    } catch (err) {
      alert(err.message);
    }
  };

  // Draw a 1-5 rating as filled and empty stars, with the number beside it -
  // so the rating is never conveyed by the stars alone.
  const stars = (rating) => '★'.repeat(rating) + '☆'.repeat(5 - rating);

  return (
    <>
      <style>{`
        * { margin: 0; padding: 0; box-sizing: border-box;
            font-family: Arial, Helvetica, sans-serif; }

        html, body, #root {
          width: 100%;
          min-height: 100%;
          /* Set explicitly: the dashboard stylesheet uses overflow:hidden, and
             without this the page inherits it and refuses to scroll. */
          overflow-x: hidden;
          overflow-y: auto;
        }

        .sd-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 400% 400%;
          animation: sdFlow 20s ease infinite;
          color: #102c45;
          padding-bottom: 44px;
        }

        @keyframes sdFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .sd-topbar {
          height: 68px; background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 26px; box-shadow: 0 2px 14px rgba(16,44,69,0.07);
          position: sticky; top: 0; z-index: 20;
        }

        .sd-brand { display: flex; align-items: center; gap: 10px; }

        .sd-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #286993; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }

        .sd-brand h1 { font-size: 17px; font-weight: 800; }
        .sd-brand p  { font-size: 11px; color: #64748b; }

        .sd-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(40,105,147,0.1); color: #286993;
          border: none; border-radius: 9px; padding: 9px 14px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }

        .sd-back:hover { background: rgba(40,105,147,0.18); }

        .sd-container {
          /* min() = "whichever is smaller". Wide screens get 1560px;
             narrow ones fall back to 94% of the viewport instead of
             overflowing. */
          max-width: min(1560px, 94vw);
          margin: 0 auto;
          padding: 26px 24px 0;
        }

        /* ---- header card ---- */
        .sd-hero {
          background: rgba(255,255,255,0.9); border-radius: 16px;
          padding: 22px 24px; box-shadow: 0 4px 20px rgba(16,44,69,0.08);
          margin-bottom: 18px;
        }

        .sd-hero-top {
          display: flex; align-items: flex-start; justify-content: space-between;
          gap: 16px; flex-wrap: wrap;
        }

        .sd-hero h2 { font-size: 25px; font-weight: 800; }

        .sd-badge {
          padding: 4px 11px; border-radius: 20px;
          font-size: 11px; font-weight: 700; text-transform: capitalize;
          display: inline-block; margin-left: 10px; vertical-align: 4px;
        }

        .sd-badge.active   { background: rgba(4,120,87,0.13);   color: #047857; }
        .sd-badge.pending  { background: rgba(245,158,11,0.15); color: #b45309; }
        .sd-badge.inactive { background: rgba(100,116,139,0.13); color: #64748b; }

        .sd-desc {
          font-size: 13px; color: #475569; line-height: 1.65;
          margin-top: 10px; max-width: 720px;
        }

        .sd-desc.empty { color: #94a3b8; font-style: italic; }

        .sd-meta {
          display: flex; flex-wrap: wrap; gap: 18px; margin-top: 16px;
          padding-top: 14px; border-top: 1px solid rgba(40,105,147,0.1);
        }

        .sd-meta-item {
          display: flex; align-items: center; gap: 7px;
          font-size: 12.5px; color: #334155;
        }

        .sd-meta-item svg { color: #286993; flex-shrink: 0; }

        .sd-none { color: #94a3b8; font-style: italic; }

        /* ---- summary tiles ---- */
        .sd-tiles {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr));
          gap: 13px; margin-bottom: 18px;
        }

        .sd-tile {
          background: rgba(255,255,255,0.88); border-radius: 13px;
          padding: 15px 17px; display: flex; align-items: center; gap: 12px;
          box-shadow: 0 3px 14px rgba(16,44,69,0.06);
        }

        .sd-tile-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: rgba(40,105,147,0.12); color: #286993;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .sd-tile-num   { font-size: 20px; font-weight: 800; line-height: 1.1; }
        .sd-tile-label { font-size: 11px; color: #64748b; }

        /* ---- section cards ---- */
        .sd-card {
          background: rgba(255,255,255,0.88); border-radius: 15px;
          padding: 19px; box-shadow: 0 4px 20px rgba(16,44,69,0.07);
          margin-bottom: 16px;
        }

        .sd-card-head {
          display: flex; align-items: center; justify-content: space-between;
          gap: 12px; flex-wrap: wrap; margin-bottom: 14px;
        }

        .sd-card-head h3 { font-size: 16px; font-weight: 700; }
        .sd-card-head p  { font-size: 11.5px; color: #64748b; margin-top: 2px; }

        .sd-btn {
          background: #286993; color: #fff; border: none; border-radius: 9px;
          padding: 9px 15px; font-size: 13px; font-weight: 600; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
        }

        .sd-btn:hover { background: #1f587d; }
        .sd-btn:disabled { opacity: 0.6; cursor: not-allowed; }

        .sd-table-wrap { width: 100%; overflow-x: auto; }
        .sd-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }

        .sd-table th {
          background: rgba(40,105,147,0.08); color: #64748b; font-weight: 600;
          padding: 10px 12px; white-space: nowrap;
          border-bottom: 1px solid rgba(40,105,147,0.12);
        }

        .sd-table td {
          padding: 11px 12px; border-bottom: 1px solid rgba(40,105,147,0.08);
          vertical-align: middle;
        }

        .sd-table tbody tr:hover { background: rgba(40,105,147,0.03); }

        .sd-pill {
          padding: 3px 9px; border-radius: 20px;
          font-size: 10.5px; font-weight: 700; display: inline-block;
          text-transform: capitalize; white-space: nowrap;
        }

        .sd-pill.available { background: rgba(4,120,87,0.13);   color: #047857; }
        .sd-pill.pending   { background: rgba(245,158,11,0.15); color: #b45309; }
        .sd-pill.adopted   { background: rgba(40,105,147,0.13); color: #286993; }

        .sd-pill.healthy   { background: rgba(4,120,87,0.13);   color: #047857; }
        .sd-pill.treatment { background: rgba(245,158,11,0.15); color: #b45309; }
        .sd-pill.critical  { background: rgba(190,18,60,0.12);  color: #be123c; }

        .sd-pill.vaccinated     { background: rgba(4,120,87,0.13);   color: #047857; }
        .sd-pill.partial        { background: rgba(245,158,11,0.15); color: #b45309; }
        .sd-pill.not_vaccinated { background: rgba(100,116,139,0.14); color: #475569; }

        .sd-actions { display: flex; gap: 7px; }

        .sd-icon-btn {
          width: 28px; height: 28px; border-radius: 7px; border: none;
          display: flex; align-items: center; justify-content: center;
          background: rgba(40,105,147,0.1); color: #286993; cursor: pointer;
        }

        .sd-icon-btn:hover { background: rgba(40,105,147,0.2); }
        .sd-icon-btn.danger:hover { background: rgba(190,18,60,0.16); color: #be123c; }

        /* ---- reviews ---- */
        .sd-review {
          padding: 12px 0; border-bottom: 1px solid rgba(40,105,147,0.08);
        }

        .sd-review:last-child { border-bottom: none; }

        .sd-review-top {
          display: flex; align-items: center; gap: 10px; flex-wrap: wrap;
        }

        .sd-review-name { font-size: 13px; font-weight: 700; }

        .sd-stars { color: #b45309; font-size: 14px; letter-spacing: 1px; }

        .sd-review-rating { font-size: 11.5px; color: #64748b; font-weight: 600; }

        .sd-review-date { font-size: 11px; color: #94a3b8; margin-left: auto; }

        .sd-review-body { font-size: 13px; color: #475569; margin-top: 6px; line-height: 1.6; }

        .sd-empty { font-size: 12.5px; color: #94a3b8; font-style: italic; padding: 8px 0; }

        .sd-msg { padding: 30px 12px; text-align: center; font-size: 13px; color: #64748b; }
        .sd-msg.error { color: #b91c1c; }

        .sd-spin { animation: sdSpin 0.9s linear infinite; display: inline-block; }
        @keyframes sdSpin { to { transform: rotate(360deg); } }

        /* ---- modal ---- */
        .sd-backdrop {
          position: fixed; inset: 0; background: rgba(16,44,69,0.45);
          display: flex; align-items: center; justify-content: center;
          z-index: 60; padding: 20px;
        }

        .sd-modal {
          background: #fff; border-radius: 14px; width: 100%; max-width: 500px;
          max-height: 90vh; overflow-y: auto; padding: 22px;
          box-shadow: 0 20px 50px rgba(16,44,69,0.3);
        }

        .sd-modal-head {
          display: flex; align-items: flex-start; justify-content: space-between;
          margin-bottom: 16px;
        }

        .sd-modal-head h3 { font-size: 17px; font-weight: 700; }
        .sd-modal-head p  { font-size: 11px; color: #64748b; margin-top: 3px;
                            font-family: Consolas, Monaco, monospace; }

        .sd-close {
          background: rgba(40,105,147,0.1); border: none; border-radius: 8px;
          width: 30px; height: 30px; display: flex; align-items: center;
          justify-content: center; cursor: pointer; color: #286993; flex-shrink: 0;
        }

        .sd-row2 { display: grid; grid-template-columns: 1fr 1fr; gap: 11px; }

        .sd-field { margin-bottom: 12px; }

        .sd-field label {
          display: block; font-size: 12px; font-weight: 600; margin-bottom: 5px;
        }

        .sd-hint { font-weight: 400; color: #94a3b8; font-size: 10.5px; }

        .sd-field input, .sd-field select, .sd-field textarea {
          width: 100%; border: 1px solid rgba(40,105,147,0.25);
          border-radius: 8px; padding: 9px 11px; font-size: 13px;
          color: #102c45; outline: none; background: #fff; font-family: inherit;
        }

        .sd-field textarea { resize: vertical; min-height: 62px; }

        .sd-field input:focus, .sd-field select:focus, .sd-field textarea:focus {
          border-color: #286993;
        }

        .sd-field .bad { border-color: #be123c; }

        .sd-err { color: #b91c1c; font-size: 11px; margin-top: 4px; }

        .sd-modal-actions {
          display: flex; justify-content: flex-end; gap: 8px; margin-top: 16px;
        }

        .sd-cancel {
          background: rgba(100,116,139,0.12); color: #475569; border: none;
          border-radius: 8px; padding: 9px 16px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
      `}</style>

      <div className="sd-page">

        <header className="sd-topbar">
          <div className="sd-brand">
            <div className="sd-brand-icon"><Dog size={20} /></div>
            <div>
              <h1>PetConnect</h1>
              <p>Shelter Details</p>
            </div>
          </div>

          <button className="sd-back" onClick={() => navigate('/shelters/admin')}>
            <ArrowLeft size={15} /> All Shelters
          </button>
        </header>

        <div className="sd-container">

          {loading && (
            <div className="sd-msg">
              <RefreshCw size={15} className="sd-spin" /> Loading shelter...
            </div>
          )}

          {!loading && error && <div className="sd-msg error">{error}</div>}

          {!loading && !error && shelter && (
            <>
              {/* ---------- the shelter itself ---------- */}
              <div className="sd-hero">
                <div className="sd-hero-top">
                  <div>
                    <h2>
                      {shelter.name}
                      <span className={`sd-badge ${shelter.status}`}>{shelter.status}</span>
                    </h2>

                    {/* ERD attribute `description` */}
                    {shelter.description ? (
                      <p className="sd-desc">{shelter.description}</p>
                    ) : (
                      <p className="sd-desc empty">No description has been written for this shelter yet.</p>
                    )}
                  </div>
                </div>

                <div className="sd-meta">
                  <span className="sd-meta-item">
                    <MapPin size={15} /> {shelter.location}
                  </span>
                  <span className="sd-meta-item">
                    <Mail size={15} /> {shelter.contact_email}
                  </span>
                  <span className="sd-meta-item">
                    <Phone size={15} /> {shelter.contact_phone}
                  </span>
                  {/* From the LEFT JOIN to users on shelters.admin_id */}
                  <span className="sd-meta-item">
                    <UserCog size={15} />
                    {shelter.admin_name
                      ? `${shelter.admin_name} (${shelter.admin_email})`
                      : <span className="sd-none">No admin assigned</span>}
                  </span>
                </div>
              </div>

              {/* ---------- summary: COUNT and AVG done by MySQL ---------- */}
              <div className="sd-tiles">
                <div className="sd-tile">
                  <div className="sd-tile-icon"><PawPrint size={18} /></div>
                  <div>
                    <div className="sd-tile-num">{shelter.summary.total_pets}</div>
                    <div className="sd-tile-label">Pets</div>
                  </div>
                </div>

                <div className="sd-tile">
                  <div className="sd-tile-icon"><PawPrint size={18} /></div>
                  <div>
                    <div className="sd-tile-num">{shelter.summary.available_pets}</div>
                    <div className="sd-tile-label">Available</div>
                  </div>
                </div>

                <div className="sd-tile">
                  <div className="sd-tile-icon"><Users size={18} /></div>
                  <div>
                    <div className="sd-tile-num">{shelter.summary.total_staff}</div>
                    <div className="sd-tile-label">Staff</div>
                  </div>
                </div>

                <div className="sd-tile">
                  <div className="sd-tile-icon"><FileText size={18} /></div>
                  <div>
                    <div className="sd-tile-num">{shelter.summary.total_applications}</div>
                    <div className="sd-tile-label">Applications</div>
                  </div>
                </div>

                <div className="sd-tile">
                  <div className="sd-tile-icon"><Star size={18} /></div>
                  <div>
                    {/*
                      AVG() over an empty table returns NULL, not 0 - there is
                      no average of nothing. So we show a dash rather than "0",
                      which would wrongly read as "rated zero".
                    */}
                    <div className="sd-tile-num">
                      {shelter.summary.average_rating ?? '—'}
                    </div>
                    <div className="sd-tile-label">
                      Avg rating ({shelter.summary.total_reviews})
                    </div>
                  </div>
                </div>
              </div>

              {/* ---------- pets that live here ---------- */}
              <div className="sd-card">
                <div className="sd-card-head">
                  <div>
                    <h3>Pets at this shelter</h3>
                    <p>SELECT * FROM pets WHERE shelter_id = {shelter.id}</p>
                  </div>
                  <button className="sd-btn" onClick={openAddPet}>
                    <Plus size={15} /> Add Pet
                  </button>
                </div>

                {shelter.pets.length === 0 ? (
                  <div className="sd-empty">
                    No pets yet. Use "Add Pet" to put the first animal on this shelter&apos;s list.
                  </div>
                ) : (
                  <div className="sd-table-wrap">
                    <table className="sd-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Type / Breed</th>
                          <th>Age</th>
                          <th>Gender</th>
                          <th>Health</th>
                          <th>Vaccine</th>
                          <th>Status</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {shelter.pets.map((pet) => (
                          <tr key={pet.id}>
                            <td><strong>{pet.name}</strong></td>
                            <td>
                              {pet.type}
                              {pet.breed && (
                                <>
                                  <br />
                                  <span style={{ color: '#64748b', fontSize: '11px' }}>{pet.breed}</span>
                                </>
                              )}
                            </td>
                            <td>{pet.age ?? '—'}</td>
                            <td>{pet.gender ?? '—'}</td>

                            {/* ERD attributes, added by this migration */}
                            <td>
                              {pet.health_status
                                ? <span className={`sd-pill ${pet.health_status}`}>{pet.health_status}</span>
                                : <span className="sd-none">—</span>}
                            </td>
                            <td>
                              {pet.vaccine_status
                                ? <span className={`sd-pill ${pet.vaccine_status}`}>
                                    {pet.vaccine_status.replace('_', ' ')}
                                  </span>
                                : <span className="sd-none">—</span>}
                            </td>

                            <td><span className={`sd-pill ${pet.status}`}>{pet.status}</span></td>

                            <td>
                              <div className="sd-actions">
                                <button className="sd-icon-btn" title="Edit" onClick={() => openEditPet(pet)}>
                                  <Edit size={13} />
                                </button>
                                <button className="sd-icon-btn danger" title="Remove" onClick={() => removePet(pet)}>
                                  <Trash2 size={13} />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ---------- staff working here ---------- */}
              <div className="sd-card">
                <div className="sd-card-head">
                  <div>
                    <h3>Staff</h3>
                    <p>SELECT ... FROM users WHERE shelter_id = {shelter.id}</p>
                  </div>
                </div>

                {shelter.staff.length === 0 ? (
                  <div className="sd-empty">
                    No user rows have shelter_id = {shelter.id}. Staff are linked when
                    somebody registers through the shelter signup page.
                  </div>
                ) : (
                  <div className="sd-table-wrap">
                    <table className="sd-table">
                      <thead>
                        <tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th></tr>
                      </thead>
                      <tbody>
                        {shelter.staff.map((s) => (
                          <tr key={s.id}>
                            <td><strong>{s.name}</strong></td>
                            <td>{s.email}</td>
                            <td>{s.phone ?? '—'}</td>
                            <td>{s.role}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* ---------- reviews ---------- */}
              <div className="sd-card">
                <div className="sd-card-head">
                  <div>
                    <h3>Reviews</h3>
                    <p>reviews JOIN users · WHERE shelter_id = {shelter.id}</p>
                  </div>
                </div>

                {shelter.reviews.length === 0 ? (
                  <div className="sd-empty">This shelter has no reviews yet.</div>
                ) : (
                  shelter.reviews.map((r) => (
                    <div className="sd-review" key={r.id}>
                      <div className="sd-review-top">
                        {/* user_name came from the JOIN, not from reviews */}
                        <span className="sd-review-name">{r.user_name}</span>
                        <span className="sd-stars">{stars(r.rating)}</span>
                        {/* the number beside the stars, so rating is never shape-only */}
                        <span className="sd-review-rating">{r.rating}/5</span>
                        <span className="sd-review-date">
                          {new Date(r.created_at).toLocaleDateString()}
                        </span>
                      </div>
                      {r.comment && <div className="sd-review-body">{r.comment}</div>}
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>

      {/* ---------------- ADD / EDIT PET MODAL ---------------- */}
      {petModal && (
        <div className="sd-backdrop">
          <div className="sd-modal">

            <div className="sd-modal-head">
              <div>
                <h3>{editingPetId ? 'Edit Pet' : 'Add Pet'}</h3>
                <p>
                  {editingPetId
                    ? `UPDATE pets SET ... WHERE id = ${editingPetId} AND shelter_id = ${id}`
                    : `INSERT INTO pets (shelter_id = ${id}, ...)`}
                </p>
              </div>
              <button className="sd-close" onClick={() => setPetModal(false)}>
                <X size={16} />
              </button>
            </div>

            <form onSubmit={savePet}>

              <div className="sd-row2">
                <div className="sd-field">
                  <label>Name <span className="sd-hint">- column: name</span></label>
                  <input
                    name="name" value={petForm.name} onChange={handlePetChange}
                    className={petErrors.name ? 'bad' : ''} placeholder="Bella"
                  />
                  {petErrors.name && <div className="sd-err">{petErrors.name[0]}</div>}
                </div>

                <div className="sd-field">
                  <label>Type <span className="sd-hint">- column: type</span></label>
                  <input
                    name="type" value={petForm.type} onChange={handlePetChange}
                    className={petErrors.type ? 'bad' : ''} placeholder="Dog"
                  />
                  {petErrors.type && <div className="sd-err">{petErrors.type[0]}</div>}
                </div>
              </div>

              <div className="sd-row2">
                <div className="sd-field">
                  <label>Breed <span className="sd-hint">- nullable</span></label>
                  <input name="breed" value={petForm.breed} onChange={handlePetChange} placeholder="Labrador" />
                </div>

                <div className="sd-field">
                  <label>Age <span className="sd-hint">- whole years</span></label>
                  <input
                    type="number" min="0" max="60"
                    name="age" value={petForm.age} onChange={handlePetChange}
                    className={petErrors.age ? 'bad' : ''} placeholder="3"
                  />
                  {petErrors.age && <div className="sd-err">{petErrors.age[0]}</div>}
                </div>
              </div>

              <div className="sd-row2">
                <div className="sd-field">
                  <label>Gender</label>
                  <select name="gender" value={petForm.gender} onChange={handlePetChange}>
                    <option value="">-- not set --</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                  </select>
                </div>

                <div className="sd-field">
                  <label>Status <span className="sd-hint">- ENUM</span></label>
                  {/* Exactly the ENUM values, so an invalid one cannot be picked */}
                  <select name="status" value={petForm.status} onChange={handlePetChange}>
                    <option value="available">available</option>
                    <option value="pending">pending</option>
                    <option value="adopted">adopted</option>
                  </select>
                </div>
              </div>

              <div className="sd-row2">
                <div className="sd-field">
                  <label>Health <span className="sd-hint">- ENUM</span></label>
                  <select name="health_status" value={petForm.health_status} onChange={handlePetChange}>
                    <option value="">-- not set --</option>
                    <option value="healthy">healthy</option>
                    <option value="treatment">treatment</option>
                    <option value="critical">critical</option>
                  </select>
                </div>

                <div className="sd-field">
                  <label>Vaccination <span className="sd-hint">- ENUM</span></label>
                  <select name="vaccine_status" value={petForm.vaccine_status} onChange={handlePetChange}>
                    <option value="">-- not set --</option>
                    <option value="vaccinated">vaccinated</option>
                    <option value="partial">partial</option>
                    <option value="not_vaccinated">not vaccinated</option>
                  </select>
                </div>
              </div>

              <div className="sd-field">
                <label>Description <span className="sd-hint">- nullable</span></label>
                <textarea
                  name="description" value={petForm.description} onChange={handlePetChange}
                  placeholder="Friendly, good with children."
                />
              </div>

              <div className="sd-modal-actions">
                <button type="button" className="sd-cancel" onClick={() => setPetModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="sd-btn" disabled={saving}>
                  {saving ? 'Saving...' : editingPetId ? 'Update Pet' : 'Add Pet'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
