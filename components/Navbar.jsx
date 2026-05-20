import React from 'react';
import { NavLink } from 'react-router-dom';

const Navbar = () => {
  return (
    <nav className="glass" style={{
      position: 'fixed',
      bottom: '20px',
      left: '50%',
      transform: 'translateX(-50%)',
      width: '90%',
      maxWidth: '400px',
      height: '70px',
      borderRadius: '25px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-around',
      zIndex: 1000,
      padding: '0 10px'
    }}>
      <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-home"></i>
      </NavLink>
      <NavLink to="/transferir" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-paper-plane"></i>
      </NavLink>
      <NavLink to="/pagar" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-shopping-cart"></i>
      </NavLink>
      <NavLink to="/perfil" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
        <i className="fas fa-user"></i>
      </NavLink>

      <style>{`
        .nav-item {
          color: rgba(255, 255, 255, 0.4);
          font-size: 1.4rem;
          transition: all 0.3s ease;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          border-radius: 18px;
        }
        .nav-item.active {
          color: #fff;
          background: var(--accent);
          box-shadow: 0 8px 20px rgba(99, 102, 241, 0.4);
          transform: translateY(-5px);
        }
        @media (min-width: 801px) {
          nav {
            display: none !important;
          }
        }
      `}</style>
    </nav>
  );
};

export default Navbar;
