import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/admin/AdminLayout';

// Public Pages
import Home from '../pages/Home';
import Services from '../pages/Services';
import ServiceDetail from '../pages/ServiceDetail';
import Cosmetics from '../pages/Cosmetics';
import ProductDetail from '../pages/ProductDetail';
import StaffList from '../pages/StaffList';
import StaffDetail from '../pages/StaffDetail';
import Gallery from '../pages/Gallery';
import Offers from '../pages/Offers';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import VerifyEmail from '../pages/VerifyEmail';
import VerifyPhone from '../pages/VerifyPhone';
import ForgotPassword from '../pages/ForgotPassword';
import ResetPassword from '../pages/ResetPassword';
import PrivacyPolicy from '../pages/PrivacyPolicy';
import TermsAndConditions from '../pages/TermsAndConditions';
import NotFound from '../pages/NotFound';

// Customer Pages
import BookingWizard from '../pages/booking/BookingWizard';
import CustomerDashboard from '../pages/customer/CustomerDashboard';
import MyAppointments from '../pages/customer/MyAppointments';
import Profile from '../pages/Profile';

// Admin Console Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import AdminAppointments from '../pages/admin/AdminAppointments';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminInquiries from '../pages/admin/AdminInquiries';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminStaff from '../pages/admin/AdminStaff';
import AdminServices from '../pages/admin/AdminServices';
import AdminCategories from '../pages/admin/AdminCategories';
import AdminOffers from '../pages/admin/AdminOffers';
import AdminReviews from '../pages/admin/AdminReviews';
import AdminGallery from '../pages/admin/AdminGallery';
import AdminSocialMedia from '../pages/admin/AdminSocialMedia';

// Auth & Role Guards
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRoute from '../components/auth/RoleRoute';

export default function AppRoutes() {
  return (
    <Routes>
      {/* 1. Public & Customer Routes under MainLayout */}
      <Route path="/" element={<MainLayout />}>
        <Route index element={<Home />} />
        <Route path="services" element={<Services />} />
        <Route path="services/:id" element={<ServiceDetail />} />
        <Route path="cosmetics" element={<Cosmetics />} />
        <Route path="cosmetics/:id" element={<ProductDetail />} />
        <Route path="products" element={<Cosmetics />} />
        <Route path="products/:id" element={<ProductDetail />} />
        <Route path="staff" element={<StaffList />} />
        <Route path="staff/:id" element={<StaffDetail />} />
        <Route path="gallery" element={<Gallery />} />
        <Route path="offers" element={<Offers />} />
        <Route path="about" element={<About />} />
        <Route path="contact" element={<Contact />} />
        
        {/* Authentication & Verification Routes */}
        <Route path="login" element={<Login />} />
        <Route path="signup" element={<Signup />} />
        <Route path="register" element={<Signup />} />
        <Route path="verify-email" element={<VerifyEmail />} />
        <Route path="forgot-password" element={<ForgotPassword />} />
        <Route path="reset-password" element={<ResetPassword />} />
        <Route
          path="verify-phone"
          element={
            <ProtectedRoute>
              <VerifyPhone />
            </ProtectedRoute>
          }
        />

        {/* Protected Customer Routes */}
        <Route
          path="dashboard"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="book"
          element={
            <ProtectedRoute>
              <BookingWizard />
            </ProtectedRoute>
          }
        />
        <Route
          path="my-appointments"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <CustomerDashboard />
            </ProtectedRoute>
          }
        />

        
        {/* Legal & Compliance Routes */}
        <Route path="/privacy-policy" element={<PrivacyPolicy />} />
        <Route path="/privacy" element={<PrivacyPolicy />} />
        <Route path="/terms-and-conditions" element={<TermsAndConditions />} />
        <Route path="/terms" element={<TermsAndConditions />} />

        <Route path="*" element={<NotFound />} />
      </Route>

      {/* 2. Admin Console Routes under Unified AdminLayout */}
      <Route
        path="/admin"
        element={
          <RoleRoute allowedRoles={['admin']}>
            <AdminLayout />
          </RoleRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="appointments" element={<AdminAppointments />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="cosmetics" element={<AdminProducts />} />
        <Route path="inquiries" element={<AdminInquiries />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="staff" element={<AdminStaff />} />
        <Route path="services" element={<AdminServices />} />
        <Route path="categories" element={<AdminCategories />} />
        <Route path="offers" element={<AdminOffers />} />
        <Route path="reviews" element={<AdminReviews />} />
        <Route path="gallery" element={<AdminGallery />} />
        <Route path="social-media" element={<AdminSocialMedia />} />
        <Route path="social-links" element={<AdminSocialMedia />} />
      </Route>
    </Routes>
  );
}
