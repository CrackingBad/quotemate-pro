import { useState } from 'react';
import { Search, Package, Filter } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product } from '@/types';
import { ProductForm } from './ProductForm';
import { ProductCard } from './ProductCard';
import { CategorySettings } from './CategorySettings';

interface ProductsViewProps {
  products: Product[];
  onAdd: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  onUpdate: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  categories: string[];
  onAddCategory: (category: string) => boolean;
  onRemoveCategory: (category: string) => void;
  productCountByCategory: Record<string, number>;
}

export function ProductsView({ 
  products, 
  onAdd, 
  onUpdate, 
  onDelete, 
  categories, 
  onAddCategory,
  onRemoveCategory,
  productCountByCategory 
}: ProductsViewProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  // Get unique categories from products that exist
  const usedCategories = [...new Set(products.map(p => p.category).filter(Boolean))] as string[];
  const allCategories = [...new Set([...categories, ...usedCategories])];

  const categoryCounts = allCategories.reduce((acc, cat) => {
    acc[cat] = products.filter(p => p.category === cat).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Products</h2>
          <p className="text-muted-foreground">{products.length} products in catalog</p>
        </div>
        <div className="flex gap-2">
          <CategorySettings 
            categories={categories}
            onAddCategory={onAddCategory}
            onRemoveCategory={onRemoveCategory}
            productCountByCategory={productCountByCategory}
          />
          <ProductForm onSubmit={onAdd} categories={categories} onAddCategory={onAddCategory} />
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Search products..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {allCategories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat} ({categoryCounts[cat] || 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-lg">
          <Package className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">
            {searchQuery ? 'No products found' : 'No products yet'}
          </h3>
          <p className="text-muted-foreground">
            {searchQuery
              ? 'Try adjusting your search query'
              : 'Add your first product to get started'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredProducts.map(product => (
            <ProductCard
              key={product.id}
              product={product}
              onUpdate={onUpdate}
              onDelete={onDelete}
              categories={categories}
              onAddCategory={onAddCategory}
            />
          ))}
        </div>
      )}
    </div>
  );
}
