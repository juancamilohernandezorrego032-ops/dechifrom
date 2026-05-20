import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AppContext } from '../App';
import Swal from 'sweetalert2';

// HU09 - Notificaciones con SweetAlert2 (prohibido usar alert() nativo)
const Login = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const { login } = useContext(AppContext);
  const [error, setError] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!username || !password) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos',
        text: 'Ingresa usuario y PIN para continuar.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    const result = login(username.trim(), password.trim());
    if (result === 'switch') {
      setUsername('');
      setPassword('');
      setError(false);
      return;
    }

    if (!result) {
      setPassword('');
      setError(true);
      Swal.fire({
        icon: 'error',
        title: '❌ Acceso denegado',
        text: 'Usuario o PIN incorrectos. Verifica tus datos e intenta de nuevo.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
        timer: 2500,
        timerProgressBar: true,
      });
      return;
    }

    Swal.fire({
      icon: 'success',
      title: '✓ ¡Bienvenido!',
      text: 'Sesión iniciada correctamente.',
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
    }).then(() => navigate('/'));
  };

  // Si ya existe sesión activa redirigir al componente principal
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/');
    }
  }, [navigate]);

  // Bloquear navegación (flechas atrás/adelante) mientras estemos en la pantalla de login
  useEffect(() => {
    // Push inicial para evitar volver atrás
    try {
      window.history.pushState(null, document.title, window.location.href);
    } catch (e) {}

    const handlePopState = () => {
      // Reempujamos para mantenernos en la misma URL
      try {
        window.history.pushState(null, document.title, window.location.href);
      } catch (e) {}

      // Mostrar una notificación corta de seguridad
      Swal.fire({
        icon: 'warning',
        title: 'Acción no permitida',
        text: 'No puedes usar las flechas del navegador en la pantalla de inicio de sesión.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
        timer: 1400,
        timerProgressBar: true,
        showConfirmButton: false,
      });
    };

    const handleKeyDownLogin = (e) => {
      const active = document.activeElement;
      const tag = active && active.tagName;
      const isEditable = active && (active.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA');

      // Evitar Backspace navegando fuera cuando no estamos en un input/textarea
      if (e.key === 'Backspace' && !isEditable) {
        e.preventDefault();
        return;
      }

      // Evitar Alt+ArrowLeft/ArrowRight
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        Swal.fire({
          icon: 'warning',
          title: 'Acción no permitida',
          text: 'Navegación hacia atrás/adelante está deshabilitada en esta pantalla.',
          background: '#1a1a2e',
          color: '#f8fafc',
          confirmButtonColor: '#6366f1',
          timer: 1400,
          timerProgressBar: true,
          showConfirmButton: false,
        });
      }
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDownLogin, { passive: false });

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDownLogin, { passive: false });
    };
  }, []);

  return (
    <div className="login-screen">
      <div className="login-box glass-premium animate-fade-in" style={{ padding: '45px 35px' }}>
        <h2 style={{ color: '#0052cc', fontWeight: '800', textAlign: 'center', marginBottom: '25px', letterSpacing: '1px' }}>LOGIN</h2>
        
        <form onSubmit={handleSubmit} style={{ marginTop: '10px' }}>
          <div className="login-input-group">
            <i className="fa-solid fa-user" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              type="text"
              value={username}
              onChange={(e) => { setUsername(e.target.value); setError(false); }}
              placeholder="Username"
            />
          </div>

          <div className="login-input-group">
            <i className="fa-solid fa-lock" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              type="password"
              value={password}
              onChange={(e) => { setPassword(e.target.value); setError(false); }}
              placeholder="Password"
            />
          </div>

          {error && (
            <p style={{ color: '#ff4d4d', textAlign: 'center', fontSize: '0.8rem', marginBottom: '15px' }}>
              Usuario o PIN incorrectos.
            </p>
          )}

          <button type="submit" className="btn-signin">
            SIGN IN
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '20px', color: '#fff', fontSize: '0.9rem' }}>
          New here? <Link to="/registro" style={{ color: '#fff', fontWeight: '700', textDecoration: 'none' }}>Create Account</Link>
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginTop: '35px', color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
          <i className="fa-solid fa-shield-halved"></i>
          <span>Portal de Administración</span>
        </div>
      </div>
    </div>
  );
};

export default Login;
