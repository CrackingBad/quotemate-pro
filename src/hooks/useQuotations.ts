import { useState, useEffect } from 'react';
import { SavedQuotation } from '@/types';

const STORAGE_KEY = 'saved_quotations';

export function useQuotations() {
  const [quotations, setQuotations] = useState<SavedQuotation[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setQuotations(parsed.map((q: SavedQuotation) => ({ 
          ...q, 
          createdAt: new Date(q.createdAt) 
        })));
      } catch {
        setQuotations([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(quotations));
    }
  }, [quotations, isLoaded]);

  const saveQuotation = (quotation: Omit<SavedQuotation, 'id' | 'createdAt'>) => {
    const newQuotation: SavedQuotation = {
      ...quotation,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setQuotations(prev => [newQuotation, ...prev]);
    return newQuotation;
  };

  const deleteQuotation = (id: string) => {
    setQuotations(prev => prev.filter(q => q.id !== id));
  };

  return { quotations, saveQuotation, deleteQuotation, isLoaded };
}
