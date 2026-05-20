import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { AppContext } from '../App';

const Register = () => {
  const { accounts, addAccount } = useContext(AppContext);
  const [username, setUsername] = useState('');
  const [name, setName] = useState('');
  const [pin, setPin] = useState('');
  const [documentId, setDocumentId] = useState('');
  const [accountNumber, setAccountNumber] = useState('');
  const [balance, setBalance] = useState('1000000');
  const navigate = useNavigate();

  // Auto-generate a random 9-digit account number on load
  useEffect(() => {
    const randomAcc = Math.floor(100000000 + Math.random() * 900000000).toString();
    setAccountNumber(randomAcc);
  }, []);

  const handleRegister = () => {
    const trimmedUsername = username.trim();
    const trimmedName = name.trim();
    const trimmedPin = pin.trim();
    const trimmedDocId = documentId.trim();
    const trimmedAccNum = accountNumber.trim();
    const amount = parseInt(balance, 10);

    if (!trimmedUsername || !trimmedName || !trimmedPin || trimmedPin.length !== 4 || 
        !trimmedDocId || !trimmedAccNum || Number.isNaN(amount) || amount < 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Campos incompletos o inválidos',
        text: 'Completa todos los campos obligatorios. Recuerda que el PIN debe ser de 4 dígitos.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    // Validar si usuario, cuenta o documento ya existen
    const exists = accounts.some(
      (account) => 
        account.username === trimmedUsername || 
        account.accountNumber === trimmedAccNum || 
        account.pin === trimmedPin
    );

    if (exists) {
      Swal.fire({
        icon: 'error',
        title: 'Datos duplicados',
        text: 'El nombre de usuario, número de cuenta o PIN ya están en uso. Elige otros datos.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    const newAccount = {
      id: `u${Date.now()}`,
      username: trimmedUsername,
      name: trimmedName,
      pin: trimmedPin,
      documentId: trimmedDocId,
      accountNumber: trimmedAccNum,
      balance: amount,
      movements: [],
    };

    addAccount(newAccount);
    Swal.fire({
      icon: 'success',
      title: '¡Cuenta creada!',
      text: 'Tu cuenta se creó con éxito. Ahora ingresa con tu PIN.',
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
    navigate('/login');
  };

  return (
    <div className="login-screen">
      <div className="login-box glass-premium animate-fade-in" style={{ padding: '35px 30px', maxWidth: '420px' }}>
        <h2 style={{ color: '#0052cc', fontWeight: '800', textAlign: 'center', marginBottom: '20px', letterSpacing: '1px' }}>REGISTRO</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '5px' }}>
          
          <div className="login-input-group" style={{ marginBottom: '0' }}>
            <i className="fa-solid fa-user" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Usuario (ej. juan) *"
            />
          </div>

          <div className="login-input-group" style={{ marginBottom: '0' }}>
            <i className="fa-solid fa-user-tag" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nombre completo *"
            />
          </div>

          <div className="login-input-group" style={{ marginBottom: '0' }}>
            <i className="fa-solid fa-id-card" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              value={documentId}
              onChange={(e) => setDocumentId(e.target.value.replace(/\D/g, ''))}
              placeholder="Documento de Identidad *"
            />
          </div>

          <div className="login-input-group" style={{ marginBottom: '0' }}>
            <i className="fa-solid fa-hashtag" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value.replace(/\D/g, ''))}
              placeholder="Número de Cuenta *"
            />
          </div>

          <div className="login-input-group" style={{ marginBottom: '0' }}>
            <i className="fa-solid fa-lock" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
              placeholder="PIN de 4 dígitos *"
              type="password"
            />
          </div>

          <div className="login-input-group" style={{ marginBottom: '0' }}>
            <i className="fa-solid fa-wallet" style={{ color: 'rgba(255,255,255,0.6)' }}></i>
            <input
              value={balance}
              onChange={(e) => setBalance(e.target.value.replace(/[^0-9]/g, ''))}
              placeholder="Saldo inicial *"
            />
          </div>
        </div>

        <button
          onClick={handleRegister}
          className="btn-signin"
          style={{ marginTop: '20px' }}>
          CREAR CUENTA
        </button>

        <p style={{ textAlign: 'center', marginTop: '18px', color: '#fff', fontSize: '0.85rem' }}>
          ¿Ya tienes cuenta? <span onClick={() => navigate('/login')} style={{ color: '#fff', cursor: 'pointer', fontWeight: '700' }}>Inicia sesión</span>
        </p>
      </div>
    </div>
  );
};

export default Register;
