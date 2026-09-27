import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  ArrowLeft,
  Settings as SettingsIcon,
  Save,
  RefreshCw,
  History,
  Check,
} from 'lucide-react';

import {
  fetchSettings,
  saveSettings,
  fetchSettingsHistory,
} from '../../api/settings';

/*
|==============================================================================
| ADMIN SETTINGS PAGE
|==============================================================================
|
|     this page -> src/api/settings.js -> /api/settings  (Api\SettingsController)
|                                          -> CALL sp_save_user_settings
|                                              -> trg_log_user_settings_change
|
| Nothing here is stored in the browser. Every value comes from the
| user_settings table and goes back to it, so the same admin signing in on a
| different machine sees the same choices.
|
| The "Recent changes" panel at the bottom is written entirely by the database.
| No code in this file, and none in the controller, inserts those rows - the
| trigger does it when the procedure's UPDATE runs.
|
| WHY THIS PAGE EXISTS SEPARATELY FROM pages/Settings.jsx
|
|   That page belongs to the shared /settings route and keeps its values in
|   localStorage. Its layout classes (.dashboard-navbar, .dashboard-layout,
|   .dashboard-main) have no CSS anywhere in the project, so it renders
|   unstyled. Rather than edit a shared page the whole team uses, the admin
|   gets its own, with styles scoped behind an "as-" prefix so they cannot
|   collide with anyone else's.
*/

const LANGUAGES = ['English', 'Bangla'];

// Every toggle on the page, so the markup below is one loop instead of four
// near-identical blocks.
const TOGGLES = [
  {
    key: 'email_notifications',
    label: 'Email notifications',
    help: 'Receive email updates about platform activity.',
  },
  {
    key: 'adoption_alerts',
    label: 'Adoption alerts',
    help: 'Be told as soon as an adoption application is submitted.',
  },
  {
    key: 'public_profile',
    label: 'Public profile',
    help: 'Let other users see your name on the platform.',
  },
  {
    key: 'dark_mode',
    label: 'Dark mode',
    help: 'Remembered on the server, so it follows you between devices.',
  },
];

export default function AdminSettings() {
  const navigate = useNavigate();

  const [settings, setSettings] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [saving, setSaving] = useState(false);
  const [saveNote, setSaveNote] = useState('');

  /*
  | READ  ->  GET /api/settings  and  GET /api/settings/history
  |
  | Promise.all so the two requests go out together rather than one after the
  | other - the page is ready as soon as the slower of the two lands.
  */
  const load = useCallback(async () => {
    // No setState before the first await. Calling it synchronously inside an
    // effect makes React render, set state, and render again before the
    // browser has painted anything.
    try {
      const [settingsData, historyData] = await Promise.all([
        fetchSettings(),
        fetchSettingsHistory(),
      ]);

      setSettings(settingsData.settings);
      setHistory(historyData.history || []);
      setLoadError('');
    } catch (error) {
      setLoadError(error.message || 'Could not reach the server.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    // `loading` already starts true, so the effect has nothing to set up front
    // and simply kicks the request off.
    let cancelled = false;

    (async () => {
      await load();
      // The component can unmount while the request is in flight; without this
      // React warns about setting state on something that is gone.
      if (cancelled) return;
    })();

    return () => { cancelled = true; };
  }, [load]);

  // The retry button is an event handler, not an effect, so it is free to set
  // state straight away.
  const retry = () => {
    setLoading(true);
    setLoadError('');
    load();
  };

  // Update one field in local state. Nothing is sent until Save is pressed.
  const change = (key, value) => {
    setSettings((current) => ({ ...current, [key]: value }));
    setSaveNote('');
  };

  /*
  | WRITE  ->  PUT /api/settings
  */
  const handleSave = async () => {
    setSaving(true);
    setSaveNote('');

    try {
      const data = await saveSettings(settings);

      // Trust what came back, not what we sent - the server returns what is
      // actually stored.
      setSettings(data.settings);
      setSaveNote(data.message);

      // Re-read the history, because the trigger has just written to it.
      const historyData = await fetchSettingsHistory();
      setHistory(historyData.history || []);
    } catch (error) {
      setSaveNote(error.message || 'Could not save.');
    } finally {
      setSaving(false);
    }
  };

  const prettyName = (name) => name.replace(/_/g, ' ');

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

        .as-page {
          min-height: 100vh;
          background: linear-gradient(135deg, #e6f2ff, #f9f4ef, #e3f6ee, #f0e6ff, #e8f4f8);
          background-size: 400% 400%;
          animation: asFlow 20s ease infinite;
          color: #102c45;
          padding-bottom: 40px;
        }

        @keyframes asFlow {
          0%   { background-position: 0% 50%; }
          50%  { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        .as-topbar {
          height: 68px; background: rgba(255,255,255,0.9);
          backdrop-filter: blur(12px);
          display: flex; align-items: center; justify-content: space-between;
          padding: 0 26px; box-shadow: 0 2px 14px rgba(16,44,69,0.07);
          position: sticky; top: 0; z-index: 20;
        }

        .as-brand { display: flex; align-items: center; gap: 10px; }

        .as-brand-icon {
          width: 36px; height: 36px; border-radius: 10px;
          background: #286993; color: #fff;
          display: flex; align-items: center; justify-content: center;
        }

        .as-brand h1 { font-size: 17px; font-weight: 800; }
        .as-brand p  { font-size: 11px; color: #64748b; }

        .as-back {
          display: inline-flex; align-items: center; gap: 6px;
          background: rgba(40,105,147,0.1); color: #286993;
          border: none; border-radius: 9px; padding: 9px 14px;
          font-size: 13px; font-weight: 600; cursor: pointer;
        }
        .as-back:hover { background: rgba(40,105,147,0.18); }

        .as-container {
          max-width: min(900px, 94vw);
          margin: 0 auto;
          padding: 26px 24px 0;
        }

        .as-heading h2 { font-size: 24px; font-weight: 800; }
        .as-heading p  { font-size: 13px; color: #64748b; margin-top: 3px; }

        .as-card {
          background: rgba(255,255,255,0.88); border-radius: 15px;
          padding: 20px; box-shadow: 0 4px 20px rgba(16,44,69,0.07);
          margin-top: 20px;
        }

        .as-card-head { margin-bottom: 6px; }
        .as-card-head h3 { font-size: 16px; font-weight: 700; }
        .as-card-head p  { font-size: 12px; color: #64748b; margin-top: 2px; }

        .as-row {
          display: flex; align-items: center; justify-content: space-between;
          gap: 16px; padding: 14px 0;
          border-bottom: 1px solid rgba(40,105,147,0.09);
        }
        .as-row:last-of-type { border-bottom: none; }

        .as-row-label { font-size: 13.5px; font-weight: 600; }
        .as-row-help  { font-size: 11.5px; color: #64748b; margin-top: 2px; }

        /* A checkbox styled as a sliding switch. The real <input> is still
           there, just visually hidden, so it stays keyboard accessible. */
        .as-switch { position: relative; width: 46px; height: 25px; flex-shrink: 0; }
        .as-switch input { opacity: 0; width: 0; height: 0; }

        .as-slider {
          position: absolute; inset: 0; cursor: pointer;
          background: #cbd5e1; border-radius: 25px; transition: background 0.2s;
        }
        .as-slider:before {
          content: ""; position: absolute;
          height: 19px; width: 19px; left: 3px; bottom: 3px;
          background: #fff; border-radius: 50%; transition: transform 0.2s;
        }
        .as-switch input:checked + .as-slider { background: #059669; }
        .as-switch input:checked + .as-slider:before { transform: translateX(21px); }
        .as-switch input:focus-visible + .as-slider { outline: 2px solid #286993; outline-offset: 2px; }

        .as-select {
          border: 1px solid rgba(40,105,147,0.22); border-radius: 9px;
          padding: 9px 12px; font-size: 13px; background: #fff;
          color: #102c45; cursor: pointer; min-width: 140px;
        }

        .as-actions {
          display: flex; align-items: center; gap: 12px;
          margin-top: 18px; flex-wrap: wrap;
        }

        .as-save {
          background: #286993; color: #fff; border: none; border-radius: 9px;
          padding: 10px 18px; font-size: 13px; font-weight: 700; cursor: pointer;
          display: inline-flex; align-items: center; gap: 7px;
        }
        .as-save:hover:not(:disabled) { background: #1f5375; }
        .as-save:disabled { opacity: 0.6; cursor: not-allowed; }

        .as-note {
          font-size: 12.5px; color: #059669; font-weight: 600;
          display: inline-flex; align-items: center; gap: 6px;
        }
        .as-note.bad { color: #dc2626; }

        .as-hist-item {
          display: flex; align-items: baseline; justify-content: space-between;
          gap: 10px; padding: 9px 0;
          border-bottom: 1px solid rgba(40,105,147,0.08);
          font-size: 12.5px;
        }
        .as-hist-item:last-child { border-bottom: none; }
        .as-hist-name { font-weight: 600; text-transform: capitalize; }
        .as-hist-change { color: #475569; }
        .as-hist-time { font-size: 10.5px; color: #94a3b8; white-space: nowrap; }

        .as-empty { padding: 16px 0; font-size: 12.5px; color: #64748b; }

        .as-spin { animation: asSpin 1s linear infinite; }
        @keyframes asSpin { to { transform: rotate(360deg); } }

        @media (max-width: 640px) {
          .as-container { padding: 18px 16px 0; }
          .as-row { flex-wrap: wrap; }
        }
      `}</style>

      <div className="as-page">
        <header className="as-topbar">
          <div className="as-brand">
            <div className="as-brand-icon"><Dog size={20} /></div>
            <div>
              <h1>PetConnect</h1>
              <p>Platform Settings</p>
            </div>
          </div>

          <button className="as-back" onClick={() => navigate('/dashboard/admin')}>
            <ArrowLeft size={15} /> Back to Dashboard
          </button>
        </header>

        <div className="as-container">
          <div className="as-heading">
            <h2>Settings</h2>
            <p>Stored in the database, so they follow you to any device you sign in from.</p>
          </div>

          {/* Three render states: loading, failed, ready. */}
          {loading && (
            <div className="as-card">
              <div className="as-empty">
                <RefreshCw size={14} className="as-spin" /> Loading settings...
              </div>
            </div>
          )}

          {!loading && loadError && (
            <div className="as-card">
              <div className="as-empty" style={{ color: '#dc2626' }}>{loadError}</div>
              <button className="as-save" onClick={retry}>
                <RefreshCw size={14} /> Try again
              </button>
            </div>
          )}

          {!loading && !loadError && settings && (
            <>
              <div className="as-card">
                <div className="as-card-head">
                  <h3><SettingsIcon size={15} /> Preferences</h3>
                  <p>Saved through sp_save_user_settings, inside one transaction.</p>
                </div>

                {TOGGLES.map((t) => (
                  <div className="as-row" key={t.key}>
                    <div>
                      <div className="as-row-label">{t.label}</div>
                      <div className="as-row-help">{t.help}</div>
                    </div>

                    <label className="as-switch">
                      <input
                        type="checkbox"
                        // ?? false so the input is always controlled, even for
                        // a value the server has not sent yet.
                        checked={settings[t.key] ?? false}
                        onChange={(e) => change(t.key, e.target.checked)}
                      />
                      <span className="as-slider" />
                    </label>
                  </div>
                ))}

                <div className="as-row">
                  <div>
                    <div className="as-row-label">Language</div>
                    <div className="as-row-help">
                      The database only accepts these two - the procedure checks it as well.
                    </div>
                  </div>

                  <select
                    className="as-select"
                    value={settings.language ?? 'English'}
                    onChange={(e) => change('language', e.target.value)}
                  >
                    {LANGUAGES.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                </div>

                <div className="as-actions">
                  <button className="as-save" onClick={handleSave} disabled={saving}>
                    {saving
                      ? <><RefreshCw size={14} className="as-spin" /> Saving...</>
                      : <><Save size={14} /> Save settings</>}
                  </button>

                  {saveNote && (
                    <span className={`as-note ${/error|could not|invalid/i.test(saveNote) ? 'bad' : ''}`}>
                      <Check size={14} /> {saveNote}
                    </span>
                  )}
                </div>
              </div>

              <div className="as-card">
                <div className="as-card-head">
                  <h3><History size={15} /> Recent changes</h3>
                  <p>
                    Written by the trigger trg_log_user_settings_change - one row per
                    setting that actually changed. Saving without changing anything
                    records nothing.
                  </p>
                </div>

                {history.length === 0 ? (
                  <div className="as-empty">No changes recorded yet.</div>
                ) : (
                  history.map((h, i) => (
                    <div className="as-hist-item" key={i}>
                      <div>
                        <span className="as-hist-name">{prettyName(h.setting_name)}</span>
                        {' '}
                        <span className="as-hist-change">
                          {h.old_value} &rarr; {h.new_value}
                        </span>
                      </div>
                      <span className="as-hist-time">{h.changed_at}</span>
                    </div>
                  ))
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
