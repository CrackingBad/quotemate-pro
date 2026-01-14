export interface Product {
  id: string;
  name: string;
  unitPrice: number;
  unitType: string;
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

export interface SavedQuotation {
  id: string;
  customerName: string;
  items: QuotationItem[];
  discount: number;
  subtotal: number;
  total: number;
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

export const DEFAULT_COMPANY_INFO: CompanyInfo = {
  name: 'Your Company Name',
  address: '123 Business Street, City, Country',
  phone: '+1 (555) 123-4567',
  email: 'contact@yourcompany.com',
};
