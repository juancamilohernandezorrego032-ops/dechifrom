import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../Layuot'; // Importa tu componente (fíjate en el nombre Layuot)

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Esta ruta "/" usa el Layout como estructura principal */}
        <Route path="/" element={<Layout />}>
          
          {/* Esta es la ruta por defecto (el Home) */}
          <Route index element={
            <div style={{ textAlign: 'center', marginTop: '50px' }}>
              <h1>🏠 ¡Bienvenido a la Página de Inicio!</h1>
              <p>Este contenido aparece dentro del Main del Layout.</p>
            </div>
          } />

          {/* Aquí podrás agregar más rutas después, por ejemplo:
          <Route path="contacto" element={<Contacto />} /> 
          */}
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter; 