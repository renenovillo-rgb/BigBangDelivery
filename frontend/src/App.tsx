import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SellerDashboardPage } from './pages/seller/DashboardPage';
import { SellerOrdersPage } from './pages/seller/OrdersPage';
import { SellerProfilePage } from './pages/seller/ProfilePage';
import { SellerSalesPage } from './pages/seller/SalesPage';
import { SellerSettingsPage } from './pages/seller/SettingsPage';
import { SellerStoriesPage } from './pages/seller/StoryRequestsPage';
import './App.css';
import { SellerLayout } from './pages/seller/SellerLayout';
import { SellerProductsPage } from './pages/seller/ProductPage';
import BuyerApp from './pages/buyer/BuyerApp';

function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <Routes>
        <Route path="/" element={<Navigate to="/comprador" replace />} />
        <Route path="/vendedor" element={<SellerLayout />}>
          <Route path="resumen" element={<SellerDashboardPage />} />
          <Route path="pedidos" element={<SellerOrdersPage />} />
          <Route path="productos" element={<SellerProductsPage />} />
          <Route path="historias" element={<SellerStoriesPage />} />
          <Route path="ventas" element={<SellerSalesPage />} />
          <Route path="perfil" element={<SellerProfilePage />} />
          <Route path="ajustes" element={<SellerSettingsPage />} />
          <Route index element={<Navigate to="/vendedor/resumen" replace />} />
        </Route>
        <Route path="/comprador" element={<BuyerApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;