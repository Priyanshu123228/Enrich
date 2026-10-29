import { useEffect } from 'react';

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1200&h=630&q=80';
const DEFAULT_URL = 'https://www.enrichbeautysikar.in';
const BRAND_SUFFIX = ' | Enrich Ladies Beauty Parlor Sikar';

export default function SEO({
  title = 'Enrich Ladies Beauty Parlor & Cosmetic Clinic | Best Salon in Sikar (4.9★)',
  description = 'Premier beauty parlour & cosmetic clinic in Sikar at Sharda Heights, Chandpol. HD bridal makeup, hydrafacial, hair styling with 512+ Google reviews.',
  keywords = 'beauty parlour in sikar, best salon in sikar, bridal makeup in sikar, best bridal makeup artist in sikar, bridal hairstyle in sikar, wedding makeup near me in sikar, hair color in sikar, keratin treatment in sikar, anti ageing facial sikar, skin brightening treatment in sikar, party makeup near me in sikar, hydrafacial in sikar, body waxing, hair extensions, permanent makeup, eyelashes, manicure, pedicure, spa services, enrich ladies beauty parlor',
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
      '@id': 'https://www.enrichbeautysikar.in/#salon',
      name: 'Enrich Ladies Beauty Parlor & Cosmetic Clinic',
      alternateName: 'Enrich Beauty Parlour Sikar',
      url: 'https://www.enrichbeautysikar.in',
      logo: 'https://www.enrichbeautysikar.in/favicon.svg',
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
        'https://www.threads.com/@enrich_beauty25',
        'https://www.facebook.com/enrichparloursikar',
        'https://wa.me/919667900313'
      ],
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Enrich Beauty & Bridal Services Menu',
        itemListElement: [
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bridal Makeup in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Best Bridal Makeup Artist in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Bridal Hairstyle in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Wedding and Event Preparation' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Party Makeup in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Keratin Treatment in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hair Color in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Haircut & Hairstyling' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Hair Extensions' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Skin Brightening Treatment in Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Anti Ageing Facial Sikar' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Facials & Skin Care' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Eyebrow Beautification' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Eyelashes' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Permanent Makeup' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Manicure & Pedicure' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Body Waxing' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Massage & Spa Services' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Shampoo & Conditioning' } },
          { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Online Beauty Salon Booking' } }
        ]
      }
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