import React, { useState, createContext, useEffect, useRef } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Layout from './Layout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transfer from './pages/Transfer';
import Payments from './pages/Payments';
import Ajustes from './pages/Ajustes';
import ReporteGraficas from './pages/ReporteGraficas';
import { logEvent } from './services/logger';

// Context para el estado global
export const AppContext = createContext();

const CLOUD_URL = 'https://kvdb.io/juancamilo-dechi3-db/accounts';
const ENABLE_CLOUD_SYNC = false;

const App = () => {
  const defaultAccounts = [
    {
      id: 'u1',
      username: 'juan',
      name: 'Juan Camilo',
      pin: '1234',
      balance: 2847500,
      documentId: '1029384756',
      accountNumber: '254881023',
      movements: [
        { id: 1, title: 'Nequi recibido', date: 'Hoy 10:32am', amount: 85000, type: 'income', icon: 'fa-wallet' },
        { id: 2, title: 'Mercado Libre', date: 'Ayer 3:15pm', amount: -124900, type: 'expense', icon: 'fa-shopping-cart' },
        { id: 3, title: 'Bancolombia', date: 'Ayer 9:00am', amount: -50000, type: 'expense', icon: 'fa-building-columns' },
      ],
    },
  ];

  const [accounts, setAccounts] = useState(() => {
    const savedAccounts = localStorage.getItem('accounts');
    return savedAccounts ? JSON.parse(savedAccounts) : defaultAccounts;
  });

  const [currentUsername, setCurrentUsername] = useState(() => localStorage.getItem('currentUsername') || null);

  const [isLoggedIn, setIsLoggedIn] = useState(() => !!localStorage.getItem('token'));
  const cloudSyncDisabledRef = useRef(false);

  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const [movements, setMovements] = useState(() => {
    const savedUser = localStorage.getItem('user');
    if (savedUser) return JSON.parse(savedUser).movements || [];
    if (currentUsername) {
      const storedAccounts = localStorage.getItem('accounts');
      if (storedAccounts) {
        const parsed = JSON.parse(storedAccounts);
        const account = parsed.find((acc) => acc.username === currentUsername);
        return account ? account.movements || [] : defaultAccounts[0].movements;
      }
    }
    return defaultAccounts[0].movements;
  });

  const updateCurrentAccount = (updatedUser, updatedMovements) => {
    logEvent('account:update', {
      username: updatedUser?.username,
      balance: updatedUser?.balance,
      movementsCount: updatedMovements?.length || 0,
    });
    setUser(updatedUser);
    setMovements(updatedMovements);
    setAccounts((prevAccounts) => prevAccounts.map((account) => {
      if (account.username === (currentUsername || updatedUser.username)) {
        return {
          ...account,
          ...updatedUser,
          movements: updatedMovements,
        };
      }
      return account;
    }));
  };

  // Editar un movimiento existente
  const editMovement = (movementId, updates) => {
    const updatedMovements = movements.map((move) =>
      move.id === movementId ? { ...move, ...updates } : move
    );
    
    const balanceDifference = updates.amount 
      ? updates.amount - movements.find((m) => m.id === movementId).amount
      : 0;
    
    const updatedUser = {
      ...user,
      balance: user.balance + balanceDifference,
    };

    updateCurrentAccount(updatedUser, updatedMovements);
  };

  // Eliminar un movimiento
  const deleteMovement = (movementId) => {
    const movement = movements.find((m) => m.id === movementId);
    const updatedMovements = movements.filter((m) => m.id !== movementId);
    
    const updatedUser = {
      ...user,
      balance: user.balance - movement.amount, // Revertir el movimiento
    };

    updateCurrentAccount(updatedUser, updatedMovements);
  };

  // Transferir a otro usuario por username (solo con el nombre / selector)
  const transferToUser = (recipientUsername, amount) => {
    logEvent('transfer:user:attempt', {
      from: user?.username,
      to: recipientUsername,
      amount,
    });

    const recipient = accounts.find((acc) => acc.username === recipientUsername);
    if (!recipient) {
      logEvent('transfer:user:failed', {
        reason: 'recipient_not_found',
        to: recipientUsername,
        amount,
      });
      return { success: false, message: 'La cuenta de destino no existe.' };
    }

    if (amount > user.balance) {
      logEvent('transfer:user:failed', {
        reason: 'insufficient_balance',
        from: user?.username,
        to: recipientUsername,
        amount,
      });
      return { success: false, message: 'Saldo insuficiente.' };
    }

    if (recipient.username === user.username) {
      logEvent('transfer:user:failed', {
        reason: 'same_account',
        username: user.username,
        amount,
      });
      return { success: false, message: 'No puedes transferir dinero a tu propia cuenta.' };
    }

    // Actualizar saldo del remitente
    const senderMovements = [
      {
        id: Date.now(),
        title: `Transferencia a ${recipient.name}`,
        date: new Date().toLocaleString('es-CO'),
        amount: -amount,
        type: 'expense',
        icon: 'fa-paper-plane',
        recipient: recipient.username,
      },
      ...movements,
    ];

    const updatedSender = {
      ...user,
      balance: user.balance - amount,
    };

    // Actualizar saldo del receptor
    const recipientMovements = [
      {
        id: Date.now(),
        title: `Transferencia de ${user.name}`,
        date: new Date().toLocaleString('es-CO'),
        amount: amount,
        type: 'income',
        icon: 'fa-wallet',
        sender: user.username,
      },
      ...(recipient.movements || []),
    ];

    const updatedRecipient = {
      ...recipient,
      balance: recipient.balance + amount,
      movements: recipientMovements,
    };

    // Actualizar contexto y cuentas
    updateCurrentAccount(updatedSender, senderMovements);
    setAccounts((prevAccounts) =>
      prevAccounts.map((acc) =>
        acc.username === recipient.username ? updatedRecipient : acc
      )
    );

    logEvent('transfer:user:success', {
      from: user.username,
      to: recipient.username,
      amount,
      senderBalance: updatedSender.balance,
      recipientBalance: updatedRecipient.balance,
    });

    return { success: true, message: 'Transferencia exitosa' };
  };

  const addAccount = (account) => {
    logEvent('account:create', {
      username: account?.username,
      accountNumber: account?.accountNumber,
    });
    setAccounts((prev) => [...prev, account]);
  };

  const clearSession = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('currentUsername');
    setIsLoggedIn(false);
    setUser(null);
    setMovements([]);
    setCurrentUsername(null);
  };

  const login = (username, password) => {
    logEvent('login:attempt', { username });
    const account = accounts.find((item) => item.username === username && item.pin === password);
    if (!account) {
      logEvent('login:failed', { username });
      return false;
    }

    // Detectar cambio de cuenta
    const isAccountSwitch = currentUsername && currentUsername !== username;
    
    if (isAccountSwitch) {
      clearSession();
      Swal.fire({
        icon: 'info',
        title: '🔐 Cambio de cuenta detectado',
        html: `<p style="font-size: 0.95rem; margin: 10px 0;">Los datos de sesión anterior han sido eliminados por seguridad.</p>
               <p style="font-size: 0.85rem; color: #94a3b8;">Iniciando sesión con: <strong>${account.name}</strong></p>`,
        background: '#1a1a2e',
        color: '#f8fafc',
        confirmButtonColor: '#6366f1',
        timer: 2000,
        timerProgressBar: true,
        showConfirmButton: false,
      });
      setTimeout(() => {
        const token = 'token_simulado_' + Date.now();
        localStorage.setItem('token', token);
        localStorage.setItem('currentUsername', username);
        localStorage.setItem('user', JSON.stringify(account));
        setCurrentUsername(username);
        setUser(account);
        setMovements(account.movements || []);
        setIsLoggedIn(true);
      }, 2000);
      return 'switch';
    }

    const token = 'token_simulado_' + Date.now();
    localStorage.setItem('token', token);
    localStorage.setItem('currentUsername', username);
    localStorage.setItem('user', JSON.stringify(account));
    setCurrentUsername(username);
    setUser(account);
    setMovements(account.movements || []);
    setIsLoggedIn(true);
    logEvent('login:success', { username, name: account.name });
    return true;
  };

  // Intento de bloquear navegación back/forward mientras esté logueado
  useEffect(() => {
    if (!isLoggedIn) return;

    console.log('[App] navigation blockers ENABLED');

    // Empuja el estado actual para prevenir volver atrás inmediato
    try {
      window.history.pushState(null, document.title, window.location.href);
    } catch (e) {
      // Algunos navegadores o contextos pueden lanzar al manipular history
    }

    const handlePopState = () => {
      console.log('[App] popstate navigation detected, logging out...');
      logEvent('browser:navigation:blocked', { type: 'popstate', path: window.location.pathname });
      logout();
    };

    const handleKeyDown = (e) => {
      // console.log('[App] keydown', e.key, e.altKey, e.ctrlKey);
      const active = document.activeElement;

      // Evitar Backspace navegando fuera cuando no estamos en un input/textarea o elemento editable
      if (e.key === 'Backspace') {
        const tag = active && active.tagName;
        const isEditable = active && (active.isContentEditable || tag === 'INPUT' || tag === 'TEXTAREA');
        if (!isEditable) {
          e.preventDefault();
          logEvent('keyboard:blocked', { key: e.key, path: window.location.pathname });
        }
      }

      // Evitar Alt+ArrowLeft/ArrowRight (navegación atrás/adelante)
      if (e.altKey && (e.key === 'ArrowLeft' || e.key === 'ArrowRight')) {
        e.preventDefault();
        logEvent('keyboard:blocked', { key: e.key, altKey: true, path: window.location.pathname });
      }

      // Evitar Ctrl+Tab/Shift+Ctrl+Tab handled by browser; don't try to block those.
    };

    window.addEventListener('popstate', handlePopState);
    window.addEventListener('keydown', handleKeyDown, { passive: false });

    const handleBeforeUnload = (e) => {
      // Mostrar diálogo nativo de confirmación al intentar recargar o cerrar
      e.preventDefault();
      e.returnValue = '';
      return '';
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('popstate', handlePopState);
      window.removeEventListener('keydown', handleKeyDown, { passive: false });
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isLoggedIn]);

  // HU10 - Limpiar localStorage al hacer logout
  const logout = () => {
    logEvent('logout', { username: user?.username });
    clearSession();

    Swal.fire({
      icon: 'info',
      title: 'Sesión cerrada',
      text: 'Por seguridad se borraron los datos de acceso. Ingresa otra vez para acceder a tu banca.',
      background: '#1a1a2e',
      color: '#f8fafc',
      confirmButtonColor: '#6366f1',
      timer: 1800,
      timerProgressBar: true,
      showConfirmButton: false,
    });
  };

  // Sincronización en la nube con kvdb.io (Permite transferir y ver saldos desde otro computador en tiempo real)
  useEffect(() => {
    const handleDocumentClick = (event) => {
      const target = event.target instanceof Element ? event.target : null;
      logEvent('ui:click', {
        path: window.location.pathname,
        text: target?.textContent?.trim()?.slice(0, 80) || '',
        tag: target?.tagName || 'UNKNOWN',
        className: typeof target?.className === 'string' ? target.className : '',
      });
    };

    document.addEventListener('click', handleDocumentClick);
    return () => document.removeEventListener('click', handleDocumentClick);
  }, []);

  useEffect(() => {
    if (!ENABLE_CLOUD_SYNC) {
      return undefined;
    }

    const fetchAccounts = async () => {
      if (cloudSyncDisabledRef.current) {
        return;
      }

      try {
        const res = await fetch(CLOUD_URL);
        if (res.status === 404) {
          cloudSyncDisabledRef.current = true;
          return;
        }

        if (res.ok) {
          const rawData = await res.text();
          if (!rawData) {
            return;
          }

          const data = JSON.parse(rawData);
          if (Array.isArray(data) && data.length > 0) {
            setAccounts(data);
            
            // Actualizar los datos de la sesión del usuario actual si está logueado
            const currentSavedUsername = localStorage.getItem('currentUsername');
            if (currentSavedUsername) {
              const matchedAcc = data.find(acc => acc.username === currentSavedUsername);
              if (matchedAcc) {
                setUser(matchedAcc);
                setMovements(matchedAcc.movements || []);
              }
            }
          }
        }
      } catch (err) {
        console.log('Error al obtener datos de la nube, usando LocalStorage:', err);
      }
    };

    fetchAccounts();
    const interval = setInterval(fetchAccounts, 4000); // Polling cada 4 segundos
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    localStorage.setItem('accounts', JSON.stringify(accounts));

    if (!ENABLE_CLOUD_SYNC) {
      return;
    }
    
    const saveAccountsToCloud = async () => {
      if (cloudSyncDisabledRef.current) {
        return;
      }

      try {
        const res = await fetch(CLOUD_URL, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(accounts)
        });

        if (res.status === 404) {
          cloudSyncDisabledRef.current = true;
        }
      } catch (err) {
        console.log('Error al guardar datos en la nube:', err);
      }
    };
    saveAccountsToCloud();
  }, [accounts]);

  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify({ ...user, movements }));
    } else {
      localStorage.removeItem('user');
    }
  }, [user, movements]);

  useEffect(() => {
    if (currentUsername) {
      localStorage.setItem('currentUsername', currentUsername);
    } else {
      localStorage.removeItem('currentUsername');
    }
  }, [currentUsername]);

  // Apply theme color and background image dynamically
  useEffect(() => {
    if (user) {
      if (user.backgroundImage && user.backgroundImage.trim() !== '') {
        document.body.style.backgroundImage = `url('${user.backgroundImage}')`;
      } else {
        document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')`;
      }
      
      const themeColor = user.themeColor || '#6366f1';
      document.documentElement.style.setProperty('--accent', themeColor);
      document.documentElement.style.setProperty('--accent-hover', themeColor + 'cc');
    } else {
      document.body.style.backgroundImage = `url('https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1920&q=80')`;
      document.documentElement.style.setProperty('--accent', '#6366f1');
      document.documentElement.style.setProperty('--accent-hover', '#4f46e5');
    }
  }, [user]);

  return (
    <AppContext.Provider value={{ user, setUser, movements, setMovements, login, logout, accounts, addAccount, updateCurrentAccount, editMovement, deleteMovement, transferToUser }}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={!isLoggedIn ? <Login /> : <Navigate to="/" />} />
          <Route path="/registro" element={!isLoggedIn ? <Register /> : <Navigate to="/" />} />

          <Route path="/" element={isLoggedIn ? <Layout /> : <Navigate to="/login" />}>
            <Route index element={<Dashboard />} />
            <Route path="transferir" element={<Transfer />} />
            <Route path="pagar" element={<Payments />} />
            <Route path="ajustes" element={<Ajustes />} />
            <Route path="reporte" element={<ReporteGraficas />} />
            <Route path="perfil" element={<div style={{ padding: '20px' }}>Perfil (En construcción)</div>} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AppContext.Provider>
  );
};

export default App;
