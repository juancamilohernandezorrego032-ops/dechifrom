import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import Swal from 'sweetalert2';
import { useNavigate } from 'react-router-dom';

const Ajustes = () => {
  const { user, movements, updateCurrentAccount } = useContext(AppContext);
  const navigate = useNavigate();

  const [name, setName] = useState(user?.name || '');
  const [bgUrl, setBgUrl] = useState(user?.backgroundImage || '');
  const [selectedColor, setSelectedColor] = useState(user?.themeColor || '#6366f1');

  const themeColors = [
    '#6366f1', // Violet
    '#8b5cf6', // Purple
    '#ef4444', // Red
    '#10b981', // Green
    '#ec4899', // Pink
    '#f59e0b', // Yellow
  ];

  const handleSaveChanges = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      Swal.fire({
        icon: 'warning',
        title: 'Nombre obligatorio',
        text: 'Por favor ingresa tu nombre de usuario para guardar los cambios.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: selectedColor,
      });
      return;
    }

    const updatedUser = {
      ...user,
      name: name.trim(),
      backgroundImage: bgUrl.trim(),
      themeColor: selectedColor,
    };

    updateCurrentAccount(updatedUser, movements);

    Swal.fire({
      icon: 'success',
      title: '¡Cambios guardados!',
      text: 'Tu perfil y diseño se han actualizado correctamente.',
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: selectedColor,
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  return (
    <div className="adjustments-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div onClick={() => navigate('/')} className="glass" style={{ width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <i className="fas fa-arrow-left" style={{ fontSize: '1rem' }}></i>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Personalización</h2>
      </div>

      <div className="glass-premium" style={{ padding: '40px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '25px' }}>
          <i className="fa-solid fa-wand-magic-sparkles" style={{ fontSize: '1.8rem', color: selectedColor }}></i>
          <div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: '800' }}>Personaliza tu Cuenta Bancaria</h3>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginTop: '2px' }}>
              Configura el diseño, los colores de NovaPay y tu información a tu medida.
            </p>
          </div>
        </div>

        <form onSubmit={handleSaveChanges} style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
          
          {/* Nombre */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px', color: 'var(--text-muted)' }}>
              Nombre de Usuario
            </label>
            <div className="glass" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Ingresa tu nombre..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
          </div>

          {/* Enlace de Fondo */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '10px', color: 'var(--text-muted)' }}>
              Fondo de Pantalla Personalizado (Enlace o URL)
            </label>
            <div className="glass" style={{
              display: 'flex',
              alignItems: 'center',
              padding: '16px 20px',
              borderRadius: '18px',
              border: '1px solid rgba(255, 255, 255, 0.08)'
            }}>
              <input
                type="text"
                value={bgUrl}
                onChange={(e) => setBgUrl(e.target.value)}
                placeholder="Pega cualquier enlace de imagen aquí..."
                style={{
                  width: '100%',
                  background: 'transparent',
                  border: 'none',
                  outline: 'none',
                  color: '#fff',
                  fontSize: '0.95rem'
                }}
              />
            </div>
            <span style={{ fontSize: '0.75rem', color: 'rgba(255, 255, 255, 0.4)', display: 'block', marginTop: '8px' }}>
              * Déjalo vacío para usar nuestro fondo espacial Premium por defecto.
            </span>
          </div>

          {/* Selector de color */}
          <div>
            <label style={{ display: 'block', fontSize: '0.9rem', fontWeight: '600', marginBottom: '15px', color: 'var(--text-muted)' }}>
              Elige el Color Principal de la Aplicación
            </label>
            <div style={{ display: 'flex', gap: '15px', alignItems: 'center' }}>
              {themeColors.map((color) => (
                <div
                  key={color}
                  onClick={() => setSelectedColor(color)}
                  style={{
                    width: selectedColor === color ? '48px' : '38px',
                    height: selectedColor === color ? '38px' : '38px',
                    borderRadius: selectedColor === color ? '12px' : '50%',
                    background: color,
                    cursor: 'pointer',
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    border: selectedColor === color ? '3px solid #fff' : '1px solid rgba(255, 255, 255, 0.2)',
                    boxShadow: selectedColor === color ? `0 0 15px ${color}` : 'none',
                  }}
                />
              ))}
            </div>
          </div>

          {/* Botón guardar */}
          <button
            type="submit"
            className="btn-signin"
            style={{
              marginTop: '15px',
              background: selectedColor,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              fontWeight: '700',
              letterSpacing: '0.5px'
            }}
          >
            <i className="fa-solid fa-cloud-arrow-up" style={{ fontSize: '1.05rem' }}></i>
            Aplicar y Guardar Cambios
          </button>

        </form>
      </div>
    </div>
  );
};

export default Ajustes;
