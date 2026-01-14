export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  unitType: string;
  category?: string;
  imageUrl?: string;
  createdAt: Date;
}

export interface QuotationItem {
  product: Product;
  quantity: number;
}

export interface CompanyInfo {
  name: string;
  logo?: string;
  address: string;
  phone: string;
  email: string;
}

export interface Currency {
  code: string;
  symbol: string;
  name: string;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  discount: number;
  items: { productId: string; quantity: number }[];
  createdAt: Date;
}

export interface SavedQuotation {
  id: string;
  customerName: string;
  items: QuotationItem[];
  discount: number;
  subtotal: number;
  total: number;
  currency: string;
  companyInfo?: CompanyInfo;
  createdAt: Date;
}

export const UNIT_TYPES = [
  { value: 'piece', label: 'Piece' },
  { value: 'meter', label: 'Meter' },
  { value: 'box', label: 'Box' },
  { value: 'kg', label: 'Kilogram' },
  { value: 'liter', label: 'Liter' },
  { value: 'set', label: 'Set' },
  { value: 'pack', label: 'Pack' },
  { value: 'roll', label: 'Roll' },
  { value: 'sqm', label: 'Square Meter' },
] as const;

export const CURRENCIES: Currency[] = [
  { code: 'EGP', symbol: 'L.E', name: 'Egyptian Pound' },
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
  { code: 'CNY', symbol: '¥', name: 'Chinese Yuan' },
  { code: 'INR', symbol: '₹', name: 'Indian Rupee' },
  { code: 'PHP', symbol: '₱', name: 'Philippine Peso' },
  { code: 'SAR', symbol: 'ر.س', name: 'Saudi Riyal' },
  { code: 'AED', symbol: 'د.إ', name: 'UAE Dirham' },
];

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Your Company Name',
  address: '123 Business Street, City, Country',
  phone: '+1 (555) 123-4567',
  email: 'contact@yourcompany.com',
};
