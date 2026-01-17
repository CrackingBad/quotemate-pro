import { useState } from 'react';
import { Tags, Plus, Trash2, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
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

interface CategorySettingsProps {
  categories: string[];
  onAddCategory: (category: string) => boolean;
  onRemoveCategory: (category: string) => void;
  productCountByCategory: Record<string, number>;
}

export function CategorySettings({ 
  categories, 
  onAddCategory, 
  onRemoveCategory,
  productCountByCategory 
}: CategorySettingsProps) {
  const [open, setOpen] = useState(false);
  const [newCategory, setNewCategory] = useState('');

  const handleAddCategory = () => {
    const trimmed = newCategory.trim();
    if (trimmed && onAddCategory(trimmed)) {
      setNewCategory('');
      toast({
        title: 'Category added',
        description: `"${trimmed}" has been added to categories.`,
      });
    } else if (categories.includes(trimmed)) {
      toast({
        title: 'Category exists',
        description: 'This category already exists.',
        variant: 'destructive',
      });
    }
  };

  const handleRemoveCategory = (category: string) => {
    onRemoveCategory(category);
    toast({
      title: 'Category removed',
      description: `"${category}" has been removed.`,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Tags className="w-4 h-4 mr-2" />
          Categories
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Manage Categories</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Add New Category</Label>
            <div className="flex gap-2">
              <Input
                placeholder="Enter category name..."
                value={newCategory}
                onChange={e => setNewCategory(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddCategory())}
                className="flex-1"
              />
              <Button type="button" onClick={handleAddCategory} disabled={!newCategory.trim()}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Existing Categories ({categories.length})</Label>
            <div className="max-h-64 overflow-y-auto space-y-2">
              {categories.length === 0 ? (
                <p className="text-center text-muted-foreground py-4">No categories created yet</p>
              ) : (
                categories.map(category => {
                  const count = productCountByCategory[category] || 0;
                  return (
                    <div 
                      key={category} 
                      className="flex items-center justify-between p-3 border rounded-lg bg-muted/30"
                    >
                      <div>
                        <p className="font-medium">{category}</p>
                        <p className="text-sm text-muted-foreground">
                          {count} product{count !== 1 ? 's' : ''}
                        </p>
                      </div>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="outline" 
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete Category</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete "{category}"?
                              {count > 0 && (
                                <span className="block mt-2 text-warning">
                                  This category has {count} product{count !== 1 ? 's' : ''}. 
                                  Products will not be deleted, but their category will be cleared.
                                </span>
                              )}
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleRemoveCategory(category)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
