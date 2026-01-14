import { useState, useRef } from 'react';
import { Plus, Image as ImageIcon, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Product, UNIT_TYPES } from '@/types';
import { uploadProductImage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

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
  const [imageSource, setImageSource] = useState<'url' | 'upload'>('upload');
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setImageUrl(url);
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
      setUploading(false);
    }
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) onClose?.();
  };

  const clearImage = () => {
    setImageUrl('');
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
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
        <Label>Product Image (optional)</Label>
        <Tabs value={imageSource} onValueChange={(v) => setImageSource(v as 'url' | 'upload')}>
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
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
            />
            <Button
              type="button"
              variant="outline"
              className="w-full"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
            >
              {uploading ? (
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
              value={imageUrl}
              onChange={e => setImageUrl(e.target.value)}
              placeholder="https://example.com/image.jpg"
            />
          </TabsContent>
        </Tabs>
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
          <button
            type="button"
            onClick={clearImage}
            className="absolute top-2 right-2 p-1 bg-destructive text-destructive-foreground rounded-full hover:bg-destructive/90"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      <div className="flex justify-end gap-2 pt-2">
        <Button type="button" variant="outline" onClick={() => handleOpenChange(false)}>
          Cancel
        </Button>
        <Button type="submit" disabled={uploading}>
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
