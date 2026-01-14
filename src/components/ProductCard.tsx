import { useState } from 'react';
import { Edit2, Trash2, Package, Plus, ZoomIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Product, UNIT_TYPES } from '@/types';
import { ProductForm } from './ProductForm';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';

interface ProductCardProps {
  product: Product;
  onUpdate: (id: string, updates: Partial<Omit<Product, 'id' | 'createdAt'>>) => void;
  onDelete: (id: string) => void;
  onAddToQuotation?: (product: Product) => void;
  showAddButton?: boolean;
  categories?: string[];
  onAddCategory?: (category: string) => boolean;
}

export function ProductCard({ product, onUpdate, onDelete, onAddToQuotation, showAddButton, categories = [], onAddCategory }: ProductCardProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [showImageZoom, setShowImageZoom] = useState(false);

  const unitLabel = UNIT_TYPES.find(u => u.value === product.unitType)?.label || product.unitType;

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  return (
    <>
      <div className="bg-card border rounded-lg overflow-hidden shadow-elevated hover:shadow-elevated-lg transition-shadow animate-fade-in">
        <div className="relative h-40 bg-muted">
          {product.imageUrl ? (
            <>
              <img
                src={product.imageUrl}
                alt={product.name}
                className="w-full h-full object-cover cursor-pointer"
                onClick={() => setShowImageZoom(true)}
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <button
                onClick={() => setShowImageZoom(true)}
                className="absolute bottom-2 right-2 p-1.5 bg-background/80 rounded-md hover:bg-background transition-colors"
              >
                <ZoomIn className="w-4 h-4 text-muted-foreground" />
              </button>
            </>
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <Package className="w-12 h-12 text-muted-foreground/50" />
            </div>
          )}
        </div>

        <div className="p-4">
          <h3 className="font-semibold text-foreground truncate" title={product.name}>
            {product.name}
          </h3>
          <div className="mt-2 flex items-baseline gap-1">
            <span className="text-lg font-bold text-success">{formatPrice(product.unitPrice)}</span>
            <span className="text-sm text-muted-foreground">/ {unitLabel}</span>
          </div>

          <div className="mt-4 flex items-center gap-2">
            {showAddButton && onAddToQuotation && (
              <Button
                size="sm"
                onClick={() => onAddToQuotation(product)}
                className="flex-1"
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            )}
            <Button
              size="sm"
              variant="outline"
              onClick={() => setIsEditing(true)}
            >
              <Edit2 className="w-4 h-4" />
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="sm" variant="outline" className="text-destructive hover:text-destructive">
                  <Trash2 className="w-4 h-4" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Product</AlertDialogTitle>
                  <AlertDialogDescription>
                    Are you sure you want to delete "{product.name}"? This action cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => onDelete(product.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {isEditing && (
        <ProductForm
          editProduct={product}
          onSubmit={(updates) => {
            onUpdate(product.id, updates);
            setIsEditing(false);
          }}
          onClose={() => setIsEditing(false)}
          categories={categories}
          onAddCategory={onAddCategory || (() => false)}
        />
      )}

      <Dialog open={showImageZoom} onOpenChange={setShowImageZoom}>
        <DialogContent className="max-w-3xl p-2">
          {product.imageUrl && (
            <img
              src={product.imageUrl}
              alt={product.name}
              className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
            />
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
