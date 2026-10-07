import { useEffect } from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=630&q=80';
const DEFAULT_URL = 'https://enrich-mu.vercel.app';
const BRAND_SUFFIX = ' | Enrich Ladies Beauty Parlor Sikar';

export default function SEO({
  title = 'Enrich Ladies Beauty Parlor & Cosmetic Clinic | Best Salon in Sikar (4.9★)',
  description = 'Premier beauty parlour & cosmetic clinic in Sikar at Sharda Heights, Chandpol. HD bridal makeup, hydrafacial, hair styling with 512+ Google reviews.',
  keywords = 'beauty parlour in sikar, best salon in sikar, enrich ladies beauty parlor, bridal makeup artist sikar, cosmetic clinic sikar, hydrafacial in sikar',
  image = DEFAULT_IMAGE,
  url = DEFAULT_URL,
  type = 'website'
}) {
  useEffect(() => {
    // 1. Set Title
    const formattedTitle = title.includes('Enrich') ? title : `${title}${BRAND_SUFFIX}`;
    document.title = formattedTitle;

    // Helper to update or create meta tag
    const setMetaTag = (attribute, name, content) => {
      let element = document.querySelector(`meta[${attribute}="${name}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute(attribute, name);
        document.head.appendChild(element);
      }
      element.setAttribute('content', content || '');
    };

    // 2. Standard Meta Tags
    setMetaTag('name', 'description', description);
    setMetaTag('name', 'keywords', keywords);

    // 3. Open Graph / Facebook / WhatsApp
    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', image);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', formattedTitle);
    setMetaTag('property', 'og:url', url.startsWith('http') ? url : `${DEFAULT_URL}${url}`);
    setMetaTag('property', 'og:type', type);

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', image);
  }, [title, description, keywords, image, url, type]);

  return null;
}
