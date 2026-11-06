import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SellerOrdersPage } from './pages/seller/OrdersPage';
import { SellerProfilePage } from './pages/seller/ProfilePage';
import { SellerStoriesPage } from './pages/seller/StoryRequestsPage';
import './App.css';
import { SellerLayout } from './pages/seller/SellerLayout';
import { SellerProductsPage } from './pages/seller/ProductPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/vendedor" element={<SellerLayout />}>
          <Route path="pedidos" element={<SellerOrdersPage />} />
          <Route path="productos" element={<SellerProductsPage />} />
          <Route path="historias" element={<SellerStoriesPage />} />
          <Route path="perfil" element={<SellerProfilePage />} />
          <Route index element={<Navigate to="/vendedor/pedidos" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;