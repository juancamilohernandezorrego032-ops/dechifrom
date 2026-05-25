import React, { useContext } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { AppContext } from './App';
import Navbar from './components/Navbar';

const Layout = () => {
  const { user, logout } = useContext(AppContext);
  const navigate = useNavigate();
  const location = useLocation();

  const getInitials = (name) => {
    if (!name) return 'N';
    return name.trim().split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  };

  return (
    <div className="layout-container">
      {/* Sidebar Desktop */}
      <aside className="sidebar">
        {/* Logo */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', paddingLeft: '10px' }}>
          <i className="fa-solid fa-building-columns" style={{ color: '#00d2ff', fontSize: '1.4rem' }}></i>
          <span style={{ fontSize: '1.35rem', fontWeight: '800', letterSpacing: '0.5px' }}>NovaPay</span>
        </div>

        {/* Profile Section */}
        <div className="profile-section">
          <div className="profile-avatar">
            {getInitials(user?.name)}
          </div>
          <h3 className="profile-name">{user?.name || 'Usuario'}</h3>
          <span className="profile-tag">Premium Account</span>
        </div>

        {/* Nav Links */}
        <ul className="nav-list">
          <li>
            <div 
              onClick={() => navigate('/')} 
              className={`sidebar-nav-item ${location.pathname === '/' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-house"></i>
              <span>Inicio</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => navigate('/transferir')} 
              className={`sidebar-nav-item ${location.pathname === '/transferir' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-paper-plane"></i>
              <span>Billetera</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => navigate('/pagar')} 
              className={`sidebar-nav-item ${location.pathname === '/pagar' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-shopping-cart"></i>
              <span>Inversiones</span>
            </div>
          </li>
          <li>
            <div 
              onClick={() => navigate('/ajustes')} 
              className={`sidebar-nav-item ${location.pathname === '/ajustes' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-gear"></i>
              <span>Ajustes y Personalización</span>
            </div>
          </li>
          <li>
            <div
              onClick={() => navigate('/reporte')}
              className={`sidebar-nav-item ${location.pathname === '/reporte' ? 'active' : ''}`}
            >
              <i className="fa-solid fa-chart-line"></i>
              <span>Reporte y Graficas</span>
            </div>
          </li>
        </ul>

        {/* Logout at bottom */}
        <div style={{ marginTop: 'auto', padding: '0 10px' }}>
          <button 
            onClick={logout}
            style={{
              width: '100%',
              padding: '14px 20px',
              borderRadius: '18px',
              background: 'rgba(239, 68, 68, 0.08)',
              border: '1px solid rgba(239, 68, 68, 0.25)',
              color: '#ff4d4d',
              fontWeight: '600',
              fontSize: '0.95rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              transition: 'all 0.3s',
              borderStyle: 'solid'
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.16)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.background = 'rgba(239, 68, 68, 0.08)';
              e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.25)';
            }}
          >
            <i className="fa-solid fa-sign-out-alt"></i>
            Cerrar Sesión
          </button>
        </div>
      </aside>

      {/* Main content pane */}
      <main className="main-content">
        <Outlet />
      </main>

      {/* Navbar Mobile */}
      <Navbar />
    </div>
  );
};

export default Layout;