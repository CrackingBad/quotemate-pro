import { useState } from 'react';
import { Building2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { CompanyInfo } from '@/types';
import { uploadProductImage } from '@/lib/storage';
import { toast } from '@/hooks/use-toast';

interface CompanySettingsProps {
  companyInfo: CompanyInfo;
  onUpdate: (updates: Partial<CompanyInfo>) => void;
}

export function CompanySettings({ companyInfo, onUpdate }: CompanySettingsProps) {
  const [open, setOpen] = useState(false);
  const [localInfo, setLocalInfo] = useState(companyInfo);
  const [uploading, setUploading] = useState(false);

  const handleSave = () => {
    onUpdate(localInfo);
    setOpen(false);
    toast({
      title: 'Settings saved',
      description: 'Company information updated successfully.',
    });
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setUploading(true);
    try {
      const url = await uploadProductImage(file);
      if (url) {
        setLocalInfo(prev => ({ ...prev, logo: url }));
        toast({
          title: 'Logo uploaded',
          description: 'Company logo uploaded successfully.',
        });
      }
    } catch {
      toast({
        title: 'Upload failed',
        description: 'Failed to upload logo.',
        variant: 'destructive',
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Building2 className="w-4 h-4 mr-2" />
          Company
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Company Settings</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Company Logo</Label>
            <div className="flex items-center gap-4">
              {localInfo.logo ? (
                <div className="relative w-20 h-20 bg-muted rounded-lg overflow-hidden">
                  <img src={localInfo.logo} alt="Logo" className="w-full h-full object-contain" />
                  <button
                    onClick={() => setLocalInfo(prev => ({ ...prev, logo: undefined }))}
                    className="absolute -top-1 -right-1 p-1 bg-destructive text-destructive-foreground rounded-full"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <div className="w-20 h-20 bg-muted rounded-lg flex items-center justify-center">
                  <Building2 className="w-8 h-8 text-muted-foreground" />
                </div>
              )}
              <div>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoUpload}
                  className="hidden"
                  id="logo-upload"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => document.getElementById('logo-upload')?.click()}
                  disabled={uploading}
                >
                  <Upload className="w-4 h-4 mr-2" />
                  {uploading ? 'Uploading...' : 'Upload Logo'}
                </Button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name</Label>
            <Input
              id="companyName"
              value={localInfo.name}
              onChange={e => setLocalInfo(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Your Company Name"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyAddress">Address</Label>
            <Input
              id="companyAddress"
              value={localInfo.address}
              onChange={e => setLocalInfo(prev => ({ ...prev, address: e.target.value }))}
              placeholder="123 Business Street, City, Country"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyPhone">Phone</Label>
            <Input
              id="companyPhone"
              value={localInfo.phone}
              onChange={e => setLocalInfo(prev => ({ ...prev, phone: e.target.value }))}
              placeholder="+1 (555) 123-4567"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="companyEmail">Email</Label>
            <Input
              id="companyEmail"
              type="email"
              value={localInfo.email}
              onChange={e => setLocalInfo(prev => ({ ...prev, email: e.target.value }))}
              placeholder="contact@yourcompany.com"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
