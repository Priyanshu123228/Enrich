import { useState } from 'react';
import { MessageCircle, X, Send, Sparkles, Calendar, HeartHandshake, PhoneCall } from 'lucide-react';
import { SALON_CONFIG } from '../../config/salonConfig';

function WhatsAppIcon({ className = "w-6 h-6" }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.711 2.598 2.664-.698c.971.53 1.77.813 2.796.813h.005c3.179 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.773-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.312.045-.693.075-2.09-.493-1.637-.665-2.73-2.317-2.813-2.427-.082-.11-1.002-1.332-1.002-2.54 0-1.209.636-1.803.86-2.048.225-.246.491-.307.655-.307.164 0 .328.003.47.01.15.008.351-.057.55.421.205.492.697 1.701.758 1.824.061.123.102.266.02.43-.082.163-.123.266-.246.409-.123.143-.258.32-.369.43-.123.122-.251.255-.108.5.144.246.638 1.053 1.37 1.705.942.84 1.737 1.1 1.983 1.223.246.123.389.102.533-.061.143-.164.614-.716.778-.962.164-.246.327-.205.55-.123.224.082 1.413.666 1.659.789.245.123.409.184.47.287.062.102.062.593-.082.998zM12 2C6.477 2 2 6.477 2 12c0 1.891.526 3.66 1.438 5.168L2 22l4.98-1.306A9.957 9.957 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2z"/>
    </svg>
  );
}

export default function WhatsAppWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const phoneNumber = '919667900313'; // Enrich official WhatsApp number

  const quickMessages = [
    {
      id: 'book',
      label: 'Book an Appointment',
      icon: Calendar,
      text: 'Hi Enrich Beauty Parlour, I would like to book a salon appointment.'
    },
    {
      id: 'bridal',
      label: 'Bridal Makeup Inquiries',
      icon: Sparkles,
      text: 'Hi Enrich, I want to inquire about HD bridal makeup packages and dates.'
    },
    {
      id: 'hydra',
      label: 'Skin & Hair Treatments',
      icon: HeartHandshake,
      text: 'Hi, I would like to know about hydrafacials and hair keratin pricing.'
    }
  ];

  const handleSend = (customText) => {
    const message = encodeURIComponent(customText || 'Hi Enrich Beauty Parlour, I would like to inquire about your salon services.');
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${message}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    setIsOpen(false);
  };

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end">
      
      {/* Interactive Popover Window */}
      {isOpen && (
        <div className="mb-3 w-80 sm:w-96 bg-white rounded-3xl border border-stone-200 shadow-2xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-200">
          
          {/* Header */}
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-700 p-5 text-white flex items-start justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white shrink-0">
                <WhatsAppIcon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="font-serif font-bold text-base text-white leading-tight">
                  Enrich Salon Concierge
                </h3>
                <div className="flex items-center gap-1.5 mt-0.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-300 animate-pulse"></span>
                  <span className="text-[11px] text-emerald-100 font-medium">Online • Instant WhatsApp Desk</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsOpen(false)}
              className="text-white/80 hover:text-white p-1 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close WhatsApp chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 space-y-4 bg-stone-50/50">
            <div className="bg-white p-3.5 rounded-2xl border border-stone-200/80 shadow-2xs space-y-1">
              <p className="text-xs text-stone-700 leading-relaxed">
                👋 Namaste! How can we assist you today at our <strong>Sharda Heights, Sikar</strong> salon?
              </p>
            </div>

            {/* Quick Option Buttons */}
            <div className="space-y-2">
              <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                Quick Questions
              </span>
              
              {quickMessages.map((item) => {
                const IconComponent = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => handleSend(item.text)}
                    className="w-full text-left p-3 rounded-xl bg-white hover:bg-emerald-50 border border-stone-200 hover:border-emerald-300 text-xs text-stone-800 font-medium transition-all flex items-center justify-between group shadow-2xs"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-6 h-6 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 transition-colors">
                        <IconComponent className="w-3.5 h-3.5" />
                      </div>
                      <span>{item.label}</span>
                    </div>
                    <Send className="w-3.5 h-3.5 text-stone-300 group-hover:text-emerald-600 transition-colors" />
                  </button>
                );
              })}
            </div>

            {/* Direct Chat Action */}
            <button
              onClick={() => handleSend('')}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs shadow-md shadow-emerald-900/15 transition-all flex items-center justify-center gap-2 active:scale-98"
            >
              <WhatsAppIcon className="w-4 h-4" />
              <span>Start WhatsApp Chat</span>
            </button>

            <p className="text-[10px] text-stone-400 text-center font-light">
              Direct desk: +91 96679 00313 • Chandpol, Sikar
            </p>
          </div>

        </div>
      )}

      {/* Floating Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Open WhatsApp chat with Enrich Salon"
        className="group relative flex items-center gap-2.5 px-4 py-3 sm:px-5 sm:py-3.5 rounded-full bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-xl shadow-emerald-900/25 transition-all duration-300 hover:scale-105 active:scale-95"
      >
        <span className="relative flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-200 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-white"></span>
        </span>

        <WhatsAppIcon className="w-5 h-5 text-white" />
        
        <span className="hidden sm:inline-block font-bold text-xs tracking-wide">
          Chat on WhatsApp
        </span>
      </button>

    </div>
  );
}
