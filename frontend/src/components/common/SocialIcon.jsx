import React from 'react';

/**
 * High-fidelity brand icons for supported social media platforms
 */
export function SocialIcon({ platform, className = 'w-5 h-5', style = {} }) {
  const p = (platform || '').toLowerCase().trim();

  switch (p) {
    case 'instagram':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
        </svg>
      );

    case 'facebook':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      );

    case 'threads':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="4" />
          <path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" />
        </svg>
      );

    case 'youtube':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
        </svg>
      );

    case 'whatsapp':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M17.472 14.382c-.301-.15-1.782-.88-2.057-.98-.276-.101-.476-.15-.677.15-.2.301-.776.98-.952 1.181-.175.201-.351.226-.652.075s-1.272-.47-2.423-1.498c-.896-.8-1.501-1.788-1.677-2.089s-.019-.463.131-.613c.136-.134.301-.351.452-.527.15-.175.2-.301.301-.501.101-.201.05-.376-.025-.527s-.677-1.632-.927-2.234c-.244-.586-.492-.507-.677-.516l-.578-.01c-.2 0-.527.075-.802.376s-1.053 1.029-1.053 2.509 1.078 2.91 1.229 3.111c.15.201 2.121 3.24 5.138 4.544.718.311 1.278.497 1.715.636.721.23 1.377.197 1.895.12.578-.087 1.782-.728 2.033-1.431.251-.703.251-1.304.175-1.431-.075-.127-.276-.201-.577-.351zm-5.467 7.424A10.82 10.82 0 0 1 6.5 20.353l-.396-.235-3.665.961.978-3.573-.257-.409a10.803 10.803 0 0 1-1.66-5.783C1.5 5.309 6.209.6 12.005.6 14.814.602 17.447 1.696 19.43 3.682a10.428 10.428 0 0 1 3.07 7.432c0 5.797-4.709 10.506-10.5 10.506z" />
        </svg>
      );

    case 'google':
    case 'google business profile':
    case 'google_business':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
        >
          <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
          <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
          <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" fill="#FBBC05" />
          <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" fill="#EA4335" />
        </svg>
      );

    case 'tiktok':
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.81 4.48c.04-.04.08-.08.12-.13a6.29 6.29 0 0 0 1.96-4.57V8.58a8.28 8.28 0 0 0 4.84 1.56V6.69h-.14z" />
        </svg>
      );

    default:
      return (
        <svg
          className={className}
          style={style}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10" />
          <line x1="2" x2="22" y1="12" y2="12" />
          <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
        </svg>
      );
  }
}

export default SocialIcon;
