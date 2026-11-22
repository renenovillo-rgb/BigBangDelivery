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
import { PlatformProvider } from './platform/PlatformProvider';
import { SellerProvider } from './pages/seller/SellerProvider';

// Vista del administrador (datos simulados, sin backend)
import { AdminShell } from './pages/administrador/AdminShell';
import { AdminDashboardPage } from './pages/administrador/AdminDashboardPage';
import { AdminApprovalsPage } from './pages/administrador/ApprovalsPage';
import { AdminVendorsPage } from './pages/administrador/VendorsPage';
import { AdminVendorDetailPage } from './pages/administrador/VendorDetailPage';
import { AdminOrdersPage } from './pages/administrador/AdminOrdersPage';
import { AdminUsersPage } from './pages/administrador/AdminUsersPage';
import { AdminCategoriesPage } from './pages/administrador/AdminCategoriesPage';
import { AdminPlansPage } from './pages/administrador/AdminPlansPage';

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
    <BrowserRouter basename={import.meta.env.BASE_URL}>
      <PlatformProvider>
      <SellerProvider>
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
        <Route path="/administrador" element={<AdminShell />}>
          <Route path="resumen" element={<AdminDashboardPage />} />
          <Route path="aprobaciones" element={<AdminApprovalsPage />} />
          <Route path="vendedores" element={<AdminVendorsPage />} />
          <Route path="vendedores/:id" element={<AdminVendorDetailPage />} />
          <Route path="pedidos" element={<AdminOrdersPage />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="categorias" element={<AdminCategoriesPage />} />
          <Route path="planes" element={<AdminPlansPage />} />
          <Route index element={<Navigate to="/administrador/resumen" replace />} />
        </Route>
        <Route path="/comprador" element={<BuyerApp />} />
      </Routes>
      </SellerProvider>
      </PlatformProvider>
    </BrowserRouter>
  );
}

export default App;
