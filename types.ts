export interface MarketPrice {
  marketName: string;
  city: string;
  price: number; // Today's Price
  yesterdayPrice: number;
  lastWeekPrice: number;
  unit: string;
  quality: 'Premium' | 'Standard' | 'Fair';
  trend: 'up' | 'down' | 'stable';
  lastUpdated: string; // Date
  reportTime: string; // Time string e.g., "10:30 AM"
  verified: boolean;
  reportedBy: string;
}

export interface PriceHistory {
  date: string;
  price: number;
}

export interface ItemData {
  name: string;
  nameUr: string;
  category: string;
  categoryUr: string;
  averagePrice: number;
  description: string;
  descriptionUr: string;
  imageUrl?: string;
  markets: MarketPrice[];
  history: PriceHistory[];
  sourceUrls: string[]; 
}

export interface SearchState {
  query: string;
  data: ItemData | null;
  loading: boolean;
  error: string | null;
}

export type Language = 'en' | 'ur';