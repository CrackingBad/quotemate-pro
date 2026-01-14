import { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, Upload, X, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, UNIT_TYPES } from '@/types';
import { uploadProductImage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

interface ProductEntry {
  id: string;
  name: string;
  unitPrice: string;
  unitType: string;
  category: string;
  imageUrl: string;
  imageSource: 'url' | 'upload';
}

const createEmptyEntry = (): ProductEntry => ({
  id: crypto.randomUUID(),
  name: '',
  unitPrice: '',
  unitType: 'piece',
  category: '',
  imageUrl: '',
  imageSource: 'upload',
});

interface ProductFormProps {
  onSubmit: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  editProduct?: Product;
  onClose?: () => void;
  categories: string[];
  onAddCategory: (category: string) => boolean;
}

export function ProductForm({ onSubmit, editProduct, onClose, categories, onAddCategory }: ProductFormProps) {
  const [open, setOpen] = useState(!!editProduct);
  const [entries, setEntries] = useState<ProductEntry[]>(
    editProduct
      ? [{
          id: crypto.randomUUID(),
          name: editProduct.name,
          unitPrice: editProduct.unitPrice.toString(),
          unitType: editProduct.unitType,
          category: editProduct.category || '',
          imageUrl: editProduct.imageUrl || '',
          imageSource: 'upload',
        }]
      : [createEmptyEntry()]
  );
  const [uploading, setUploading] = useState<Record<string, boolean>>({});
  const [newCategory, setNewCategory] = useState('');
  const fileInputRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const updateEntry = (id: string, updates: Partial<ProductEntry>) => {
    setEntries(prev => prev.map(e => e.id === id ? { ...e, ...updates } : e));
  };

  const addEntry = () => {
    setEntries(prev => [...prev, createEmptyEntry()]);
  };

  const removeEntry = (id: string) => {
    if (entries.length > 1) {
      setEntries(prev => prev.filter(e => e.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const validEntries = entries.filter(e => e.name.trim() && e.unitPrice);
    if (validEntries.length === 0) return;

    validEntries.forEach(entry => {
      onSubmit({
        name: entry.name.trim(),
        unitPrice: parseFloat(entry.unitPrice),
        unitType: entry.unitType,
        category: entry.category || undefined,
        imageUrl: entry.imageUrl.trim() || undefined,
      });
    });

    if (!editProduct) {
      setEntries([createEmptyEntry()]);
    }
    setOpen(false);
    onClose?.();
    
    toast({
      title: editProduct ? 'Product updated' : `${validEntries.length} product(s) added`,
      description: editProduct ? 'Product has been updated successfully.' : `Successfully added ${validEntries.length} product(s) to catalog.`,
    });
  };

  const handleFileUpload = async (entryId: string, e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast({
        title: 'Invalid file type',
        description: 'Please select an image file.',
        variant: 'destructive',
      });
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: 'File too large',
        description: 'Please select an image under 5MB.',
        variant: 'destructive',
      });
      return;
    }

    setUploading(prev => ({ ...prev, [entryId]: true }));
    try {
      const url = await uploadProductImage(file);
      if (url) {
        updateEntry(entryId, { imageUrl: url });
        toast({
          title: 'Image uploaded',
          description: 'Product image uploaded successfully.',
        });
      } else {
        toast({
          title: 'Upload failed',
          description: 'Failed to upload image. Please try again.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload image. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setUploading(prev => ({ ...prev, [entryId]: false }));
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      if (!editProduct) {
        setEntries([createEmptyEntry()]);
      }
      onClose?.();
    }
  };

  const clearImage = (entryId: string) => {
    updateEntry(entryId, { imageUrl: '' });
    const ref = fileInputRefs.current[entryId];
    if (ref) ref.value = '';
  };

  const handleAddCategory = () => {
    if (newCategory.trim() && onAddCategory(newCategory.trim())) {
      setNewCategory('');
      toast({
        title: 'Category added',
        description: `"${newCategory.trim()}" has been added to categories.`,
      });
    }
  };

  const renderEntryForm = (entry: ProductEntry, index: number) => (
    <div key={entry.id} className="space-y-4 p-4 border rounded-lg bg-muted/30">
      {!editProduct && entries.length > 1 && (
        <div className="flex justify-between items-center">
          <span className="text-sm font-medium text-muted-foreground">Product {index + 1}</span>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => removeEntry(entry.id)}
            className="text-destructive hover:text-destructive"
          >
            <Trash2 className="w-4 h-4" />
          </Button>
        </div>
      )}

      <div className="space-y-2">
        <Label>Product Name</Label>
        <Input
          value={entry.name}
          onChange={e => updateEntry(entry.id, { name: e.target.value })}
          placeholder="Enter product name"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label>Unit Price</Label>
          <Input
            type="number"
            step="0.01"
            min="0"
            value={entry.unitPrice}
            onChange={e => updateEntry(entry.id, { unitPrice: e.target.value })}
            placeholder="0.00"
            required
          />
        </div>

        <div className="space-y-2">
          <Label>Unit Type</Label>
          <Select value={entry.unitType} onValueChange={v => updateEntry(entry.id, { unitType: v })}>
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
        <Label>Category (optional)</Label>
        <div className="flex gap-2">
          <Select value={entry.category} onValueChange={v => updateEntry(entry.id, { category: v === 'none' ? '' : v })}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">No category</SelectItem>
              {categories.map(cat => (
                <SelectItem key={cat} value={cat}>
                  {cat}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 mt-2">
          <Input
            placeholder="Add new category..."
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
            className="flex-1"
          />
          <Button type="button" variant="outline" size="sm" onClick={handleAddCategory}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <Label>Product Image (optional)</Label>
        <Tabs value={entry.imageSource} onValueChange={(v) => updateEntry(entry.id, { imageSource: v as 'url' | 'upload' })}>
          <TabsList className="w-full">
            <TabsTrigger value="upload" className="flex-1">
              <Upload className="w-4 h-4 mr-2" />
              Upload
            </TabsTrigger>
            <TabsTrigger value="url" className="flex-1">
              <ImageIcon className="w-4 h-4 mr-2" />
              URL
            </TabsTrigger>
          </TabsList>
          <TabsContent value="upload" className="mt-2">
            <input
              ref={el => fileInputRefs.current[entry.id] = el}
              type="file"
              accept="image/*"
              onChange={e => handleFileUpload(entry.id, e)}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRefs.current[entry.id]?.click()}
              disabled={uploading[entry.id]}
            >
              {uploading[entry.id] ? (
                'Uploading...'
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Choose Image
                </>
              )}
            </Button>
          </TabsContent>
          <TabsContent value="url" className="mt-2">
            <Input
              type="url"
              value={entry.imageUrl}
              onChange={e => updateEntry(entry.id, { imageUrl: e.target.value })}
              placeholder="https://example.com/image.jpg"
            />
          </TabsContent>
        </Tabs>
      </div>

      {entry.imageUrl && (
        <div className="relative w-full h-32 bg-muted rounded-lg overflow-hidden">
          <img
            src={entry.imageUrl}
            alt="Preview"
            className="w-full h-full object-cover"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
          <button
            type="button"
            onClick={() => clearImage(entry.id)}
            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );

  const formContent = (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-2">
        {entries.map((entry, index) => renderEntryForm(entry, index))}
      </div>

      {!editProduct && (
        <Button type="button" variant="outline" onClick={addEntry} className="w-full">
          <Plus className="w-4 h-4 mr-2" />
          Add Another Product
        </Button>
      )}

      <div className="flex justify-end gap-2 pt-2 border-t">
        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={Object.values(uploading).some(Boolean)}>
          {editProduct ? 'Save Changes' : `Add ${entries.filter(e => e.name.trim() && e.unitPrice).length || ''} Product(s)`}
        </Button>
      </div>
    </form>
  );

  if (editProduct) {
    return (
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Edit Product</DialogTitle>
          </DialogHeader>
          {formContent}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Add Products
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add Products</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
