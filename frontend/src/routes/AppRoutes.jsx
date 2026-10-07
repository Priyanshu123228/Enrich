import { lazy, Suspense } from 'react';
import { Routes, Route } from 'react-router-dom';
import MainLayout from '../components/layout/MainLayout';
import AdminLayout from '../components/admin/AdminLayout';
import { Loader2 } from 'lucide-react';

// Eager load Home for instant First Contentful Paint (FCP)
import Home from '../pages/Home';

// Lazy-loaded Public Pages (loaded on demand)
const Services = lazy(() => import('../pages/Services'));
const ServiceDetail = lazy(() => import('../pages/ServiceDetail'));
const Cosmetics = lazy(() => import('../pages/Cosmetics'));
const ProductDetail = lazy(() => import('../pages/ProductDetail'));
const StaffList = lazy(() => import('../pages/StaffList'));
const StaffDetail = lazy(() => import('../pages/StaffDetail'));
const Gallery = lazy(() => import('../pages/Gallery'));
const Offers = lazy(() => import('../pages/Offers'));
const About = lazy(() => import('../pages/About'));
const Contact = lazy(() => import('../pages/Contact'));
const Login = lazy(() => import('../pages/Login'));
const Signup = lazy(() => import('../pages/Signup'));
const VerifyEmail = lazy(() => import('../pages/VerifyEmail'));
const VerifyPhone = lazy(() => import('../pages/VerifyPhone'));
const ForgotPassword = lazy(() => import('../pages/ForgotPassword'));
const ResetPassword = lazy(() => import('../pages/ResetPassword'));
const PrivacyPolicy = lazy(() => import('../pages/PrivacyPolicy'));
const TermsAndConditions = lazy(() => import('../pages/TermsAndConditions'));
const NotFound = lazy(() => import('../pages/NotFound'));

// Lazy-loaded Customer Pages
const BookingWizard = lazy(() => import('../pages/booking/BookingWizard'));
const CustomerDashboard = lazy(() => import('../pages/customer/CustomerDashboard'));

// Lazy-loaded Admin Console Pages
const AdminDashboard = lazy(() => import('../pages/admin/AdminDashboard'));
const AdminAppointments = lazy(() => import('../pages/admin/AdminAppointments'));
const AdminProducts = lazy(() => import('../pages/admin/AdminProducts'));
const AdminInquiries = lazy(() => import('../pages/admin/AdminInquiries'));
const AdminCustomers = lazy(() => import('../pages/admin/AdminCustomers'));
const AdminStaff = lazy(() => import('../pages/admin/AdminStaff'));
const AdminServices = lazy(() => import('../pages/admin/AdminServices'));
const AdminCategories = lazy(() => import('../pages/admin/AdminCategories'));
const AdminOffers = lazy(() => import('../pages/admin/AdminOffers'));
const AdminReviews = lazy(() => import('../pages/admin/AdminReviews'));
const AdminGallery = lazy(() => import('../pages/admin/AdminGallery'));
const AdminSocialMedia = lazy(() => import('../pages/admin/AdminSocialMedia'));

// Auth & Role Guards
import ProtectedRoute from '../components/auth/ProtectedRoute';
import RoleRoute from '../components/auth/RoleRoute';

/**
 * Sleek luxury fallback loader during lazy chunk transition
 */
function PageFallback() {
  return (
    <div className="min-h-[50vh] flex flex-col items-center justify-center space-y-3 py-16">
      <Loader2 className="w-8 h-8 animate-spin text-rose-700" />
      <span className="text-xs font-semibold uppercase tracking-wider text-stone-600">
        Loading...
      </span>
    </div>
  );
}

export default function AppRoutes() {
  return (
    <Suspense fallback={<PageFallback />}>
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
    </Suspense>
  );
}
