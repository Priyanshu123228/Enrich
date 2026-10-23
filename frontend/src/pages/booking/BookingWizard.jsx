import { useState, useEffect, useRef, useMemo } from 'react';
import { resolveImageUrl, DEFAULT_SALON_PLACEHOLDER, DEFAULT_AVATAR_PLACEHOLDER } from '../../utils/imageUrl';
import { getTodayDateString, isSlotPassed } from '../../utils/dateUtils';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { serviceService } from '../../services/service.service';
import { slotService } from '../../services/slot.service';
import { appointmentService } from '../../services/appointment.service';
import { paymentService } from '../../services/payment.service';
import { offerService } from '../../services/offer.service';
import { authService } from '../../services/auth.service';
import { useAuth } from '../../context/AuthContext';
import {
  schedule2HourReminder,
  requestPushPermission,
  registerPushSubscription,
  showLocalNotification
} from '../../utils/pushNotifications';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Scissors,
  Users,
  User,
  Star,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  CreditCard,
  ShieldCheck,
  Building2,
  Tag,
  Check,
  Smartphone,
  MapPin,
  PhoneCall,
  Bell,
  BellRing,
  Wifi,
  Search,
  Filter,
  ArrowRight,
  X
} from 'lucide-react';

export default function BookingWizard() {
  const { user, refreshUser } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const topRef = useRef(null);
  const topErrorRef = useRef(null);
  const phoneVerificationRef = useRef(null);
  const phoneInputRef = useRef(null);
  const otpInputRef = useRef(null);
  const [highlightPhoneCard, setHighlightPhoneCard] = useState(false);

  // Step 1 to 5
  const [currentStep, setCurrentStep] = useState(1);

  // Auto-scroll smoothly to top whenever step changes
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (topRef.current) {
      topRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [currentStep]);

  // Data states
  const [services, setServices] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Step 1 Filters
  const [serviceSearch, setServiceSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Selection states
  const [selectedService, setSelectedService] = useState(null);
  const selectedStaff = 'any';
  const [selectedDate, setSelectedDate] = useState(() => getTodayDateString());
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

  // Guest & Phone OTP Verification States (Frictionless Booking)
  const [guestName, setGuestName] = useState(user?.name || '');
  const [guestPhone, setGuestPhone] = useState(user?.phone || '');
  const [guestChannel, setGuestChannel] = useState('sms'); // 'sms' | 'whatsapp'
  const [otpSent, setOtpSent] = useState(false);
  const [otpInput, setOtpInput] = useState('');
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isVerifyingOtp, setIsVerifyingOtp] = useState(false);
  const [otpFeedback, setOtpFeedback] = useState({ type: '', message: '' });
  const [devOtpHint, setDevOtpHint] = useState('');
  const [otpCountdown, setOtpCountdown] = useState(0);
  const [isMobileVerified, setIsMobileVerified] = useState(Boolean(user?.isPhoneVerified));

  // 2-Hour Reminder State
  const [reminderActive, setReminderActive] = useState(() => {
    return localStorage.getItem('enrich_push_enabled') === 'true';
  });
  const [reminderFeedback, setReminderFeedback] = useState('');

  // Sync state if user logs in or profile refreshes
  useEffect(() => {
    if (user?.isPhoneVerified) {
      setIsMobileVerified(true);
    }
    if (user?.name && !guestName) {
      setGuestName(user.name);
    }
    if (user?.phone && !guestPhone) {
      setGuestPhone(user.phone);
    }
  }, [user]);

  // Countdown timer effect
  useEffect(() => {
    if (otpCountdown <= 0) return;
    const timer = setInterval(() => {
      setOtpCountdown((prev) => prev - 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [otpCountdown]);

  // Promo / Coupon States
  const [promoCodeInput, setPromoCodeInput] = useState(() => {
    return new URLSearchParams(location.search).get('promo') || '';
  });
  const [appliedOffer, setAppliedOffer] = useState(null);
  const [discountAmount, setDiscountAmount] = useState(0);
  const [promoFeedback, setPromoFeedback] = useState({ type: '', message: '' });
  const [isValidatingPromo, setIsValidatingPromo] = useState(false);

  // UI / Async states
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [confirmedBooking, setConfirmedBooking] = useState(null);

  // Clear selected slot if it has passed
  useEffect(() => {
    if (selectedSlot && isSlotPassed(selectedDate, selectedSlot)) {
      setSelectedSlot('');
    }
  }, [selectedDate, selectedSlot]);

  // Initial fetch of services & staff
  useEffect(() => {
    const fetchInitial = async () => {
      setIsLoadingData(true);
      try {
        const [servicesRes, staffRes] = await Promise.all([
          serviceService.getServices({ limit: 50 }),
          staffService.getStaff()
        ]);

        if (servicesRes?.data?.services) {
          setServices(servicesRes.data.services);
          // Pre-selection from location state OR URL Query Parameters (?service= / ?serviceId=)
          const searchParams = new URLSearchParams(location.search);
          const targetServiceId = location.state?.preSelectedServiceId || searchParams.get('serviceId') || searchParams.get('service');
          if (targetServiceId) {
            const pre = servicesRes.data.services.find(
              (s) => s._id === targetServiceId || s.slug === targetServiceId || s.name?.toLowerCase() === targetServiceId.toLowerCase()
            );
            if (pre) {
              setSelectedService(pre);
              setCurrentStep(2); // Jump directly to Stylist / Date selection
            }
          }
        }

        if (staffRes?.data) {
          setStaffMembers(staffRes.data);
          const searchParams = new URLSearchParams(location.search);
          const targetStaffId = location.state?.preSelectedStaffId || searchParams.get('staffId') || searchParams.get('staff');
          if (targetStaffId) {
            const staffMatch = staffRes.data.find(
              (st) => st._id === targetStaffId || st.name?.toLowerCase() === targetStaffId.toLowerCase()
            );
            if (staffMatch) {
              setSelectedStaff(staffMatch);
            }
          }
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load booking catalog');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitial();
  }, [location.state, location.search]);

  // Fetch live slots whenever Service, Staff, or Date changes
  useEffect(() => {
    if (!selectedService || !selectedDate) return;

    const fetchSlots = async () => {
      setIsLoadingSlots(true);
      setErrorMsg('');
      setSelectedSlot('');
      try {
        const res = await slotService.getAvailableSlots({
          serviceId: selectedService._id,
          staffId: selectedStaff === 'any' ? 'any' : selectedStaff._id,
          date: selectedDate
        });

        if (res?.data?.availableSlots) {
          const slots = res.data.availableSlots;
          setAvailableSlots(slots);

          // If today has 0 open (unpassed) slots because salon has closed for today, auto-switch to tomorrow
          const todayIso = getTodayDateString();
          if (selectedDate === todayIso) {
            const openToday = slots.filter((s) => !isSlotPassed(todayIso, s.time) && !s.isPassed);
            if (openToday.length === 0) {
              const tmrw = new Date();
              tmrw.setDate(tmrw.getDate() + 1);
              const tmrwIso = tmrw.toISOString().split('T')[0];
              setSelectedDate(tmrwIso);
            }
          }
        } else {
          setAvailableSlots([]);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to calculate available time slots');
        setAvailableSlots([]);
      } finally {
        setIsLoadingSlots(false);
      }
    };

    fetchSlots();
  }, [selectedService, selectedStaff, selectedDate]);

  // Filter staff offering the selected service
  const qualifiedStaff = selectedService
    ? staffMembers.filter((st) =>
        st.services?.some((s) => (s._id ? s._id === selectedService._id : s === selectedService._id))
      )
    : staffMembers;

  // Extract unique categories from services
  const categories = useMemo(() => {
    const list = services
      .map((s) => s.category?.name)
      .filter((c) => Boolean(c) && typeof c === 'string');
    return ['all', ...new Set(list)];
  }, [services]);

  // Filtered services based on search and category
  const filteredServices = useMemo(() => {
    return services.filter((s) => {
      const matchesCat =
        selectedCategory === 'all' ||
        (s.category?.name && s.category.name.toLowerCase() === selectedCategory.toLowerCase());
      const query = serviceSearch.trim().toLowerCase();
      const matchesQuery =
        !query ||
        s.name?.toLowerCase().includes(query) ||
        s.description?.toLowerCase().includes(query) ||
        s.category?.name?.toLowerCase().includes(query);
      return matchesCat && matchesQuery;
    });
  }, [services, selectedCategory, serviceSearch]);

  // Quick Date presets
  const datePresets = useMemo(() => {
    const today = new Date();
    const presets = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(today);
      d.setDate(today.getDate() + i);
      const iso = d.toISOString().split('T')[0];
      const weekdayShort = d.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNum = d.getDate();
      const monthShort = d.toLocaleDateString('en-US', { month: 'short' });
      const label =
        i === 0
          ? 'Today'
          : i === 1
          ? 'Tomorrow'
          : `${weekdayShort}, ${monthShort} ${dayNum}`;
      presets.push({ iso, label });
    }
    return presets;
  }, []);

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('counter'); // Pay at Salon

  // Handle Promo Code Validation
  const handleApplyPromo = async () => {
    if (!promoCodeInput.trim() || !selectedService) return;
    setIsValidatingPromo(true);
    setPromoFeedback({ type: '', message: '' });

    const baseAmount = selectedService.discountPrice > 0 ? selectedService.discountPrice : selectedService.price;

    try {
      const res = await offerService.validateOffer(
        promoCodeInput.trim(),
        baseAmount,
        selectedService._id
      );

      if (res?.data?.offer) {
        setAppliedOffer(res.data.offer);
        setDiscountAmount(res.data.discountAmount);
        setPromoFeedback({
          type: 'success',
          message: res.message || `Promo code "${res.data.offer.code}" applied!`
        });
      }
    } catch (err) {
      setAppliedOffer(null);
      setDiscountAmount(0);
      setPromoFeedback({
        type: 'error',
        message: err.message || 'Invalid or expired coupon code'
      });
    } finally {
      setIsValidatingPromo(false);
    }
  };

  const handleRemovePromo = () => {
    setAppliedOffer(null);
    setDiscountAmount(0);
    setPromoCodeInput('');
    setPromoFeedback({ type: '', message: '' });
  };

  // Dispatch 4-digit SMS / WhatsApp OTP
  const handleSendOtp = async () => {
    const clean = guestPhone.replace(/\D/g, '').slice(-10);
    if (clean.length !== 10) {
      setOtpFeedback({ type: 'error', message: 'Please enter a valid 10-digit mobile number' });
      return;
    }

    setIsSendingOtp(true);
    setOtpFeedback({ type: '', message: '' });
    setDevOtpHint('');

    try {
      const res = await authService.sendGuestPhoneOTP({
        phone: clean,
        name: guestName.trim() || 'Valued Client',
        channel: guestChannel
      });

      setOtpSent(true);
      setOtpCountdown(45);
      if (res?.data?.devOtp) {
        setDevOtpHint(res.data.devOtp);
      }
      setOtpFeedback({
        type: 'success',
        message: res.message || `4-digit OTP sent via ${guestChannel === 'whatsapp' ? 'WhatsApp' : 'SMS'}!`
      });
    } catch (err) {
      setOtpFeedback({
        type: 'error',
        message: err.message || 'Failed to dispatch verification code. Please try again.'
      });
    } finally {
      setIsSendingOtp(false);
    }
  };

  // Verify 4-digit OTP and establish session
  const handleVerifyOtp = async () => {
    const clean = guestPhone.replace(/\D/g, '').slice(-10);
    const code = otpInput.trim();

    if (code.length !== 4) {
      setOtpFeedback({ type: 'error', message: 'Please enter the 4-digit verification code' });
      return;
    }

    setIsVerifyingOtp(true);
    setOtpFeedback({ type: '', message: '' });

    try {
      const res = await authService.verifyGuestPhoneOTP({
        phone: clean,
        otp: code,
        name: guestName.trim()
      });

      if (res?.data?.token) {
        localStorage.setItem('token', res.data.token);
        if (typeof refreshUser === 'function') {
          await refreshUser();
        }
      }

      setIsMobileVerified(true);
      setOtpFeedback({
        type: 'success',
        message: 'Mobile number verified successfully!'
      });
    } catch (err) {
      setOtpFeedback({
        type: 'error',
        message: err.message || 'Incorrect or expired verification code'
      });
    } finally {
      setIsVerifyingOtp(false);
    }
  };

  // Helper: Save booking to offline storage and schedule 2-hour reminder
  const saveAndScheduleBooking = (booking) => {
    setConfirmedBooking(booking);
    try {
      localStorage.setItem('lastBooking', JSON.stringify(booking));
      const raw = localStorage.getItem('enrich_offline_appointments');
      const list = raw ? JSON.parse(raw) : [];
      const updated = [booking, ...list.filter((b) => b.bookingId !== booking.bookingId)].slice(0, 5);
      localStorage.setItem('enrich_offline_appointments', JSON.stringify(updated));
    } catch (e) {
      console.warn('Offline cache notice:', e);
    }
    schedule2HourReminder(booking);
  };

  const handleEnablePushReminder = async () => {
    const granted = await requestPushPermission();
    if (granted) {
      setReminderActive(true);
      await registerPushSubscription(user?.phone || guestPhone);
      if (confirmedBooking) {
        schedule2HourReminder(confirmedBooking);
      }
      setReminderFeedback('2-hour appointment reminder active on this device!');
      setTimeout(() => setReminderFeedback(''), 4000);
    } else {
      setReminderFeedback('Push notification permission was denied or dismissed.');
      setTimeout(() => setReminderFeedback(''), 4000);
    }
  };

  const handleTestReminder = async () => {
    if (typeof Notification !== 'undefined' && Notification.permission !== 'granted') {
      const granted = await requestPushPermission();
      if (!granted) return;
    }
    const serviceName = confirmedBooking?.service?.name || 'Salon Treatment';
    const timeStr = confirmedBooking?.startTime || '11:00';
    await showLocalNotification(
      '⏰ Reminder: Your Salon Appointment is in 2 Hours!',
      `Your ${serviceName} session starts at ${timeStr}. Enrich Salon, Sikar.`
    );
  };

  // Final Appointment Submission
  const handleConfirmAppointment = async () => {
    setErrorMsg('');

    // Frictionless Check: Verify mobile number before booking
    if (!user?.isPhoneVerified && !isMobileVerified) {
      setErrorMsg('Please complete quick mobile verification above before confirming your reservation.');
      setHighlightPhoneCard(true);
      setTimeout(() => setHighlightPhoneCard(false), 3500);

      // Smooth scroll directly to the verification section so the user instantly sees what is required
      if (phoneVerificationRef.current) {
        phoneVerificationRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }

      setTimeout(() => {
        if (!guestPhone || guestPhone.length < 10) {
          phoneInputRef.current?.focus();
        } else if (otpSent && (!otpInput || otpInput.length < 4)) {
          otpInputRef.current?.focus();
        }
      }, 350);
      return;
    }

    setIsSubmitting(true);

    try {
      // Create Appointment Reservation (Pay at Salon Desk)
      const appRes = await appointmentService.createAppointment({
        serviceId: selectedService._id,
        staffId: selectedStaff === 'any' ? 'any' : selectedStaff._id,
        date: selectedDate,
        startTime: selectedSlot,
        notes,
        paymentMethod: 'counter'
      });

      const newApp = appRes?.data;
      if (!newApp) {
        throw new Error('Could not create appointment');
      }

      saveAndScheduleBooking(newApp);
      setCurrentStep(4);
      setIsSubmitting(false);
      return;
    } catch (err) {
      const isAuthErr = err.status === 401 || err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('unauthorized');
      const errorText = isAuthErr
        ? 'Please complete quick mobile verification above before confirming your reservation.'
        : (err.message || 'Failed to complete reservation. Please try again.');

      setErrorMsg(errorText);

      if (isAuthErr) {
        setHighlightPhoneCard(true);
        setTimeout(() => setHighlightPhoneCard(false), 3500);
        phoneVerificationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      } else {
        topErrorRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Service', icon: Scissors },
    { num: 2, title: 'Date & Slot', icon: Calendar },
    { num: 3, title: 'Review', fullTitle: 'Review & Confirm', icon: CheckCircle2 }
  ];

  // Helper: check if a step is accessible by the user
  const canAccessStep = (stepNum) => {
    if (stepNum === 1) return true;
    if (stepNum === 2) return Boolean(selectedService);
    if (stepNum === 3) return Boolean(selectedService && selectedSlot);
    return false;
  };

  const goToStep = (stepNum) => {
    if (canAccessStep(stepNum)) {
      setCurrentStep(stepNum);
    }
  };

  if (isLoadingData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-sm text-stone-500">Loading booking catalog...</p>
      </div>
    );
  }

  // Current calculation for final payable
  const currentBasePrice = selectedService?.discountPrice > 0 ? selectedService.discountPrice : selectedService?.price || 0;
  const currentFinalPayable = Math.max(0, currentBasePrice - discountAmount);

  return (
    <div ref={topRef} className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 pb-28 md:pb-12">
      
      {/* Top Header & Interactive Wizard Step Bar */}
      {currentStep < 4 && (
        <div className="space-y-4">
          <div className="text-center space-y-1">
            <span className="text-[11px] font-bold tracking-widest text-stone-500 uppercase">
              Online Booking
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Schedule Your Appointment
            </h1>
          </div>

          {/* Interactive Clickable Step Bar */}
          <div className="grid grid-cols-4 gap-1.5 sm:gap-3 max-w-2xl mx-auto">
            {steps.map((s) => {
              const isCurrent = currentStep === s.num;
              const isPast = currentStep > s.num;
              const isAccessible = canAccessStep(s.num);
              const StepIcon = s.icon;

              return (
                <button
                  key={s.num}
                  type="button"
                  onClick={() => goToStep(s.num)}
                  disabled={!isAccessible}
                  className={`py-2 px-1.5 sm:px-3 rounded-xl text-center border transition-all cursor-pointer ${
                    isCurrent
                      ? 'bg-stone-900 text-white border-stone-900 shadow-sm ring-1 ring-stone-900'
                      : isPast
                      ? 'bg-emerald-50/80 text-emerald-950 border-emerald-300 hover:bg-emerald-100/70 font-semibold'
                      : isAccessible
                      ? 'bg-white text-stone-700 border-stone-300 hover:border-stone-400'
                      : 'bg-stone-50 text-stone-300 border-stone-200 cursor-not-allowed opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1 text-[10px] uppercase font-bold tracking-wider">
                    {isPast ? (
                      <Check className="w-3 h-3 text-emerald-600 shrink-0" />
                    ) : (
                      <StepIcon className={`w-3 h-3 shrink-0 ${isCurrent ? 'text-white' : 'text-stone-400'}`} />
                    )}
                    <span>Step {s.num}</span>
                  </div>
                  <div className="text-xs font-semibold truncate mt-0.5">
                    <span className="sm:hidden">{s.title}</span>
                    <span className="hidden sm:inline">{s.fullTitle || s.title}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div ref={topErrorRef} className="p-4 rounded-xl bg-red-50 border border-red-200 text-red-800 text-sm flex items-center justify-between shadow-xs animate-in fade-in duration-150">
          <div className="flex items-center space-x-3">
            <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
            <span className="font-medium">{errorMsg}</span>
          </div>
          <button
            type="button"
            onClick={() => setErrorMsg('')}
            className="p-1 hover:bg-red-100 rounded text-red-700 transition-colors cursor-pointer"
            title="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE WITH SEARCH & CATEGORY FILTER */}
      {currentStep === 1 && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                1. Choose a Service
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Select your desired treatment. You can change your choice anytime.
              </p>
            </div>

            {/* Selected quick preview if already chosen */}
            {selectedService && (
              <div className="inline-flex items-center gap-2 bg-stone-900 text-white px-3.5 py-1.5 rounded-lg text-xs font-medium self-start sm:self-auto">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-[200px]">{selectedService.name}</span>
                <span className="text-stone-300 font-medium">{selectedService.duration} mins</span>
              </div>
            )}
          </div>

          {/* Search Box & Quick Category Filter */}
          <div className="space-y-3">
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-stone-400" />
              <input
                type="text"
                value={serviceSearch}
                onChange={(e) => setServiceSearch(e.target.value)}
                placeholder="Search treatments (e.g. hair, facial, bridal, nails, glow)..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-stone-300 bg-stone-50/50 text-xs text-stone-900 placeholder:text-stone-400 focus:outline-stone-500 focus:bg-white transition-all font-medium"
              />
              {serviceSearch && (
                <button
                  type="button"
                  onClick={() => setServiceSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 text-xs px-1"
                >
                  ✕
                </button>
              )}
            </div>

            {/* Category Pills (if more than 1 category exists) */}
            {categories.length > 2 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg font-semibold text-xs whitespace-nowrap transition-all cursor-pointer ${
                      selectedCategory === cat
                        ? 'bg-stone-900 text-white shadow-xs'
                        : 'bg-stone-100 hover:bg-stone-200 text-stone-700'
                    }`}
                  >
                    {cat === 'all' ? 'All Treatments' : cat}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Service Cards Grid */}
          {filteredServices.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
              {filteredServices.map((service) => {
                const isSelected = selectedService?._id === service._id;
                return (
                  <div
                    key={service._id}
                    onClick={() => setSelectedService(service)}
                    className={`p-4 sm:p-5 rounded-xl border-2 cursor-pointer transition-all flex flex-col justify-between space-y-3 ${
                      isSelected
                        ? 'border-stone-900 bg-stone-50/90 shadow-md ring-2 ring-stone-900'
                        : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start space-x-3.5">
                      <img
                        src={resolveImageUrl(service.images?.[0]?.url || service.images?.[0], DEFAULT_SALON_PLACEHOLDER)}
                        alt={service.name}
                        className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg object-cover shrink-0 border border-stone-200"
                      />
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex justify-between items-start gap-2">
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-stone-100 text-stone-700 truncate">
                            {service.category?.name || 'Treatment'}
                          </span>
                          <div className="text-right shrink-0">
                            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-100">
                              Available
                            </span>
                          </div>
                        </div>

                        <h3 className="font-bold text-sm sm:text-base text-stone-900 leading-snug">
                          {service.name}
                        </h3>
                        <p className="text-xs text-stone-500 line-clamp-2 leading-relaxed">
                          {service.description}
                        </p>
                        <div className="text-[11px] text-stone-600 font-medium flex items-center pt-1">
                          <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                          {service.duration} mins session
                        </div>
                      </div>
                    </div>

                    {/* Inline Selection Indicator */}
                    {isSelected && (
                      <div className="pt-2.5 border-t border-stone-200/90 flex items-center justify-between gap-2">
                        <span className="text-xs font-bold text-emerald-800 flex items-center">
                          <Check className="w-4 h-4 mr-1 text-emerald-600" />
                          Selected
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setCurrentStep(2);
                          }}
                          className="px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs flex items-center gap-1 shadow-xs transition-transform active:scale-95 cursor-pointer"
                        >
                          Select Date & Time <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
                        </button>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-stone-200 rounded-xl space-y-2">
              <p className="text-xs text-stone-500">No treatments found matching "{serviceSearch}".</p>
              <button
                type="button"
                onClick={() => {
                  setServiceSearch('');
                  setSelectedCategory('all');
                }}
                className="text-xs font-bold text-stone-900 underline"
              >
                Clear Search & Filters
              </button>
            </div>
          )}

          {/* Desktop Navigation Footer (Hidden on mobile where sticky bar is active) */}
          <div className="pt-5 hidden md:flex justify-between items-center border-t border-stone-100">
            <span className="text-xs text-stone-500">
              {selectedService ? (
                <span>Selected: <strong className="text-stone-900">{selectedService.name}</strong></span>
              ) : (
                'Please select a treatment above to continue'
              )}
            </span>
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedService}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Continue to Date & Slot
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: DATE PICKER & LIVE SLOTS */}
      {currentStep === 2 && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-stone-100 pb-4">
            <div>
              <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
                2. Select Date & Time Slot
              </h2>
              <p className="text-xs text-stone-500 mt-0.5">
                Session duration: <strong className="text-stone-800 font-semibold">{selectedService?.duration} mins</strong>
              </p>
            </div>
          </div>

          {/* Quick Date Presets + Calendar Input */}
          <div className="p-4 bg-stone-50 rounded-xl border border-stone-200 space-y-3">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700">
              Select Appointment Date
            </label>
            
            {/* Quick Presets */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {datePresets.map((preset) => (
                <button
                  key={preset.iso}
                  type="button"
                  onClick={() => setSelectedDate(preset.iso)}
                  className={`py-2 px-2.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer truncate ${
                    selectedDate === preset.iso
                      ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                      : 'bg-white text-stone-700 border-stone-300 hover:bg-stone-100'
                  }`}
                >
                  {preset.label}
                </button>
              ))}
            </div>

            <div className="flex items-center gap-2 pt-1">
              <span className="text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                Or pick calendar date:
              </span>
              <input
                type="date"
                min={getTodayDateString()}
                value={selectedDate}
                onChange={(e) => setSelectedDate(e.target.value)}
                className="px-3 py-1.5 rounded-lg border border-stone-300 bg-white text-xs font-medium focus:outline-stone-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Slot Grid Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-stone-800 flex items-center gap-1.5">
                <span>Available Openings</span>
                <span className="px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 text-xs font-mono">
                  {availableSlots.filter((s) => !isSlotPassed(selectedDate, s.time) && !s.isPassed).length}
                </span>
              </h4>
              {selectedSlot && (
                <span className="text-xs font-bold text-emerald-800 flex items-center bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  <Check className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                  Selected Slot: {selectedSlot}
                </span>
              )}
            </div>

            {isLoadingSlots ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
                <p className="text-xs text-stone-500">Checking live beautician schedules...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 gap-2 sm:gap-3">
                {availableSlots.map((slot) => {
                  const isPassed = isSlotPassed(selectedDate, slot.time) || slot.isPassed;
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      disabled={isPassed}
                      onClick={() => {
                        if (!isPassed) setSelectedSlot(slot.time);
                      }}
                      aria-disabled={isPassed}
                      title={isPassed ? 'This time slot has already passed' : `Select ${slot.time}`}
                      className={`py-2.5 px-2 rounded-xl text-center border transition-all ${
                        isPassed
                          ? 'opacity-35 bg-stone-100 text-stone-400 border-stone-200 cursor-not-allowed select-none line-through'
                          : isSelected
                          ? 'bg-stone-900 text-white border-stone-900 shadow-md font-bold cursor-pointer ring-2 ring-stone-900'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50 font-medium cursor-pointer'
                      }`}
                    >
                      <span className="text-xs sm:text-sm font-semibold">{slot.time}</span>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-8 text-center border border-dashed border-stone-300 rounded-xl text-stone-500 text-xs">
                No slots available on this date. Please select another date.
              </div>
            )}
          </div>

          <div className="pt-5 hidden md:flex justify-between items-center border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              disabled={!selectedSlot}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer shadow-xs"
            >
              Review Details
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: REVIEW, GUEST MOBILE OTP & CONFIRM */}
      {currentStep === 3 && (
        <div className="bg-white p-5 sm:p-8 rounded-2xl border border-stone-200 shadow-xs space-y-6">
          <div className="space-y-1 border-b border-stone-100 pb-4">
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-stone-900">
              3. Review & Confirm Booking
            </h2>
            <p className="text-xs text-stone-500">
              Verify your mobile number and review appointment details before locking your slot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Left Column: Summary Details Card */}
            <div className="p-5 sm:p-6 bg-stone-50 rounded-xl border border-stone-200 space-y-4 text-xs text-stone-700">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2 flex items-center justify-between">
                <span>Booking Summary</span>
                <span className="text-[11px] font-normal text-stone-500 font-sans">
                  {selectedService?.duration} mins
                </span>
              </h4>

              <div className="flex justify-between">
                <span className="text-stone-500">Treatment:</span>
                <span className="font-bold text-stone-900 text-sm">{selectedService?.name}</span>
              </div>



              <div className="flex justify-between">
                <span className="text-stone-500">Date:</span>
                <span className="font-semibold text-stone-900">
                  {new Date(`${selectedDate}T00:00:00`).toLocaleDateString('en-US', {
                    weekday: 'long',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Time Window:</span>
                <span className="font-bold text-stone-900 font-mono text-sm">
                  {selectedSlot} ({selectedService?.duration} mins)
                </span>
              </div>



              {/* Booking Summary Note */}
              <div className="pt-3 border-t border-stone-200 space-y-1.5">
                <div className="flex justify-between text-stone-500 text-xs">
                  <span>Appointment Type:</span>
                  <span className="font-semibold text-stone-800">Confirmed Salon Visit</span>
                </div>

                <div className="pt-2 border-t border-stone-200/60 flex justify-between items-center text-xs text-stone-600">
                  <span>Billing & Consultation:</span>
                  <span className="font-semibold text-stone-900">Payable at Salon Counter</span>
                </div>
              </div>
            </div>

            {/* Right Column: Guest Mobile OTP Verification & Payment Preference */}
            <div className="space-y-5">
              
              {/* ENHANCEMENT 1: FRICTIONLESS GUEST / PHONE OTP VERIFICATION */}
              <div
                ref={phoneVerificationRef}
                id="phone-verification-section"
                className={`p-4 rounded-xl border transition-all duration-300 space-y-3 ${
                  highlightPhoneCard
                    ? 'border-amber-500 bg-amber-50/80 ring-4 ring-amber-400/50 shadow-lg scale-[1.01]'
                    : 'border-stone-200 bg-stone-50/70'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Smartphone className="w-4 h-4 text-stone-800" />
                    <span className="text-xs font-bold uppercase tracking-wider text-stone-900">
                      Client Contact & Verification
                    </span>
                  </div>
                  {isMobileVerified ? (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
                      <Check className="w-3 h-3 mr-1" />
                      Phone Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                      Instant 4-Digit OTP
                    </span>
                  )}
                </div>

                {isMobileVerified ? (
                  <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-lg text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-emerald-950">
                        {user?.name || guestName || 'Valued Client'}
                      </span>
                      <span className="font-mono text-emerald-800 font-bold">
                        +91 {user?.phone || guestPhone}
                      </span>
                    </div>
                    <p className="text-[11px] text-emerald-700">
                      ✓ Mobile confirmed. WhatsApp booking voucher and SMS will be sent to this number.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3 pt-1">
                    <p className="text-[11px] text-stone-500 leading-snug">
                      No password required. Enter your name and mobile number to receive your instant 4-digit confirmation code.
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          value={guestName}
                          onChange={(e) => setGuestName(e.target.value)}
                          placeholder="e.g. Priya Sharma"
                          className="w-full px-3 py-2 rounded-lg border border-stone-300 bg-white text-xs focus:outline-stone-500 font-medium"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold uppercase text-stone-600 mb-1">
                          Mobile Number *
                        </label>
                        <div className="flex">
                          <span className="inline-flex items-center px-2.5 rounded-l-lg border border-r-0 border-stone-300 bg-stone-100 text-stone-600 text-xs font-semibold">
                            +91
                          </span>
                          <input
                            ref={phoneInputRef}
                            type="tel"
                            maxLength={10}
                            value={guestPhone}
                            onChange={(e) => setGuestPhone(e.target.value.replace(/\D/g, ''))}
                            placeholder="9876543210"
                            className="w-full px-3 py-2 rounded-r-lg border border-stone-300 bg-white text-xs font-mono font-medium focus:outline-stone-500"
                          />
                        </div>
                      </div>
                    </div>

                    {/* Channel Selector: SMS vs WhatsApp */}
                    <div className="flex items-center space-x-2 pt-1">
                      <span className="text-[10px] font-bold text-stone-500 uppercase tracking-wider">
                        Send via:
                      </span>
                      <div className="inline-flex rounded-lg border border-stone-200 bg-white p-0.5">
                        <button
                          type="button"
                          onClick={() => setGuestChannel('sms')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            guestChannel === 'sms'
                              ? 'bg-stone-900 text-white shadow-xs'
                              : 'text-stone-600 hover:text-stone-900'
                          }`}
                        >
                          SMS
                        </button>
                        <button
                          type="button"
                          onClick={() => setGuestChannel('whatsapp')}
                          className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                            guestChannel === 'whatsapp'
                              ? 'bg-emerald-700 text-white shadow-xs'
                              : 'text-stone-600 hover:text-emerald-700'
                          }`}
                        >
                          WhatsApp
                        </button>
                      </div>

                      {!otpSent && (
                        <button
                          type="button"
                          onClick={handleSendOtp}
                          disabled={isSendingOtp || guestPhone.replace(/\D/g, '').length < 10}
                          className="ml-auto px-3.5 py-1.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs disabled:opacity-50 transition-colors cursor-pointer flex items-center gap-1.5 shadow-xs"
                        >
                          {isSendingOtp ? (
                            <>
                              <Loader2 className="w-3 h-3 animate-spin" />
                              Sending...
                            </>
                          ) : (
                            <>
                              <Smartphone className="w-3.5 h-3.5" />
                              Send 4-Digit OTP
                            </>
                          )}
                        </button>
                      )}
                    </div>

                    {/* Inline 4-Digit OTP Entry Form */}
                    {otpSent && (
                      <div className="p-3 bg-white rounded-lg border border-stone-200 space-y-2 mt-2">
                        <div className="flex items-center justify-between">
                          <label className="text-[11px] font-bold text-stone-700 uppercase tracking-wider">
                            Enter 4-Digit Code
                          </label>
                          {devOtpHint && (
                            <span className="text-[10px] font-bold bg-amber-50 text-amber-800 px-2 py-0.5 rounded border border-amber-200">
                              Demo Code: <strong className="font-mono text-amber-950">{devOtpHint}</strong>
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <input
                            ref={otpInputRef}
                            type="text"
                            maxLength={4}
                            value={otpInput}
                            onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ''))}
                            placeholder="4-digit code"
                            className="flex-1 px-3 py-2 rounded-lg border border-stone-300 text-center font-mono text-sm tracking-widest font-bold focus:outline-stone-500"
                          />
                          <button
                            type="button"
                            onClick={handleVerifyOtp}
                            disabled={isVerifyingOtp || otpInput.trim().length !== 4}
                            className="px-4 py-2 rounded-lg bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs transition-colors disabled:opacity-50 cursor-pointer flex items-center gap-1 shadow-xs"
                          >
                            {isVerifyingOtp ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Verify Code'}
                          </button>
                        </div>

                        <div className="flex items-center justify-between text-[11px] text-stone-500 pt-1">
                          <span>Didn't receive code?</span>
                          {otpCountdown > 0 ? (
                            <span className="text-stone-400">Resend in {otpCountdown}s</span>
                          ) : (
                            <button
                              type="button"
                              onClick={handleSendOtp}
                              className="font-bold text-stone-900 hover:underline cursor-pointer"
                            >
                              Resend OTP
                            </button>
                          )}
                        </div>
                      </div>
                    )}

                    {otpFeedback.message && (
                      <p
                        className={`text-[11px] font-medium flex items-center gap-1 ${
                          otpFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                        }`}
                      >
                        {otpFeedback.type === 'success' && <Check className="w-3 h-3 text-emerald-600 shrink-0" />}
                        {otpFeedback.message}
                      </p>
                    )}
                  </div>
                )}
              </div>



              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Special Notes or Treatment Preferences (Optional)
                </label>
                <textarea
                  rows="2"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive skin or low heat styling..."
                  className="w-full p-3 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-stone-50 border border-stone-200 text-stone-700 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
                <span className="text-[11px] text-stone-600">
                  Zero cancellation fee up to 4 hours prior to appointment.
                </span>
              </div>
            </div>

          </div>

          <div className="pt-4 hidden md:flex justify-between items-center border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center px-5 py-2.5 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              onClick={handleConfirmAppointment}
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2.5 rounded-xl bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-70 shadow-sm"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Confirming Booking...
                </>
              ) : (
                <>
                  <Check className="w-4 h-4 mr-2 text-emerald-400" />
                  Confirm & Pay at Salon
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: SUCCESS CONFIRMATION + 2-HOUR REMINDER */}
      {currentStep === 4 && confirmedBooking && (
        <div className="bg-white p-6 sm:p-12 rounded-2xl border border-stone-200 shadow-xs max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-xs">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-1.5">
            <span className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
              Reservation Confirmed
            </span>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-stone-900">
              Appointment Scheduled
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Your appointment is recorded in our system. A confirmation SMS & WhatsApp voucher has been generated.
            </p>
          </div>

          {/* Booking Summary Box */}
          <div className="p-5 sm:p-6 bg-stone-50 rounded-xl border border-stone-200 text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-stone-200 pb-2.5 items-center">
              <span className="text-stone-500">Booking Reference:</span>
              <span className="font-bold text-stone-900 font-mono text-sm bg-stone-200/60 px-2 py-0.5 rounded">
                {confirmedBooking.bookingId}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Treatment:</span>
              <span className="font-semibold text-stone-900">{confirmedBooking.service?.name}</span>
            </div>

            <div className="flex justify-between">
              <span className="text-stone-500">Date & Slot:</span>
              <span className="font-bold text-stone-900">
                {confirmedBooking.date} at {confirmedBooking.startTime} - {confirmedBooking.endTime}
              </span>
            </div>

            {/* Payment Status Summary */}
            <div className="flex justify-between border-t border-stone-200 pt-2.5 items-center">
              <span className="text-stone-500">Payment Status:</span>
              <span className="px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border bg-amber-50 text-amber-800 border-amber-300">
                Pay at Salon Reception
              </span>
            </div>
          </div>

          {/* 2-HOUR PUSH NOTIFICATION REMINDER */}
          <div className="p-4 rounded-xl border border-rose-200 bg-rose-50/60 text-left space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-rose-950">
                <BellRing className="w-4 h-4 text-rose-700 shrink-0" />
                <h4 className="text-xs font-bold uppercase tracking-wider">
                  2-Hour Appointment Reminder
                </h4>
              </div>
              <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-rose-100 text-rose-800">
                Push Notification
              </span>
            </div>

            <p className="text-[11px] text-rose-900 leading-snug">
              Get an automated reminder alert on your device 2 hours before your appointment at <strong className="font-semibold">{confirmedBooking.startTime}</strong>.
            </p>

            <div className="flex flex-wrap items-center gap-2 pt-1">
              <button
                type="button"
                onClick={handleEnablePushReminder}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  reminderActive
                    ? 'bg-emerald-700 text-white shadow-xs'
                    : 'bg-rose-700 hover:bg-rose-800 text-white shadow-xs'
                }`}
              >
                {reminderActive ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    Reminder Active
                  </>
                ) : (
                  <>
                    <Bell className="w-3.5 h-3.5" />
                    Turn On 2-Hour Reminder
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleTestReminder}
                className="px-3 py-1.5 rounded-lg border border-rose-300 bg-white hover:bg-rose-50 text-rose-800 text-xs font-semibold transition-colors cursor-pointer"
              >
                Send Test Alert
              </button>

              {reminderFeedback && (
                <span className="text-[11px] font-medium text-emerald-800 flex items-center gap-1">
                  <Check className="w-3 h-3 text-emerald-600" />
                  {reminderFeedback}
                </span>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3 justify-center pt-2">
            <Link
              to="/dashboard?tab=upcoming"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg bg-stone-900 text-white text-xs font-semibold hover:bg-stone-800 transition-colors"
            >
              View in Customer Dashboard
            </Link>
            <Link
              to="/services"
              className="inline-flex items-center justify-center px-6 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 text-xs font-semibold transition-colors"
            >
              Browse More Services
            </Link>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* PERSISTENT FLOATING STICKY BOTTOM ACTION BAR (STEPS 1-4)  */}
      {/* Guarantees the user NEVER has to hunt or scroll for NEXT  */}
      {/* ======================================================== */}
      {currentStep < 4 && (
        <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur-md border-t border-stone-200/90 shadow-2xl">
          {/* Real-time Inline Error Alert attached directly above the Bottom Bar */}
          {errorMsg && (
            <div className="bg-rose-600 text-white text-xs px-4 py-2.5 flex items-center justify-between shadow-lg animate-in slide-in-from-bottom duration-150">
              <div className="flex items-center gap-2 min-w-0">
                <AlertCircle className="w-4 h-4 shrink-0 text-white" />
                <span className="font-semibold truncate">{errorMsg}</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 ml-2">
                {!isMobileVerified && !user?.isPhoneVerified && currentStep === 3 && (
                  <button
                    type="button"
                    onClick={() => {
                      phoneVerificationRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                      if (!guestPhone || guestPhone.length < 10) {
                        phoneInputRef.current?.focus();
                      } else {
                        otpInputRef.current?.focus();
                      }
                    }}
                    className="px-2 py-0.5 rounded bg-white text-rose-700 text-[11px] font-bold hover:bg-rose-50 cursor-pointer shadow-xs"
                  >
                    Verify Phone ↑
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setErrorMsg('')}
                  className="p-1 hover:bg-rose-700 rounded text-rose-100 cursor-pointer"
                  title="Dismiss"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          )}

          <div className="px-4 py-3 sm:py-3.5 max-w-5xl mx-auto flex items-center justify-between gap-3 pb-safe">
            
            {/* Left Selection Preview */}
            <div className="min-w-0 flex-1">
              {currentStep === 1 && (
                selectedService ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Treatment Selected
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {selectedService.name}
                    </span>
                    <span className="text-[11px] font-semibold text-stone-600">
                      {selectedService.duration} mins session
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Step 1 of 3
                    </span>
                    <span className="text-xs font-semibold text-stone-600">
                      Tap any treatment above to select
                    </span>
                  </div>
                )
              )}

              {currentStep === 2 && (
                selectedSlot ? (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                      <Check className="w-3 h-3 mr-1" />
                      Time Slot Selected
                    </span>
                    <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                      {selectedDate} at {selectedSlot}
                    </span>
                    <span className="text-[11px] text-stone-500">
                      {selectedService?.duration} mins session
                    </span>
                  </div>
                ) : (
                  <div className="flex flex-col">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">
                      Step 2 of 3
                    </span>
                    <span className="text-xs font-semibold text-stone-600">
                      Please pick an available time slot above
                    </span>
                  </div>
                )
              )}

              {currentStep === 3 && (
                <div className="flex flex-col">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 flex items-center">
                    <Check className="w-3 h-3 mr-1" />
                    Ready to Confirm
                  </span>
                  <span className="text-xs sm:text-sm font-bold text-stone-900 truncate">
                    {selectedService?.name}
                  </span>
                  <span className="text-[10px] font-medium text-stone-500">
                    Pay at Salon Reception
                  </span>
                </div>
              )}
            </div>

            {/* Right Action Buttons */}
            <div className="flex items-center space-x-2 shrink-0">
              {currentStep > 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep((prev) => prev - 1)}
                  className="px-3 sm:px-4 py-2.5 rounded-xl border border-stone-300 hover:bg-stone-50 text-stone-700 font-semibold text-xs transition-colors cursor-pointer flex items-center"
                >
                  <ChevronLeft className="w-4 h-4 mr-0.5 sm:mr-1" />
                  <span className="hidden sm:inline">Back</span>
                </button>
              )}

              {currentStep === 1 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(2)}
                  disabled={!selectedService}
                  className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center cursor-pointer shadow-sm ${
                    selectedService
                      ? 'bg-stone-900 hover:bg-stone-800 text-white ring-2 ring-stone-900 ring-offset-1'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Select Date & Time
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              )}

              {currentStep === 2 && (
                <button
                  type="button"
                  onClick={() => setCurrentStep(3)}
                  disabled={!selectedSlot}
                  className={`px-5 sm:px-6 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center cursor-pointer shadow-sm ${
                    selectedSlot
                      ? 'bg-stone-900 hover:bg-stone-800 text-white ring-2 ring-stone-900 ring-offset-1'
                      : 'bg-stone-200 text-stone-400 cursor-not-allowed'
                  }`}
                >
                  Review Details
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </button>
              )}

              {currentStep === 3 && (
                <button
                  type="button"
                  onClick={handleConfirmAppointment}
                  disabled={isSubmitting}
                  className={`px-5 sm:px-7 py-2.5 rounded-xl font-bold text-xs transition-all flex items-center cursor-pointer shadow-sm ${
                    !isMobileVerified && !user?.isPhoneVerified
                      ? 'bg-amber-600 hover:bg-amber-700 text-white ring-2 ring-amber-500 ring-offset-1'
                      : 'bg-stone-900 hover:bg-stone-800 text-white ring-2 ring-stone-900 ring-offset-1'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-1.5 animate-spin" />
                      Confirming...
                    </>
                  ) : !isMobileVerified && !user?.isPhoneVerified ? (
                    <>
                      <Smartphone className="w-4 h-4 mr-1.5 animate-pulse" />
                      <span>Verify Phone to Book</span>
                    </>
                  ) : (
                    <>
                      <Check className="w-4 h-4 mr-1.5 text-emerald-400" />
                      <span>Confirm & Pay at Salon</span>
                    </>
                  )}
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
}
