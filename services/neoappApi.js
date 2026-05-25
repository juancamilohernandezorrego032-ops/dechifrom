/**
 * Cliente NeoApp API (banco local puerto 8080).
 * En desarrollo usa proxy de Vite: /neoappapi -> http://localhost:8080/neoappapi
 */

const API_BASE = (import.meta.env.VITE_NEOAPP_API_BASE || '/neoappapi').replace(/\/$/, '');

const rutas = {
  eventos: `${API_BASE}/v1/eventos`,
  gastos: `${API_BASE}/v1/gastos`,
  usuarios: `${API_BASE}/v1/usuarios`,
};

async function getJson(url) {
  const response = await fetch(url, {
    method: 'GET',
    headers: { Accept: 'application/json' },
  });

  if (!response.ok) {
    throw new Error(`HTTP ${response.status} en ${url}`);
  }

  return response.json();
}

export function normalizarEvento(item) {
  if (!item || typeof item !== 'object') return null;

  const id = item.id;
  if (id == null) return null;

  return {
    id: Number(id),
    tipo: String(item.tipo || 'EVENTO').toUpperCase(),
    accion: String(item.accion || 'Sin accion'),
    fecha: item.fechaEvento || '',
    canal: String(item.origen || 'API'),
    ruta: String(item.ruta || '/'),
    usuario: item.usuario != null ? String(item.usuario) : '-',
    metodo: String(item.metodoHttp || '-'),
  };
}

export async function obtenerEventos() {
  const data = await getJson(rutas.eventos);
  const lista = Array.isArray(data) ? data : [];
  return lista.map(normalizarEvento).filter(Boolean);
}

export async function obtenerGastos() {
  const data = await getJson(rutas.gastos);
  return Array.isArray(data) ? data : [];
}

export async function obtenerUsuarios() {
  const data = await getJson(rutas.usuarios);
  return Array.isArray(data) ? data : [];
}

export async function verificarApi() {
  const checks = [
    { nombre: 'eventos', url: rutas.eventos },
    { nombre: 'gastos', url: rutas.gastos },
    { nombre: 'usuarios', url: rutas.usuarios },
  ];

  const resultados = {};

  await Promise.all(
    checks.map(async ({ nombre, url }) => {
      try {
        const data = await getJson(url);
        const cantidad = Array.isArray(data) ? data.length : 0;
        resultados[nombre] = { ok: true, url, cantidad, error: null };
      } catch (error) {
        resultados[nombre] = {
          ok: false,
          url,
          cantidad: 0,
          error: error?.message || 'Error de conexion',
        };
      }
    }),
  );

  return { base: API_BASE, resultados };
}

export function contarPorCampo(lista, campo) {
  return lista.reduce((acc, item) => {
    const clave = item[campo] || 'Sin dato';
    acc[clave] = (acc[clave] || 0) + 1;
    return acc;
  }, {});
}

export { API_BASE, rutas };
