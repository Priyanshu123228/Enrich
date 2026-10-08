import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { appointmentService } from '../../services/appointment.service';
import { slotService } from '../../services/slot.service';
import { getTodayDateString, isSlotPassed } from '../../utils/dateUtils';
import {
  Calendar,
  Clock,
  Scissors,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Loader2,
  CalendarDays,
  RefreshCw,
  X
} from 'lucide-react';

export default function MyAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [activeFilter, setActiveFilter] = useState('all'); // 'all' | 'confirmed' | 'completed' | 'cancelled'
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Reschedule Modal States
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  const [reschedulingApp, setReschedulingApp] = useState(null);
  const [newDate, setNewDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState('');
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);

  const fetchAppointments = async () => {
    setIsLoading(true);
    try {
      const res = await appointmentService.getMyAppointments();
      if (res?.data) {
        setAppointments(res.data);
      }
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load your appointments' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAppointments();
  }, []);

  const handleCancel = async (id, bookingId) => {
    const reason = window.prompt(`Please provide a reason for cancelling booking ${bookingId}:`);
    if (reason === null) return; // User pressed Cancel

    try {
      await appointmentService.cancelAppointment(id, reason || 'Cancelled by customer');
      setFeedback({ type: 'success', message: `Booking ${bookingId} has been cancelled.` });
      await fetchAppointments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel appointment' });
    }
  };

  const openRescheduleModal = async (appointment) => {
    setReschedulingApp(appointment);
    setNewDate(appointment.date);
    setSelectedRescheduleSlot('');
    setIsRescheduleOpen(true);
    loadRescheduleSlots(appointment, appointment.date);
  };

  const loadRescheduleSlots = async (app, date) => {
    setIsLoadingSlots(true);
    try {
      const res = await slotService.getAvailableSlots({
        serviceId: app.service._id,
        staffId: app.staff._id,
        date
      });
      if (res?.data?.availableSlots) {
        setRescheduleSlots(res.data.availableSlots);
      } else {
        setRescheduleSlots([]);
      }
    } catch (err) {
      setRescheduleSlots([]);
    } finally {
      setIsLoadingSlots(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRescheduleSlot) return;

    setIsSavingReschedule(true);
    try {
      await appointmentService.rescheduleAppointment(reschedulingApp._id, {
        newDate,
        newStartTime: selectedRescheduleSlot
      });
      setFeedback({ type: 'success', message: 'Appointment successfully rescheduled.' });
      setIsRescheduleOpen(false);
      await fetchAppointments();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reschedule slot' });
    } finally {
      setIsSavingReschedule(false);
    }
  };

  const statusColors = {
    confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    completed: 'bg-stone-100 text-stone-800 border-stone-300',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  const filteredAppointments = appointments.filter((app) => {
    if (activeFilter === 'all') return true;
    return app.status === activeFilter;
  });

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs">
        <div>
          <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded-md bg-stone-100 text-stone-800 text-xs font-semibold uppercase tracking-wider mb-2">
            <CalendarDays className="w-3.5 h-3.5 text-stone-600" />
            <span>Customer Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
            My Appointments
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 mt-1">
            Track upcoming visits, reschedule sessions, or book new treatments.
          </p>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
        >
          Book Appointment
        </Link>
      </div>

      {/* Action Notification Alert */}
      {feedback.message && (
        <div
          className={`p-4 rounded-lg flex items-center justify-between text-xs sm:text-sm ${
            feedback.type === 'success'
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-800'
              : 'bg-red-50 border border-red-200 text-red-800'
          }`}
        >
          <div className="flex items-center space-x-2">
            {feedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span className="font-medium">{feedback.message}</span>
          </div>
          <button
            onClick={() => setFeedback({ type: '', message: '' })}
            className="text-stone-400 hover:text-stone-700"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'all', label: 'All Bookings' },
          { id: 'confirmed', label: 'Upcoming' },
          { id: 'completed', label: 'Completed' },
          { id: 'cancelled', label: 'Cancelled' }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveFilter(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors cursor-pointer ${
              activeFilter === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      {isLoading ? (
        <div className="p-16 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">Retrieving your bookings...</p>
        </div>
      ) : filteredAppointments.length > 0 ? (
        <div className="space-y-4">
          {filteredAppointments.map((app) => (
            <div
              key={app._id}
              className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs hover:border-stone-300 transition-colors flex flex-col md:flex-row justify-between items-start md:items-center gap-6"
            >
              {/* Left Column: Service & Stylist Info */}
              <div className="flex items-start space-x-4">
                <img
                  src={app.service?.images?.[0]?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                  alt={app.service?.name}
                  className="w-16 h-16 rounded-lg object-cover shrink-0 border border-stone-200"
                />

                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="font-mono text-[11px] font-bold text-stone-900">
                      {app.bookingId}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border capitalize ${
                        statusColors[app.status] || statusColors.confirmed
                      }`}
                    >
                      {app.status}
                    </span>
                  </div>

                  <h3 className="text-lg font-bold font-serif text-stone-900 leading-tight">
                    {app.service?.name}
                  </h3>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-stone-500 pt-1">
                    <span className="flex items-center text-stone-700 font-medium">
                      <Scissors className="w-3.5 h-3.5 mr-1 text-stone-500" />
                      Stylist: {app.staff?.name}
                    </span>
                    <span className="flex items-center">
                      <Calendar className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      {app.date}
                    </span>
                    <span className="flex items-center">
                      <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      {app.startTime} - {app.endTime} ({app.duration}m)
                    </span>
                  </div>

                  {app.notes && (
                    <p className="text-[11px] text-stone-500 italic pt-1">Note: "{app.notes}"</p>
                  )}
                </div>
              </div>

              {/* Right Column: Price & Action Buttons */}
              <div className="flex flex-row md:flex-col items-end justify-between w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-stone-100 gap-3">
                <div className="text-right">
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider block">
                    Amount
                  </span>
                  <span className="text-2xl font-bold font-serif text-stone-900">
                    ${app.finalAmount}
                  </span>
                </div>

                {app.status === 'confirmed' && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => openRescheduleModal(app)}
                      className="px-3.5 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Reschedule
                    </button>
                    <button
                      onClick={() => handleCancel(app._id, app.bookingId)}
                      className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-4 max-w-lg mx-auto">
          <div className="w-16 h-16 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center mx-auto">
            <Calendar className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-serif font-bold text-stone-900">No Appointments Found</h3>
          <p className="text-xs sm:text-sm text-stone-500">
            You don't have any bookings matching this filter.
          </p>
          <Link
            to="/book"
            className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
          >
            Book Appointment
          </Link>
        </div>
      )}

      {/* RESCHEDULE MODAL */}
      {isRescheduleOpen && reschedulingApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Reschedule {reschedulingApp.service?.name}
              </h3>
              <button
                onClick={() => setIsRescheduleOpen(false)}
                className="text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Select New Date
                </label>
                <input
                  type="date"
                  min={getTodayDateString()}
                  value={newDate}
                  onChange={(e) => {
                    setNewDate(e.target.value);
                    loadRescheduleSlots(reschedulingApp, e.target.value);
                  }}
                  className="w-full px-3.5 py-2.5 rounded-lg border border-stone-300 text-xs focus:outline-stone-500 cursor-pointer"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">
                  Choose New Time Slot
                </label>
                {isLoadingSlots ? (
                  <div className="p-4 text-center text-stone-400">
                    <Loader2 className="w-4 h-4 animate-spin inline mr-1" />
                    Calculating available slots...
                  </div>
                ) : rescheduleSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-48 overflow-y-auto p-1">
                    {rescheduleSlots.map((s) => {
                      const isPassed = isSlotPassed(rescheduleDate, s.time);
                      const isSelected = selectedRescheduleSlot === s.time;
                      return (
                        <button
                          key={s.time}
                          type="button"
                          disabled={isPassed}
                          onClick={() => {
                            if (!isPassed) setSelectedRescheduleSlot(s.time);
                          }}
                          title={isPassed ? 'This time slot has already passed' : ('Select ' + s.time)}
                          className={'py-2 px-1 rounded-lg text-center border transition-all ' + (
                            isPassed
                              ? 'bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed opacity-50 line-through'
                              : isSelected
                              ? 'bg-stone-900 text-white font-bold cursor-pointer ring-1 ring-stone-900'
                              : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50 cursor-pointer'
                          )}
                        >
                          {s.time} {isPassed ? '(Passed)' : ''}
                        </button>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">No slots open on this date. Pick another date.</p>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setIsRescheduleOpen(false)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRescheduleSlot || isSavingReschedule}
                  className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-xs disabled:opacity-50"
                >
                  {isSavingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
