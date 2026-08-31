import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  ArrowLeft,
  RefreshCw,
  Building2,
  PawPrint,
  Users,
  FileText,
  CheckCircle,
  Flag,
} from 'lucide-react';

import { fetchReports } from '../../api/reports';

/*
|==============================================================================
| ADMIN REPORTS PAGE   (issue #42)
|==============================================================================
|
| Every number on this page is produced by an AGGREGATE query - the database
| summarises the rows and sends back only the totals.
|
|     stat tiles          COUNT(*) subqueries
|     pets per shelter    shelters LEFT JOIN pets, GROUP BY shelter
|     by status / type    GROUP BY that column
|     applications/day    GROUP BY DATE(created_at)
|     busiest shelters    shelters -> pets -> applications, three tables
|
| WHY BARS AND NOT PIE CHARTS
| A bar's length is read along one axis, so comparing two bars is easy. Pie
| slices are compared by angle and area, which people judge badly - anything
| beyond "one slice is over half" is guesswork.
|
| The status colours were checked with a contrast/colour-blindness validator.
| Every bar also carries a text label and its number, so colour is never the
| only thing telling you what a bar means.
*/

// --- validated status colours ------------------------------------------------
// green / amber / crimson, checked for colour-blind separation against a light
// surface. Do not swap these for prettier shades without re-checking.
const GOOD = '#047857';
const WARN = '#f59e0b';
const BAD = '#be123c';

// One hue for plain magnitude bars. A single series needs one colour, not a
// rainbow - different hues would imply a meaning that is not there.
const BRAND = '#286993';

// Status name -> colour. Anything unrecognised falls back to the brand hue.
const STATUS_COLOR = {
  approved: GOOD, Resolved: GOOD, available: GOOD, active: GOOD,
  pending: WARN, Pending: WARN,
  rejected: BAD, Rejected: BAD,
  adopted: BRAND, inactive: '#64748b',
};

/*
| One row of a bar chart: a label, a proportional bar, and the value.
|
| The bar width is a percentage of the biggest value in the set, so the
| longest bar always fills the row and the rest are read against it.
*/
function BarRow({ label, value, max, color, sublabel }) {
  // Guard against dividing by zero when every value is 0.
  const percent = max > 0 ? Math.round((value / max) * 100) : 0;

  return (
    <div className="rp-bar-row">
      <div className="rp-bar-label">
        {label}
        {sublabel && <span className="rp-bar-sub">{sublabel}</span>}
      </div>

      <div className="rp-bar-track">
        {/* minWidth keeps a non-zero value visible even when it is tiny */}
        <div
          className="rp-bar-fill"
          style={{
            width: `${percent}%`,
            background: color || BRAND,
            minWidth: value > 0 ? '6px' : '0',
          }}
        />
      </div>

      {/* The value in text - so the chart is readable without seeing colour */}
      <div className="rp-bar-value">{value}</div>
    </div>
  );
}

export default function AdminReports() {
  const navigate = useNavigate();

  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = async () => {
    setLoading(true);
    setError('');

    try {
      const data = await fetchReports();
      setReports(data.reports);
    } catch (err) {
      setError(err.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  };

  /*
  | Load once when the page opens.
  |
  | This does not call load() directly. load() sets `loading` to true as its
  | first line, and setting state synchronously inside an effect makes React
  | render twice for no reason. `loading` already starts as true, so on the
  | first run we just fetch and fill in the result.
  |
  | The `cancelled` flag stops us setting state after the user has navigated
  | away while the request was still in flight.
  */
  useEffect(() => {
    let cancelled = false;

    fetchReports()
      .then((data) => {
        if (!cancelled) setReports(data.reports);
      })
      .catch((err) => {
        if (!cancelled) setError(err.message || 'Could not reach the server.');
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  // The largest value in a list, used to scale every bar in that list.
  const maxOf = (rows, key) =>
    rows && rows.length ? Math.max(...rows.map((r) => Number(r[key]) || 0)) : 0;

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

        .rp-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 400% 400%;
          animation: rpFlow 20s ease infinite;
          color: #102c45;
          padding-bottom: 44px;
        }

        @keyframes rpFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .rp-topbar {
          height: 68px; background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 26px; box-shadow: 0 2px 14px rgba(16,44,69,0.07);
          position: sticky; top: 0; z-index: 20;
        }

        .rp-brand { display: flex; align-items: center; gap: 10px; }

        .rp-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #286993; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }

        .rp-brand h1 { font-size: 17px; font-weight: 800; }
        .rp-brand p  { font-size: 11px; color: #64748b; }

        .rp-topbar-actions { display: flex; align-items: center; gap: 9px; }

        .rp-back, .rp-refresh {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(40,105,147,0.1); color: #286993;
          border: none; border-radius: 9px; padding: 9px 14px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }

        .rp-back:hover, .rp-refresh:hover { background: rgba(40,105,147,0.18); }

        .rp-container {
          /* min() = "whichever is smaller". Wide screens get 1560px;
             narrow ones fall back to 94% of the viewport instead of
             overflowing. */
          max-width: min(1560px, 94vw);
          margin: 0 auto;
          padding: 26px 24px 0;
        }

        .rp-heading h2 { font-size: 24px; font-weight: 800; }
        .rp-heading p  { font-size: 13px; color: #64748b; margin-top: 3px; }

        /* ---- stat tiles: a headline number needs no chart ---- */
        .rp-tiles {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
          gap: 15px; margin: 22px 0 26px;
        }

        .rp-tile {
          background: rgba(255,255,255,0.88); border-radius: 13px;
          padding: 16px 18px; display: flex; align-items: center; gap: 13px;
          box-shadow: 0 3px 14px rgba(16,44,69,0.06);
        }

        .rp-tile-icon {
          width: 38px; height: 38px; border-radius: 10px;
          background: rgba(40,105,147,0.12); color: #286993;
          display: flex; align-items: center; justify-content: center;
          flex-shrink: 0;
        }

        .rp-tile-num   { font-size: 23px; font-weight: 800; line-height: 1.05; }
        .rp-tile-label { font-size: 11px; color: #64748b; margin-top: 2px; }

        /* ---- report cards ---- */
        .rp-grid {
          display: grid; grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
          gap: 16px;
        }

        .rp-card {
          background: rgba(255,255,255,0.88); border-radius: 15px;
          padding: 19px; box-shadow: 0 4px 20px rgba(16,44,69,0.07);
        }

        .rp-card.wide { grid-column: 1 / -1; }

        .rp-card h3 { font-size: 15px; font-weight: 700; }

        .rp-card .rp-sql {
          font-size: 11px; color: #64748b; margin: 3px 0 15px;
          font-family: Consolas, Monaco, monospace;
        }

        /* ---- bar rows ---- */
        .rp-bar-row {
          display: grid;
          /* minmax lets the label column grow up to 230px on a wide card and
             shrink on a narrow one. The old fixed 150px is what cut
             "Safe Haven Animal Shelter" off with an ellipsis. */
          grid-template-columns: minmax(120px, 230px) 1fr 46px;
          align-items: center;
          gap: 12px;
          margin-bottom: 10px;
        }

        .rp-bar-label {
          font-size: 12.5px;
          font-weight: 600;
          line-height: 1.35;
          /* Wrap a long name onto a second line instead of truncating it.
             overflow-wrap: anywhere also breaks a single very long word,
             which the default would let spill out of the column. */
          overflow-wrap: anywhere;
        }

        .rp-bar-sub {
          display: block; font-size: 10px; color: #94a3b8; font-weight: 400;
        }

        .rp-bar-track {
          height: 15px; background: rgba(40,105,147,0.08);
          border-radius: 4px; overflow: hidden;
        }

        /* 4px rounded end on the data side, flat against the baseline */
        .rp-bar-fill {
          height: 100%; border-radius: 0 4px 4px 0;
          transition: width 0.35s ease;
        }

        .rp-bar-value {
          font-size: 13px; font-weight: 700; text-align: right;
        }

        /* ---- legend: identity is never colour alone ---- */
        .rp-legend {
          display: flex; flex-wrap: wrap; gap: 13px;
          margin-top: 13px; padding-top: 11px;
          border-top: 1px solid rgba(40,105,147,0.09);
        }

        .rp-legend-item {
          display: flex; align-items: center; gap: 6px;
          font-size: 11px; color: #64748b;
        }

        .rp-swatch { width: 11px; height: 11px; border-radius: 3px; flex-shrink: 0; }

        /* ---- table for the widest report ---- */
        .rp-table-wrap { width: 100%; overflow-x: auto; }
        .rp-table { width: 100%; border-collapse: collapse; font-size: 13px; text-align: left; }

        .rp-table th {
          background: rgba(40,105,147,0.08); color: #64748b; font-weight: 600;
          padding: 10px 12px; white-space: nowrap;
          border-bottom: 1px solid rgba(40,105,147,0.12);
        }

        .rp-table td {
          padding: 11px 12px; border-bottom: 1px solid rgba(40,105,147,0.08);
        }

        .rp-table td.num { font-weight: 700; }

        .rp-msg { padding: 30px 12px; text-align: center; font-size: 13px; color: #64748b; }
        .rp-msg.error { color: #b91c1c; }

        .rp-spin { animation: rpSpin 0.9s linear infinite; display: inline-block; }
        @keyframes rpSpin { to { transform: rotate(360deg); } }

        .rp-empty { font-size: 12px; color: #94a3b8; font-style: italic; padding: 6px 0; }
      `}</style>

      <div className="rp-page">

        <header className="rp-topbar">
          <div className="rp-brand">
            <div className="rp-brand-icon"><Dog size={20} /></div>
            <div>
              <h1>PetConnect</h1>
              <p>Platform Reports</p>
            </div>
          </div>

          <div className="rp-topbar-actions">
            <button className="rp-refresh" onClick={load}>
              <RefreshCw size={14} /> Refresh
            </button>
            <button className="rp-back" onClick={() => navigate('/dashboard/admin')}>
              <ArrowLeft size={15} /> Back to Dashboard
            </button>
          </div>
        </header>

        <div className="rp-container">

          <div className="rp-heading">
            <h2>Reports</h2>
            <p>Every figure here is calculated by the database with COUNT and GROUP BY.</p>
          </div>

          {loading && (
            <div className="rp-msg">
              <RefreshCw size={15} className="rp-spin" /> Running the report queries...
            </div>
          )}

          {!loading && error && <div className="rp-msg error">{error}</div>}

          {!loading && !error && reports && (
            <>
              {/*
                STAT TILES - a single headline number is not a chart.
                Drawing one bar to represent one number adds nothing.
              */}
              <div className="rp-tiles">
                <div className="rp-tile">
                  <div className="rp-tile-icon"><Building2 size={19} /></div>
                  <div>
                    <div className="rp-tile-num">{reports.overview.total_shelters}</div>
                    <div className="rp-tile-label">Shelters</div>
                  </div>
                </div>

                <div className="rp-tile">
                  <div className="rp-tile-icon"><PawPrint size={19} /></div>
                  <div>
                    <div className="rp-tile-num">{reports.overview.total_pets}</div>
                    <div className="rp-tile-label">Pets</div>
                  </div>
                </div>

                <div className="rp-tile">
                  <div className="rp-tile-icon"><Users size={19} /></div>
                  <div>
                    <div className="rp-tile-num">{reports.overview.total_users}</div>
                    <div className="rp-tile-label">Users</div>
                  </div>
                </div>

                <div className="rp-tile">
                  <div className="rp-tile-icon"><FileText size={19} /></div>
                  <div>
                    <div className="rp-tile-num">{reports.overview.total_applications}</div>
                    <div className="rp-tile-label">Applications</div>
                  </div>
                </div>

                <div className="rp-tile">
                  <div className="rp-tile-icon" style={{ background: 'rgba(4,120,87,0.12)', color: GOOD }}>
                    <CheckCircle size={19} />
                  </div>
                  <div>
                    <div className="rp-tile-num">{reports.overview.total_adoptions}</div>
                    <div className="rp-tile-label">Adoptions</div>
                  </div>
                </div>

                <div className="rp-tile">
                  <div className="rp-tile-icon" style={{ background: 'rgba(245,158,11,0.14)', color: '#b45309' }}>
                    <Flag size={19} />
                  </div>
                  <div>
                    <div className="rp-tile-num">{reports.overview.pending_complaints}</div>
                    <div className="rp-tile-label">Open complaints</div>
                  </div>
                </div>
              </div>

              <div className="rp-grid">

                {/* ---- pets per shelter ---- */}
                <div className="rp-card">
                  <h3>Pets per shelter</h3>
                  <p className="rp-sql">shelters LEFT JOIN pets · GROUP BY shelter</p>

                  {reports.pets_per_shelter.length === 0 ? (
                    <div className="rp-empty">No shelters yet.</div>
                  ) : (
                    reports.pets_per_shelter.map((row) => (
                      <BarRow
                        key={row.id}
                        label={row.name}
                        sublabel={row.location}
                        value={Number(row.total_pets)}
                        max={maxOf(reports.pets_per_shelter, 'total_pets')}
                        color={BRAND}
                      />
                    ))
                  )}
                  <div className="rp-legend">
                    <div className="rp-legend-item">
                      LEFT JOIN, so a shelter with 0 pets still appears.
                    </div>
                  </div>
                </div>

                {/* ---- pets by status ---- */}
                <div className="rp-card">
                  <h3>Pets by status</h3>
                  <p className="rp-sql">GROUP BY pets.status</p>

                  {reports.pets_by_status.length === 0 ? (
                    <div className="rp-empty">No pets yet.</div>
                  ) : (
                    reports.pets_by_status.map((row) => (
                      <BarRow
                        key={row.status}
                        label={row.status}
                        value={Number(row.total)}
                        max={maxOf(reports.pets_by_status, 'total')}
                        color={STATUS_COLOR[row.status]}
                      />
                    ))
                  )}
                </div>

                {/* ---- pets by type ---- */}
                <div className="rp-card">
                  <h3>Pets by type</h3>
                  <p className="rp-sql">GROUP BY pets.type</p>

                  {reports.pets_by_type.length === 0 ? (
                    <div className="rp-empty">No pets yet.</div>
                  ) : (
                    reports.pets_by_type.map((row) => (
                      <BarRow
                        key={row.type}
                        label={row.type}
                        value={Number(row.total)}
                        max={maxOf(reports.pets_by_type, 'total')}
                        color={BRAND}
                      />
                    ))
                  )}
                </div>

                {/* ---- applications by outcome ---- */}
                <div className="rp-card">
                  <h3>Applications by outcome</h3>
                  <p className="rp-sql">GROUP BY applications.status</p>

                  {reports.applications_by_status.length === 0 ? (
                    <div className="rp-empty">No applications yet.</div>
                  ) : (
                    <>
                      {reports.applications_by_status.map((row) => (
                        <BarRow
                          key={row.status}
                          label={row.status}
                          value={Number(row.total)}
                          max={maxOf(reports.applications_by_status, 'total')}
                          color={STATUS_COLOR[row.status]}
                        />
                      ))}

                      {/* A legend so the colours are never the only cue */}
                      <div className="rp-legend">
                        <span className="rp-legend-item">
                          <span className="rp-swatch" style={{ background: GOOD }} /> approved
                        </span>
                        <span className="rp-legend-item">
                          <span className="rp-swatch" style={{ background: WARN }} /> pending
                        </span>
                        <span className="rp-legend-item">
                          <span className="rp-swatch" style={{ background: BAD }} /> rejected
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {/* ---- complaints by category ---- */}
                <div className="rp-card">
                  <h3>Complaints by category</h3>
                  <p className="rp-sql">GROUP BY complaints.category</p>

                  {reports.complaints_by_category.length === 0 ? (
                    <div className="rp-empty">No complaints yet.</div>
                  ) : (
                    reports.complaints_by_category.map((row) => (
                      <BarRow
                        key={row.category}
                        label={row.category}
                        sublabel={`${row.still_pending} still open`}
                        value={Number(row.total)}
                        max={maxOf(reports.complaints_by_category, 'total')}
                        color={BRAND}
                      />
                    ))
                  )}
                </div>

                {/* ---- applications per day ---- */}
                <div className="rp-card">
                  <h3>Applications per day</h3>
                  <p className="rp-sql">GROUP BY DATE(created_at) · last 30 days</p>

                  {reports.applications_by_day.length === 0 ? (
                    <div className="rp-empty">No applications in the last 30 days.</div>
                  ) : (
                    reports.applications_by_day.map((row) => (
                      <BarRow
                        key={row.day}
                        label={new Date(row.day).toLocaleDateString(undefined, {
                          day: 'numeric', month: 'short',
                        })}
                        value={Number(row.total)}
                        max={maxOf(reports.applications_by_day, 'total')}
                        color={BRAND}
                      />
                    ))
                  )}
                  <div className="rp-legend">
                    <div className="rp-legend-item">
                      DATE() drops the time, so a whole day groups into one bar.
                    </div>
                  </div>
                </div>

                {/* ---- busiest shelters: the three-table join ---- */}
                <div className="rp-card wide">
                  <h3>Busiest shelters</h3>
                  <p className="rp-sql">
                    shelters LEFT JOIN pets LEFT JOIN applications · GROUP BY shelter · HAVING pets_listed &gt; 0
                  </p>

                  {reports.busiest_shelters.length === 0 ? (
                    <div className="rp-empty">No shelter has any pets listed yet.</div>
                  ) : (
                    <div className="rp-table-wrap">
                      <table className="rp-table">
                        <thead>
                          <tr>
                            <th>Shelter</th>
                            <th>Pets listed</th>
                            <th>Applications</th>
                            <th>Adoptions completed</th>
                          </tr>
                        </thead>
                        <tbody>
                          {reports.busiest_shelters.map((row) => (
                            <tr key={row.id}>
                              <td>{row.name}</td>
                              <td className="num">{row.pets_listed}</td>
                              <td className="num">{row.applications_received}</td>
                              <td className="num" style={{ color: GOOD }}>
                                {row.adoptions_completed}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}

                  <div className="rp-legend">
                    <div className="rp-legend-item">
                      COUNT(DISTINCT pets.id) - joining three tables repeats rows, and
                      DISTINCT stops each pet being counted more than once.
                    </div>
                  </div>
                </div>

              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
