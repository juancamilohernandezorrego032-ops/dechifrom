import React, { useContext } from 'react';
import { AppContext } from '../App';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Payments = () => {
  const { user, movements, updateCurrentAccount } = useContext(AppContext);
  const navigate = useNavigate();

  const handlePurchase = async (category) => {
    const { value: amountString } = await Swal.fire({
      title: `Cuánto pagar en ${category.title}`,
      input: 'text',
      inputLabel: 'Monto (COP)',
      inputValue: category.defaultAmount.toString(),
      inputAttributes: {
        autocapitalize: 'off',
        inputmode: 'numeric',
      },
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      preConfirm: (value) => {
        const numero = parseInt(value.replace(/\D/g, ''), 10);
        if (!numero || numero <= 0) {
          Swal.showValidationMessage('Ingresa un monto válido mayor a 0');
        }
        return numero;
      },
    });

    if (!amountString) return;
    const amount = amountString;

    // Validar saldo
    if (amount > user.balance) {
      Swal.fire({
        icon: 'error',
        title: '❌ Saldo insuficiente',
        html: `<p style="font-size: 1rem;">No tienes suficiente saldo para este pago.</p>
               <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;">Saldo disponible: <strong>$${user.balance.toLocaleString('es-CO')}</strong></p>
               <p style="font-size: 0.9rem; color: #94a3b8;">Intentas pagar: <strong>$${amount.toLocaleString('es-CO')}</strong></p>`,
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    // Confirmación antes de proceder
    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Confirmar pago',
      html: `<p style="font-size: 1rem;">¿Deseas pagar <strong>$${amount.toLocaleString('es-CO')}</strong></p>
             <p style="font-size: 0.9rem; color: #94a3b8;">en <strong>${category.title}</strong>?</p>`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
      showCancelButton: true,
      confirmButtonText: 'Confirmar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmResult.isConfirmed) return;

    const updatedUser = { ...user, balance: user.balance - amount };
    const updatedMovements = [
      {
        id: Date.now(),
        title: `${category.title}`,
        date: new Date().toLocaleString('es-CO'),
        amount: -amount,
        type: 'expense',
        icon: category.icon,
        editable: true,
      },
      ...movements,
    ];
    updateCurrentAccount(updatedUser, updatedMovements);

    Swal.fire({
      icon: 'success',
      title: '✓ Pago realizado',
      html: `<p style="font-size: 1rem;">Se descontaron <strong>$${amount.toLocaleString('es-CO')}</strong></p>
             <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;">Nuevo saldo: <strong>$${updatedUser.balance.toLocaleString('es-CO')}</strong></p>`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const categories = [
    { id: 1, title: 'Luz y gas', icon: 'fa-lightbulb', defaultAmount: 50000, color: '#f59e0b' },
    { id: 2, title: 'Internet', icon: 'fa-wifi', defaultAmount: 60000, color: '#3b82f6' },
    { id: 3, title: 'Teléfono', icon: 'fa-phone', defaultAmount: 30000, color: '#8b5cf6' },
    { id: 4, title: 'Agua', icon: 'fa-droplet', defaultAmount: 40000, color: '#06b6d4' },
    { id: 5, title: 'Transporte', icon: 'fa-bus', defaultAmount: 25000, color: '#10b981' },
    { id: 6, title: 'Alimentación', icon: 'fa-utensils', defaultAmount: 100000, color: '#ec4899' },
    { id: 7, title: 'Salud', icon: 'fa-heart', defaultAmount: 50000, color: '#ef4444' },
    { id: 8, title: 'Educación', icon: 'fa-book', defaultAmount: 80000, color: '#6366f1' },
  ];

  return (
    <div className="payments-page animate-fade-in" style={{ maxWidth: '800px', margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '30px' }}>
        <div onClick={() => navigate('/')} className="glass" style={{ width: '45px', height: '45px', borderRadius: '15px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
          <i className="fas fa-arrow-left" style={{ fontSize: '1rem' }}></i>
        </div>
        <h2 style={{ fontSize: '1.6rem', fontWeight: '700' }}>Pagar y comprar</h2>
      </div>

      <div className="glass-premium" style={{ padding: '30px', marginBottom: '30px' }}>
        {/* Saldo actual */}
        <div style={{ textAlign: 'center', marginBottom: '30px' }}>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginBottom: '5px' }}>Saldo disponible</p>
          <h3 style={{ fontSize: '2rem', color: '#38bdf8', fontWeight: '700' }}>${user.balance.toLocaleString('es-CO')}</h3>
        </div>

        {/* Categorías */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          {categories.map((category) => (
            <div
              key={category.id}
              onClick={() => handlePurchase(category)}
              className="glass"
              style={{
                padding: '20px',
                borderRadius: '20px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                textAlign: 'center',
                gap: '10px',
              }}
            >
              <div style={{
                width: '50px',
                height: '50px',
                borderRadius: '16px',
                background: `${category.color}18`,
                border: `1px solid ${category.color}33`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <i className={`fas ${category.icon}`} style={{ fontSize: '1.25rem', color: category.color }}></i>
              </div>
              <p style={{ fontWeight: '600', fontSize: '0.95rem', color: '#fff' }}>{category.title}</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Desde ${category.defaultAmount.toLocaleString('es-CO')}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Payments;
