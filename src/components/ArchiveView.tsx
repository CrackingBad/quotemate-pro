import { useState } from 'react';
import { FileText, Trash2, Eye, Calendar, User, Package, Percent } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SavedQuotation, UNIT_TYPES } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
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

interface ArchiveViewProps {
  quotations: SavedQuotation[];
  onDelete: (id: string) => void;
}

export function ArchiveView({ quotations, onDelete }: ArchiveViewProps) {
  const [viewingQuotation, setViewingQuotation] = useState<SavedQuotation | null>(null);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  if (quotations.length === 0) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-bold text-foreground">Archive</h2>
          <p className="text-muted-foreground">View your saved quotations</p>
        </div>

        <div className="text-center py-16 bg-card border rounded-lg">
          <FileText className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No saved quotations</h3>
          <p className="text-muted-foreground">Your saved quotations will appear here</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-foreground">Archive</h2>
        <p className="text-muted-foreground">{quotations.length} saved quotations</p>
      </div>

      <div className="grid gap-4">
        {quotations.map(quotation => (
          <div
            key={quotation.id}
            className="bg-card border rounded-lg p-4 flex flex-col sm:flex-row sm:items-center gap-4 animate-fade-in"
          >
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-muted-foreground" />
                <h3 className="font-semibold truncate">{quotation.customerName}</h3>
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(quotation.createdAt)}
                </span>
                <span className="flex items-center gap-1">
                  <Package className="w-3.5 h-3.5" />
                  {quotation.items.length} products
                </span>
                {quotation.discount > 0 && (
                  <span className="flex items-center gap-1">
                    <Percent className="w-3.5 h-3.5" />
                    {quotation.discount}% discount
                  </span>
                )}
              </div>
            </div>

            <div className="text-right">
              <p className="text-2xl font-bold text-success">{formatPrice(quotation.total)}</p>
              {quotation.discount > 0 && (
                <p className="text-sm text-muted-foreground line-through">
                  {formatPrice(quotation.subtotal)}
                </p>
              )}
            </div>

            <div className="flex gap-2 sm:flex-col">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setViewingQuotation(quotation)}
                className="flex-1 sm:flex-auto"
              >
                <Eye className="w-4 h-4 sm:mr-2" />
                <span className="hidden sm:inline">View</span>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-destructive hover:text-destructive flex-1 sm:flex-auto"
                  >
                    <Trash2 className="w-4 h-4 sm:mr-2" />
                    <span className="hidden sm:inline">Delete</span>
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Quotation</AlertDialogTitle>
                    <AlertDialogDescription>
                      Are you sure you want to delete this quotation for "{quotation.customerName}"? This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => onDelete(quotation.id)}
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
          </div>
        ))}
      </div>

      {/* View Quotation Dialog */}
      <Dialog open={!!viewingQuotation} onOpenChange={() => setViewingQuotation(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Quotation Details</DialogTitle>
          </DialogHeader>
          {viewingQuotation && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-sm text-muted-foreground">Customer</p>
                  <p className="font-semibold text-lg">{viewingQuotation.customerName}</p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-muted-foreground">Date</p>
                  <p className="font-medium">{formatDate(viewingQuotation.createdAt)}</p>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="border-b bg-muted/50">
                      <th className="text-left px-4 py-2 text-sm font-medium text-muted-foreground">Product</th>
                      <th className="text-center px-4 py-2 text-sm font-medium text-muted-foreground">Qty</th>
                      <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Unit Price</th>
                      <th className="text-right px-4 py-2 text-sm font-medium text-muted-foreground">Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {viewingQuotation.items.map((item, idx) => {
                      const unitLabel = UNIT_TYPES.find(u => u.value === item.product.unitType)?.label || item.product.unitType;
                      return (
                        <tr key={idx} className="border-b last:border-0">
                          <td className="px-4 py-2">{item.product.name}</td>
                          <td className="px-4 py-2 text-center">{item.quantity}</td>
                          <td className="px-4 py-2 text-right text-muted-foreground">
                            {formatPrice(item.product.unitPrice)} / {unitLabel}
                          </td>
                          <td className="px-4 py-2 text-right font-medium">
                            {formatPrice(item.product.unitPrice * item.quantity)}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="bg-muted/50 rounded-lg p-4">
                <div className="max-w-xs ml-auto space-y-2">
                  <div className="flex justify-between text-muted-foreground">
                    <span>Subtotal</span>
                    <span>{formatPrice(viewingQuotation.subtotal)}</span>
                  </div>
                  {viewingQuotation.discount > 0 && (
                    <div className="flex justify-between text-destructive">
                      <span>Discount ({viewingQuotation.discount}%)</span>
                      <span>-{formatPrice(viewingQuotation.subtotal - viewingQuotation.total)}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span className="text-success">{formatPrice(viewingQuotation.total)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
