import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../App';
import { gastosService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const Dashboard = () => {
  const { user, movements, logout, editMovement, deleteMovement, updateCurrentAccount } = useContext(AppContext);
  const navigate = useNavigate();
  const [loadingMovements, setLoadingMovements] = useState(false);

  // Modal States
  const [isDepositOpen, setIsDepositOpen] = useState(false);
  const [isWithdrawOpen, setIsWithdrawOpen] = useState(false);
  const [modalAmount, setModalAmount] = useState('');

  useEffect(() => {
    const cargarMovimientos = async () => {
      setLoadingMovements(true);
      try {
        await gastosService.getAll();
      } catch (error) {
        console.error('Error al cargar movimientos:', error);
      } finally {
        setLoadingMovements(false);
      }
    };

    cargarMovimientos();
  }, []);

  // Handle deposit submission from custom modal (Screenshot 3)
  const handleConfirmDeposit = (e) => {
    e.preventDefault();
    const amountVal = parseInt(modalAmount.replace(/\D/g, ''), 10);
    if (!amountVal || amountVal <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'Por favor ingresa un monto mayor a 0.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    const updatedUser = { ...user, balance: user.balance + amountVal };
    const updatedMovements = [
      {
        id: Date.now(),
        title: 'Depósito Fondos',
        date: new Date().toLocaleString('es-CO'),
        amount: amountVal,
        type: 'income',
        icon: 'fa-plus',
      },
      ...movements,
    ];
    updateCurrentAccount(updatedUser, updatedMovements);

    setIsDepositOpen(false);
    setModalAmount('');

    Swal.fire({
      icon: 'success',
      title: '¡Depósito Exitoso!',
      text: `Se cargaron $${amountVal.toLocaleString('es-CO')} a tu cuenta.`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  // Handle withdraw submission from custom modal (Screenshot 4)
  const handleConfirmWithdraw = (e) => {
    e.preventDefault();
    const amountVal = parseInt(modalAmount.replace(/\D/g, ''), 10);
    if (!amountVal || amountVal <= 0) {
      Swal.fire({
        icon: 'warning',
        title: 'Monto inválido',
        text: 'Por favor ingresa un monto mayor a 0.',
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    if (amountVal > user.balance) {
      Swal.fire({
        icon: 'error',
        title: '❌ Saldo insuficiente',
        html: `<p style="font-size: 1rem;">No tienes suficiente saldo para este retiro.</p>
               <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;">Saldo disponible: <strong>$${user.balance.toLocaleString('es-CO')}</strong></p>`,
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    const updatedUser = { ...user, balance: user.balance - amountVal };
    const updatedMovements = [
      {
        id: Date.now(),
        title: 'Retiro Fondos',
        date: new Date().toLocaleString('es-CO'),
        amount: -amountVal,
        type: 'expense',
        icon: 'fa-arrow-down-long',
      },
      ...movements,
    ];
    updateCurrentAccount(updatedUser, updatedMovements);

    setIsWithdrawOpen(false);
    setModalAmount('');

    Swal.fire({
      icon: 'success',
      title: '¡Retiro Exitoso!',
      text: `Se retiraron $${amountVal.toLocaleString('es-CO')} de tu cuenta.`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  // Buy item from market store (converts USD to COP at 1 USD = 4,000 COP)
  const handleBuyProduct = async (product) => {
    const copPrice = product.priceUsd * 4000;

    const confirmResult = await Swal.fire({
      icon: 'question',
      title: 'Confirmar compra',
      html: `<p style="font-size: 1rem;">¿Deseas comprar <strong>${product.name}</strong>?</p>
             <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 8px;">Precio USD: <strong>$${product.priceUsd} USD</strong></p>
             <p style="font-size: 0.95rem; color: #38bdf8;">Equivalente COP: <strong>$${copPrice.toLocaleString('es-CO')} COP</strong></p>`,
      background: '#1a1a2e',
      color: '#f8fafc',
      showCancelButton: true,
      confirmButtonText: 'Comprar',
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#ef4444',
    });

    if (!confirmResult.isConfirmed) return;

    if (copPrice > user.balance) {
      Swal.fire({
        icon: 'error',
        title: '❌ Saldo insuficiente',
        html: `<p style="font-size: 1rem;">No tienes saldo suficiente para comprar este artículo.</p>
               <p style="font-size: 0.9rem; color: #94a3b8; margin-top: 10px;">Saldo disponible: <strong>$${user.balance.toLocaleString('es-CO')} COP</strong></p>
               <p style="font-size: 0.9rem; color: #94a3b8;">Precio artículo: <strong>$${copPrice.toLocaleString('es-CO')} COP</strong></p>`,
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
      });
      return;
    }

    const updatedUser = { ...user, balance: user.balance - copPrice };
    const updatedMovements = [
      {
        id: Date.now(),
        title: `Compra: ${product.name}`,
        date: new Date().toLocaleString('es-CO'),
        amount: -copPrice,
        type: 'expense',
        icon: product.icon,
      },
      ...movements,
    ];
    updateCurrentAccount(updatedUser, updatedMovements);

    Swal.fire({
      icon: 'success',
      title: '¡Compra exitosa!',
      text: `Compraste ${product.name} por $${copPrice.toLocaleString('es-CO')} COP.`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 2000,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const handleEditMovementPrompt = async (move) => {
    const { value: newAmount } = await Swal.fire({
      title: 'Editar monto',
      input: 'text',
      inputLabel: 'Nuevo monto ($ COP)',
      inputValue: Math.abs(move.amount).toString(),
      inputAttributes: {
        inputmode: 'numeric',
      },
      showCancelButton: true,
      confirmButtonText: 'Guardar',
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

    if (!newAmount) return;

    const actualAmount = move.type === 'expense' ? -newAmount : newAmount;
    editMovement(move.id, { amount: actualAmount });

    Swal.fire({
      icon: 'success',
      title: 'Movimiento actualizado',
      text: `El monto se cambió a $${newAmount.toLocaleString('es-CO')}`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const handleDeleteMovementPrompt = async (move) => {
    const confirmResult = await Swal.fire({
      icon: 'warning',
      title: '¿Eliminar y devolver?',
      html: `<p style="font-size: 0.95rem;">Vas a eliminar el movimiento:</p>
             <p style="font-size: 1rem; margin: 10px 0;"><strong>${move.title}</strong></p>
             <p style="font-size: 0.9rem; color: #94a3b8;">El valor de $${Math.abs(move.amount).toLocaleString('es-CO')} será devuelto/revertido a tu saldo.</p>`,
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6366f1',
      showCancelButton: true,
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    });

    if (!confirmResult.isConfirmed) return;

    deleteMovement(move.id);

    Swal.fire({
      icon: 'success',
      title: 'Movimiento devuelto',
      text: 'El monto ha sido revertido a tu cuenta.',
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1500,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  const products = [
    { id: 1, name: 'AirPods Pro', priceUsd: 200, icon: 'fa-headphones', img: 'https://images.unsplash.com/photo-1588449668338-d1517824ee31?w=300&auto=format&fit=crop&q=80' },
    { id: 2, name: 'iPhone 15', priceUsd: 800, icon: 'fa-mobile-screen-button', img: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=300&auto=format&fit=crop&q=80' },
    { id: 3, name: 'MacBook Air', priceUsd: 1500, icon: 'fa-laptop', img: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=300&auto=format&fit=crop&q=80' },
    { id: 4, name: 'Keychron K2', priceUsd: 100, icon: 'fa-keyboard', img: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=300&auto=format&fit=crop&q=80' },
  ];

  return (
    <div className="animate-fade-in" style={{ display: 'grid', gridTemplateColumns: '1.4fr 1fr', gap: '35px', className: 'dashboard-layout' }}>
      
      {/* Columna Izquierda: Tarjeta de saldo, Acciones Rápidas y Transacciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '30px' }}>
        
        {/* Debit Card (MasterCard style) */}
        <div className="glass-premium" style={{
          height: '230px',
          borderRadius: '28px',
          padding: '24px 30px',
          position: 'relative',
          overflow: 'hidden',
          background: 'linear-gradient(135deg, #1e1b4b 0%, #312e81 40%, #4338ca 100%)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.4)',
          border: '1px solid rgba(255, 255, 255, 0.1)'
        }}>
          {/* Card Overlays */}
          <div style={{
            position: 'absolute',
            top: '-20px',
            right: '-20px',
            width: '180px',
            height: '180px',
            background: 'rgba(99, 102, 241, 0.15)',
            borderRadius: '50%',
            filter: 'blur(35px)'
          }}></div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', zIndex: 2, position: 'relative' }}>
            <div>
              <p style={{ fontSize: '0.85rem', opacity: 0.7, marginBottom: '6px', letterSpacing: '0.5px' }}>Saldo disponible</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: '700', letterSpacing: '-0.5px' }}>
                ${user.balance.toLocaleString('es-CO')}
              </h2>
            </div>
            
            {/* MasterCard Logo */}
            <div style={{ display: 'flex', position: 'relative', width: '50px', height: '35px', alignItems: 'center' }}>
              <div style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#eb001b', opacity: 0.9, position: 'absolute', left: 0 }}></div>
              <div style={{ width: '25px', height: '25px', borderRadius: '50%', background: '#f79e1b', opacity: 0.9, position: 'absolute', right: 0 }}></div>
            </div>
          </div>

          <div style={{ marginTop: '55px', zIndex: 2, position: 'relative' }}>
            <p style={{ letterSpacing: '4px', fontSize: '1.25rem', marginBottom: '8px', fontWeight: '500' }}>4532 •••• •••• 8821</p>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <p style={{ fontSize: '0.8rem', textTransform: 'uppercase', opacity: 0.8, letterSpacing: '1px' }}>{user.name}</p>
              <p style={{ fontSize: '0.8rem', opacity: 0.8, fontWeight: '600' }}>PRIORITY DEBIT</p>
            </div>
          </div>
        </div>

        {/* Quick Actions Panel */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '15px' }}>
          
          {/* Depositar Action */}
          <div onClick={() => setIsDepositOpen(true)} className="glass" style={{
            padding: '20px 10px',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '24px'
          }}>
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.05)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#38bdf8'
            }}>
              <i className="fa-solid fa-cloud-arrow-up"></i>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Depositar</p>
          </div>

          {/* Retirar Action */}
          <div onClick={() => setIsWithdrawOpen(true)} className="glass" style={{
            padding: '20px 10px',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '24px'
          }}>
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.05)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#fbbf24'
            }}>
              <i className="fa-solid fa-money-bill-transfer"></i>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Retirar</p>
          </div>

          {/* Transferir Action */}
          <div onClick={() => navigate('/transferir')} className="glass" style={{
            padding: '20px 10px',
            textAlign: 'center',
            cursor: 'pointer',
            borderRadius: '24px'
          }}>
            <div style={{
              width: '55px',
              height: '55px',
              borderRadius: '18px',
              background: 'rgba(255, 255, 255, 0.05)',
              margin: '0 auto 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.2rem',
              color: '#a78bfa'
            }}>
              <i className="fa-solid fa-paper-plane"></i>
            </div>
            <p style={{ fontSize: '0.85rem', fontWeight: '600' }}>Transferir</p>
          </div>

        </div>

        {/* Recent Movements Panel */}
        <div className="glass-premium" style={{ padding: '24px', flexGrow: 1 }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-clock-rotate-left" style={{ color: 'rgba(255,255,255,0.5)' }}></i>
            Movimientos Recientes
          </h3>

          {loadingMovements ? (
            <p style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>Cargando movimientos...</p>
          ) : movements.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
              <i className="fas fa-inbox" style={{ fontSize: '2.5rem', marginBottom: '12px', opacity: 0.4 }}></i>
              <p style={{ fontSize: '0.9rem' }}>No hay movimientos aún</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '380px', overflowY: 'auto', paddingRight: '5px' }}>
              {movements.map((move) => (
                <div key={move.id} className="glass" style={{
                  padding: '14px 16px',
                  borderRadius: '18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1 }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '14px',
                      background: move.type === 'income' ? 'rgba(16, 185, 129, 0.12)' : 'rgba(239, 68, 68, 0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      color: move.type === 'income' ? '#10b981' : '#ef4444'
                    }}>
                      <i className={`fas ${move.icon || (move.type === 'income' ? 'fa-arrow-down' : 'fa-arrow-up')}`}></i>
                    </div>
                    <div>
                      <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{move.title}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{move.date}</p>
                    </div>
                  </div>
                  
                  <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <p style={{
                      fontWeight: '700',
                      color: move.type === 'income' ? '#38bdf8' : '#f8fafc',
                      fontSize: '0.95rem',
                      textAlign: 'right'
                    }}>
                      {move.type === 'income' ? '+' : '-'}${Math.abs(move.amount).toLocaleString('es-CO')}
                    </p>

                    <div style={{ display: 'flex', gap: '6px' }}>
                      <button
                        onClick={() => handleEditMovementPrompt(move)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'rgba(255,255,255,0.06)',
                          color: '#fff',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.12)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.06)'}
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button
                        onClick={() => handleDeleteMovementPrompt(move)}
                        style={{
                          padding: '6px 10px',
                          borderRadius: '10px',
                          border: 'none',
                          background: 'rgba(239, 68, 68, 0.12)',
                          color: '#ef4444',
                          cursor: 'pointer',
                          fontSize: '0.75rem',
                          transition: 'background 0.2s'
                        }}
                        onMouseOver={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.2)'}
                        onMouseOut={(e) => e.currentTarget.style.background = 'rgba(239, 68, 68, 0.12)'}
                      >
                        <i className="fas fa-trash-can"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Columna Derecha: Tienda Market (Screenshot 2) */}
      <div className="glass-premium" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px', height: 'fit-content' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <i className="fa-solid fa-bag-shopping" style={{ color: 'rgba(255,255,255,0.5)' }}></i>
            Tienda Market
          </h3>
          <span style={{ fontSize: '0.8rem', color: '#38bdf8', cursor: 'pointer', fontWeight: '600' }}>Ver todo</span>
        </div>

        <div className="market-grid">
          {products.map((product) => (
            <div key={product.id} className="product-card">
              <div className="product-image-container">
                <img src={product.img} alt={product.name} />
              </div>
              <p className="product-title">{product.name}</p>
              <p className="product-price">${product.priceUsd}</p>
              <button 
                onClick={() => handleBuyProduct(product)}
                className="btn-product-add"
              >
                Agregar
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL DEPOSITAR FONDOS (Screenshot 3) */}
      {isDepositOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Depositar Fondos</h3>
              <button onClick={() => { setIsDepositOpen(false); setModalAmount(''); }} className="modal-close">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleConfirmDeposit}>
              <div className="modal-input-group">
                <i className="fa-solid fa-coins"></i>
                <input 
                  type="text"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Monto a transaccionar"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-cyan">
                Confirmar Acción
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL RETIRAR FONDOS (Screenshot 4) */}
      {isWithdrawOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Retirar Fondos</h3>
              <button onClick={() => { setIsWithdrawOpen(false); setModalAmount(''); }} className="modal-close">
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>
            
            <form onSubmit={handleConfirmWithdraw}>
              <div className="modal-input-group">
                <i className="fa-solid fa-coins"></i>
                <input 
                  type="text"
                  value={modalAmount}
                  onChange={(e) => setModalAmount(e.target.value.replace(/[^0-9]/g, ''))}
                  placeholder="Monto a transaccionar"
                  autoFocus
                />
              </div>

              <button type="submit" className="btn-cyan">
                Confirmar Acción
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

export default Dashboard;
