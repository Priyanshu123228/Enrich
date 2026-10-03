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
  CalendarCheck
} from 'lucide-react';

export default function Navbar() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const { user, isAuthenticated, logout } = useAuth();
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
      ? 'text-rose-700 font-semibold border-b-2 border-rose-700 pb-1'
      : 'text-stone-700 hover:text-rose-700 font-medium transition-colors pb-1';

  const roleBadgeColor = {
    admin: 'bg-stone-800 text-stone-100',
    staff: 'bg-stone-200 text-stone-800',
    customer: 'bg-rose-100 text-rose-800'
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-stone-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-lg bg-stone-900 text-white flex items-center justify-center shadow-sm group-hover:bg-rose-700 transition-colors">
              <Scissors className="w-5 h-5 text-rose-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-stone-900 font-serif">
                Enrich<span className="text-rose-700"> Beauty</span>
              </span>
              <span className="text-[11px] uppercase tracking-widest text-stone-500 font-medium -mt-1">
                Parlour & Clinic • Sikar
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center space-x-7">
            {navLinks.map((link) => (
              <NavLink key={link.name} to={link.path} className={activeLinkClass}>
                {link.name}
              </NavLink>
            ))}
          </nav>

          {/* Right Action Buttons */}
          <div className="hidden md:flex items-center space-x-4">
            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2.5 px-3 py-1.5 rounded-lg hover:bg-stone-100 transition-colors border border-stone-200 cursor-pointer"
                >
                  <div className="w-7 h-7 rounded-md bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
                    {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="text-left text-xs">
                    <p className="font-semibold text-stone-800 leading-tight truncate max-w-[120px]">
                      {user?.name?.split(' ')[0]}
                    </p>
                    <span
                      className={`inline-block px-1.5 py-0.2 rounded text-[10px] uppercase font-bold tracking-wider ${
                        roleBadgeColor[user?.role] || roleBadgeColor.customer
                      }`}
                    >
                      {user?.role}
                    </span>
                  </div>
                </button>

                {/* Dropdown Menu */}
                {userDropdownOpen && (
                  <div
                    onMouseLeave={() => setUserDropdownOpen(false)}
                    className="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-lg border border-stone-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
                  >
                    <div className="px-4 py-2 border-b border-stone-100">
                      <p className="text-xs font-semibold text-stone-900 truncate">{user?.name}</p>
                      <p className="text-[11px] text-stone-500 truncate">{user?.email}</p>
                    </div>
                    
                    <Link
                      to="/dashboard"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-stone-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <CalendarCheck className="w-4 h-4 mr-2 text-rose-600" />
                      Customer Dashboard
                    </Link>

                    <Link
                      to="/dashboard?tab=upcoming"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-stone-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <Calendar className="w-4 h-4 mr-2 text-stone-400" />
                      My Appointments
                    </Link>

                    <Link
                      to="/dashboard?tab=favorites"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-stone-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <Scissors className="w-4 h-4 mr-2 text-stone-400" />
                      Saved Favorites
                    </Link>

                    <Link
                      to="/dashboard?tab=profile"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center px-4 py-2 text-xs font-medium text-stone-700 hover:bg-rose-50 hover:text-rose-700 transition-colors"
                    >
                      <User className="w-4 h-4 mr-2 text-stone-400" />
                      Profile & Account
                    </Link>

                    {/* Admin Links */}
                    {user?.role === 'admin' && (
                      <div className="border-t border-stone-100 my-1 py-1">
                        <div className="px-4 py-1 text-[10px] font-bold text-stone-800 uppercase tracking-wider flex items-center gap-1">
                          <Shield className="w-3 h-3 text-rose-600" />
                          Admin Console
                        </div>
                        <Link
                          to="/admin/appointments"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <CalendarCheck className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Master Appointments
                        </Link>
                        <Link
                          to="/admin/services"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <Scissors className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Manage Services
                        </Link>
                        <Link
                          to="/admin/staff"
                          onClick={() => setUserDropdownOpen(false)}
                          className="flex items-center px-4 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 hover:text-stone-900 transition-colors"
                        >
                          <Users className="w-3.5 h-3.5 mr-2 text-stone-500" />
                          Manage Stylists Roster
                        </Link>
                      </div>
                    )}

                    <div className="border-t border-stone-100 mt-1 pt-1">
                      <button
                        onClick={handleLogout}
                        className="w-full flex items-center px-4 py-2 text-xs font-medium text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
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
                className="inline-flex items-center px-4 py-2 text-sm font-medium text-stone-700 hover:text-rose-700 transition-colors"
              >
                <User className="w-4 h-4 mr-1.5" />
                Sign In
              </Link>
            )}

            <Link
              to="/book"
              className="inline-flex items-center justify-center px-5 py-2.5 rounded-lg text-sm font-semibold text-white bg-stone-900 hover:bg-stone-800 shadow-sm transition-colors"
            >
              <Calendar className="w-4 h-4 mr-2 text-rose-300" />
              Book Appointment
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <div className="flex md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-stone-600 hover:text-rose-700 hover:bg-stone-100 focus:outline-none"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white border-b border-stone-200 px-4 pt-2 pb-6 space-y-3">
          <div className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <NavLink
                key={link.name}
                to={link.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) =>
                  `block px-3 py-2 rounded-lg text-base font-medium ${
                    isActive
                      ? 'bg-rose-50 text-rose-700 font-semibold'
                      : 'text-stone-700 hover:bg-stone-50 hover:text-rose-700'
                  }`
                }
              >
                {link.name}
              </NavLink>
            ))}
          </div>

          <div className="pt-4 border-t border-stone-100 flex flex-col space-y-2">
            {isAuthenticated ? (
              <>
                <Link
                  to="/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-rose-50 text-rose-700 font-semibold text-xs"
                >
                  Customer Dashboard
                </Link>

                <Link
                  to="/dashboard?tab=upcoming"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-lg border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 text-xs"
                >
                  My Appointments
                </Link>

                <Link
                  to="/dashboard?tab=favorites"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-lg border border-stone-200 text-stone-700 font-medium hover:bg-stone-50 text-xs"
                >
                  Saved Favorites
                </Link>

                <Link
                  to="/dashboard?tab=profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full text-center py-2 px-4 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 text-xs"
                >
                  Profile Settings ({user?.name})
                </Link>

                {user?.role === 'admin' && (
                  <Link
                    to="/admin/appointments"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full text-center py-2 px-4 rounded-lg bg-stone-100 text-stone-800 font-semibold text-xs"
                  >
                    Admin: Master Appointments
                  </Link>
                )}

                <button
                  onClick={() => {
                    handleLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-center py-2.5 px-4 rounded-lg bg-stone-100 text-rose-700 font-medium hover:bg-rose-50 text-xs cursor-pointer"
                >
                  Sign Out
                </button>
              </>
            ) : (
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 px-4 rounded-lg border border-stone-300 text-stone-700 font-medium hover:bg-stone-50 text-xs"
              >
                Sign In
              </Link>
            )}

            <Link
              to="/book"
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2.5 px-4 rounded-lg bg-stone-900 text-white font-medium hover:bg-stone-800 shadow-xs text-xs"
            >
              Book Appointment
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
