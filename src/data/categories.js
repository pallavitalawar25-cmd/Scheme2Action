import { GraduationCap, Wheat, HeartPulse, Baby, Home, PiggyBank, Briefcase, ShoppingBasket } from 'lucide-react';

// Each category owns an accent colour used by cards, hero and badges.
export const categories = [
  { slug: 'education', icon: GraduationCap, accent: '#2f7fd1' },
  { slug: 'agriculture', icon: Wheat, accent: '#0e9a66' },
  { slug: 'healthcare', icon: HeartPulse, accent: '#e5593f' },
  { slug: 'women-children', icon: Baby, accent: '#c2468b' },
  { slug: 'housing', icon: Home, accent: '#235579' },
  { slug: 'pension', icon: PiggyBank, accent: '#b7791f' },
  { slug: 'employment', icon: Briefcase, accent: '#4f46a5' },
  { slug: 'food', icon: ShoppingBasket, accent: '#d9730d' },
];

export const getCategory = (slug) => categories.find((c) => c.slug === slug);
