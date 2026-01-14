import { FileText } from 'lucide-react';

interface HeaderProps {
  activeTab: 'products' | 'quotation' | 'archive';
  onTabChange: (tab: 'products' | 'quotation' | 'archive') => void;
}

export function Header({ activeTab, onTabChange }: HeaderProps) {
  const tabs = [
    { id: 'products' as const, label: 'Products' },
    { id: 'quotation' as const, label: 'Quotation' },
    { id: 'archive' as const, label: 'Archive' },
  ];

  return (
    <header className="bg-card border-b no-print">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary-foreground" />
            </div>
            <div>
              <h1 className="text-lg font-semibold text-foreground">QuotePro</h1>
              <p className="text-xs text-muted-foreground">Product & Quotation Manager</p>
            </div>
          </div>

          <nav className="flex items-center gap-1">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                  activeTab === tab.id
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>
    </header>
  );
}
