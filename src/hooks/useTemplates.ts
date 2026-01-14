import { useState, useEffect } from 'react';
import { QuotationTemplate } from '@/types';

const STORAGE_KEY = 'quotation_templates';

export function useTemplates() {
  const [templates, setTemplates] = useState<QuotationTemplate[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setTemplates(parsed.map((t: QuotationTemplate) => ({ ...t, createdAt: new Date(t.createdAt) })));
      } catch {
        setTemplates([]);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(templates));
    }
  }, [templates, isLoaded]);

  const saveTemplate = (template: Omit<QuotationTemplate, 'id' | 'createdAt'>) => {
    const newTemplate: QuotationTemplate = {
      ...template,
      id: crypto.randomUUID(),
      createdAt: new Date(),
    };
    setTemplates(prev => [...prev, newTemplate]);
    return newTemplate;
  };

  const deleteTemplate = (id: string) => {
    setTemplates(prev => prev.filter(t => t.id !== id));
  };

  return { templates, saveTemplate, deleteTemplate, isLoaded };
}
