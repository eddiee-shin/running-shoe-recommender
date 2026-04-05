export interface Shoe {
  id: number;
  likes: number;
  title: string;
  brand: string;
  model: string;
  type: string;
  rating: number;
  review_count: number;
  pace_score: number;
  cushion_score: number;
  mileage_score: number;
  weight_g: number;
  drop_mm: number;
  stack_height_mm: number;
  price_usd: number;
  one_liner: string;
  image: string;
  tags: string[];
  updated: string;
  source: string;
  release_year: number;
}

export interface UserPreferences {
  shoeType: string;
  cushion: 'low' | 'medium' | 'high' | 'any';
  pace: 'casual' | 'moderate' | 'fast' | 'any';
  mileage: 'low' | 'medium' | 'high' | 'any';
  budget: 'any' | 'budget' | 'mid' | 'premium';
  releaseYear: 'any' | '2026' | '2025' | '2024';
  useCase: string;
}

export const SHOE_TYPES = ['Daily Trainer', 'Race Day/Carbon', 'Tempo/Interval', 'Recovery', 'Trail'];

export const TYPE_EMOJIS: Record<string, string> = {
  'Daily Trainer': '🏃',
  'Race Day/Carbon': '🏅',
  'Tempo/Interval': '⚡',
  'Recovery': '🛋️',
  'Trail': '🏔️',
};

export const TYPE_LABELS: Record<string, string> = {
  'Daily Trainer': '데일리 트레이너',
  'Race Day/Carbon': '카본 레이싱화',
  'Tempo/Interval': '템포/인터벌',
  'Recovery': '리커버리',
  'Trail': '트레일',
};

export function resolveImagePath(image: string): string {
  if (!image) return '/images/placeholder.jpg';
  if (image.startsWith('http')) return image;
  if (image.startsWith('images/')) return '/' + image;
  if (image.startsWith('image/')) return '/' + image;
  if (image.startsWith('/')) return image;
  return '/images/' + image;
}
