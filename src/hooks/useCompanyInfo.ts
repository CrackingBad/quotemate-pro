import { useState, useEffect } from 'react';
import { CompanyInfo, DEFAULT_COMPANY_INFO } from '@/types';

const STORAGE_KEY = 'company_info';

export function useCompanyInfo() {
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo>(DEFAULT_COMPANY_INFO);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        setCompanyInfo(JSON.parse(stored));
      } catch {
        setCompanyInfo(DEFAULT_COMPANY_INFO);
      }
    }
    setIsLoaded(true);
  }, []);

  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(companyInfo));
    }
  }, [companyInfo, isLoaded]);

  const updateCompanyInfo = (updates: Partial<CompanyInfo>) => {
    setCompanyInfo(prev => ({ ...prev, ...updates }));
  };

  return { companyInfo, updateCompanyInfo, isLoaded };
}
