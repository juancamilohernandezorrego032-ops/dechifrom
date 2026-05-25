const BACKEND_EVENTS_URL = import.meta.env.VITE_BACKEND_EVENTS_URL || 'http://localhost:8080/neoappapi/v1/eventos';

const buildBackendEvent = (type, payload, timestamp) => ({
  accion: type,
  detalle: JSON.stringify(payload),
  tipo: 'UI',
  origen: 'FRONTEND_BANK',
  metodoHttp: 'POST',
  ruta: payload?.path || window.location.pathname,
  usuario: payload?.username || payload?.from || payload?.to || 'frontend',
  fechaEvento: timestamp,
});

const sendToLocalDevApi = (entry) => {
  console.log('[NovaPay][POST] /api/events', entry);
  return fetch('/api/events', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry),
  });
};

const sendToBackendApi = (entry) => {
  if (!BACKEND_EVENTS_URL) {
    return Promise.resolve();
  }

  const backendBody = buildBackendEvent(entry.type, entry.payload, entry.timestamp);
  console.log('[NovaPay][POST]', BACKEND_EVENTS_URL, backendBody);

  return fetch(BACKEND_EVENTS_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(backendBody),
  }).then((response) => {
    console.log('[NovaPay][POST][RESPONSE]', BACKEND_EVENTS_URL, {
      status: response.status,
      ok: response.ok,
    });
    return response;
  }).catch((error) => {
    console.log('[NovaPay][POST][ERROR]', BACKEND_EVENTS_URL, {
      message: error?.message || 'Error desconocido',
    });
    throw error;
  });
};

export const logGetRequest = async (url, options = {}) => {
  console.log('[NovaPay][GET]', url, options);
  const response = await fetch(url, {
    method: 'GET',
    ...options,
  });
  console.log('[NovaPay][GET][RESPONSE]', url, {
    status: response.status,
    ok: response.ok,
  });
  return response;
};

export const logEvent = (type, payload = {}) => {
  const entry = {
    type,
    payload,
    timestamp: new Date().toISOString(),
  };

  console.log(`[NovaPay] ${type}`, entry);

  try {
    Promise.allSettled([
      sendToLocalDevApi(entry),
      sendToBackendApi(entry),
    ]).catch(() => {});
  } catch (error) {
    // No interrumpir la app si el endpoint local no está disponible.
  }
};
