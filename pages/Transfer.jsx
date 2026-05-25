import React, { useState, useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { logEvent } from '../services/logger';

const Transfer = () => {
  const { user, accounts, updateCurrentAccount, transferToUser } = useContext(AppContext);
  const [amount, setAmount] = useState('0');
  const [transferMode, setTransferMode] = useState('bank'); // 'bank' o 'user'
  
  // Bank transfer states
  const [selectedBank, setSelectedBank] = useState('');
  const [bankAccountNumber, setBankAccountNumber] = useState('');
  const [bankAccountName, setBankAccountName] = useState('');

  // User transfer states
  const [selectedUser, setSelectedUser] = useState(null);

  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Filtrar usuarios disponibles (excluir al usuario actual)
  const availableUsers = accounts ? accounts.filter((acc) => acc.username !== user?.username) : [];

  const handleAmountChange = (value) => {
    const cleaned = value.replace(/[^0-9]/g, '');
    setAmount(cleaned === '' ? '0' : cleaned);
  };

  const handleNumber = (num) => {
    if (amount === '0') setAmount(num);
    else setAmount((prev) => `${prev}${num}`);
  };

  const handleDelete = () => {
    if (amount.length <= 1) setAmount('0');
    else setAmount((prev) => prev.slice(0, -1));
  };

  const handleTransfer = async () => {
    const montoNum = parseInt(amount, 10);
    logEvent('transfer:submit', {
      mode: transferMode,
      amount: montoNum || 0,
      selectedBank,
      selectedUser: selectedUser?.username || null,
    });

    // Validar monto
    if (amount === '0') {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'Ingresa un monto mayor a 0.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: 'var(--accent)',
      });
      return;
    }

    // Validar saldo
    if (montoNum > user.balance) {
      Swal.fire({
        icon: 'error',
        title: '❌ Saldo insuficiente',
        html: `<p style="font-size: 1rem;">No tienes suficiente saldo para esta transferencia.</p>
               <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;">Saldo disponible: <strong>$${user.balance.toLocaleString('es-CO')} COP</strong></p>
               <p style="font-size: 0.9rem; color: #94a3b8;">Intentas transferir: <strong>$${montoNum.toLocaleString('es-CO')} COP</strong></p>`,
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: 'var(--accent)',
      });
      return;
    }

    if (transferMode === 'bank') {
      if (!selectedBank || !bankAccountNumber.trim() || !bankAccountName.trim()) {
        Swal.fire({
          icon: 'warning',
          title: 'Datos incompletos',
          text: 'Por favor selecciona el banco e ingresa el número de cuenta y el nombre del destinatario.',
          background: '#1a1a2e',
          color: '#f8fafc',
          confirmButtonColor: 'var(--accent)',
        });
        return;
      }

      try {
        setLoading(true);
        // Transferencia a banco externo
        const updatedUser = { ...user, balance: user.balance - montoNum };
        const updatedMovements = [
          {
            id: Date.now(),
            title: `Transferencia a ${selectedBank}`,
            date: new Date().toLocaleString('es-CO'),
            amount: -montoNum,
            type: 'expense',
            icon: 'fa-paper-plane',
          },
          ...user.movements,
        ];
        updateCurrentAccount(updatedUser, updatedMovements);
        logEvent('transfer:bank:success', {
          from: user.username,
          bank: selectedBank,
          accountNumber: bankAccountNumber,
          accountName: bankAccountName,
          amount: montoNum,
          balance: updatedUser.balance,
        });

        Swal.fire({
          icon: 'success',
          title: '¡Transferencia exitosa!',
          html: `<p style="font-size: 1rem;">Se transfirieron <strong>$${montoNum.toLocaleString('es-CO')} COP</strong></p>
                 <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 10px;">Banco: <strong>${selectedBank}</strong></p>
                 <p style="font-size: 0.85rem; color: #94a3b8;">Cuenta: <strong>${bankAccountNumber}</strong></p>`,
          background: '#1a1a2e',
          color: '#f8fafc',
          confirmButtonColor: 'var(--accent)',
          timer: 2500,
          timerProgressBar: true,
          showConfirmButton: false,
        }).then(() => navigate('/'));
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error al procesar',
          text: 'Por favor intenta de nuevo.',
          background: '#1a1a2e',
          color: '#f8fafc',
          confirmButtonColor: 'var(--accent)',
        });
      } finally {
        setLoading(false);
      }

    } else {
      // Transferencia a otro usuario de NovaPay
      if (!selectedUser) {
        Swal.fire({
          icon: 'warning',
          title: 'Usuario no seleccionado',
          text: 'Por favor selecciona el usuario de destino de la lista.',
          background: '#1a1a2e',
          color: '#f8fafc',
          confirmButtonColor: 'var(--accent)',
        });
        return;
      }

      try {
        setLoading(true);
        const result = transferToUser(selectedUser.username, montoNum);
        
        if (result.success) {
          logEvent('transfer:novapay:success', {
            from: user.username,
            to: selectedUser.username,
            amount: montoNum,
          });
          Swal.fire({
            icon: 'success',
            title: '¡Transferencia exitosa!',
            html: `<p style="font-size: 1.05rem; color: #10b981; font-weight: 600;">Envío completado</p>
                   <p style="font-size: 1rem; margin-top: 8px;">Monto: <strong>$${montoNum.toLocaleString('es-CO')} COP</strong></p>
                   <p style="font-size: 0.85rem; color: #94a3b8; margin-top: 5px;">Destinatario: <strong>${selectedUser.name}</strong></p>`,
            background: '#1a1a2e',
            color: '#f8fafc',
            confirmButtonColor: 'var(--accent)',
            timer: 2500,
            timerProgressBar: true,
            showConfirmButton: false,
          }).then(() => navigate('/'));
        } else {
          logEvent('transfer:novapay:failed', {
            from: user.username,
            to: selectedUser.username,
            amount: montoNum,
            message: result.message,
          });
          Swal.fire({
            icon: 'error',
            title: 'No se pudo realizar la transferencia',
            text: result.message,
            background: '#1a1a2e',
            color: '#f8fafc',
            confirmButtonColor: 'var(--accent)',
          });
        }
      } catch (error) {
        Swal.fire({
          icon: 'error',
          title: 'Error de red',
          text: 'Ocurrió un error al procesar el envío. Reintenta.',
          background: '#1a1a2e',
          color: '#f8fafc',
          confirmButtonColor: 'var(--accent)',
        });
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="transfer-page animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div onClick={() => navigate('/')} className="glass" style={{ width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <i className="fas fa-arrow-left" style={{ fontSize: '1rem' }}></i>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Transferencia</h2>
      </div>

      {/* Modo de transferencia */}
      <div style={{ display: 'flex', gap: '15px', marginBottom: '35px' }}>
        <button
          onClick={() => setTransferMode('bank')}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '20px',
            border: 'none',
            background: transferMode === 'bank' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.95rem',
            transition: 'all 0.3s',
            boxShadow: transferMode === 'bank' ? '0 8px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          <i className="fas fa-bank" style={{ marginRight: '8px' }}></i>
          A Banco
        </button>
        <button
          onClick={() => setTransferMode('user')}
          style={{
            flex: 1,
            padding: '16px',
            borderRadius: '20px',
            border: 'none',
            background: transferMode === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.05)',
            color: '#f8fafc',
            cursor: 'pointer',
            fontWeight: '700',
            fontSize: '0.95rem',
            transition: 'all 0.3s',
            boxShadow: transferMode === 'user' ? '0 8px 20px rgba(99, 102, 241, 0.3)' : 'none'
          }}
        >
          <i className="fas fa-users" style={{ marginRight: '8px' }}></i>
          A Usuario NovaPay
        </button>
      </div>

      <div className="glass-premium" style={{ padding: '30px', marginBottom: '30px' }}>
        {/* Saldo actual */}
        <div style={{ textAlign: 'center', marginBottom: '25px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Saldo disponible</p>
          <h3 style={{ fontSize: '2rem', color: '#38bdf8', fontWeight: '700' }}>${user.balance.toLocaleString('es-CO')}</h3>
        </div>

        {/* Inputs de Banco Destino */}
        {transferMode === 'bank' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px', marginBottom: '25px' }}>
            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                Selecciona banco destino
              </label>
              <div className="glass" style={{ padding: '14px 18px', borderRadius: '16px' }}>
                <select
                  value={selectedBank}
                  onChange={(e) => setSelectedBank(e.target.value)}
                  style={{
                    width: '100%',
                    background: 'transparent',
                    border: 'none',
                    color: '#f8fafc',
                    fontSize: '0.95rem',
                    outline: 'none',
                    cursor: 'pointer',
                  }}
                >
                  <option value="" style={{ background: '#111827', color: '#fff' }}>-- Selecciona un banco --</option>
                  <option value="Bancolombia" style={{ background: '#111827', color: '#fff' }}>Bancolombia</option>
                  <option value="Davivienda" style={{ background: '#111827', color: '#fff' }}>Davivienda</option>
                  <option value="BBVA" style={{ background: '#111827', color: '#fff' }}>BBVA</option>
                  <option value="Santander" style={{ background: '#111827', color: '#fff' }}>Santander</option>
                  <option value="Nequi" style={{ background: '#111827', color: '#fff' }}>Nequi</option>
                  <option value="Daviplata" style={{ background: '#111827', color: '#fff' }}>Daviplata</option>
                </select>
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                Número de Cuenta Destino
              </label>
              <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <i className="fa-solid fa-hashtag" style={{ color: 'rgba(255,255,255,0.5)', marginRight: '12px' }}></i>
                <input
                  type="text"
                  value={bankAccountNumber}
                  onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ''))}
                  placeholder="Ej: 9876543210"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>
            </div>

            <div>
              <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>
                Nombre del Destinatario
              </label>
              <div className="glass" style={{ display: 'flex', alignItems: 'center', padding: '14px 18px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.08)' }}>
                <i className="fa-solid fa-signature" style={{ color: 'rgba(255,255,255,0.5)', marginRight: '12px' }}></i>
                <input
                  type="text"
                  value={bankAccountName}
                  onChange={(e) => setBankAccountName(e.target.value)}
                  placeholder="Ej: Juan Camilo"
                  style={{ width: '100%', background: 'transparent', border: 'none', outline: 'none', color: '#fff', fontSize: '0.95rem' }}
                />
              </div>
            </div>
          </div>
        ) : (
          /* Selección de Usuario NovaPay */
          <div style={{ marginBottom: '25px' }}>
            <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.95rem', fontWeight: '600', color: '#fff' }}>
              Selecciona usuario destino
            </label>
            {availableUsers.length === 0 ? (
              <div className="glass" style={{ padding: '16px', borderRadius: '18px', textAlign: 'center', color: 'var(--text-muted)' }}>
                No hay otros usuarios disponibles
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '180px', overflowY: 'auto', paddingRight: '5px' }}>
                {availableUsers.map((acc) => (
                  <div
                    key={acc.id}
                    onClick={() => setSelectedUser(acc)}
                    className="glass"
                    style={{
                      padding: '14px 18px',
                      borderRadius: '18px',
                      cursor: 'pointer',
                      border: selectedUser?.id === acc.id ? '2px solid var(--accent)' : '2px solid transparent',
                      boxShadow: selectedUser?.id === acc.id ? '0 0 15px rgba(99, 102, 241, 0.25)' : 'none',
                      transition: 'all 0.3s',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff' }}>{acc.name}</p>
                      <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>@{acc.username}</p>
                    </div>
                    <p style={{ fontSize: '0.9rem', color: '#10b981', fontWeight: '700' }}>
                      Saldo: ${acc.balance.toLocaleString('es-CO')}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Monto */}
        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '12px', fontSize: '0.85rem', fontWeight: '600', color: 'var(--text-muted)' }}>Monto a transferir</label>
          <div className="glass" style={{ padding: '18px', borderRadius: '18px', textAlign: 'center', marginBottom: '20px' }}>
            <input
              type="text"
              value={`$${(amount === '0' ? '' : amount).replace(/\B(?=(\d{3})+(?!\d))/g, '.')}`}
              onChange={(e) => handleAmountChange(e.target.value)}
              placeholder="$0"
              style={{
                width: '100%',
                background: 'transparent',
                border: 'none',
                fontSize: '2rem',
                fontWeight: '700',
                textAlign: 'center',
                outline: 'none',
                color: '#f8fafc',
              }}
            />
          </div>

          {/* Teclado Calculadora */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px', marginBottom: '10px' }}>
            {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((num) => (
              <button
                key={num}
                onClick={() => handleNumber(num)}
                className="glass"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  border: 'none',
                  fontSize: '1.25rem',
                  fontWeight: '600',
                  color: '#fff',
                  cursor: 'pointer',
                  transition: 'transform 0.1s',
                }}
                onMouseDown={(e) => (e.currentTarget.style.transform = 'scale(0.95)')}
                onMouseUp={(e) => (e.currentTarget.style.transform = 'scale(1)')}
              >
                {num}
              </button>
            ))}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
            <button
              onClick={() => handleNumber('0')}
              className="glass"
              style={{
                padding: '16px',
                borderRadius: '16px',
                border: 'none',
                fontSize: '1.25rem',
                fontWeight: '600',
                color: '#fff',
                cursor: 'pointer',
              }}
            >
              0
            </button>
            <button
              onClick={() => setAmount('0')}
              className="glass"
              style={{
                padding: '16px',
                borderRadius: '16px',
                fontSize: '1.25rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'rgba(239, 68, 68, 0.2)',
                border: '1px solid rgba(239, 68, 68, 0.3)',
                color: '#ff4d4d',
              }}
            >
              C
            </button>
            <button
              onClick={handleDelete}
              className="glass"
              style={{
                padding: '16px',
                borderRadius: '16px',
                fontSize: '1.25rem',
                fontWeight: '600',
                cursor: 'pointer',
                background: 'rgba(251, 191, 36, 0.15)',
                border: '1px solid rgba(251, 191, 36, 0.3)',
                color: '#fbbf24',
              }}
            >
              <i className="fas fa-backspace"></i>
            </button>
          </div>
        </div>

        {/* Botón de transferencia */}
        <button
          onClick={handleTransfer}
          disabled={loading}
          className="btn-signin"
          style={{
            marginTop: '10px',
            background: loading ? 'rgba(255,255,255,0.1)' : 'var(--accent)',
            cursor: loading ? 'not-allowed' : 'pointer'
          }}
        >
          {loading ? 'Procesando...' : 'TRANSFERIR'}
        </button>
      </div>
    </div>
  );
};

export default Transfer;
