import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProductsView } from '@/components/ProductsView';
import { QuotationBuilder } from '@/components/QuotationBuilder';
import { ArchiveView } from '@/components/ArchiveView';
import { useProducts } from '@/hooks/useProducts';
import { useQuotations } from '@/hooks/useQuotations';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';

type TabType = 'products' | 'quotation' | 'archive';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { quotations, saveQuotation, deleteQuotation } = useQuotations();
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();

  return (
    <div className="min-h-screen bg-background">
      <Header activeTab={activeTab} onTabChange={setActiveTab} />
      
      <main className="container mx-auto px-4 py-8">
        {activeTab === 'products' && (
          <ProductsView
            products={products}
            onAdd={addProduct}
            onUpdate={updateProduct}
            onDelete={deleteProduct}
          />
        )}

        {activeTab === 'quotation' && (
          <QuotationBuilder
            products={products}
            companyInfo={companyInfo}
            onUpdateCompanyInfo={updateCompanyInfo}
            onSave={saveQuotation}
          />
        )}

        {activeTab === 'archive' && (
          <ArchiveView
            quotations={quotations}
            companyInfo={companyInfo}
            onDelete={deleteQuotation}
          />
        )}
      </main>
    </div>
  );
};

export default Index;
