import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SavedQuotation, QuotationItem, CompanyInfo, UNIT_TYPES } from '@/types';

const formatPrice = (price: number, currency: string = 'USD') => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
  }).format(price);
};

// Convert image URL to base64 for PDF embedding
const getImageBase64 = async (url: string): Promise<string | null> => {
  try {
    const response = await fetch(url);
    const blob = await response.blob();
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result as string);
      reader.onerror = () => resolve(null);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
};

export async function generateQuotationPDF(
  quotation: {
    customerName: string;
    items: QuotationItem[];
    discount: number;
    subtotal: number;
    total: number;
  },
  companyInfo: CompanyInfo,
  currency: string = 'USD'
): Promise<jsPDF> {
  const doc = new jsPDF();
  let startY = 25;

  // Add company logo if exists
  if (companyInfo.logo) {
    const logoBase64 = await getImageBase64(companyInfo.logo);
    if (logoBase64) {
      try {
        doc.addImage(logoBase64, 'JPEG', 20, 10, 30, 30);
        startY = 20;
      } catch {
        // Logo failed to load, continue without it
      }
    }
  }

  // Company Header - offset if logo exists
  const textStartX = companyInfo.logo ? 55 : 20;
  
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, textStartX, startY);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(companyInfo.address, textStartX, startY + 8);
  doc.text(`Phone: ${companyInfo.phone}`, textStartX, startY + 14);
  doc.text(`Email: ${companyInfo.email}`, textStartX, startY + 20);

  // Quotation Title - positioned to fit within page
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(176, 31, 46); // #B01F2E
  doc.text('PRICE QUOTATION', 190, startY, { align: 'right' });

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 190, startY + 8, { align: 'right' });

  // Customer Info
  const customerY = companyInfo.logo ? 55 : 60;
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Customer:', 20, customerY);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerName, 50, customerY);

  // Table
  const tableData = quotation.items.map(item => {
    const unitLabel = UNIT_TYPES.find(u => u.value === item.product.unitType)?.label || item.product.unitType;
    return [
      item.product.name,
      `${formatPrice(item.product.unitPrice, currency)} / ${unitLabel}`,
      item.quantity.toString(),
      formatPrice(item.product.unitPrice * item.quantity, currency),
    ];
  });

  autoTable(doc, {
    startY: customerY + 10,
    head: [['Product', 'Unit Price', 'Quantity', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [176, 31, 46], // #B01F2E
      textColor: 255,
      fontStyle: 'bold',
    },
    columnStyles: {
      0: { cellWidth: 70 },
      1: { cellWidth: 40, halign: 'right' },
      2: { cellWidth: 30, halign: 'center' },
      3: { cellWidth: 40, halign: 'right' },
    },
    styles: {
      fontSize: 10,
      cellPadding: 5,
    },
  });

  // Get the final Y position after table
  const finalY = (doc as any).lastAutoTable.finalY + 15;

  // Totals
  const totalsX = 140;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text('Subtotal:', totalsX, finalY);
  doc.text(formatPrice(quotation.subtotal, currency), 185, finalY, { align: 'right' });

  if (quotation.discount > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text(`Discount (${quotation.discount}%):`, totalsX, finalY + 7);
    doc.text(`-${formatPrice(quotation.subtotal - quotation.total, currency)}`, 185, finalY + 7, { align: 'right' });
    doc.setTextColor(0);
  }

  const totalY = quotation.discount > 0 ? finalY + 17 : finalY + 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(176, 31, 46); // #B01F2E
  doc.text('Total:', totalsX, totalY);
  doc.text(formatPrice(quotation.total, currency), 185, totalY, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  return doc;
}

export async function downloadQuotationPDF(
  quotation: SavedQuotation | {
    customerName: string;
    items: QuotationItem[];
    discount: number;
    subtotal: number;
    total: number;
  },
  companyInfo: CompanyInfo,
  currency: string = 'USD',
  filename?: string
) {
  const doc = await generateQuotationPDF(quotation, companyInfo, currency);
  const name = filename || `quotation-${quotation.customerName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  doc.save(name);
}
