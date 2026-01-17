import { useState } from 'react';
import { Header } from '@/components/Header';
import { ProductsView } from '@/components/ProductsView';
import { QuotationBuilder } from '@/components/QuotationBuilder';
import { ArchiveView } from '@/components/ArchiveView';
import { useProducts } from '@/hooks/useProducts';
import { useQuotations } from '@/hooks/useQuotations';
import { useCompanyInfo } from '@/hooks/useCompanyInfo';
import { useTemplates } from '@/hooks/useTemplates';
import { useCategories } from '@/hooks/useCategories';

type TabType = 'products' | 'quotation' | 'archive';

const Index = () => {
  const [activeTab, setActiveTab] = useState<TabType>('products');
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const { quotations, saveQuotation, deleteQuotation } = useQuotations();
  const { companyInfo, updateCompanyInfo } = useCompanyInfo();
  const { templates, saveTemplate, deleteTemplate } = useTemplates();
  const { categories, addCategory, removeCategory } = useCategories();

  // Calculate product count per category
  const productCountByCategory = categories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

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
            categories={categories}
            onAddCategory={addCategory}
            onRemoveCategory={removeCategory}
            productCountByCategory={productCountByCategory}
          />
        )}

        {activeTab === 'quotation' && (
          <QuotationBuilder
            products={products}
            companyInfo={companyInfo}
            templates={templates}
            onUpdateCompanyInfo={updateCompanyInfo}
            onSaveTemplate={saveTemplate}
            onDeleteTemplate={deleteTemplate}
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
