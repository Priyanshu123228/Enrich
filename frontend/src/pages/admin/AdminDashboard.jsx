import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminService } from '../../services/admin.service';
import {
  Users,
  Calendar,
  DollarSign,
  TrendingUp,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowUpRight,
  Loader2,
  CalendarCheck,
  Scissors
} from 'lucide-react';

export default function AdminDashboard() {
  const [analytics, setAnalytics] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchStats = async () => {
      setIsLoading(true);
      try {
        const res = await adminService.getDashboardAnalytics();
        if (res?.data) {
          setAnalytics(res.data);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to fetch executive analytics');
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-xs text-stone-500">Loading salon analytics and metrics...</p>
      </div>
    );
  }

  const { overview, topServices, monthlyRevenue, recentBookings } = analytics || {};

  const maxRevenue = Math.max(...(monthlyRevenue?.map((m) => m.revenue) || [1000]), 1000);

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      
      {/* Dashboard Top Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
            Executive Summary
          </span>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900 mt-1">
            Salon Performance Dashboard
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-0.5">
            Tracking of appointments, revenue, clients, and service bookings.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <Link
            to="/admin/appointments"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
          >
            <CalendarCheck className="w-3.5 h-3.5 mr-1.5" />
            Manage Bookings
          </Link>
          <Link
            to="/admin/services"
            className="inline-flex items-center px-4 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs border border-stone-200 transition-colors"
          >
            <Scissors className="w-3.5 h-3.5 mr-1.5" />
            Update Menu
          </Link>
        </div>
      </div>

      {/* 4 Core KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* Total Revenue */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Revenue
            </span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
              <DollarSign className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-stone-900">
              ${overview?.totalRevenue || 0}
            </span>
            <p className="text-[11px] text-emerald-700 font-semibold flex items-center mt-1">
              <TrendingUp className="w-3 h-3 mr-1" />
              +${overview?.todayRevenue || 0} earned today
            </p>
          </div>
        </div>

        {/* Total Bookings */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Total Appointments
            </span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
              <Calendar className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-stone-900">
              {overview?.totalAppointments || 0}
            </span>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              <strong className="text-stone-900">{overview?.todayAppointments || 0}</strong> scheduled for today
            </p>
          </div>
        </div>

        {/* Total Customers */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Registered Clients
            </span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
              <Users className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-stone-900">
              {overview?.totalCustomers || 0}
            </span>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              Across <strong className="text-stone-800">{overview?.totalStaff || 0}</strong> stylists
            </p>
          </div>
        </div>

        {/* Completed Visits */}
        <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-stone-400">
              Completed Visits
            </span>
            <div className="w-9 h-9 rounded-lg bg-stone-100 text-stone-800 flex items-center justify-center">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <div>
            <span className="text-3xl font-serif font-bold text-stone-900">
              {overview?.statusDistribution?.completed || 0}
            </span>
            <p className="text-[11px] text-stone-500 font-medium mt-1">
              {overview?.statusDistribution?.cancelled || 0} cancellations recorded
            </p>
          </div>
        </div>

      </div>

      {/* Middle Grid: Revenue Trend Chart & Top Services Breakdown */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Monthly Revenue Trend Bar Chart */}
        <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Monthly Revenue Trend
              </h3>
              <p className="text-xs text-stone-500">Gross earnings trajectory over recent months</p>
            </div>
            <span className="px-2.5 py-1 rounded text-[11px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
              Monthly Record
            </span>
          </div>

          {/* Visual Bar Chart */}
          <div className="pt-4 flex items-end justify-between gap-3 h-52 border-b border-stone-100 pb-3">
            {monthlyRevenue?.map((m) => {
              const heightPercent = Math.max(15, Math.round((m.revenue / maxRevenue) * 100));
              return (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] font-semibold text-stone-600 opacity-0 group-hover:opacity-100 transition-opacity">
                    ${m.revenue}
                  </span>
                  <div
                    style={{ height: `${heightPercent}%` }}
                    className="w-full max-w-[42px] rounded-t-md bg-stone-800 group-hover:bg-stone-900 transition-colors shadow-xs"
                  />
                  <span className="text-[11px] font-semibold text-stone-700 mt-1">
                    {m.month}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="flex justify-between text-xs text-stone-500 pt-1">
            <span>Aggregated Gross Sales</span>
            <span className="font-bold text-stone-900 font-serif">Lifetime: ${overview?.totalRevenue || 0}</span>
          </div>
        </div>

        {/* Right: Popular Services Ranking */}
        <div className="lg:col-span-5 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex justify-between items-center pb-2 border-b border-stone-100">
            <div>
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Top Services
              </h3>
              <p className="text-xs text-stone-500">Ranked by booking volume and sales</p>
            </div>
          </div>

          {topServices && topServices.length > 0 ? (
            <div className="space-y-4">
              {topServices.map((service, idx) => (
                <div key={service._id} className="flex items-center justify-between text-xs">
                  <div className="flex items-center space-x-3">
                    <span className="w-6 h-6 rounded bg-stone-100 font-bold text-stone-700 flex items-center justify-center text-[10px]">
                      #{idx + 1}
                    </span>
                    <div>
                      <p className="font-semibold text-stone-900 line-clamp-1">{service.name}</p>
                      <span className="text-[10px] text-stone-400">{service.category}</span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="font-bold text-stone-900">${service.totalRevenue}</span>
                    <span className="text-[10px] text-stone-400 block">{service.bookingsCount} booked</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-stone-400 italic">
              Booking data will populate as clients reserve treatments.
            </div>
          )}
        </div>

      </div>

      {/* Recent Bookings Feed Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs p-6 sm:p-8 space-y-4">
        <div className="flex justify-between items-center pb-3 border-b border-stone-100">
          <div>
            <h3 className="text-lg font-serif font-bold text-stone-900">
              Recent Reservations
            </h3>
            <p className="text-xs text-stone-500">Live bookings across salon departments</p>
          </div>
          <Link
            to="/admin/appointments"
            className="text-xs font-semibold text-stone-800 hover:text-stone-900 flex items-center"
          >
            View Master List <ArrowUpRight className="w-3.5 h-3.5 ml-1" />
          </Link>
        </div>

        {recentBookings && recentBookings.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-100 text-stone-400 uppercase text-[10px] font-bold">
                  <th className="py-2.5">Reference</th>
                  <th className="py-2.5">Client</th>
                  <th className="py-2.5">Treatment</th>
                  <th className="py-2.5">Stylist</th>
                  <th className="py-2.5">Date & Slot</th>
                  <th className="py-2.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-stone-700">
                {recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-stone-50">
                    <td className="py-3 font-mono font-bold text-stone-900">{b.bookingId}</td>
                    <td className="py-3 font-semibold text-stone-900">{b.customer?.name || 'Client'}</td>
                    <td className="py-3">{b.service?.name}</td>
                    <td className="py-3">{b.staff?.name}</td>
                    <td className="py-3">
                      {b.date} ({b.startTime})
                    </td>
                    <td className="py-3">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {b.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-xs text-stone-400 italic">No bookings recorded yet.</p>
        )}
      </div>

    </div>
  );
}
