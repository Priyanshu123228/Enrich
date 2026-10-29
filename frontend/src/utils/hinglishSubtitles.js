//local hindi for salon services

export const SERVICE_HINGLISH_MAP = [
  // 1. Bridal & Engagement Makeup
  {
    keywords: ['bridal trial', 'trial hair'],
    hinglish: 'Dulhan ke liye perfect look trial aur jewelry setting check'
  },
  {
    keywords: ['royal bridal', 'bridal package', 'wedding makeup', 'bridal makeup', 'dulhan', 'wedding and event'],
    hinglish: 'Dulhan ke liye royal waterproof makeup, hair styling aur jewelry setting'
  },
  {
    keywords: ['evening occasion', 'party makeup', 'reception', 'engagement', 'cocktail'],
    hinglish: 'Party ya engagement ke liye flawless waterproof makeup aur hairstyle'
  },
  {
    keywords: ['permanent makeup', 'microblading', 'lip blush'],
    hinglish: 'Eyebrows aur lips ka smudge-proof, waterproof long-lasting permanent beauty look'
  },

  // 2. Hair Care, Styling, Extensions & Chemical Treatments
  {
    keywords: ['keratin', 'smoothing', 'smoothening', 'straightening', 'rebonding'],
    hinglish: 'Rukhe aur ghunghrale baalon ko silky, soft, shiny aur straight banaye'
  },
  {
    keywords: ['balayage', 'highlights', 'hair color', 'global color', 'gloss finish', 'gloss toner'],
    hinglish: 'Trendy sun-kissed hair color aur baalon ko luminous high-shine look'
  },
  {
    keywords: ['hair spa', 'deep conditioning', 'scalp massage', 'hair treatment', 'shampoo & conditioning'],
    hinglish: 'Baalon ka jhadna roke aur deep nourishment se silky soft banaye'
  },
  {
    keywords: ['hair extensions', 'extensions'],
    hinglish: 'Baalon ki natural lambai aur volume badhane ke liye premium hair extensions'
  },
  {
    keywords: ['cut & blowout', 'haircut', 'blowout', 'custom cut', 'styling', 'hairstyling'],
    hinglish: 'Stylish haircut aur blowdry se baalon ko naya bouncy volume'
  },

  // 3. Facial, Clean-Up, Brightening & Anti-Ageing
  {
    keywords: ['anti ageing', 'anti-ageing', 'anti aging', 'ageing', 'wrinkle'],
    hinglish: 'Jhurriyan aur fine lines kam karke skin ko tight, firm aur youthful banaye'
  },
  {
    keywords: ['skin brightening', 'brightening', 'fairness', 'glow treatment'],
    hinglish: 'Dull aur tanned skin ko saaf karke radiant glowing nikhra tone laye'
  },
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
    keywords: ['facial', 'skin glow', 'skin treatment', 'skin care'],
    hinglish: 'Chehre ko moisturize karke sundar glowing nikhar dene ke liye'
  },

  // 4. Waxing, Lashes & Eyebrow Beautification
  {
    keywords: ['waxing', 'rica wax', 'honey wax', 'body wax', 'body waxing'],
    hinglish: 'Bina dard skin ko smooth, hair-free aur tan-free banaye'
  },
  {
    keywords: ['eyelashes', 'lashes', 'lash extension'],
    hinglish: 'Palakon ko natural dense, ghana aur attractive curl look dene ke liye'
  },
  {
    keywords: ['eyebrow beautification', 'threading', 'eyebrow', 'upper lip', 'forehead'],
    hinglish: 'Eyebrows aur upper-lips ko perfect natural neat shape'
  },
  {
    keywords: ['shaving', 'shave'],
    hinglish: 'Hygienic gentle skin grooming aur smooth finish'
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

  // 6. Spa, Body Care & Concierge
  {
    keywords: ['aromatherapy', 'stress relief', 'body massage', 'spa', 'swedish', 'massage', 'spa services'],
    hinglish: 'Sharir ki thakan door karne aur poori body ko deep relax karne ke liye'
  },
  {
    keywords: ['body polishing', 'body scrub', 'scrub'],
    hinglish: 'Poori body ki skin ko soft, smooth aur glowing banane ke liye'
  },
  {
    keywords: ['mobile salon', 'doorstep'],
    hinglish: 'Ghar baithe salon aur bridal treatments aapki suvidha anusar'
  }
];

export const CATEGORY_HINGLISH_GUIDE = {
  All: 'Sabhi Services & Packages',
  Hair: 'Baalon ki Care, Cut, Spa, Smoothening & Extensions',
  Skin: 'Facial, Brightening, D-Tan & Anti-Ageing Care',
  Makeup: 'Party, Sagai & Function Ke Looks',
  Nails: 'Designer Nail Art, Extensions & Pedicure',
  Bridal: 'Royal Dulhan Makeup & Complete Wedding Packages',
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
