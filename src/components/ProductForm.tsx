import { useState } from 'react';
import { Plus, Image as ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Product, UNIT_TYPES } from '@/types';

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  editProduct?: Product;
  onClose?: () => void;
}

export function ProductForm({ onSubmit, editProduct, onClose }: ProductFormProps) {
  const [open, setOpen] = useState(!!editProduct);
  const [name, setName] = useState(editProduct?.name || '');
  const [unitPrice, setUnitPrice] = useState(editProduct?.unitPrice?.toString() || '');
  const [unitType, setUnitType] = useState(editProduct?.unitType || 'piece');
  const [imageUrl, setImageUrl] = useState(editProduct?.imageUrl || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !unitPrice) return;

    onSubmit({
      name: name.trim(),
      unitPrice: parseFloat(unitPrice),
      unitType,
      imageUrl: imageUrl.trim() || undefined,
    });

    if (!editProduct) {
      setName('');
      setUnitPrice('');
      setUnitType('piece');
      setImageUrl('');
    }
    setOpen(false);
    onClose?.();
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) onClose?.();
  };

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Product Name</Label>
        <Input
          id="name"
          value={name}
          onChange={e => setName(e.target.value)}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="price">Unit Price</Label>
          <Input
            id="price"
            type="number"
            step="0.01"
            min="0"
            value={unitPrice}
            onChange={e => setUnitPrice(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="unit">Unit Type</Label>
          <Select value={unitType} onValueChange={setUnitType}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {UNIT_TYPES.map(unit => (
                <SelectItem key={unit.value} value={unit.value}>
                  {unit.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Image URL (optional)</Label>
        <Input
          id="image"
          type="url"
          value={imageUrl}
          onChange={e => setImageUrl(e.target.value)}
          placeholder="https://example.com/image.jpg"
        />
      </div>

      {imageUrl && (
        <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
          <img
            src={imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit">
          {editProduct ? 'Save Changes' : 'Add Product'}
        </Button>
      </div>
    </form>
  );

  if (editProduct) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
