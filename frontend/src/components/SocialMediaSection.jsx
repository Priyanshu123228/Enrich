import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, MessageCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SocialIcon from './common/SocialIcon';
import socialService from '../services/social.service';

const PLATFORM_STYLES = {
  instagram: {
    accentColor: '#E1306C',
    gradient: 'from-pink-500/10 via-rose-500/5 to-amber-500/10',
    borderHover: 'hover:border-pink-300',
    badge: 'Trending Looks & Reels',
    buttonText: 'Follow on Instagram'
  },
  facebook: {
    accentColor: '#1877F2',
    gradient: 'from-blue-600/10 via-sky-500/5 to-transparent',
    borderHover: 'hover:border-blue-300',
    badge: 'Community & Updates',
    buttonText: 'Visit Facebook Page'
  },
  threads: {
    accentColor: '#1F2937',
    gradient: 'from-stone-500/10 via-stone-400/5 to-transparent',
    borderHover: 'hover:border-stone-400',
    badge: 'Salon Daily Stories',
    buttonText: 'Follow on Threads'
  },
  youtube: {
    accentColor: '#E11D48',
    gradient: 'from-rose-600/10 via-orange-500/5 to-transparent',
    borderHover: 'hover:border-rose-300',
    badge: 'Makeover Tutorials',
    buttonText: 'Watch on YouTube'
  },
  whatsapp: {
    accentColor: '#16A34A',
    gradient: 'from-emerald-500/10 via-teal-500/5 to-transparent',
    borderHover: 'hover:border-emerald-300',
    badge: 'Instant VIP Concierge',
    buttonText: 'Chat on WhatsApp'
  },
  google: {
    accentColor: '#2563EB',
    gradient: 'from-blue-500/10 via-amber-500/5 to-emerald-500/10',
    borderHover: 'hover:border-blue-300',
    badge: 'Verified 4.9★ Reviews',
    buttonText: 'View on Google Maps'
  },
  tiktok: {
    accentColor: '#0F172A',
    gradient: 'from-cyan-500/10 via-pink-500/5 to-transparent',
    borderHover: 'hover:border-stone-400',
    badge: 'Styling Shorts',
    buttonText: 'Watch on TikTok'
  }
};

export default function SocialMediaSection() {
  const [socialLinks, setSocialLinks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    const fetchSocialLinks = async () => {
      try {
        const res = await socialService.getActiveSocialLinks();
        if (isMounted && res && res.data) {
          const list = Array.isArray(res.data) ? res.data : (res.data.data || []);
          setSocialLinks(list);
        }
      } catch (err) {
        console.warn('Social media links could not be loaded:', err?.message || err);
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    fetchSocialLinks();
    return () => {
      isMounted = false;
    };
  }, []);

  if (loading) {
    return (
      <section className="bg-[#FAF7F2] py-20 border-y border-stone-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="h-4 w-32 bg-stone-200 rounded-full mx-auto animate-pulse" />
            <div className="h-8 w-64 bg-stone-200 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-80 bg-stone-200 rounded-md mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-white/80 rounded-3xl animate-pulse border border-stone-200 shadow-xs" />
            ))}
          </div>
        </div>
      </section>
    );
  }

  if (!socialLinks || socialLinks.length === 0) {
    return null;
  }

  const primaryPlatform = socialLinks.find((l) => l.platform === 'instagram') || socialLinks[0];

  return (
    <section id="social-journey" className="relative bg-gradient-to-b from-[#FAF7F2] via-[#F5EFE6] to-[#FAF7F2] text-stone-900 py-20 sm:py-24 border-y border-stone-200/80 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-rose-50 border border-rose-200/80 text-rose-800 text-xs font-bold tracking-widest uppercase shadow-2xs">
            <Sparkles className="w-3.5 h-3.5 text-rose-600" />
            <span>Connect & Explore</span>
          </div>

          <h2 className="text-3xl sm:text-5xl font-serif font-bold text-stone-900 tracking-tight">
            Follow Our <span className="text-rose-700 italic font-serif">Journey</span>
          </h2>

          <p className="text-sm sm:text-base text-stone-600 leading-relaxed font-light">
            Explore our daily bridal transformations, salon artistry, client reviews, and exclusive announcements.
          </p>
        </div>

        {/* Social Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {socialLinks.map((link) => {
            const platformKey = link.platform?.toLowerCase() || 'other';
            const style = PLATFORM_STYLES[platformKey] || {
              accentColor: '#BE185D',
              gradient: 'from-rose-50/60 to-transparent',
              borderHover: 'hover:border-rose-300',
              badge: 'Official Channel',
              buttonText: `Visit ${link.displayName}`
            };

            return (
              <div
                key={link._id || link.platform}
                className={`group relative flex flex-col justify-between p-6 sm:p-8 rounded-3xl bg-white/95 border border-stone-200/90 transition-all duration-300 hover:-translate-y-1.5 hover:shadow-xl hover:shadow-stone-200/70 ${style.borderHover}`}
              >
                <div className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-stone-50 border border-stone-200/80 flex items-center justify-center text-stone-800 group-hover:scale-105 group-hover:border-rose-200 transition-all shadow-xs">
                        <SocialIcon
                          platform={link.platform}
                          className="w-6 h-6 transition-transform"
                          style={{ color: style.accentColor }}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-stone-900 tracking-tight font-serif">
                          {link.displayName}
                        </h3>
                        {link.handle ? (
                          <p className="text-xs font-mono text-stone-500">
                            {link.handle}
                          </p>
                        ) : (
                          <p className="text-xs text-stone-500 capitalize">
                            {link.platform}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wide uppercase bg-stone-100 text-stone-700 border border-stone-200 shrink-0">
                      {style.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-600 leading-relaxed line-clamp-3 font-light">
                    {link.description || 'Stay updated with exclusive salon announcements, bridal previews, and beauty transformations.'}
                  </p>
                </div>

                <div className="relative pt-6 mt-4 border-t border-stone-100">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-3 rounded-2xl bg-stone-900 hover:bg-rose-700 text-white text-xs font-bold tracking-wide transition-all duration-200 group-hover:shadow-md cursor-pointer active:scale-98"
                  >
                    <span>{style.buttonText}</span>
                    <ArrowUpRight className="w-3.5 h-3.5 text-stone-300 group-hover:text-white transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                  </a>
                </div>

              </div>
            );
          })}
        </div>

        {/* Primary Call To Action (CTA) */}
        {primaryPlatform && (
          <div className="pt-4 text-center">
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-3 sm:p-3.5 rounded-3xl bg-white/95 border border-stone-200/90 shadow-lg shadow-stone-200/50 backdrop-blur-sm">
              <span className="text-xs text-stone-700 px-3 flex items-center gap-2 font-medium">
                <CheckCircle2 className="w-4 h-4 text-rose-600 shrink-0" />
                <span>Daily updates published directly across our official channels</span>
              </span>
              <a
                href={primaryPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl bg-gradient-to-r from-rose-700 via-rose-600 to-rose-700 hover:from-rose-600 hover:to-rose-500 text-white font-bold text-xs tracking-wider uppercase shadow-md shadow-rose-900/20 transition-all hover:scale-[1.02] cursor-pointer"
              >
                <span>See More on Social Media</span>
                <ExternalLink className="w-3.5 h-3.5 ml-1" />
              </a>
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
