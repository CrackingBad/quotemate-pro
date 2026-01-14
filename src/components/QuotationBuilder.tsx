import { useState } from 'react';
import { Search, Plus, Minus, Trash2, Printer, Save, ShoppingCart, FileDown, Check, Coins, BookTemplate } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Product, QuotationItem, CompanyInfo, QuotationTemplate, UNIT_TYPES, CURRENCIES } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { downloadQuotationPDF } from '@/lib/pdf';
import { CompanySettings } from './CompanySettings';

interface QuotationBuilderProps {
  products: Product[];
  companyInfo: CompanyInfo;
  templates: QuotationTemplate[];
  onUpdateCompanyInfo: (updates: Partial<CompanyInfo>) => void;
  onSaveTemplate: (template: Omit<QuotationTemplate, 'id' | 'createdAt'>) => void;
  onDeleteTemplate: (id: string) => void;
  onSave: (quotation: {
    customerName: string;
    items: QuotationItem[];
    discount: number;
    subtotal: number;
    total: number;
    currency: string;
    companyInfo: CompanyInfo;
  }) => void;
}

export function QuotationBuilder({ 
  products, 
  companyInfo, 
  templates,
  onUpdateCompanyInfo, 
  onSaveTemplate,
  onDeleteTemplate,
  onSave 
}: QuotationBuilderProps) {
  const [items, setItems] = useState<QuotationItem[]>([]);
  const [discount, setDiscount] = useState(0);
  const [customerName, setCustomerName] = useState('');
  const [currency, setCurrency] = useState('EGP');
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showProductPicker, setShowProductPicker] = useState(false);
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [showTemplates, setShowTemplates] = useState(false);

  const filteredProducts = products.filter(p => {
    const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || p.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const formatPrice = (price: number) => {
    const currencyInfo = CURRENCIES.find(c => c.code === currency);
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(price);
  };

  const toggleProductSelection = (productId: string) => {
    setSelectedProducts(prev => {
      const next = new Set(prev);
      if (next.has(productId)) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });
  };

  const addSelectedProducts = () => {
    const productsToAdd = products.filter(p => selectedProducts.has(p.id));
    
    setItems(prevItems => {
      const newItems = [...prevItems];
      
      productsToAdd.forEach(product => {
        const existingIndex = newItems.findIndex(i => i.product.id === product.id);
        if (existingIndex >= 0) {
          newItems[existingIndex] = {
            ...newItems[existingIndex],
            quantity: newItems[existingIndex].quantity + 1
          };
        } else {
          newItems.push({ product, quantity: 1 });
        }
      });
      
      return newItems;
    });

    setSelectedProducts(new Set());
    setShowProductPicker(false);
    setSearchQuery('');
    setCategoryFilter('all');
    
    toast({
      title: 'Products added',
      description: `Added ${productsToAdd.length} product(s) to quotation.`,
    });
  };

  const updateQuantity = (productId: string, delta: number) => {
    setItems(items.map(i => {
      if (i.product.id === productId) {
        const newQty = Math.max(1, i.quantity + delta);
        return { ...i, quantity: newQty };
      }
      return i;
    }));
  };

  const setQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) return;
    setItems(items.map(i =>
      i.product.id === productId ? { ...i, quantity } : i
    ));
  };

  const removeItem = (productId: string) => {
    setItems(items.filter(i => i.product.id !== productId));
  };

  const subtotal = items.reduce((sum, i) => sum + i.product.unitPrice * i.quantity, 0);
  const discountAmount = subtotal * (discount / 100);
  const total = subtotal - discountAmount;

  const handleSave = () => {
    if (!customerName.trim()) {
      toast({
        title: 'Customer name required',
        description: 'Please enter a customer name to save the quotation.',
        variant: 'destructive',
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: 'No items',
        description: 'Add at least one product to the quotation.',
        variant: 'destructive',
      });
      return;
    }

    onSave({
      customerName: customerName.trim(),
      items,
      discount,
      subtotal,
      total,
      currency,
      companyInfo,
    });

    setItems([]);
    setDiscount(0);
    setCustomerName('');
    toast({
      title: 'Quotation saved',
      description: 'The quotation has been saved to your archive.',
    });
  };

  const handleSaveAsTemplate = () => {
    if (!templateName.trim()) {
      toast({
        title: 'Template name required',
        description: 'Please enter a name for the template.',
        variant: 'destructive',
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: 'No items',
        description: 'Add at least one product to save as template.',
        variant: 'destructive',
      });
      return;
    }

    onSaveTemplate({
      name: templateName.trim(),
      discount,
      items: items.map(i => ({ productId: i.product.id, quantity: i.quantity })),
    });

    setTemplateName('');
    setShowSaveTemplate(false);
    toast({
      title: 'Template saved',
      description: 'Quotation template has been saved.',
    });
  };

  const loadTemplate = (template: QuotationTemplate) => {
    const templateItems: QuotationItem[] = [];
    template.items.forEach(ti => {
      const product = products.find(p => p.id === ti.productId);
      if (product) {
        templateItems.push({ product, quantity: ti.quantity });
      }
    });
    setItems(templateItems);
    setDiscount(template.discount);
    setShowTemplates(false);
    toast({
      title: 'Template loaded',
      description: `Loaded template "${template.name}".`,
    });
  };

  const handleExportPDF = () => {
    if (!customerName.trim()) {
      toast({
        title: 'Customer name required',
        description: 'Please enter a customer name to export the quotation.',
        variant: 'destructive',
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: 'No items',
        description: 'Add at least one product to export.',
        variant: 'destructive',
      });
      return;
    }

    downloadQuotationPDF({
      customerName: customerName.trim(),
      items,
      discount,
      subtotal,
      total,
    }, companyInfo, currency);

    toast({
      title: 'PDF exported',
      description: 'Quotation has been downloaded as PDF.',
    });
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between no-print">
        <div>
          <h2 className="text-2xl font-bold text-foreground">New Quotation</h2>
          <p className="text-muted-foreground">Build and customize your price quotation</p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <CompanySettings companyInfo={companyInfo} onUpdate={onUpdateCompanyInfo} />
          
          {/* Templates Button */}
          <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookTemplate className="w-4 h-4 mr-2" />
                Templates
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Quotation Templates</DialogTitle>
              </DialogHeader>
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {templates.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No templates saved yet</p>
                ) : (
                  templates.map(template => (
                    <div key={template.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{template.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {template.items.length} items • {template.discount}% discount
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => loadTemplate(template)}>
                          Load
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline" 
                          className="text-destructive"
                          onClick={() => onDeleteTemplate(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </DialogContent>
          </Dialog>

          <Dialog open={showProductPicker} onOpenChange={(open) => {
            setShowProductPicker(open);
            if (!open) {
              setSelectedProducts(new Set());
              setSearchQuery('');
              setCategoryFilter('all');
            }
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Add Products
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Select Products</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search products..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
                <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="All categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All categories</SelectItem>
                    {[...new Set(products.map(p => p.category).filter(Boolean))].map(cat => (
                      <SelectItem key={cat} value={cat as string}>
                        {cat}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="max-h-64 overflow-y-auto space-y-2">
                  {filteredProducts.length === 0 ? (
                    <p className="text-center text-muted-foreground py-4">No products found</p>
                  ) : (
                    filteredProducts.map(product => (
                      <label
                        key={product.id}
                        className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors ${
                          selectedProducts.has(product.id) 
                            ? 'bg-primary/10 border-primary' 
                            : 'hover:bg-accent'
                        }`}
                      >
                        <Checkbox
                          checked={selectedProducts.has(product.id)}
                          onCheckedChange={() => toggleProductSelection(product.id)}
                        />
                        <div className="w-10 h-10 bg-muted rounded-md overflow-hidden flex-shrink-0">
                          {product.imageUrl ? (
                            <img src={product.imageUrl} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                              <ShoppingCart className="w-4 h-4" />
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{product.name}</p>
                          <p className="text-sm text-success">{formatPrice(product.unitPrice)}</p>
                          {product.category && (
                            <p className="text-xs text-muted-foreground">
                              {product.category}
                            </p>
                          )}
                        </div>
                      </label>
                    ))
                  )}
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  onClick={() => setShowProductPicker(false)}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={addSelectedProducts}
                  disabled={selectedProducts.size === 0}
                >
                  <Check className="w-4 h-4 mr-2" />
                  Add {selectedProducts.size > 0 ? `(${selectedProducts.size})` : ''}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Customer Name and Currency */}
      <div className="bg-card border rounded-lg p-4 no-print">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="customerName">Customer Name</Label>
            <Input
              id="customerName"
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Enter customer name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="currency">Currency</Label>
            <Select value={currency} onValueChange={setCurrency}>
              <SelectTrigger className="mt-2">
                <Coins className="w-4 h-4 mr-2" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CURRENCIES.map(curr => (
                  <SelectItem key={curr.code} value={curr.code}>
                    {curr.symbol} {curr.code} - {curr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Print Header */}
      <div className="print-only text-center pb-6 border-b mb-6">
        {companyInfo.logo && (
          <img src={companyInfo.logo} alt="Company Logo" className="h-16 mx-auto mb-4 object-contain" />
        )}
        <h1 className="text-2xl font-bold">{companyInfo.name}</h1>
        <p className="text-sm text-muted-foreground">{companyInfo.address}</p>
        <p className="text-sm text-muted-foreground">Phone: {companyInfo.phone} | Email: {companyInfo.email}</p>
        <h2 className="text-3xl font-bold mt-6">Price Quotation</h2>
        {customerName && <p className="text-lg mt-2">Customer: {customerName}</p>}
        <p className="text-muted-foreground mt-1">Date: {new Date().toLocaleDateString()}</p>
      </div>

      {/* Items Table */}
      {items.length === 0 ? (
        <div className="text-center py-16 bg-card border rounded-lg">
          <ShoppingCart className="w-12 h-12 mx-auto text-muted-foreground/50 mb-4" />
          <h3 className="text-lg font-medium text-foreground mb-1">No items yet</h3>
          <p className="text-muted-foreground">Add products to start building your quotation</p>
        </div>
      ) : (
        <div className="bg-card border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b bg-muted/50">
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">Product</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Unit Price</th>
                  <th className="text-center px-4 py-3 font-medium text-muted-foreground">Quantity</th>
                  <th className="text-right px-4 py-3 font-medium text-muted-foreground">Total</th>
                  <th className="w-16 no-print"></th>
                </tr>
              </thead>
              <tbody>
                {items.map(item => {
                  const unitLabel = UNIT_TYPES.find(u => u.value === item.product.unitType)?.label || item.product.unitType;
                  const lineTotal = item.product.unitPrice * item.quantity;
                  return (
                    <tr key={item.product.id} className="border-b last:border-0">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-muted rounded overflow-hidden flex-shrink-0">
                            {item.product.imageUrl ? (
                              <img src={item.product.imageUrl} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                <ShoppingCart className="w-4 h-4" />
                              </div>
                            )}
                          </div>
                          <div>
                            <p className="font-medium">{item.product.name}</p>
                            <p className="text-sm text-muted-foreground print-only">
                              {formatPrice(item.product.unitPrice)} / {unitLabel}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-center no-print">
                        <span className="text-muted-foreground">
                          {formatPrice(item.product.unitPrice)} / {unitLabel}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8 no-print"
                            onClick={() => updateQuantity(item.product.id, -1)}
                          >
                            <Minus className="w-3 h-3" />
                          </Button>
                          <Input
                            type="number"
                            min={1}
                            value={item.quantity}
                            onChange={e => setQuantity(item.product.id, parseInt(e.target.value) || 1)}
                            className="w-16 text-center no-print"
                          />
                          <span className="print-only font-medium">{item.quantity}</span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="w-8 h-8 no-print"
                            onClick={() => updateQuantity(item.product.id, 1)}
                          >
                            <Plus className="w-3 h-3" />
                          </Button>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-success">
                        {formatPrice(lineTotal)}
                      </td>
                      <td className="px-4 py-3 no-print">
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive hover:text-destructive"
                          onClick={() => removeItem(item.product.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Totals */}
      {items.length > 0 && (
        <div className="bg-card border rounded-lg p-6">
          <div className="max-w-xs ml-auto space-y-3">
            <div className="flex justify-between text-muted-foreground">
              <span>Subtotal</span>
              <span>{formatPrice(subtotal)}</span>
            </div>

            <div className="flex items-center justify-between gap-4 no-print">
              <Label htmlFor="discount" className="text-muted-foreground">Discount (%)</Label>
              <Input
                id="discount"
                type="number"
                min={0}
                max={100}
                value={discount}
                onChange={e => setDiscount(Math.min(100, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-24 text-right"
              />
            </div>

            {discount > 0 && (
              <div className="flex justify-between text-destructive">
                <span>Discount ({discount}%)</span>
                <span>-{formatPrice(discountAmount)}</span>
              </div>
            )}

            <div className="flex justify-between text-lg font-bold border-t pt-3">
              <span>Total</span>
              <span className="text-success">{formatPrice(total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* Actions */}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-3 justify-end no-print">
          <Dialog open={showSaveTemplate} onOpenChange={setShowSaveTemplate}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <BookTemplate className="w-4 h-4 mr-2" />
                Save as Template
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Save as Template</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="templateName">Template Name</Label>
                  <Input
                    id="templateName"
                    value={templateName}
                    onChange={e => setTemplateName(e.target.value)}
                    placeholder="Enter template name"
                    className="mt-2"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowSaveTemplate(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveAsTemplate}>
                  Save Template
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button variant="outline" onClick={handlePrint}>
            <Printer className="w-4 h-4 mr-2" />
            Print
          </Button>
          <Button variant="outline" onClick={handleExportPDF}>
            <FileDown className="w-4 h-4 mr-2" />
            Export PDF
          </Button>
          <Button onClick={handleSave}>
            <Save className="w-4 h-4 mr-2" />
            Save Quotation
          </Button>
        </div>
      )}
    </div>
  );
}
