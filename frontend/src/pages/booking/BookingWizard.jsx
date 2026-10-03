import { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { serviceService } from '../../services/service.service';
import { staffService } from '../../services/staff.service';
import { slotService } from '../../services/slot.service';
import { appointmentService } from '../../services/appointment.service';
import { paymentService } from '../../services/payment.service';
import { offerService } from '../../services/offer.service';
import { loadRazorpayScript } from '../../utils/loadRazorpay';
import { useAuth } from '../../context/AuthContext';
import {
  Calendar,
  Clock,
  CheckCircle2,
  Sparkles,
  Scissors,
  Users,
  Star,
  ChevronRight,
  ChevronLeft,
  Loader2,
  AlertCircle,
  FileText,
  DollarSign,
  CreditCard,
  ShieldCheck,
  Building2,
  Tag,
  Gift,
  Percent,
  Check
} from 'lucide-react';

export default function BookingWizard() {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Step 1 to 5
  const [currentStep, setCurrentStep] = useState(1);

  // Data states
  const [services, setServices] = useState([]);
  const [staffMembers, setStaffMembers] = useState([]);
  const [availableSlots, setAvailableSlots] = useState([]);

  // Selection states
  const [selectedService, setSelectedService] = useState(null);
  const [selectedStaff, setSelectedStaff] = useState('any'); // 'any' or staff object
  const [selectedDate, setSelectedDate] = useState(() => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  });
  const [selectedSlot, setSelectedSlot] = useState('');
  const [notes, setNotes] = useState('');

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
          // Check if pre-selected service passed from location state
          if (location.state?.preSelectedServiceId) {
            const pre = servicesRes.data.services.find(
              (s) => s._id === location.state.preSelectedServiceId
            );
            if (pre) setSelectedService(pre);
          }
        }

        if (staffRes?.data) {
          setStaffMembers(staffRes.data);
        }
      } catch (err) {
        setErrorMsg(err.message || 'Failed to load booking catalog');
      } finally {
        setIsLoadingData(false);
      }
    };

    fetchInitial();
  }, [location.state]);

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
          setAvailableSlots(res.data.availableSlots);
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

  // Payment states
  const [paymentMethod, setPaymentMethod] = useState('online'); // 'online' | 'counter'
  const [paymentInfo, setPaymentInfo] = useState(null);

  // Filter staff offering the selected service
  const qualifiedStaff = selectedService
    ? staffMembers.filter((st) =>
        st.services?.some((s) => (s._id ? s._id === selectedService._id : s === selectedService._id))
      )
    : staffMembers;

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

  const handleConfirmAppointment = async () => {
    setErrorMsg('');

    // Require phone verification before confirming appointment
    if (!user?.isPhoneVerified) {
      navigate('/verify-phone', {
        state: {
          from: '/book',
          message: 'Phone verification is required before confirming your salon reservation.'
        }
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // 1. Create Appointment Reservation (Status: pending/confirmed, paymentStatus: pending)
      const appRes = await appointmentService.createAppointment({
        serviceId: selectedService._id,
        staffId: selectedStaff === 'any' ? 'any' : selectedStaff._id,
        date: selectedDate,
        startTime: selectedSlot,
        notes,
        promoCode: appliedOffer?.code
      });

      const newApp = appRes?.data;
      if (!newApp) {
        throw new Error('Could not create appointment');
      }

      // If user chose Pay at Counter / Salon
      if (paymentMethod === 'counter') {
        setConfirmedBooking(newApp);
        setCurrentStep(5);
        setIsSubmitting(false);
        return;
      }

      // 2. User chose Pay Online with Razorpay -> Create backend Razorpay Order
      const orderRes = await paymentService.createOrder({
        appointmentId: newApp._id
      });

      if (!orderRes?.data?.orderId) {
        throw new Error('Failed to generate payment order');
      }

      const isLoaded = await loadRazorpayScript();
      if (!isLoaded) {
        throw new Error('Razorpay SDK failed to load. Please check your internet connection.');
      }

      const options = {
        key: orderRes.data.keyId,
        amount: orderRes.data.amount,
        currency: orderRes.data.currency,
        name: 'Enrich Beauty Parlour & Cosmetic Clinic',
        description: `${selectedService.name} Booking Reservation`,
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
          setIsSubmitting(true);
          try {
            // 3. Verify Razorpay HMAC signature on backend
            const verifyRes = await paymentService.verifyPayment({
              appointmentId: newApp._id,
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              paymentMethod: 'razorpay'
            });

            setPaymentInfo(verifyRes.data);
            setConfirmedBooking({
              ...newApp,
              paymentStatus: 'paid',
              status: 'confirmed',
              razorpayPaymentId: response.razorpay_payment_id
            });
            setCurrentStep(5);
          } catch (verErr) {
            setErrorMsg(verErr.message || 'Payment verification failed on server');
            setConfirmedBooking({
              ...newApp,
              paymentStatus: 'failed',
              status: 'pending'
            });
            setCurrentStep(5);
          } finally {
            setIsSubmitting(false);
          }
        },
        modal: {
          ondismiss: async () => {
            // Customer closed modal without completing payment
            await paymentService.reportFailure({
              appointmentId: newApp._id,
              razorpay_order_id: orderRes.data.orderId,
              error_description: 'Payment popup closed by customer'
            });
            setConfirmedBooking({
              ...newApp,
              paymentStatus: 'pending',
              status: 'pending'
            });
            setCurrentStep(5);
            setIsSubmitting(false);
          }
        }
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', async (response) => {
        await paymentService.reportFailure({
          appointmentId: newApp._id,
          razorpay_order_id: response.error?.metadata?.order_id || orderRes.data.orderId,
          error_code: response.error?.code,
          error_description: response.error?.description,
          error_reason: response.error?.reason
        });
        setErrorMsg(`Payment failed: ${response.error?.description || 'Transaction unsuccessful'}`);
        setIsSubmitting(false);
      });

      rzp.open();
    } catch (err) {
      if (err.status === 401 || err.message?.toLowerCase().includes('token') || err.message?.toLowerCase().includes('unauthorized')) {
        setErrorMsg('Your login session has expired. Please log in again to confirm your appointment reservation.');
      } else {
        setErrorMsg(err.message || 'Failed to complete reservation. Please try again.');
      }
      setIsSubmitting(false);
    }
  };

  const steps = [
    { num: 1, title: 'Service' },
    { num: 2, title: 'Stylist' },
    { num: 3, title: 'Date & Time' },
    { num: 4, title: 'Review & Book' }
  ];

  if (isLoadingData) {
    return (
      <div className="min-h-[70vh] flex flex-col items-center justify-center">
        <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-3" />
        <p className="text-sm text-stone-500">Loading booking options...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      
      {/* Top Header & Wizard Progress */}
      {currentStep < 5 && (
        <div className="space-y-6">
          <div className="text-center space-y-1.5">
            <span className="text-xs font-bold tracking-widest text-stone-500 uppercase">
              Online Booking
            </span>
            <h1 className="text-3xl sm:text-4xl font-serif font-bold text-stone-900">
              Schedule Your Appointment
            </h1>
          </div>

          {/* Progress Step Bar */}
          <div className="grid grid-cols-4 gap-2 max-w-2xl mx-auto">
            {steps.map((s) => (
              <div
                key={s.num}
                className={`py-2 px-3 rounded-lg text-center border transition-all ${
                  currentStep === s.num
                    ? 'bg-stone-900 text-white border-stone-900 shadow-xs'
                    : currentStep > s.num
                    ? 'bg-stone-100 text-stone-800 border-stone-300 font-semibold'
                    : 'bg-white text-stone-400 border-stone-200'
                }`}
              >
                <div className="text-[10px] uppercase tracking-wider font-bold">Step {s.num}</div>
                <div className="text-xs font-semibold truncate">{s.title}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Error Alert */}
      {errorMsg && (
        <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 text-sm flex items-center space-x-3">
          <AlertCircle className="w-5 h-5 text-red-600 shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* STEP 1: SELECT SERVICE */}
      {currentStep === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              1. Choose a Service
            </h2>
            <p className="text-xs text-stone-500">
              Select the treatment you would like to book today.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {services.map((service) => {
              const isSelected = selectedService?._id === service._id;
              return (
                <div
                  key={service._id}
                  onClick={() => setSelectedService(service)}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex items-start space-x-4 ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-400 bg-white hover:bg-stone-50/60'
                  }`}
                >
                  <img
                    src={service.images?.[0]?.url || 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=800&q=80'}
                    alt={service.name}
                    className="w-16 h-16 rounded-md object-cover shrink-0 border border-stone-200"
                  />
                  <div className="space-y-1 flex-1">
                    <div className="flex justify-between items-start">
                      <span className="text-[10px] font-semibold px-2 py-0.5 rounded bg-stone-100 text-stone-700">
                        {service.category}
                      </span>
                      <span className="text-base font-bold font-serif text-stone-900">
                        ${service.discountPrice > 0 ? service.discountPrice : service.price}
                      </span>
                    </div>
                    <h4 className="font-bold text-sm text-stone-900 font-serif leading-snug">
                      {service.name}
                    </h4>
                    <p className="text-xs text-stone-500 line-clamp-1">{service.description}</p>
                    <div className="text-[11px] text-stone-600 font-medium flex items-center pt-1">
                      <Clock className="w-3.5 h-3.5 mr-1 text-stone-400" />
                      {service.duration} mins session
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="pt-4 flex justify-end">
            <button
              onClick={() => setCurrentStep(2)}
              disabled={!selectedService}
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Continue to Stylist
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 2: SELECT STYLIST */}
      {currentStep === 2 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              2. Select Your Preferred Stylist
            </h2>
            <p className="text-xs text-stone-500">
              Choose a specific specialist for <strong className="text-stone-800">{selectedService?.name}</strong> or select any available stylist.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            
            {/* Option: Any Available Stylist */}
            <div
              onClick={() => setSelectedStaff('any')}
              className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                selectedStaff === 'any'
                  ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                  : 'border-stone-200 hover:border-stone-400 bg-white'
              }`}
            >
              <div className="space-y-2">
                <div className="w-12 h-12 rounded-lg bg-stone-100 text-stone-700 flex items-center justify-center">
                  <Users className="w-6 h-6" />
                </div>
                <h4 className="font-bold text-base text-stone-900 font-serif">
                  Any Available Stylist
                </h4>
                <p className="text-xs text-stone-500 leading-relaxed">
                  We will assign the first available qualified stylist to give you the most flexible schedule options.
                </p>
              </div>
              <span className="text-[11px] font-semibold text-stone-700 mt-4 block">
                First available appointment
              </span>
            </div>

            {/* Qualified Staff Cards */}
            {qualifiedStaff.map((staff) => {
              const isSelected = selectedStaff?._id === staff._id;
              return (
                <div
                  key={staff._id}
                  onClick={() => setSelectedStaff(staff)}
                  className={`p-5 rounded-lg border-2 cursor-pointer transition-all flex flex-col justify-between ${
                    isSelected
                      ? 'border-stone-900 bg-stone-50 shadow-xs ring-1 ring-stone-900'
                      : 'border-stone-200 hover:border-stone-400 bg-white'
                  }`}
                >
                  <div className="space-y-3">
                    <img
                      src={staff.avatar?.url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=600&q=80'}
                      alt={staff.name}
                      className="w-14 h-14 rounded-lg object-cover border border-stone-200"
                    />
                    <div>
                      <h4 className="font-bold text-base text-stone-900 font-serif">
                        {staff.name}
                      </h4>
                      {staff.experience > 0 && (
                        <p className="text-[11px] text-stone-500 mt-0.5">
                          {staff.experience} years experience
                        </p>
                      )}
                      {staff.ratingCount > 0 && (
                        <p className="text-[11px] text-amber-700 flex items-center mt-0.5">
                          <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500 mr-1" />
                          {staff.ratingAverage?.toFixed(1)} ({staff.ratingCount} reviews)
                        </p>
                      )}
                    </div>
                    {staff.bio && (
                      <p className="text-xs text-stone-600 line-clamp-2">{staff.bio}</p>
                    )}
                  </div>
                </div>
              );
            })}

          </div>

          <div className="pt-4 flex justify-between items-center border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(1)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer"
            >
              Continue to Date & Slot
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 3: DATE PICKER & LIVE SLOTS */}
      {currentStep === 3 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              3. Select Date & Time Slot
            </h2>
            <p className="text-xs text-stone-500">
              Available slots are calculated in real time according to stylist shifts, existing appointments, and duration.
            </p>
          </div>

          {/* Date Picker Row */}
          <div className="p-4 bg-stone-50 rounded-lg border border-stone-200 max-w-md">
            <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
              Appointment Date
            </label>
            <input
              type="date"
              min={new Date().toISOString().split('T')[0]}
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-stone-300 bg-white text-sm font-medium focus:outline-stone-500 cursor-pointer"
            />
          </div>

          {/* Slot Grid Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-800">
                Available Openings ({availableSlots.length})
              </h4>
              <span className="text-xs text-stone-500 flex items-center">
                <Clock className="w-3.5 h-3.5 mr-1" />
                Session duration: {selectedService?.duration} mins
              </span>
            </div>

            {isLoadingSlots ? (
              <div className="p-12 flex flex-col items-center justify-center">
                <Loader2 className="w-8 h-8 text-stone-700 animate-spin mb-2" />
                <p className="text-xs text-stone-500">Checking stylist schedule and booked openings...</p>
              </div>
            ) : availableSlots.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-3">
                {availableSlots.map((slot) => {
                  const isSelected = selectedSlot === slot.time;
                  return (
                    <button
                      key={slot.time}
                      type="button"
                      onClick={() => setSelectedSlot(slot.time)}
                      className={`py-2.5 px-2 rounded-lg text-center border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-stone-900 text-white border-stone-900 shadow-xs font-bold'
                          : 'bg-white text-stone-800 border-stone-200 hover:border-stone-400 hover:bg-stone-50 font-medium'
                      }`}
                    >
                      <div className="text-sm font-mono">{slot.time}</div>
                      <div className={`text-[10px] ${isSelected ? 'text-stone-300' : 'text-stone-400'}`}>
                        to {slot.endTime}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="p-10 text-center bg-stone-50 rounded-lg border border-stone-200 space-y-2">
                <Clock className="w-8 h-8 text-stone-400 mx-auto" />
                <p className="text-sm font-semibold text-stone-700">No Open Slots Available</p>
                <p className="text-xs text-stone-500">
                  All slots for this day are fully booked or the stylist is off duty. Please choose a different date.
                </p>
              </div>
            )}
          </div>

          <div className="pt-4 flex justify-between items-center border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(2)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              onClick={() => setCurrentStep(4)}
              disabled={!selectedSlot}
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors disabled:opacity-50 cursor-pointer"
            >
              Review Details
              <ChevronRight className="w-4 h-4 ml-1.5" />
            </button>
          </div>
        </div>
      )}

      {/* STEP 4: REVIEW & CONFIRM */}
      {currentStep === 4 && (
        <div className="bg-white p-6 sm:p-8 rounded-xl border border-stone-200 shadow-xs space-y-6">
          <div className="space-y-1">
            <h2 className="text-2xl font-serif font-bold text-stone-900">
              4. Review & Confirm Booking
            </h2>
            <p className="text-xs text-stone-500">
              Double-check your appointment details before confirming.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            {/* Summary Details Card */}
            <div className="p-6 bg-stone-50 rounded-lg border border-stone-200 space-y-4 text-xs text-stone-700">
              <h4 className="text-sm font-bold uppercase tracking-wider text-stone-900 border-b border-stone-200 pb-2">
                Booking Summary
              </h4>

              <div className="flex justify-between">
                <span className="text-stone-500">Treatment:</span>
                <span className="font-bold text-stone-900 text-sm">{selectedService?.name}</span>
              </div>

              <div className="flex justify-between">
                <span className="text-stone-500">Stylist:</span>
                <span className="font-semibold text-stone-900">
                  {selectedStaff === 'any' ? 'Any Available Stylist' : selectedStaff.name}
                </span>
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

              {/* Promo Code Input Box */}
              <div className="pt-2 border-t border-stone-200/60 space-y-2">
                <label className="block text-[10px] uppercase font-bold text-stone-500 tracking-wider">
                  Have a Promo Code?
                </label>
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                    <input
                      type="text"
                      disabled={appliedOffer !== null}
                      value={promoCodeInput}
                      onChange={(e) => setPromoCodeInput(e.target.value.toUpperCase())}
                      placeholder="e.g. WELCOME10"
                      className="w-full pl-8 pr-3 py-2 rounded-lg border border-stone-300 font-mono font-bold text-xs uppercase focus:outline-stone-500 disabled:bg-stone-100 disabled:text-stone-500"
                    />
                  </div>
                  {appliedOffer ? (
                    <button
                      type="button"
                      onClick={handleRemovePromo}
                      className="px-3 py-2 rounded-lg bg-stone-100 hover:bg-stone-200 text-stone-700 font-semibold text-xs border border-stone-300 cursor-pointer"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyPromo}
                      disabled={isValidatingPromo || !promoCodeInput.trim()}
                      className="px-4 py-2 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs disabled:opacity-50 cursor-pointer flex items-center gap-1"
                    >
                      {isValidatingPromo ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Apply'}
                    </button>
                  )}
                </div>

                {promoFeedback.message && (
                  <p
                    className={`text-[11px] font-medium flex items-center gap-1 ${
                      promoFeedback.type === 'success' ? 'text-emerald-700' : 'text-red-600'
                    }`}
                  >
                    {promoFeedback.type === 'success' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                    {promoFeedback.message}
                  </p>
                )}
              </div>

              {/* Price Calculation Breakdown */}
              {(() => {
                const basePrice = selectedService?.discountPrice > 0 ? selectedService.discountPrice : selectedService?.price;
                const finalPayable = Math.max(0, basePrice - discountAmount);

                return (
                  <div className="pt-3 border-t border-stone-200 space-y-1.5">
                    <div className="flex justify-between text-stone-500">
                      <span>Treatment Price:</span>
                      <span className="font-semibold text-stone-800">${basePrice}</span>
                    </div>

                    {discountAmount > 0 && (
                      <div className="flex justify-between text-emerald-700 font-semibold">
                        <span>Promo Discount ({appliedOffer?.code}):</span>
                        <span>-${discountAmount}</span>
                      </div>
                    )}

                    <div className="pt-2 border-t border-stone-200/60 flex justify-between items-baseline">
                      <span className="text-sm font-bold text-stone-900">Total Payable:</span>
                      <span className="text-2xl font-bold font-serif text-stone-900">
                        ${finalPayable}
                      </span>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* Client Notes & Payment Options */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Select Payment Preference *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Option 1: Razorpay Online */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('online')}
                    className={`p-3.5 rounded-lg border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      paymentMethod === 'online'
                        ? 'border-stone-900 bg-stone-50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-md bg-stone-100 text-stone-800">
                          <CreditCard className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-stone-900">Pay Online</span>
                      </div>
                      <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-stone-200 text-stone-800">
                        Razorpay
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      UPI, Cards, NetBanking, Wallets
                    </p>
                  </button>

                  {/* Option 2: Pay at Salon */}
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('counter')}
                    className={`p-3.5 rounded-lg border-2 text-left transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      paymentMethod === 'counter'
                        ? 'border-stone-900 bg-stone-50 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex items-center space-x-2">
                        <div className="p-1.5 rounded-md bg-stone-100 text-stone-800">
                          <Building2 className="w-4 h-4" />
                        </div>
                        <span className="font-bold text-xs text-stone-900">Pay at Salon</span>
                      </div>
                    </div>
                    <p className="text-[11px] text-stone-500 leading-snug">
                      Pay via Cash or Card at front desk on visit
                    </p>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-stone-700 mb-1.5">
                  Special Notes or Treatment Preferences (Optional)
                </label>
                <textarea
                  rows="3"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="e.g. Sensitive skin or low heat styling..."
                  className="w-full p-3 rounded-lg border border-stone-300 text-xs focus:outline-stone-500"
                />
              </div>

              <div className="p-3.5 rounded-lg bg-stone-50 border border-stone-200 text-stone-700 text-xs flex items-center space-x-2">
                <ShieldCheck className="w-4 h-4 text-stone-600 shrink-0" />
                <span className="text-[11px] text-stone-600">
                  Zero cancellation fee up to 4 hours prior to appointment.
                </span>
              </div>
            </div>

          </div>

          <div className="pt-4 flex justify-between items-center border-t border-stone-100">
            <button
              onClick={() => setCurrentStep(3)}
              className="inline-flex items-center px-5 py-2.5 rounded-lg border border-stone-300 text-stone-700 hover:bg-stone-50 font-semibold text-xs transition-colors cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4 mr-1.5" />
              Back
            </button>
            <button
              onClick={handleConfirmAppointment}
              disabled={isSubmitting}
              className="inline-flex items-center px-6 py-2.5 rounded-lg bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs transition-colors cursor-pointer disabled:opacity-70"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  {paymentMethod === 'online' ? 'Launching Checkout...' : 'Confirming Booking...'}
                </>
              ) : (
                <>
                  <CreditCard className="w-4 h-4 mr-2" />
                  {paymentMethod === 'online' ? 'Proceed to Razorpay Checkout' : 'Confirm and Pay at Salon'}
                </>
              )}
            </button>
          </div>
        </div>
      )}

      {/* STEP 5: SUCCESS CONFIRMATION */}
      {currentStep === 5 && confirmedBooking && (
        <div className="bg-white p-8 sm:p-12 rounded-xl border border-stone-200 shadow-xs max-w-2xl mx-auto text-center space-y-6">
          <div className="w-16 h-16 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>

          <div className="space-y-2">
            <span className="text-xs font-bold tracking-widest text-emerald-800 uppercase">
              Reservation Confirmed
            </span>
            <h2 className="text-3xl font-serif font-bold text-stone-900">
              Appointment Scheduled
            </h2>
            <p className="text-xs sm:text-sm text-stone-500">
              Your appointment is recorded in our system.
            </p>
          </div>

          <div className="p-6 bg-stone-50 rounded-lg border border-stone-200 text-left text-xs space-y-3">
            <div className="flex justify-between border-b border-stone-200 pb-2">
              <span className="text-stone-500">Booking Reference:</span>
              <span className="font-bold text-stone-900 font-mono text-sm">{confirmedBooking.bookingId}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Treatment:</span>
              <span className="font-semibold text-stone-900">{confirmedBooking.service?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-stone-500">Stylist:</span>
              <span className="font-semibold text-stone-900">{confirmedBooking.staff?.name}</span>
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
              <span
                className={`px-2.5 py-1 rounded text-[10px] font-bold uppercase tracking-wider border ${
                  confirmedBooking.paymentStatus === 'paid'
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                    : 'bg-amber-50 text-amber-800 border-amber-300'
                }`}
              >
                {confirmedBooking.paymentStatus === 'paid'
                  ? 'Paid Online (Razorpay)'
                  : 'Payment Pending at Reception'}
              </span>
            </div>

            {confirmedBooking.razorpayPaymentId && (
              <div className="flex justify-between font-mono text-[11px] text-stone-500">
                <span>Razorpay Txn ID:</span>
                <span className="font-semibold text-stone-800">{confirmedBooking.razorpayPaymentId}</span>
              </div>
            )}
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

    </div>
  );
}
