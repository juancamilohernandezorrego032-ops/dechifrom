
import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar'; // Importa el nuevo Navbar

const Layout = () => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <Navbar /> {/* <-- El Navbar ahora es un componente independiente */}

      <main style={{ flex: 1, padding: '20px' }}>
        <Outlet /> 
      </main>

      <footer style={{ background: '#20232a', color: 'white', padding: '1.5rem', textAlign: 'center' }}>
        <p>© 2026 Mi Proyecto Base - Consistencia Visual HU03</p>
      </footer>
    </div>
  );
};

export default Layout;