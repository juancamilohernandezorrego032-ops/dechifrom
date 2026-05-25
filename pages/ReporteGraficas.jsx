import React, { useCallback, useEffect, useMemo, useState } from 'react';
import {
  API_BASE,
  contarPorCampo,
  obtenerEventos,
  verificarApi,
} from '../services/neoappApi';
import { logEvent } from '../services/logger';

const GRAFICAS_ESTATICAS = [
  {
    titulo: 'Evolucion de operaciones (historico)',
    src: '/graficas/grafico_evolucion_banco.png',
  },
  {
    titulo: 'Promedios historicos',
    src: '/graficas/grafico_promedios_banco.png',
  },
  {
    titulo: 'Eventos por tipo (API)',
    src: '/graficas/grafico_api_tipos.png',
  },
  {
    titulo: 'Eventos por origen (API)',
    src: '/graficas/grafico_api_origenes.png',
  },
];

function BarraSimple({ etiqueta, valor, maximo, color }) {
  const ancho = maximo > 0 ? Math.round((valor / maximo) * 100) : 0;

  return (
    <div className="grafica-barra-fila">
      <div className="grafica-barra-etiqueta" title={etiqueta}>
        {etiqueta}
      </div>
      <div className="grafica-barra-pista">
        <div
          className="grafica-barra-relleno"
          style={{ width: `${ancho}%`, backgroundColor: color }}
        />
      </div>
      <span className="grafica-barra-valor">{valor}</span>
    </div>
  );
}

const ReporteGraficas = () => {
  const [eventos, setEventos] = useState([]);
  const [estadoApi, setEstadoApi] = useState(null);
  const [cargando, setCargando] = useState(true);
  const [error, setError] = useState('');

  const cargar = useCallback(async () => {
    setCargando(true);
    setError('');

    try {
      const [verificacion, lista] = await Promise.all([
        verificarApi(),
        obtenerEventos(),
      ]);
      setEstadoApi(verificacion);
      setEventos(lista);
      logEvent('reporte:graficas:loaded', {
        path: '/reporte',
        totalEventos: lista.length,
      });
    } catch (err) {
      setError(err?.message || 'No se pudo conectar con la API del banco.');
      logEvent('reporte:graficas:error', { path: '/reporte', message: err?.message });
    } finally {
      setCargando(false);
    }
  }, []);

  useEffect(() => {
    cargar();
    const intervalo = setInterval(cargar, 8000);
    return () => clearInterval(intervalo);
  }, [cargar]);

  const porTipo = useMemo(() => contarPorCampo(eventos, 'tipo'), [eventos]);
  const porOrigen = useMemo(() => contarPorCampo(eventos, 'canal'), [eventos]);

  const maxTipo = Math.max(...Object.values(porTipo), 1);
  const maxOrigen = Math.max(...Object.values(porOrigen), 1);

  const ultimosEventos = useMemo(
    () => [...eventos].sort((a, b) => b.id - a.id).slice(0, 12),
    [eventos],
  );

  return (
    <div className="reporte-graficas-page">
      <header className="reporte-graficas-header">
        <div>
          <h1>Reporte y graficas del banco</h1>
          <p className="reporte-graficas-sub">
            Datos desde <code>{API_BASE}</code> — actualizacion automatica cada 8 s
          </p>
        </div>
        <div className="reporte-graficas-acciones">
          <button type="button" className="btn-grafica" onClick={cargar} disabled={cargando}>
            {cargando ? 'Actualizando...' : 'Actualizar'}
          </button>
          <a
            href="/reporte_final_banco.html"
            target="_blank"
            rel="noreferrer"
            className="btn-grafica btn-grafica-outline"
          >
            Reporte HTML completo
          </a>
        </div>
      </header>

      {estadoApi && (
        <section className="reporte-api-estado">
          {Object.entries(estadoApi.resultados).map(([nombre, info]) => (
            <span
              key={nombre}
              className={`pill-api ${info.ok ? 'pill-ok' : 'pill-error'}`}
            >
              {nombre}: {info.ok ? `${info.cantidad} registros` : info.error}
            </span>
          ))}
        </section>
      )}

      {error && <div className="reporte-error">{error}</div>}

      <section className="reporte-graficas-grid">
        {GRAFICAS_ESTATICAS.map((g) => (
          <article key={g.src} className="tarjeta-grafica">
            <h2>{g.titulo}</h2>
            <img src={g.src} alt={g.titulo} loading="lazy" />
          </article>
        ))}
      </section>

      <section className="reporte-live-grid">
        <article className="tarjeta-grafica">
          <h2>En vivo: eventos por tipo</h2>
          {Object.entries(porTipo).map(([tipo, cantidad]) => (
            <BarraSimple
              key={tipo}
              etiqueta={tipo}
              valor={cantidad}
              maximo={maxTipo}
              color="#2E7D32"
            />
          ))}
        </article>

        <article className="tarjeta-grafica">
          <h2>En vivo: eventos por origen</h2>
          {Object.entries(porOrigen).map(([origen, cantidad]) => (
            <BarraSimple
              key={origen}
              etiqueta={origen}
              valor={cantidad}
              maximo={maxOrigen}
              color="#EF6C00"
            />
          ))}
        </article>
      </section>

      <section className="tarjeta-grafica reporte-tabla-eventos">
        <h2>Ultimos eventos de la API ({eventos.length} total)</h2>
        <div className="tabla-eventos-wrap">
          <table>
            <thead>
              <tr>
                <th>ID</th>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Accion</th>
                <th>Origen</th>
                <th>Usuario</th>
              </tr>
            </thead>
            <tbody>
              {ultimosEventos.length === 0 ? (
                <tr>
                  <td colSpan={6}>Sin eventos</td>
                </tr>
              ) : (
                ultimosEventos.map((ev) => (
                  <tr key={ev.id}>
                    <td>{ev.id}</td>
                    <td>{String(ev.fecha).slice(0, 19)}</td>
                    <td>{ev.tipo}</td>
                    <td>{ev.accion.slice(0, 48)}</td>
                    <td>{ev.canal}</td>
                    <td>{ev.usuario}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
};

export default ReporteGraficas;
