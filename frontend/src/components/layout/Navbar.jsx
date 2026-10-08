import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Scissors,
  Menu,
  X,
  Calendar,
  User,
  LogOut,
  Shield,
  Users,
  CalendarCheck,
  ChevronDown,
  LayoutDashboard,
  Sparkles,
  MessageSquare,
  UserCheck,
  Tag,
  Camera,
  Gift,
  Star,
  Share2,
  ExternalLink
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();

  const handleNavClick = () => {
    setMobileMenuOpen(false);
    try {
      window.scrollTo({ top: 0, left: 0, behavior: 'instant' });
    } catch (_) {
      window.scrollTo(0, 0);
    }
  };
  const navigate = useNavigate();

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Services', path: '/services' },
    { name: 'Cosmetics', path: '/cosmetics' },
    { name: 'Offers', path: '/offers' },
    { name: 'Stylists', path: '/staff' },
    { name: 'Gallery', path: '/gallery' },
    { name: 'About', path: '/about' },
    { name: 'Contact', path: '/contact' }
  ];

  const adminMenuLinks = [
    { name: 'Admin Dashboard', path: '/admin', icon: LayoutDashboard },
    { name: 'Appointments Manager', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Cosmetics Inventory', path: '/admin/products', icon: Sparkles },
    { name: 'Customer Inquiries', path: '/admin/inquiries', icon: MessageSquare },
    { name: 'Customers Roster', path: '/admin/customers', icon: UserCheck },
    { name: 'Services & Pricing', path: '/admin/services', icon: Scissors },
    { name: 'Stylists & Team', path: '/admin/staff', icon: Users },
    { name: 'Service Categories', path: '/admin/categories', icon: Tag },
    { name: 'Media Gallery', path: '/admin/gallery', icon: Camera },
    { name: 'Offers & Promos', path: '/admin/offers', icon: Gift },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star },
    { name: 'Social Channels', path: '/admin/social-media', icon: Share2 }
  ];

  const handleLogout = () => {
    logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  return (
    <nav className="sticky top-0 z-50 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-stone-200/80 transition-all duration-300">

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-20 items-center">
          
          {/* Logo Brand */}
          <div className="flex-shrink-0 flex items-center">
            <Link to="/" className="flex items-center space-x-3 group cursor-pointer" onClick={handleNavClick}>
              <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-rose-700 to-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-900/10 group-hover:scale-105 transition-transform duration-300">
                <Scissors className="w-5 h-5" />
              </div>
              <div className="flex flex-col">
                <span className="font-serif text-xl sm:text-2xl font-bold tracking-tight text-stone-900 group-hover:text-rose-800 transition-colors">
                  Enrich
                </span>
                <span className="text-xs uppercase tracking-widest text-stone-500 font-medium -mt-0.5">
                  Beauty & Clinic · Sikar
                </span>
              </div>
            </Link>
          </div>

          {/* Desktop Navigation Links */}
          <div className="hidden lg:flex lg:space-x-1 items-center">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 ${
                    isActive
                      ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200/80 shadow-2xs'
                      : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100/70'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          {/* Right Action CTA & User Menu */}
          <div className="hidden lg:flex items-center space-x-3">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 px-3.5 py-2 rounded-full border border-stone-200 bg-white hover:bg-stone-50 text-stone-800 text-xs font-semibold transition-all shadow-2xs cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-rose-100 text-rose-800 flex items-center justify-center text-xs font-bold">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <span className="max-w-[110px] truncate">{user?.name || 'Account'}</span>
                  {user?.role === 'admin' && (
                    <span className="text-xs text-stone-500 font-medium ml-0.5">
                      (Admin)
                    </span>
                  )}
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-72 max-h-[85vh] overflow-y-auto bg-white rounded-2xl shadow-xl border border-stone-200 p-2 space-y-1 animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {/* User Header */}
                    <div className="px-3.5 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-xs text-stone-500 truncate">{user?.email}</p>
                      {user?.role === 'admin' && (
                        <span className="inline-block mt-1 px-2 py-0.5 rounded text-xs font-bold bg-rose-100 text-rose-800">
                          Verified Administrator
                        </span>
                      )}
                    </div>

                    {/* Customer Personal Links */}
                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <Calendar className="w-4 h-4 mr-2.5 text-stone-400" />
                        Customer Dashboard
                      </Link>

                      <Link
                        to="/dashboard?tab=upcoming"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <CalendarCheck className="w-4 h-4 mr-2.5 text-stone-400" />
                        My Appointments
                      </Link>

                      <Link
                        to="/dashboard?tab=favorites"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <Scissors className="w-4 h-4 mr-2.5 text-stone-400" />
                        Saved Favorites
                      </Link>

                      <Link
                        to="/dashboard?tab=profile"
                        onClick={() => setUserDropdownOpen(false)}
                        className="flex items-center px-3.5 py-1.5 text-xs font-semibold text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                      >
                        <User className="w-4 h-4 mr-2.5 text-stone-400" />
                        Profile & Account
                      </Link>
                    </div>

                    {/* Complete Admin Console Suite */}
                    {user?.role === 'admin' && (
                      <div className="border-t border-stone-100 my-1 pt-2">
                        <div className="px-3.5 py-1 text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center justify-between">
                          <span className="flex items-center gap-1.5">
                            <Shield className="w-3.5 h-3.5 text-rose-600" />
                            Admin Console
                          </span>
                          <Link
                            to="/admin"
                            onClick={() => setUserDropdownOpen(false)}
                            className="text-xs font-bold text-stone-600 hover:text-stone-900 hover:underline flex items-center gap-0.5"
                          >
                            Full Suite →
                          </Link>
                        </div>

                        <div className="space-y-0.5 mt-1">
                          {adminMenuLinks.map((item) => {
                            const IconComponent = item.icon;
                            return (
                              <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => setUserDropdownOpen(false)}
                                className="flex items-center px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                              >
                                <IconComponent className="w-3.5 h-3.5 mr-2.5 text-stone-500 shrink-0" />
                                <span className="truncate">{item.name}</span>
                              </Link>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-3.5 py-2 text-xs font-bold text-rose-700 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                      >
                        <LogOut className="w-4 h-4 mr-2" />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="inline-flex items-center px-4 py-2.5 rounded-full text-xs font-bold text-stone-700 hover:text-rose-800 hover:bg-stone-50 border border-stone-200/80 transition-all shadow-2xs"
              >
                <User className="w-4 h-4 mr-1.5 text-rose-700" />
                Sign In
              </Link>
            )}

            <Link
              to="/book"
              className="btn-primary px-5 py-2.5 rounded-lg whitespace-nowrap shadow-sm"
            >
              <Calendar className="w-4 h-4 mr-2 text-rose-200" />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex lg:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2.5 rounded-2xl text-stone-700 hover:text-rose-700 hover:bg-stone-100 focus:outline-none transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-stone-200 px-5 pt-3 pb-8 space-y-4 shadow-lg animate-in slide-in-from-top-2 max-h-[85vh] overflow-y-auto">
          <div className="flex flex-col space-y-1.5">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={handleNavClick}
                className={({ isActive }) =>
                  `block px-4 py-2.5 rounded-2xl text-sm font-semibold transition-colors ${
                    isActive
                      ? 'bg-rose-50 text-rose-800 font-bold border border-rose-200/80'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-rose-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col space-y-2.5">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={handleNavClick}
                  className="w-full text-center py-3 px-4 rounded-2xl bg-rose-50 text-rose-800 font-bold text-xs"
                >
                  Customer Dashboard
                </Link>

                <Link
                  to="/dashboard?tab=upcoming"
                  onClick={handleNavClick}
                  className="w-full text-center py-2.5 px-4 rounded-2xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 text-xs"
                >
                  My Appointments
                </Link>

                <Link
                  to="/dashboard?tab=favorites"
                  onClick={handleNavClick}
                  className="w-full text-center py-2.5 px-4 rounded-2xl border border-stone-200 text-stone-700 font-semibold hover:bg-stone-50 text-xs"
                >
                  Saved Favorites
                </Link>

                <Link
                  to="/dashboard?tab=profile"
                  onClick={handleNavClick}
                  className="w-full text-center py-2.5 px-4 rounded-2xl border border-stone-300 text-stone-700 font-semibold hover:bg-stone-50 text-xs"
                >
                  Profile Settings ({user?.name})
                </Link>

                {user?.role === 'admin' && (
                  <div className="pt-3 border-t border-stone-200 space-y-2">
                    <div className="px-2 text-xs font-bold uppercase tracking-wider text-rose-800 flex items-center gap-1">
                      <Shield className="w-3.5 h-3.5" />
                      Admin Management Console
                    </div>
                    <div className="grid grid-cols-1 gap-1.5">
                      {adminMenuLinks.map((item) => {
                        const IconComponent = item.icon;
                        return (
                          <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleNavClick}
                            className="flex items-center px-4 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-stone-800 text-xs font-semibold"
                          >
                            <IconComponent className="w-3.5 h-3.5 mr-2 text-stone-600" />
                            {item.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-3 px-4 rounded-2xl bg-stone-100 text-rose-700 font-bold hover:bg-rose-50 text-xs cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={handleNavClick}
                className="w-full text-center py-3 px-4 rounded-2xl border border-stone-300 text-stone-800 font-bold text-xs"
              >
                Sign In / Register
              </Link>
            )}

            <Link
              to="/book"
              onClick={handleNavClick}
              className="w-full text-center py-3.5 px-6 rounded-2xl text-xs font-bold text-white bg-gradient-to-r from-rose-700 to-rose-600 shadow-md shadow-rose-900/20"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
