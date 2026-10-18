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
    const absoluteUrl = url.startsWith('http') ? url : `${DEFAULT_URL}${url}`;
    const absoluteImage = image.startsWith('http') ? image : `${DEFAULT_URL}${image}`;

    setMetaTag('property', 'og:title', formattedTitle);
    setMetaTag('property', 'og:description', description);
    setMetaTag('property', 'og:image', absoluteImage);
    setMetaTag('property', 'og:image:width', '1200');
    setMetaTag('property', 'og:image:height', '630');
    setMetaTag('property', 'og:image:alt', formattedTitle);
    setMetaTag('property', 'og:url', absoluteUrl);
    setMetaTag('property', 'og:type', type);

    // 4. Twitter Cards
    setMetaTag('name', 'twitter:card', 'summary_large_image');
    setMetaTag('name', 'twitter:title', formattedTitle);
    setMetaTag('name', 'twitter:description', description);
    setMetaTag('name', 'twitter:image', absoluteImage);

    // 5. Canonical Tag
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (!canonicalElement) {
      canonicalElement = document.createElement('link');
      canonicalElement.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalElement);
    }
    canonicalElement.setAttribute('href', absoluteUrl);

    // 6. Schema.org JSON-LD Structured Data for LocalBusiness & BeautySalon
    const schemaData = {
      '@context': 'https://schema.org',
      '@type': 'BeautySalon',
      '@id': 'https://enrich-mu.vercel.app/#salon',
      name: 'Enrich Ladies Beauty Parlor & Cosmetic Clinic',
      alternateName: 'Enrich Beauty Parlour Sikar',
      url: 'https://enrich-mu.vercel.app',
      logo: 'https://enrich-mu.vercel.app/favicon.svg',
      image: absoluteImage,
      description: description,
      telephone: '+919667900313',
      email: 'enrichparlour1212@gmail.com',
      priceRange: '₹₹',
      address: {
        '@type': 'PostalAddress',
        streetAddress: 'First Floor, Sharda Heights, near Ramlila Maidan, Chandpol',
        addressLocality: 'Sikar',
        addressRegion: 'Rajasthan',
        postalCode: '332001',
        addressCountry: 'IN'
      },
      geo: {
        '@type': 'GeoCoordinates',
        latitude: 27.6053398,
        longitude: 75.1384512
      },
      hasMap: 'https://www.google.com/maps/place/Enrich+Ladies+Beauty+Parlor/@27.6053398,75.1384512,17z',
      openingHoursSpecification: [
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
          opens: '09:00',
          closes: '20:00'
        },
        {
          '@type': 'OpeningHoursSpecification',
          dayOfWeek: ['Sunday'],
          opens: '10:00',
          closes: '17:00'
        }
      ],
      aggregateRating: {
        '@type': 'AggregateRating',
        ratingValue: '4.9',
        reviewCount: '512',
        bestRating: '5',
        worstRating: '1'
      },
      sameAs: [
        'https://www.instagram.com/enrich_beauty25/',
        'https://www.facebook.com/enrichparloursikar',
        'https://wa.me/919667900313'
      ]
    };

    let scriptElement = document.querySelector('#schema-structured-data');
    if (!scriptElement) {
      scriptElement = document.createElement('script');
      scriptElement.setAttribute('id', 'schema-structured-data');
      scriptElement.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptElement);
    }
    scriptElement.textContent = JSON.stringify(schemaData);
  }, [title, description, keywords, image, url, type]);

  return null;
}
