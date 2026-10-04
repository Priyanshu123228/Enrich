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
  ChevronDown
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
    { name: 'Contact', path: '/contact' },
  ];

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const activeLinkClass = ({ isActive }) =>
    isActive
      ? 'px-3.5 py-2 rounded-full text-xs font-bold tracking-wide bg-rose-50 text-rose-800 border border-rose-200/80 shadow-2xs transition-all'
      : 'px-3.5 py-2 rounded-full text-xs font-semibold tracking-wide text-stone-700 hover:text-rose-800 hover:bg-stone-50 transition-all';

  const roleBadgeColor = {
    admin: 'bg-stone-900 text-white',
    staff: 'bg-stone-200 text-stone-800',
    customer: 'bg-rose-100 text-rose-800'
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
      <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-8 xl:px-12">
        <div className="flex items-center justify-between h-20 sm:h-22 gap-4 lg:gap-6">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group shrink-0">
            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-rose-700 via-rose-600 to-rose-700 text-white flex items-center justify-center shadow-md shadow-rose-900/20 group-hover:scale-105 transition-transform duration-300">
              <Scissors className="w-5 h-5 text-rose-100" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-stone-900 font-serif leading-tight">
                Enrich <span className="text-rose-700 italic font-serif">Beauty</span>
              </span>
              <span className="text-[10px] sm:text-[11px] uppercase tracking-widest text-stone-500 font-medium">
                Parlour & Clinic • Sikar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={activeLinkClass}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden lg:flex items-center gap-3.5 shrink-0 pl-3 border-l border-stone-200/80">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3.5 py-1.5 rounded-full bg-white hover:bg-stone-50 transition-all border border-stone-200/90 shadow-2xs cursor-pointer active:scale-95"
                >
                  <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-rose-700 to-rose-600 text-white flex items-center justify-center font-bold text-xs shadow-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-bold text-stone-900 leading-tight truncate max-w-[110px]">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded-full text-[9px] uppercase font-bold tracking-wider ${
                        roleBadgeColor[user?.role] || roleBadgeColor.customer
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-400" />
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-2xl shadow-xl border border-stone-200 p-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2.5 border-b border-stone-100">
                      <p className="text-xs font-bold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
                    >
                      <CalendarCheck className="w-4 h-4 mr-2 text-rose-600" />
                      Customer Dashboard
                    </Link>

                    <Link
                      to="/dashboard?tab=upcoming"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-stone-400" />
                      My Appointments
                    </Link>

                    <Link
                      to="/dashboard?tab=favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
                    >
                      <Scissors className="w-4 h-4 mr-2 text-stone-400" />
                      Saved Favorites
                    </Link>

                    <Link
                      to="/dashboard?tab=profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-3.5 py-2 text-xs font-semibold text-stone-700 hover:bg-rose-50 hover:text-rose-700 rounded-xl transition-colors"
                    >
                      <User className="w-4 h-4 mr-2 text-stone-400" />
                      Profile & Account
                    </Link>

                    {/* Admin Links */}
                    {user?.role === 'admin' && (
                      <div className="border-t border-stone-100 my-1 pt-1">
                        <div className="px-3.5 py-1 text-[10px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
                          <Shield className="w-3 h-3 text-rose-600" />
                          Admin Console
                        </div>
                        <Link
                          to="/admin/appointments"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Master Appointments
                        </Link>
                        <Link
                          to="/admin/services"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                        >
                          <Scissors className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Manage Services
                        </Link>
                        <Link
                          to="/admin/staff"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-3.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 rounded-xl transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Manage Stylists Roster
                        </Link>
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
              className="inline-flex items-center justify-center px-6 py-3 rounded-full text-xs font-bold text-white bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 shadow-md shadow-rose-900/20 hover:shadow-lg hover:shadow-rose-900/30 transition-all active:scale-95 cursor-pointer whitespace-nowrap"
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
        <div className="lg:hidden bg-white border-b border-stone-200 px-5 pt-3 pb-8 space-y-4 shadow-lg animate-in slide-in-from-top-2">
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
                  <Link
                    to="/admin/appointments"
                    onClick={handleNavClick}
                    className="w-full text-center py-2.5 px-4 rounded-2xl bg-stone-100 text-stone-900 font-bold text-xs"
                  >
                    Admin: Master Appointments
                  </Link>
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
                className="w-full text-center py-3 px-4 rounded-2xl border border-stone-300 text-stone-700 font-bold hover:bg-stone-50 text-xs"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/book"
              onClick={handleNavClick}
              className="w-full text-center py-3.5 px-5 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 text-white font-bold shadow-md shadow-rose-900/20 text-xs tracking-wide"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
