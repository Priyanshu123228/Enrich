import { useState, useEffect } from 'react';
import { appointmentService } from '../../services/appointment.service';
import {
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  AlertCircle,
  Loader2,
  Search,
  Filter,
  X,
  User,
  Phone
} from 'lucide-react';

export default function AdminAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [actionFeedback, setActionFeedback] = useState({ type: '', message: '' });

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const params = {
        status: statusFilter === 'all' ? undefined : statusFilter,
        date: dateFilter || undefined
      };
      const res = await appointmentService.getAllAppointments(params);
      if (res?.data?.appointments) {
        setAppointments(res.data.appointments);
      }
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to fetch appointments' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, [statusFilter, dateFilter]);

  const handleStatusChange = async (id, newStatus) => {
    try {
      await appointmentService.updateAppointmentStatus(id, newStatus);
      setAppointments((prev) =>
        prev.map((app) => (app._id === id ? { ...app, status: newStatus } : app))
      );
      setActionFeedback({ type: 'success', message: `Booking status updated to ${newStatus}` });
    } catch (err) {
      setActionFeedback({ type: 'error', message: err.message || 'Failed to update status' });
    }
  };

  const statusColors = {
    confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    completed: 'bg-stone-100 text-stone-800 border-stone-300',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  const filteredAppointments = appointments.filter((app) => {
    const query = searchQuery.toLowerCase();
    return (
      app.bookingId?.toLowerCase().includes(query) ||
      app.customer?.name?.toLowerCase().includes(query) ||
      app.service?.name?.toLowerCase().includes(query) ||
      app.staff?.name?.toLowerCase().includes(query)
    );
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded bg-stone-100 text-stone-700 text-xs font-semibold uppercase tracking-wider mb-2 border border-stone-200">
            <span>Appointment Management</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            Appointments & Schedule
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Monitor reservations across stylists, update booking statuses, and manage schedule.
          </p>
        </div>

        <button
          onClick={fetchAppointments}
          className="px-4 py-2 rounded-lg border border-stone-300 hover:bg-stone-50 text-xs font-semibold text-stone-700 cursor-pointer"
        >
          Refresh Feed
        </button>
      </div>

      {/* Action Notification Alert */}
      {actionFeedback.message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs sm:text-sm ${
            actionFeedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {actionFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{actionFeedback.message}</span>
          </div>
          <button
            onClick={() => setActionFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row gap-4 justify-between items-center text-xs">
        
        {/* Search */}
        <div className="relative w-full md:w-80">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-stone-400">
            <Search className="w-4 h-4" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search booking ID, client, or stylist..."
            className="w-full pl-10 pr-4 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
          />
        </div>

        {/* Date Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto">
          <span className="text-stone-500 font-medium">Date:</span>
          <input
            type="date"
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
          />
          {dateFilter && (
            <button
              onClick={() => setDateFilter('')}
              className="text-stone-400 hover:text-stone-800 text-xs underline"
            >
              Clear
            </button>
          )}
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto w-full md:w-auto pb-1 scrollbar-none">
          {['all', 'confirmed', 'completed', 'cancelled'].map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg font-semibold capitalize cursor-pointer transition-colors ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Master Table */}
      <div className="bg-white rounded-xl border border-stone-200 shadow-xs overflow-hidden">
        {isLoading ? (
          <div className="p-16 flex flex-col items-center justify-center">
            <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
            <p className="text-xs text-stone-500">Loading master bookings...</p>
          </div>
        ) : filteredAppointments.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200 text-[11px] font-bold uppercase tracking-wider text-stone-600">
                  <th className="py-3.5 px-6">Reference ID</th>
                  <th className="py-3.5 px-4">Client</th>
                  <th className="py-3.5 px-4">Service</th>
                  <th className="py-3.5 px-4">Stylist</th>
                  <th className="py-3.5 px-4">Date & Slot</th>
                  <th className="py-3.5 px-4">Amount</th>
                  <th className="py-3.5 px-4">Payment</th>
                  <th className="py-3.5 px-6 text-right">Status Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
                {filteredAppointments.map((app) => (
                  <tr key={app._id} className="hover:bg-stone-50/60 transition-colors">
                    {/* Booking ID */}
                    <td className="py-4 px-6 font-mono font-bold text-stone-900">
                      {app.bookingId}
                    </td>

                    {/* Customer */}
                    <td className="py-4 px-4">
                      <p className="font-semibold text-stone-900">{app.customer?.name || 'Walk-in'}</p>
                      <p className="text-[11px] text-stone-400">{app.customer?.phone || app.customer?.email}</p>
                    </td>

                    {/* Service */}
                    <td className="py-4 px-4">
                      <p className="font-medium text-stone-900 line-clamp-1">{app.service?.name}</p>
                      <p className="text-[10px] text-stone-400">{app.service?.category} • {app.duration}m</p>
                    </td>

                    {/* Stylist */}
                    <td className="py-4 px-4">
                      <span className="font-semibold text-stone-800">{app.staff?.name}</span>
                    </td>

                    {/* Date & Time */}
                    <td className="py-4 px-4">
                      <span className="font-medium text-stone-900 block">{app.date}</span>
                      <span className="text-[11px] text-stone-700 font-mono">
                        {app.startTime} - {app.endTime}
                      </span>
                    </td>

                    {/* Amount */}
                    <td className="py-4 px-4 font-bold text-stone-900 font-serif text-sm">
                      ${app.finalAmount}
                    </td>

                    {/* Payment Status */}
                    <td className="py-4 px-4">
                      <span
                        className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                          app.paymentStatus === 'paid'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                            : app.paymentStatus === 'refunded'
                            ? 'bg-stone-100 text-stone-800 border-stone-300'
                            : 'bg-amber-50 text-amber-800 border-amber-200'
                        }`}
                      >
                        {app.paymentStatus === 'paid' ? 'Paid (Razorpay)' : app.paymentStatus || 'Pending'}
                      </span>
                    </td>

                    {/* Status Dropdown */}
                    <td className="py-4 px-6 text-right">
                      <select
                        value={app.status}
                        onChange={(e) => handleStatusChange(app._id, e.target.value)}
                        className={`px-3 py-1 rounded-md text-[11px] font-semibold border cursor-pointer capitalize ${
                          statusColors[app.status] || statusColors.confirmed
                        }`}
                      >
                        <option value="confirmed">Confirmed</option>
                        <option value="completed">Completed</option>
                        <option value="cancelled">Cancelled</option>
                        <option value="pending">Pending</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-12 text-center space-y-2">
            <p className="text-sm text-stone-500">No appointments found matching current filters.</p>
          </div>
        )}
      </div>

    </div>
  );
}
