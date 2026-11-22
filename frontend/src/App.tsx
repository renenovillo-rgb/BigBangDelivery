import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { SellerOrdersPage } from './pages/seller/OrdersPage';
import { SellerProfilePage } from './pages/seller/ProfilePage';
import { SellerStoriesPage } from './pages/seller/StoryRequestsPage';
import './App.css';
import { SellerLayout } from './pages/seller/SellerLayout';
import { SellerProductsPage } from './pages/seller/ProductPage';
import BuyerApp from './pages/buyer/BuyerApp';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import DashboardPage from './pages/admin/DashboardPage';
import StoresManagementPage from './pages/admin/StoresManagementPage';
import ProductStoriesModerationPage from './pages/admin/ProductStoriesModerationPage';
import CategoriesPage from './pages/admin/CategoriesPage';
import UsersPage from './pages/admin/UsersPage';
import OrdersPage from './pages/admin/OrdersPage';
import SubscriptionsPage from './pages/admin/SubscriptionsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/admin" element={<AdminLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="stores" element={<StoresManagementPage />} />
          <Route path="stories" element={<ProductStoriesModerationPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="subscriptions" element={<SubscriptionsPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        
        <Route path="/vendedor" element={<SellerLayout />}>
          <Route path="pedidos" element={<SellerOrdersPage />} />
          <Route path="productos" element={<SellerProductsPage />} />
          <Route path="historias" element={<SellerStoriesPage />} />
          <Route path="perfil" element={<SellerProfilePage />} />
          <Route index element={<Navigate to="/vendedor/pedidos" replace />} />
        </Route>
        <Route path="/comprador" element={<BuyerApp />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;