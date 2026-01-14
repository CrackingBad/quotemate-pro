import { useState, useEffect } from 'react';
import { CURRENCIES } from '@/types';

const STORAGE_KEY = 'selected_currency';

export function useCurrency() {
  const [currency, setCurrency] = useState('USD');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setCurrency(stored);
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, currency);
    }
  }, [currency, isLoaded]);

  const formatPrice = (price: number) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'symbol',
    }).format(price);
  };

  return { currency, setCurrency, formatPrice, isLoaded };
}
