import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { appointmentService } from '../../services/appointment.service';
import { slotService } from '../../services/slot.service';
import { customerService } from '../../services/customer.service';
import { paymentService } from '../../services/payment.service';
import { loadRazorpayScript } from '../../utils/loadRazorpay';
import {
  User,
  Calendar,
  Clock,
  Scissors,
  Heart,
  Star,
  CheckCircle2,
  AlertCircle,
  Loader2,
  X,
  CreditCard,
  RefreshCw,
  FileText,
  KeyRound,
  Shield,
  MessageSquare,
  DollarSign,
  ChevronRight,
  LogOut,
  Trash2,
  Phone
} from 'lucide-react';

export default function CustomerDashboard() {
  const { user, updateUserProfile, changeUserPassword, logout } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  // Active Tab
  const defaultTab = searchParams.get('tab') || 'upcoming';
  const [activeTab, setActiveTab] = useState(defaultTab); // 'upcoming' | 'past' | 'favorites' | 'reviews' | 'profile'

  // Data states
  const [appointments, setAppointments] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [myReviews, setMyReviews] = useState([]);
  const [pendingReviews, setPendingReviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [feedback, setFeedback] = useState({ type: '', message: '' });

  // Profile Form States
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    email: user?.email || ''
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [isSavingProfile, setIsSavingProfile] = useState(false);

  // Modals
  const [detailModalApp, setDetailModalApp] = useState(null);

  // Reschedule Modal
  const [rescheduleModalApp, setRescheduleModalApp] = useState(null);
  const [rescheduleDate, setRescheduleDate] = useState(() => new Date().toISOString().split('T')[0]);
  const [rescheduleSlots, setRescheduleSlots] = useState([]);
  const [selectedRescheduleSlot, setSelectedRescheduleSlot] = useState('');
  const [isLoadingRescheduleSlots, setIsLoadingRescheduleSlots] = useState(false);
  const [isSavingReschedule, setIsSavingReschedule] = useState(false);

  // Review Modal
  const [reviewModalApp, setReviewModalApp] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // Fetch all customer dashboard data
  const fetchDashboardData = async () => {
    setIsLoading(true);
    try {
      const [appRes, favRes, revRes, pendingRevRes] = await Promise.all([
        appointmentService.getMyAppointments(),
        customerService.getFavorites(),
        customerService.getMyReviews(),
        customerService.getPendingReviews()
      ]);

      if (appRes?.data) setAppointments(appRes.data);
      if (favRes?.data) setFavorites(favRes.data);
      if (revRes?.data) setMyReviews(revRes.data);
      if (pendingRevRes?.data) setPendingReviews(pendingRevRes.data);
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to load dashboard data' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Sync tab from URL query params
  useEffect(() => {
    const tabParam = searchParams.get('tab');
    if (tabParam && ['upcoming', 'past', 'favorites', 'reviews', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam);
    }
  }, [searchParams]);

  const handleTabChange = (tabId) => {
    setActiveTab(tabId);
    setSearchParams({ tab: tabId });
    setFeedback({ type: '', message: '' });
  };

  // Appointment Actions
  const handleCancelAppointment = async (id, bookingId) => {
    const reason = window.prompt(`Please enter cancellation reason for booking #${bookingId}:`);
    if (reason === null) return;

    try {
      await appointmentService.cancelAppointment(id, reason || 'Cancelled by client');
      setFeedback({ type: 'success', message: `Booking #${bookingId} has been cancelled.` });
      await fetchDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to cancel appointment' });
    }
  };

  const handlePayNow = async (app) => {
    setFeedback({ type: '', message: '' });
    try {
      // 1. Create Razorpay Order on backend
      const orderRes = await paymentService.createOrder({
        appointmentId: app._id
      });

      if (!orderRes?.data?.orderId) {
        throw new Error('Unable to create Razorpay payment order');
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please verify your internet connection.');
      }

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Enrich Beauty Parlour & Cosmetic Clinic',
        description: `Settling Payment for ${app.service?.name} (#${app.bookingId})`,
        image: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=200&q=80',
        order_id: orderRes.data.orderId,
        prefill: {
          name: user?.name || orderRes.data.customer?.name || '',
          email: user?.email || orderRes.data.customer?.email || '',
          contact: user?.phone || orderRes.data.customer?.phone || ''
        },
        theme: {
          color: '#1c1917'
        },
        handler: async (response) => {
          try {
            // 2. Cryptographic signature verification on backend
            await paymentService.verifyPayment({
              appointmentId: app._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: 'razorpay'
            });

            setFeedback({
              type: 'success',
              message: `Payment of $${app.finalAmount} verified successfully. Razorpay Txn: ${response.razorpay_payment_id}`
            });
            await fetchDashboardData();
          } catch (verErr) {
            setFeedback({
              type: 'error',
              message: verErr.message || 'Payment verification failed on server.'
            });
          }
        },
        modal: {
          ondismiss: async () => {
            await paymentService.reportFailure({
              appointmentId: app._id,
              razorpay_order_id: orderRes.data.orderId,
              error_description: 'Payment popup closed by customer'
            });
            setFeedback({
              type: 'error',
              message: 'Payment was cancelled before completion.'
            });
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        await paymentService.reportFailure({
          appointmentId: app._id,
          razorpay_order_id: response.error?.metadata?.order_id || orderRes.data.orderId,
          error_code: response.error?.code,
          error_description: response.error?.description,
          error_reason: response.error?.reason
        });
        setFeedback({
          type: 'error',
          message: `Payment failed: ${response.error?.description || 'Transaction unsuccessful'}`
        });
      });

      rzp.open();
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('unauthorized')) {
        setFeedback({
          type: 'error',
          message: 'Your login session has expired. Please log in again.'
        });
      } else {
        setFeedback({
          type: 'error',
          message: err.message || 'Failed to initiate Razorpay checkout'
        });
      }
    }
  };

  const openRescheduleModal = async (app) => {
    setRescheduleModalApp(app);
    setRescheduleDate(app.date);
    setSelectedRescheduleSlot('');
    loadAvailableRescheduleSlots(app, app.date);
  };

  const loadAvailableRescheduleSlots = async (app, date) => {
    setIsLoadingRescheduleSlots(true);
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
    } catch {
      setRescheduleSlots([]);
    } finally {
      setIsLoadingRescheduleSlots(false);
    }
  };

  const handleRescheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRescheduleSlot) return;

    setIsSavingReschedule(true);
    try {
      await appointmentService.rescheduleAppointment(rescheduleModalApp._id, {
        newDate: rescheduleDate,
        newStartTime: selectedRescheduleSlot
      });
      setFeedback({ type: 'success', message: 'Appointment rescheduled successfully.' });
      setRescheduleModalApp(null);
      await fetchDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to reschedule' });
    } finally {
      setIsSavingReschedule(false);
    }
  };

  const openReviewModal = (app) => {
    setReviewModalApp(app);
    setReviewRating(5);
    setReviewComment('');
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewComment.trim()) return;

    setIsSubmittingReview(true);
    try {
      await customerService.createReview({
        appointmentId: reviewModalApp._id,
        serviceId: reviewModalApp.service?._id,
        staffId: reviewModalApp.staff?._id,
        rating: reviewRating,
        comment: reviewComment
      });
      setFeedback({ type: 'success', message: 'Thank you for your review.' });
      setReviewModalApp(null);
      await fetchDashboardData();
    } catch (err) {
      setFeedback({ type: 'error', message: err.message || 'Failed to submit review' });
    } finally {
      setIsSubmittingReview(false);
    }
  };

  const handleRemoveFavorite = async (serviceId) => {
    try {
      await customerService.toggleFavorite(serviceId);
      setFavorites((prev) => prev.filter((s) => s._id !== serviceId));
      setFeedback({ type: 'success', message: 'Service removed from saved list.' });
    } catch (err) {
      setFeedback({ type: 'error', message: err.message });
    }
  };

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setIsSavingProfile(true);
    const res = await updateUserProfile({
      name: profileData.name,
      phone: profileData.phone
    });
    setIsSavingProfile(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Profile information updated successfully.' });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setFeedback({ type: 'error', message: 'New passwords do not match' });
      return;
    }
    setIsSavingProfile(true);
    const res = await changeUserPassword({
      currentPassword: passwordData.currentPassword,
      newPassword: passwordData.newPassword
    });
    setIsSavingProfile(false);
    if (res.success) {
      setFeedback({ type: 'success', message: 'Password changed successfully.' });
      setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } else {
      setFeedback({ type: 'error', message: res.message });
    }
  };

  // Group appointments into Upcoming and Past
  const upcomingAppointments = appointments.filter(
    (a) => a.status === 'confirmed' || a.status === 'pending'
  );
  const pastAppointments = appointments.filter(
    (a) => a.status === 'completed' || a.status === 'cancelled'
  );

  const statusColors = {
    confirmed: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    completed: 'bg-stone-100 text-stone-800 border-stone-300',
    cancelled: 'bg-red-50 text-red-800 border-red-200',
    pending: 'bg-amber-50 text-amber-800 border-amber-200'
  };

  const tabs = [
    { id: 'upcoming', label: 'Upcoming Visits', count: upcomingAppointments.length, icon: Calendar },
    { id: 'past', label: 'Past History', count: pastAppointments.length, icon: Clock },
    { id: 'favorites', label: 'Saved Services', count: favorites.length, icon: Heart },
    { id: 'reviews', label: 'My Reviews', count: myReviews.length, icon: Star },
    { id: 'profile', label: 'Profile & Security', count: null, icon: User }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Customer Hero Banner */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center space-x-5">
          <div className="w-16 h-16 rounded-lg bg-stone-900 text-white font-serif font-bold text-2xl flex items-center justify-center">
            {user?.name?.charAt(0).toUpperCase()}
          </div>
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
                Welcome, {user?.name?.split(' ')[0]}
              </h1>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-700 border border-stone-200">
                Customer Portal
              </span>
            </div>
            <p className="text-xs sm:text-sm text-stone-500">
              Manage appointments, view service receipts, saved treatments, and salon feedback.
            </p>
          </div>
        </div>

        <Link
          to="/book"
          className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors"
        >
          Book Appointment
        </Link>
      </div>

      {/* Phone Verification Warning Banner if not verified */}
      {!user?.isPhoneVerified && (
        <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs sm:text-sm shadow-xs">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 shrink-0">
              <Phone className="w-4 h-4" />
            </div>
            <div>
              <p className="font-semibold text-amber-950">Phone Number Not Verified</p>
              <p className="text-xs text-amber-800">
                Please verify your phone number with a 6-digit SMS code to unlock instant appointment booking.
              </p>
            </div>
          </div>
          <Link
            to="/verify-phone"
            className="inline-flex items-center justify-center px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-700 text-white font-semibold text-xs transition-colors shrink-0"
          >
            Verify Phone Number
          </Link>
        </div>
      )}

      {/* Global Notification Banner */}
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
          <button onClick={() => setFeedback({ type: '', message: '' })} className="text-stone-400">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Navigation Tabs Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none border-b border-stone-200">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => handleTabChange(tab.id)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors flex items-center space-x-2 cursor-pointer ${
              activeTab === tab.id
                ? 'bg-stone-900 text-white shadow-xs'
                : 'bg-white text-stone-600 hover:bg-stone-100 border border-stone-200'
            }`}
          >
            <tab.icon className="w-3.5 h-3.5" />
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-bold ${
                  activeTab === tab.id ? 'bg-stone-700 text-white' : 'bg-stone-100 text-stone-700'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT AREA */}
      {isLoading ? (
        <div className="p-20 flex flex-col items-center justify-center">
          <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
          <p className="text-xs text-stone-500">Loading your dashboard...</p>
        </div>
      ) : (
        <>
          {/* TAB 1: UPCOMING APPOINTMENTS */}
          {activeTab === 'upcoming' && (
            <div className="space-y-5">
              {upcomingAppointments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {upcomingAppointments.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs hover:border-stone-300 transition-colors flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[11px] font-bold text-stone-900">
                            #{app.bookingId}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {/* Payment Status Badge */}
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                app.paymentStatus === 'paid'
                                  ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                                  : 'bg-amber-50 text-amber-800 border-amber-200'
                              }`}
                            >
                              {app.paymentStatus === 'paid' ? 'Paid' : 'Payment: Pending'}
                            </span>
                            {/* Appointment Status Badge */}
                            <span
                              className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                                statusColors[app.status] || statusColors.confirmed
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                        </div>

                        <div className="flex items-start space-x-3">
                          <img
                            src={app.service?.images?.[0]?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                            alt={app.service?.name}
                            className="w-14 h-14 rounded-lg object-cover border border-stone-200 shrink-0"
                          />
                          <div>
                            <span className="text-[10px] font-semibold text-stone-500 uppercase tracking-wide">
                              {app.service?.category || 'Salon Service'}
                            </span>
                            <h3 className="font-bold text-base font-serif text-stone-900 leading-snug">
                              {app.service?.name}
                            </h3>
                            <p className="text-xs text-stone-600 flex items-center mt-1">
                              <Scissors className="w-3.5 h-3.5 mr-1 text-stone-400" />
                              Stylist: <strong>{app.staff?.name || 'Assigned Stylist'}</strong>
                            </p>
                          </div>
                        </div>

                        <div className="p-3 bg-stone-50 rounded-lg space-y-1.5 text-xs text-stone-700">
                          <div className="flex justify-between">
                            <span className="text-stone-500">Date:</span>
                            <span className="font-semibold text-stone-900">{app.date}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-stone-500">Time Window:</span>
                            <span className="font-bold text-stone-900">
                              {app.startTime} - {app.endTime} ({app.duration}m)
                            </span>
                          </div>
                          <div className="flex justify-between border-t border-stone-200 pt-1.5">
                            <span className="text-stone-500">Total Price:</span>
                            <span className="font-bold text-stone-900 font-serif text-sm">
                              ${app.finalAmount}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Appointment Actions */}
                      <div className="pt-2 border-t border-stone-100 flex flex-wrap gap-2 justify-between items-center text-xs">
                        <button
                          onClick={() => setDetailModalApp(app)}
                          className="text-stone-700 hover:text-stone-900 font-semibold cursor-pointer"
                        >
                          View Details
                        </button>

                        <div className="flex items-center flex-wrap gap-2">
                          {/* Pay if payment is pending */}
                          {app.paymentStatus !== 'paid' && app.status !== 'cancelled' && (
                            <button
                              onClick={() => handlePayNow(app)}
                              className="px-3 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold flex items-center gap-1 transition-colors cursor-pointer"
                            >
                              <CreditCard className="w-3.5 h-3.5" />
                              Pay Now
                            </button>
                          )}
                          <button
                            onClick={() => openRescheduleModal(app)}
                            className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold cursor-pointer"
                          >
                            Reschedule
                          </button>
                          <button
                            onClick={() => handleCancelAppointment(app._id, app.bookingId)}
                            className="px-3 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold cursor-pointer"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
                  <Calendar className="w-10 h-10 text-stone-400 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-stone-900">No Upcoming Appointments</h3>
                  <p className="text-xs text-stone-500">You don't have any appointments scheduled right now.</p>
                  <Link
                    to="/book"
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Schedule Appointment
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PAST APPOINTMENTS */}
          {activeTab === 'past' && (
            <div className="space-y-5">
              {pastAppointments.length > 0 ? (
                <div className="space-y-4">
                  {pastAppointments.map((app) => (
                    <div
                      key={app._id}
                      className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col md:flex-row justify-between items-start md:items-center gap-4"
                    >
                      <div className="flex items-start space-x-4">
                        <img
                          src={app.service?.images?.[0]?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                          alt={app.service?.name}
                          className="w-14 h-14 rounded-lg object-cover shrink-0 border border-stone-200"
                        />
                        <div className="space-y-1 text-xs">
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-stone-500">{app.bookingId}</span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                statusColors[app.status] || statusColors.completed
                              }`}
                            >
                              {app.status}
                            </span>
                          </div>
                          <h4 className="font-bold text-base font-serif text-stone-900">{app.service?.name}</h4>
                          <p className="text-stone-500">
                            Stylist: {app.staff?.name} • {app.date} at {app.startTime}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center flex-wrap space-x-3 w-full md:w-auto justify-end pt-3 md:pt-0 border-t md:border-t-0 border-stone-100 text-xs">
                        <span className="font-bold text-base font-serif text-stone-900 mr-2">
                          ${app.finalAmount}
                        </span>

                        <button
                          onClick={() => setDetailModalApp(app)}
                          className="px-3 py-1.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold cursor-pointer"
                        >
                          View Details
                        </button>

                        {app.status === 'completed' && (
                          <button
                            onClick={() => openReviewModal(app)}
                            className="px-3.5 py-1.5 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold border border-stone-300 flex items-center cursor-pointer"
                          >
                            <Star className="w-3.5 h-3.5 mr-1 text-amber-500 fill-amber-500" />
                            Leave Review
                          </button>
                        )}

                        <Link
                          to="/book"
                          state={{ preSelectedServiceId: app.service?._id }}
                          className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold cursor-pointer transition-colors"
                        >
                          Book Again
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-xs text-stone-400 italic">
                  No past appointment history found.
                </div>
              )}
            </div>
          )}

          {/* TAB 3: SAVED FAVORITES */}
          {activeTab === 'favorites' && (
            <div className="space-y-5">
              {favorites.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {favorites.map((service) => (
                    <div
                      key={service._id}
                      className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-3">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                            {service.category}
                          </span>
                          <button
                            onClick={() => handleRemoveFavorite(service._id)}
                            className="p-1 rounded-md text-stone-700 hover:bg-stone-100 cursor-pointer"
                            title="Remove from favorites"
                          >
                            <Heart className="w-4 h-4 fill-stone-800 text-stone-800" />
                          </button>
                        </div>

                        <h3 className="font-bold text-lg font-serif text-stone-900">{service.name}</h3>
                        <p className="text-xs text-stone-500 line-clamp-2">{service.description}</p>
                        
                        <div className="flex items-center text-xs text-stone-600">
                          <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          {service.duration} mins session
                        </div>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex items-center justify-between text-xs">
                        <span className="text-xl font-bold font-serif text-stone-900">
                          ${service.discountPrice > 0 ? service.discountPrice : service.price}
                        </span>
                        <Link
                          to="/book"
                          state={{ preSelectedServiceId: service._id }}
                          className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold transition-colors"
                        >
                          Book Now
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl border border-stone-200 p-12 text-center space-y-3">
                  <Heart className="w-10 h-10 text-stone-300 mx-auto" />
                  <h3 className="text-lg font-serif font-bold text-stone-900">No Saved Treatments</h3>
                  <p className="text-xs text-stone-500">You haven't saved any treatments yet.</p>
                  <Link
                    to="/services"
                    className="inline-flex items-center px-5 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
                  >
                    Browse Services
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: MY REVIEWS */}
          {activeTab === 'reviews' && (
            <div className="space-y-6">
              
              {/* Pending Completed Appointments Awaiting Review */}
              {pendingReviews.length > 0 && (
                <div className="p-6 bg-stone-50 rounded-xl border border-stone-200 space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 rounded-lg bg-stone-200 text-stone-800 flex items-center justify-center">
                      <Star className="w-4 h-4 fill-stone-700 text-stone-700" />
                    </div>
                    <div>
                      <h4 className="font-serif font-bold text-stone-900 text-sm">
                        You have {pendingReviews.length} completed {pendingReviews.length === 1 ? 'treatment' : 'treatments'} awaiting feedback
                      </h4>
                      <p className="text-xs text-stone-600">
                        Share your feedback to help us maintain our salon standards.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
                    {pendingReviews.map((app) => (
                      <div
                        key={app._id}
                        className="bg-white p-4 rounded-lg border border-stone-200 shadow-xs flex items-center justify-between gap-3"
                      >
                        <div className="space-y-0.5 text-xs">
                          <span className="text-[10px] font-mono font-bold text-stone-400 block">
                            #{app.bookingId} • {app.date}
                          </span>
                          <h5 className="font-bold text-stone-900 font-serif">{app.service?.name}</h5>
                          <p className="text-stone-500 text-[11px]">with {app.staff?.name}</p>
                        </div>

                        <button
                          onClick={() => openReviewModal(app)}
                          className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs shrink-0 cursor-pointer transition-colors"
                        >
                          Write Review
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Submitted Reviews List */}
              {myReviews.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {myReviews.map((rev) => (
                    <div
                      key={rev._id}
                      className="bg-white rounded-xl border border-stone-200 p-6 shadow-xs space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <span className="text-xs font-semibold text-stone-900 font-serif block">
                            {rev.service?.name}
                          </span>
                          {rev.appointment?.bookingId && (
                            <span className="text-[10px] font-mono text-stone-500 font-semibold">
                              Verified Visit #{rev.appointment.bookingId}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center text-amber-700 font-bold text-xs bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500 mr-1" />
                          <span>{rev.rating}.0</span>
                        </div>
                      </div>

                      <p className="text-xs text-stone-700 leading-relaxed bg-stone-50 p-3 rounded-lg border border-stone-100">
                        "{rev.comment}"
                      </p>

                      <div className="text-[11px] text-stone-400 flex justify-between pt-1 border-t border-stone-100">
                        <span>Stylist: {rev.staff?.name || 'Stylist'}</span>
                        <span>{new Date(rev.date || rev.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : pendingReviews.length === 0 ? (
                <div className="bg-white rounded-xl border border-stone-200 p-12 text-center text-xs text-stone-400 italic">
                  You haven't submitted any reviews yet. Complete an appointment to rate your experience.
                </div>
              ) : null}

            </div>
          )}

          {/* TAB 5: PROFILE & SECURITY */}
          {activeTab === 'profile' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Profile Details Form */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-5">
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center">
                  <User className="w-5 h-5 mr-2 text-stone-700" />
                  Personal Information
                </h3>

                <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={profileData.name}
                      onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Email Address</label>
                    <input
                      type="email"
                      disabled
                      value={profileData.email}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-200 bg-stone-100 text-stone-500 cursor-not-allowed text-xs"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Phone Number</label>
                    <input
                      type="tel"
                      required
                      value={profileData.phone}
                      onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {isSavingProfile ? 'Saving...' : 'Update Details'}
                  </button>
                </form>
              </div>

              {/* Password Change Form */}
              <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-5">
                <h3 className="text-lg font-serif font-bold text-stone-900 flex items-center">
                  <KeyRound className="w-5 h-5 mr-2 text-stone-700" />
                  Security & Password
                </h3>

                <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Current Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.currentPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.newPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold uppercase text-stone-700 mb-1">Confirm New Password</label>
                    <input
                      type="password"
                      required
                      value={passwordData.confirmPassword}
                      onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                      className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={isSavingProfile}
                    className="px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
                  >
                    {isSavingProfile ? 'Updating...' : 'Change Password'}
                  </button>
                </form>
              </div>
            </div>
          )}
        </>
      )}

      {/* MODAL 1: VIEW RECEIPT / DETAILS */}
      {detailModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-5">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Booking Details & Invoice
              </h3>
              <button onClick={() => setDetailModalApp(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-stone-700">
              <div className="flex justify-between font-mono">
                <span className="text-stone-500">Reference ID:</span>
                <span className="font-bold text-stone-900">{detailModalApp.bookingId}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Treatment:</span>
                <span className="font-semibold text-stone-900">{detailModalApp.service?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Stylist:</span>
                <span className="font-semibold text-stone-900">{detailModalApp.staff?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Scheduled:</span>
                <span className="font-bold text-stone-900">
                  {detailModalApp.date} at {detailModalApp.startTime} - {detailModalApp.endTime}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Appointment Status:</span>
                <span className="font-bold capitalize text-stone-900">{detailModalApp.status}</span>
              </div>
              <div className="flex justify-between items-center border-t border-stone-100 pt-2">
                <span className="text-stone-500">Payment Status:</span>
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider border ${
                    detailModalApp.paymentStatus === 'paid'
                      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                      : 'bg-amber-50 text-amber-800 border-amber-200'
                  }`}
                >
                  {detailModalApp.paymentStatus === 'paid'
                    ? 'Paid Online (Razorpay)'
                    : 'Payment Pending at Reception'}
                </span>
              </div>

              {detailModalApp.razorpayPaymentId && (
                <div className="flex justify-between font-mono text-[11px] text-stone-500">
                  <span>Razorpay Payment ID:</span>
                  <span className="font-bold text-stone-800">{detailModalApp.razorpayPaymentId}</span>
                </div>
              )}

              {detailModalApp.razorpayOrderId && (
                <div className="flex justify-between font-mono text-[11px] text-stone-500">
                  <span>Razorpay Order ID:</span>
                  <span className="text-stone-600">{detailModalApp.razorpayOrderId}</span>
                </div>
              )}

              <div className="flex justify-between border-t border-stone-200 pt-3 text-sm">
                <span className="font-bold text-stone-900">Total Amount:</span>
                <span className="font-bold text-stone-900 font-serif">${detailModalApp.finalAmount}</span>
              </div>
            </div>

            <div className="pt-2 flex flex-col gap-2">
              {detailModalApp.paymentStatus !== 'paid' && detailModalApp.status !== 'cancelled' && (
                <button
                  onClick={() => {
                    const target = detailModalApp;
                    setDetailModalApp(null);
                    handlePayNow(target);
                  }}
                  className="w-full py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                  Pay Now with Razorpay (${detailModalApp.finalAmount})
                </button>
              )}
              <button
                onClick={() => setDetailModalApp(null)}
                className="w-full py-2.5 rounded-lg border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: RESCHEDULE */}
      {rescheduleModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-lg w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Reschedule Session
              </h3>
              <button onClick={() => setRescheduleModalApp(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleRescheduleSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Pick New Date</label>
                <input
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  value={rescheduleDate}
                  onChange={(e) => {
                    setRescheduleDate(e.target.value);
                    loadAvailableRescheduleSlots(rescheduleModalApp, e.target.value);
                  }}
                  className="w-full px-3.5 py-2 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Pick New Time Slot</label>
                {isLoadingRescheduleSlots ? (
                  <div className="p-4 text-center text-stone-400">Calculating open slots...</div>
                ) : rescheduleSlots.length > 0 ? (
                  <div className="grid grid-cols-3 gap-2 max-h-40 overflow-y-auto p-1">
                    {rescheduleSlots.map((s) => (
                      <button
                        key={s.time}
                        type="button"
                        onClick={() => setSelectedRescheduleSlot(s.time)}
                        className={`py-2 px-1 rounded-lg text-center border transition-all cursor-pointer ${
                          selectedRescheduleSlot === s.time
                            ? 'bg-stone-900 text-white font-bold'
                            : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
                        }`}
                      >
                        {s.time}
                      </button>
                    ))}
                  </div>
                ) : (
                  <p className="text-stone-400 italic">No slots open on this date.</p>
                )}
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setRescheduleModalApp(null)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!selectedRescheduleSlot || isSavingReschedule}
                  className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold disabled:opacity-50 transition-colors"
                >
                  {isSavingReschedule ? 'Rescheduling...' : 'Confirm Reschedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 3: LEAVE REVIEW */}
      {reviewModalApp && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-md w-full p-6 sm:p-8 shadow-xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-lg font-serif font-bold text-stone-900">
                Rate Your Experience
              </h3>
              <button onClick={() => setReviewModalApp(null)} className="text-stone-400 hover:text-stone-700">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
              <div>
                <p className="text-xs text-stone-500 mb-2">
                  Treatment: <strong className="text-stone-900">{reviewModalApp.service?.name}</strong> with {reviewModalApp.staff?.name}
                </p>
                <label className="block font-semibold uppercase text-stone-700 mb-1.5">Rating (1 to 5 Stars)</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setReviewRating(star)}
                      className="p-1 cursor-pointer focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 transition-colors ${
                          star <= reviewRating
                            ? 'text-amber-500 fill-amber-500'
                            : 'text-stone-300'
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold uppercase text-stone-700 mb-1">Your Review & Comments *</label>
                <textarea
                  rows="4"
                  required
                  value={reviewComment}
                  onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="Share details about the service, stylist care, and results..."
                  className="w-full p-3 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-stone-100">
                <button
                  type="button"
                  onClick={() => setReviewModalApp(null)}
                  className="px-4 py-2 rounded-lg border border-stone-300 text-stone-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingReview}
                  className="px-6 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-xs disabled:opacity-50 transition-colors"
                >
                  {isSubmittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
