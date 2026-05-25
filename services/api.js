// HU07 - Módulo centralizado de configuración de red
import { logGetRequest } from './logger';
import { rutas as NEOAPP_RUTAS, obtenerGastos } from './neoappApi';

const BASE_URL = 'https://jsonplaceholder.typicode.com';
const NEOAPP_GASTOS = NEOAPP_RUTAS.gastos;

const ENDPOINTS = {
  login: `${BASE_URL}/users`,
  gastos: NEOAPP_GASTOS,
  transferencias: `${BASE_URL}/posts`,
};

// Función genérica para peticiones HTTP
const request = async (url, options = {}) => {
  const token = localStorage.getItem('token');
  const method = options.method || 'GET';

  const defaultHeaders = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };

  console.log(`[NovaPay][${method}]`, url, options.body ? { body: options.body } : {});

  const response = method === 'GET'
    ? await logGetRequest(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      })
    : await fetch(url, {
        ...options,
        headers: { ...defaultHeaders, ...options.headers },
      });

  if (method !== 'GET') {
    console.log(`[NovaPay][${method}][RESPONSE]`, url, {
      status: response.status,
      ok: response.ok,
    });
  }

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

// Servicios de gastos (NeoApp API local)
export const gastosService = {
  getAll: async () => {
    try {
      return await obtenerGastos();
    } catch (error) {
      console.warn('[NovaPay] Fallback gastos jsonplaceholder:', error?.message);
      return request(`${BASE_URL}/posts`);
    }
  },
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
