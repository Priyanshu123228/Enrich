import React, { useEffect, useState } from 'react';
import { ExternalLink, Sparkles, MessageCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import SocialIcon from './common/SocialIcon';
import socialService from '../services/social.service';

const PLATFORM_STYLES = {
  instagram: {
    accentColor: '#E1306C',
    gradient: 'from-pink-500/10 via-rose-500/10 to-amber-500/10',
    borderHover: 'hover:border-pink-500/40',
    badge: 'Trending Reels & Looks',
    buttonText: 'Follow on Instagram'
  },
  facebook: {
    accentColor: '#1877F2',
    gradient: 'from-blue-600/10 via-sky-500/10 to-transparent',
    borderHover: 'hover:border-blue-500/40',
    badge: 'Community & Events',
    buttonText: 'Visit Facebook Page'
  },
  threads: {
    accentColor: '#000000',
    gradient: 'from-stone-500/10 via-stone-400/5 to-transparent',
    borderHover: 'hover:border-stone-400/40',
    badge: 'Salon Daily Stories',
    buttonText: 'Follow on Threads'
  },
  youtube: {
    accentColor: '#FF0000',
    gradient: 'from-red-600/10 via-orange-500/10 to-transparent',
    borderHover: 'hover:border-red-500/40',
    badge: 'Makeover Tutorials',
    buttonText: 'Watch on YouTube'
  },
  whatsapp: {
    accentColor: '#25D366',
    gradient: 'from-emerald-500/10 via-teal-500/10 to-transparent',
    borderHover: 'hover:border-emerald-500/40',
    badge: 'Instant Consultation',
    buttonText: 'Chat on WhatsApp'
  },
  google: {
    accentColor: '#4285F4',
    gradient: 'from-blue-500/10 via-amber-500/5 to-emerald-500/10',
    borderHover: 'hover:border-blue-400/40',
    badge: 'Verified 4.9? Reviews',
    buttonText: 'View on Google Maps'
  },
  tiktok: {
    accentColor: '#000000',
    gradient: 'from-cyan-500/10 via-pink-500/10 to-transparent',
    borderHover: 'hover:border-stone-400/40',
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
      <section className="bg-stone-900 text-white py-20 border-y border-stone-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <div className="h-4 w-32 bg-stone-800 rounded-full mx-auto animate-pulse" />
            <div className="h-8 w-64 bg-stone-800 rounded-lg mx-auto animate-pulse" />
            <div className="h-4 w-80 bg-stone-800 rounded-md mx-auto animate-pulse" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 bg-stone-800/60 rounded-2xl animate-pulse border border-stone-800" />
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
    <section id="social-journey" className="relative bg-gradient-to-b from-stone-950 via-stone-900 to-stone-950 text-white py-20 sm:py-24 border-y border-stone-800 overflow-hidden">
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-rose-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-72 h-72 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
        
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center space-x-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs font-semibold tracking-wide uppercase">
            <Sparkles className="w-3.5 h-3.5 text-rose-400" />
            <span>Connect & Explore</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-serif font-bold text-white tracking-tight">
            Follow Our Journey
          </h2>

          <p className="text-sm sm:text-base text-stone-300 leading-relaxed font-light">
            See our latest looks, transformations, offers and updates.
          </p>
        </div>

        {/* Social Platforms Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {socialLinks.map((link) => {
            const platformKey = link.platform?.toLowerCase() || 'other';
            const style = PLATFORM_STYLES[platformKey] || {
              accentColor: '#E11D48',
              gradient: 'from-stone-800/40 to-transparent',
              borderHover: 'hover:border-rose-500/40',
              badge: 'Official Channel',
              buttonText: `Visit ${link.displayName}`
            };

            return (
              <div
                key={link._id || link.platform}
                className={`group relative flex flex-col justify-between p-6 sm:p-7 rounded-2xl bg-stone-900/90 border border-stone-800 transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-stone-950/80 ${style.borderHover}`}
              >
                <div className={`absolute inset-0 rounded-2xl bg-gradient-to-br ${style.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`} />

                <div className="relative space-y-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3.5">
                      <div className="w-12 h-12 rounded-xl bg-stone-800/90 border border-stone-700/80 flex items-center justify-center text-white group-hover:scale-105 group-hover:border-stone-600 transition-transform shadow-inner">
                        <SocialIcon
                          platform={link.platform}
                          className="w-6 h-6 transition-transform"
                          style={{ color: style.accentColor }}
                        />
                      </div>
                      <div>
                        <h3 className="text-base font-semibold text-white tracking-tight">
                          {link.displayName}
                        </h3>
                        {link.handle ? (
                          <p className="text-xs font-mono text-stone-400">
                            {link.handle}
                          </p>
                        ) : (
                          <p className="text-xs text-stone-400 capitalize">
                            {link.platform}
                          </p>
                        )}
                      </div>
                    </div>

                    <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-stone-800 text-stone-300 border border-stone-700/60 shrink-0">
                      {style.badge}
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-stone-300 leading-relaxed line-clamp-3">
                    {link.description || 'Stay updated with exclusive salon announcements, bridal previews, and beauty transformations.'}
                  </p>
                </div>

                <div className="relative pt-6 mt-4 border-t border-stone-800/80">
                  <a
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center space-x-2 px-4 py-2.5 rounded-xl bg-stone-800/90 hover:bg-rose-700 text-white text-xs font-semibold tracking-wide border border-stone-700 hover:border-rose-600 transition-all duration-200 group-hover:shadow-md cursor-pointer"
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
            <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-2 sm:p-2.5 rounded-2xl bg-stone-900/80 border border-stone-800 shadow-xl backdrop-blur-sm">
              <span className="text-xs text-stone-300 px-3 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-rose-400" />
                <span>Daily updates published directly across our official channels</span>
              </span>
              <a
                href={primaryPlatform.url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-700 to-rose-600 hover:from-rose-600 hover:to-rose-500 text-white font-semibold text-xs tracking-wider uppercase shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] cursor-pointer"
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
