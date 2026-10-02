import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  CalendarCheck,
  Users,
  Scissors,
  Sparkles,
  Tag,
  Gift,
  Star,
  Camera,
  ArrowLeft,
  LogOut,
  ShieldCheck,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

export default function AdminLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const navItems = [
    { name: 'Dashboard', path: '/admin', icon: LayoutDashboard, end: true },
    { name: 'Appointments', path: '/admin/appointments', icon: CalendarCheck },
    { name: 'Customers', path: '/admin/customers', icon: Users },
    { name: 'Stylists Roster', path: '/admin/staff', icon: Scissors },
    { name: 'Services Menu', path: '/admin/services', icon: Sparkles },
    { name: 'Categories', path: '/admin/categories', icon: Tag },
    { name: 'Media Gallery', path: '/admin/gallery', icon: Camera },
    { name: 'Offers & Promos', path: '/admin/offers', icon: Gift },
    { name: 'Reviews Moderation', path: '/admin/reviews', icon: Star }
  ];

  const handleLogout = async () => {
    await logout();
    navigate('/');
  };

  const activeClass = ({ isActive }) =>
    `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
      isActive
        ? 'bg-stone-900 text-white shadow-xs font-bold'
        : 'text-stone-600 hover:text-stone-900 hover:bg-stone-100'
    }`;

  return (
    <div className="min-h-screen bg-stone-100/60 flex flex-col md:flex-row">
      
      {/* Mobile Top Header */}
      <div className="md:hidden bg-white border-b border-stone-200 px-4 py-3 flex items-center justify-between sticky top-0 z-40">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-stone-900 text-white flex items-center justify-center font-bold text-xs">
            A
          </div>
          <span className="font-serif font-bold text-stone-900 text-sm">LuxeParlour Admin</span>
        </div>

        <button
          onClick={() => setMobileNavOpen(!mobileNavOpen)}
          className="p-2 rounded-lg text-stone-600 hover:bg-stone-100"
        >
          {mobileNavOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
        </button>
      </div>

      {/* Desktop & Mobile Sidebar */}
      <aside
        className={`fixed md:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-stone-200 p-6 flex flex-col justify-between transition-transform duration-300 md:translate-x-0 ${
          mobileNavOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="space-y-6">
          
          {/* Brand & Admin Badge */}
          <div className="space-y-1">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-stone-900 flex items-center justify-center text-white">
                <Scissors className="w-4 h-4" />
              </div>
              <span className="text-lg font-bold font-serif text-stone-900 tracking-tight">
                LuxeParlour
              </span>
            </Link>
            <div className="inline-flex items-center space-x-1 px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-bold uppercase tracking-wider mt-1 border border-stone-200">
              <ShieldCheck className="w-3 h-3 text-stone-700" />
              <span>Administration</span>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.name}
                to={item.path}
                end={item.end}
                onClick={() => setMobileNavOpen(false)}
                className={activeClass}
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>

        </div>

        {/* Sidebar Footer */}
        <div className="pt-4 border-t border-stone-100 space-y-2">
          <Link
            to="/"
            className="flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-600 hover:text-stone-900 hover:bg-stone-50 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Public Site</span>
          </Link>

          <button
            onClick={handleLogout}
            className="w-full flex items-center space-x-2 px-3 py-2 rounded-lg text-xs font-medium text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Admin Content Container */}
      <main className="flex-1 min-w-0 p-4 sm:p-8 lg:p-10">
        <Outlet />
      </main>

    </div>
  );
}
