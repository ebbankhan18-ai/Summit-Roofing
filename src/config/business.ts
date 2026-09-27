/**
 * SINGLE SOURCE OF TRUTH for all business-specific template data.
 * Rebrand the whole site (and its copy, plans, areas, testimonials) by
 * editing this file — no structural code changes required anywhere else.
 */
export const business = {
  name: 'Summit Shield Roofing',
  shortName: 'Summit Shield',
  tagline: 'Dallas roof repair, replacement & inspections',
  city: 'Dallas',
  state: 'TX',
  phone: '(214) 555-0182',
  phoneHref: 'tel:+12145550182',
  email: 'hello@summitshieldroofing.com',
  hours: 'Mon–Sat · 7:00 AM – 7:00 PM CT',
  serviceLocation: 'Serving Dallas and surrounding communities',
  /** Demo/template content — replace before going live for a real business. */
  isTemplate: true,
  hero: {
    eyebrow: 'Dallas · Fort Worth · North Texas',
    title: 'Dallas roof repair, replacement & inspections',
    subtitle:
      'Straight answers, photo-documented estimates, and crews that treat your home like their own. Get a same-week inspection and a written quote you can actually read.',
    primaryCta: 'Get my free estimate',
    secondaryCta: 'Book an inspection',
  },
  trustStrip: [
    'Photo-documented estimates',
    'Same-week inspection slots',
    'Written, itemized quotes',
    'Local Dallas crews',
  ],
  services: [
    {
      key: 'repair',
      name: 'Roof repair',
      icon: '🔧',
      blurb:
        'Leaks, missing shingles, flashing failures, and storm damage — diagnosed with photos and fixed with matched materials, not patches on patches.',
      points: ['Leak detection & sealing', 'Shingle & flashing repair', 'Storm & hail damage triage'],
    },
    {
      key: 'replacement',
      name: 'Roof replacement',
      icon: '🏠',
      blurb:
        'A full tear-off and re-roof with manufacturer-backed systems. Itemized quotes show exactly what goes under, on, and around your new roof.',
      points: ['Full tear-off & re-roof', 'Ventilation & underlayment upgrades', 'Itemized, line-by-line quotes'],
    },
    {
      key: 'inspection',
      name: 'Roof inspection',
      icon: '🔍',
      blurb:
        'A 26-point roof inspection with a photo report and honest advice — buy, sell, file a claim, or plan ahead with real numbers.',
      points: ['26-point condition check', 'Photo report delivered fast', 'Flat rate — no obligation'],
    },
  ],
  serviceAreas: [
    'Dallas', 'Fort Worth', 'Plano', 'Arlington', 'Richardson', 'Garland',
    'Irving', 'Frisco', 'McKinney', 'Denton', 'Mesquite', 'Carrollton',
  ],
  financing: {
    title: 'Financing may be available at checkout',
    body:
      'Depending on merchant status and customer eligibility, financing or extended payment options may be offered on the secure Whop checkout page when you pay your deposit. Approval is decided by the payment provider at checkout — we never promise terms in advance.',
  },
  testimonials: [
    {
      quote:
        'They found the flashing leak two other companies missed and sent a photo report the same day. Quote was itemized and the crew was in and out before the rain came back.',
      author: 'Dana R.',
      area: 'Lake Highlands, Dallas',
    },
    {
      quote:
        'Our re-roof went exactly to the written schedule. Every line item matched the quote — no surprise "rot found" upcharges halfway through.',
      author: 'Marcus T.',
      area: 'Plano',
    },
    {
      quote:
        'Booked the flat-rate inspection after the hailstorm. Honest answer: only needed repairs, not a full replacement. That kind of honesty earns repeat business.',
      author: 'Priya S.',
      area: 'Richardson',
    },
  ],
  howItWorks: [
    {
      step: 1,
      title: 'Request an estimate',
      body: 'Tell us about your roof through the estimate form. It lands straight in our Whop CRM as a lead and we follow up fast.',
    },
    {
      step: 2,
      title: 'Book the inspection',
      body: 'Reserve a flat-rate inspection on this site and pay securely through Whop checkout. You get a photo report and a written quote.',
    },
    {
      step: 3,
      title: 'Approve & place the deposit',
      body: 'Happy with the quote? Approve it and start the project with a $500 deposit paid through Whop checkout.',
    },
    {
      step: 4,
      title: 'Build & final balance',
      body: 'We complete the work. The final balance is invoiced through Whop when the job is done — auto-charged to your saved card or paid by a manual invoice link.',
    },
  ],
  contact: {
    title: 'Talk to a roofer, not a call center',
    body: 'Call, email, or request an estimate. We answer with real schedules and real prices.',
  },
  /** Sample testimonials — clearly labeled in the UI. */
  testimonialsLabel: 'Sample testimonials — template content',
  footerDisclosure:
    'Summit Shield Roofing is a demonstration website template built on Whop Websites. Testimonials, statistics, and business claims are illustrative sample content, not statements of a real company. Replace all copy, plans, and contact details before launching a real roofing business.',
} as const

export type BusinessConfig = typeof business
