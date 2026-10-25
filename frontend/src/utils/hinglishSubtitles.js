/**
 * Hinglish Subtitles & Explanations for Salon Services & Categories
 * Tailored for local customers in small towns/Tier-2/3 cities (e.g. Sikar, Rajasthan)
 * 
 * Provides simple, everyday conversational Hindi/Hinglish explanations
 * so customers immediately understand the benefit of treatments
 * without getting confused by technical salon jargon.
 */

export const SERVICE_HINGLISH_MAP = [
  // 1. Bridal & Engagement Makeup
  {
    keywords: ['bridal trial', 'trial hair'],
    hinglish: 'Dulhan ke liye perfect look trial aur jewelry setting check'
  },
  {
    keywords: ['royal bridal', 'bridal package', 'wedding makeup', 'bridal makeup', 'dulhan'],
    hinglish: 'Dulhan ke liye royal waterproof makeup, hair styling aur jewelry setting'
  },
  {
    keywords: ['evening occasion', 'party makeup', 'reception', 'engagement', 'cocktail'],
    hinglish: 'Party ya engagement ke liye flawless waterproof makeup aur hairstyle'
  },

  // 2. Hair Care, Styling & Chemical Treatments
  {
    keywords: ['keratin', 'smoothing', 'smoothening', 'straightening', 'rebonding'],
    hinglish: 'Rukhe aur ghunghrale baalon ko silky, soft, shiny aur straight banaye'
  },
  {
    keywords: ['balayage', 'highlights', 'hair color', 'global color', 'gloss finish', 'gloss toner'],
    hinglish: 'Trendy sun-kissed hair color aur baalon ko luminous high-shine look'
  },
  {
    keywords: ['hair spa', 'deep conditioning', 'scalp massage', 'hair treatment'],
    hinglish: 'Baalon ka jhadna roke aur deep nourishment se silky soft banaye'
  },
  {
    keywords: ['cut & blowout', 'haircut', 'blowout', 'custom cut', 'styling'],
    hinglish: 'Stylish haircut aur blowdry se baalon ko naya bouncy volume'
  },

  // 3. Facial, Clean-Up & Skin Treatments
  {
    keywords: ['hydrating oxygen', 'oxygen infusion', 'hydra facial', 'hydra'],
    hinglish: 'Skin ki deep hydration aur instant fresh party glow ke liye'
  },
  {
    keywords: ['deep cleansing facial', 'cleansing facial', 'clean up', 'cleanup', 'pore cleansing'],
    hinglish: 'Blackheads aur dead skin hatakar chehre ko fresh aur nikhra banaye'
  },
  {
    keywords: ['d-tan', 'dtan', 'tan removal', 'de-tan'],
    hinglish: 'Dhoop se kali hui skin ko saaf karke natural gora nikhar laye'
  },
  {
    keywords: ['bleach', 'fruit bleach', 'gold bleach'],
    hinglish: 'Instant facial glow aur unchahe baalon ko golden match kare'
  },
  {
    keywords: ['facial', 'skin glow', 'skin treatment'],
    hinglish: 'Chehre ko moisturize karke sundar glowing nikhar dene ke liye'
  },

  // 4. Waxing & Threading
  {
    keywords: ['waxing', 'rica wax', 'honey wax', 'body wax'],
    hinglish: 'Bina dard skin ko smooth, hair-free aur tan-free banaye'
  },
  {
    keywords: ['threading', 'eyebrow', 'upper lip', 'forehead'],
    hinglish: 'Eyebrows aur upper-lips ko perfect natural neat shape'
  },

  // 5. Nails & Hands/Feet Care
  {
    keywords: ['gel extensions', 'nail art', 'nail extensions', 'acrylic'],
    hinglish: 'Sundar custom designer extensions aur long-lasting fancy nail art'
  },
  {
    keywords: ['gel manicure', 'manicure', 'nail paint', 'gel polish'],
    hinglish: 'Nails ko mazboot aur chip-free glossy shine finish de'
  },
  {
    keywords: ['pedicure', 'manicure & pedicure', 'feet care'],
    hinglish: 'Haath aur pairon ki deep safai, dead skin removal aur massage'
  },

  // 6. Spa & Body Care
  {
    keywords: ['aromatherapy', 'stress relief', 'body massage', 'spa', 'swedish'],
    hinglish: 'Sharir ki thakan door karne aur poori body ko deep relax karne ke liye'
  },
  {
    keywords: ['body polishing', 'body scrub', 'scrub'],
    hinglish: 'Poori body ki skin ko soft, smooth aur glowing banane ke liye'
  }
];

export const CATEGORY_HINGLISH_GUIDE = {
  All: 'Sabhi Services & Packages',
  Hair: 'Baalon ki Care, Cut, Spa & Smoothening',
  Skin: 'Facial, Clean-up, D-Tan & Natural Glow',
  Makeup: 'Party, Sagai & Function Ke Looks',
  Nails: 'Designer Nail Art & Nail Extensions',
  Bridal: 'Royal Dulhan Makeup & Complete Packages',
  Spa: 'Body Polishing & Relaxing Massage'
};

/**
 * Returns a friendly, conversational Hinglish subtitle for any service.
 * Prioritizes service.hinglishSubtitle if explicitly configured,
 * then checks smart keyword matching against service.name / service.description,
 * and falls back to a category-specific explanation.
 */
export function getHinglishSubtitle(service) {
  if (!service) return '';

  // 1. Explicit admin/backend override
  if (service.hinglishSubtitle && typeof service.hinglishSubtitle === 'string' && service.hinglishSubtitle.trim()) {
    return service.hinglishSubtitle.trim();
  }
  if (service.hinglish && typeof service.hinglish === 'string' && service.hinglish.trim()) {
    return service.hinglish.trim();
  }

  const name = (service.name || '').toLowerCase();
  const desc = (service.description || '').toLowerCase();
  const fullText = (name + ' ' + desc);

  // 2. Keyword matcher
  for (const item of SERVICE_HINGLISH_MAP) {
    for (const kw of item.keywords) {
      if (fullText.includes(kw)) {
        return item.hinglish;
      }
    }
  }

  // 3. Fallback based on category
  const cat = (service.category || '').toLowerCase();
  if (cat.includes('hair')) {
    return 'Baalon ki khoobsurati aur healthy growth ke liye';
  }
  if (cat.includes('skin')) {
    return 'Chehre ko fresh, saaf aur glowing banane ke liye';
  }
  if (cat.includes('makeup')) {
    return 'Khas maukon ke liye professional sundar look';
  }
  if (cat.includes('bridal')) {
    return 'Shaadi ke din royal dulhan makeup aur styling';
  }
  if (cat.includes('nail')) {
    return 'Nail care aur stunning styling ke liye';
  }
  if (cat.includes('spa')) {
    return 'Sharir ki thakan aur stress mitane ke liye';
  }

  return 'Personalized luxury salon service by Enrich';
}
