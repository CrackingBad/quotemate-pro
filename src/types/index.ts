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

export interface SavedQuotation {
  id: string;
  customerName: string;
  items: QuotationItem[];
  discount: number;
  subtotal: number;
  total: number;
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
