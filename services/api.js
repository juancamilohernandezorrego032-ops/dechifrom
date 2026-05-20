// HU07 - Módulo centralizado de configuración de red
const BASE_URL = 'https://jsonplaceholder.typicode.com';

const ENDPOINTS = {
  login: `${BASE_URL}/users`,
  gastos: `${BASE_URL}/posts`,
  transferencias: `${BASE_URL}/posts`,
};

// Función genérica para peticiones HTTP
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  const response = await fetch(url, {
    ...options,
    headers: { ...defaultHeaders, ...options.headers },
  });

  if (!response.ok) {
    throw new Error(`Error ${response.status}: ${response.statusText}`);
  }

  return response.json();
};

// Servicios de autenticación
export const authService = {
  login: (credentials) =>
    request(ENDPOINTS.login, {
      method: 'GET', // Simulado con jsonplaceholder
      body: JSON.stringify(credentials),
    }),
};

// Servicios de gastos
export const gastosService = {
  getAll: () => request(ENDPOINTS.gastos),
  create: (gasto) =>
    request(ENDPOINTS.gastos, {
      method: 'POST',
      body: JSON.stringify(gasto),
    }),
};

// Servicios de transferencias
export const transferenciasService = {
  create: (transferencia) =>
    request(ENDPOINTS.transferencias, {
      method: 'POST',
      body: JSON.stringify(transferencia),
    }),
};

export default ENDPOINTS;
