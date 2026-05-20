import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from '../Layuot'; // Fíjate en el nombre Layuot
import Home from '../pages/Home';
import Products from '../pages/Products';

const AppRouter = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* RUTA PADRE */}
        <Route path="/" element={<Layout />}>
          
          {/* RUTA HIJA: Se usa la prop 'index' */}
          <Route index element={<Home />} />
          
          <Route path="productos" element={<Products />} />
          <Route path="contacto" element={<h2>Página de Contacto</h2>} />
          
        </Route>
      </Routes>
    </BrowserRouter>
  );
};

export default AppRouter;
