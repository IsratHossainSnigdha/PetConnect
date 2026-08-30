import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Dog,
  LayoutDashboard,
  Building2,
  Flag,
  BarChart3,
  Settings,
  LogOut,
} from 'lucide-react';

/*
|==============================================================================
| ADMIN SIDEBAR   (issue #34)
|==============================================================================
|
| Pulled out of adminDashboard.jsx, which had grown past 1,900 lines.
|
| WHY SPLIT A FILE UP AT ALL
| A component should be small enough to hold in your head. When the sidebar,
| the stat cards, the shelter table and three popups all live in one file, a
| change to any of them means scrolling past the others - and two people
| editing different features end up editing the same file and conflicting.
|
| WHAT GOES IN A COMPONENT AND WHAT STAYS OUT
| This one is PRESENTATIONAL: it draws things and reports clicks. It holds no
| state and talks to no API. The page above it owns the data; this just
| receives what it needs through props.
|
| That separation is why the same sidebar can be reused on other admin pages
| without dragging any dashboard logic along with it.
|
| PROPS
|   activeTab      which menu item to highlight
|   onTabChange    called with a tab name when a non-navigating item is clicked
|   onLogout       called when Logout is pressed
*/
export default function AdminSidebar({ activeTab, onTabChange, onLogout }) {
  const navigate = useNavigate();

  return (
    <aside className="sidebar">
      <div className="sidebar-top">

        <div className="sidebar-brand" onClick={() => navigate('/')}>
          <div className="brand-icon">
            <Dog size={22} />
          </div>
          <div>
            <div className="brand-title">Pet Admin</div>
            <div className="brand-subtitle">Platform Administration</div>
          </div>
        </div>

        <div className="sidebar-menu">
          <button
            className={`menu-item ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => onTabChange('dashboard')}
          >
            <LayoutDashboard size={18} /> Dashboard
          </button>

          {/* These three open their own pages (issues #35, #41, #42) */}
          <button
            className={`menu-item ${activeTab === 'shelters' ? 'active' : ''}`}
            onClick={() => navigate('/shelters/admin')}
          >
            <Building2 size={18} /> Shelters
          </button>

          <button
            className={`menu-item ${activeTab === 'complaints' ? 'active' : ''}`}
            onClick={() => navigate('/complaints/admin')}
          >
            <Flag size={18} /> Complaints
          </button>

          <button
            className={`menu-item ${activeTab === 'reports' ? 'active' : ''}`}
            onClick={() => navigate('/reports/admin')}
          >
            <BarChart3 size={18} /> Reports
          </button>

          <button
            className={`menu-item ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => onTabChange('settings')}
          >
            <Settings size={18} /> Settings
          </button>
        </div>
      </div>

      <div className="sidebar-bottom">
        {/*
          A real logout: the page's handler DELETEs the row from
          personal_access_tokens so the token stops working server-side.
          Simply navigating away would leave it valid.
        */}
        <button className="logout-btn" onClick={onLogout}>
          <LogOut size={18} /> Logout
        </button>
      </div>
    </aside>
  );
}
