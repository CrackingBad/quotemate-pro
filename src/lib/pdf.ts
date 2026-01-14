import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SavedQuotation, QuotationItem, CompanyInfo, UNIT_TYPES } from '@/types';

const formatPrice = (price: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
  }).format(price);
};

export function generateQuotationPDF(
  quotation: {
    customerName: string;
    items: QuotationItem[];
    discount: number;
    subtotal: number;
    total: number;
  },
  companyInfo: CompanyInfo
): jsPDF {
  const doc = new jsPDF();

  // Company Header
  doc.setFontSize(20);
  doc.setFont('helvetica', 'bold');
  doc.text(companyInfo.name, 20, 25);

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(companyInfo.address, 20, 33);
  doc.text(`Phone: ${companyInfo.phone}`, 20, 39);
  doc.text(`Email: ${companyInfo.email}`, 20, 45);

  // Quotation Title
  doc.setFontSize(24);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 78, 121);
  doc.text('PRICE QUOTATION', 140, 25);

  // Date
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100);
  doc.text(`Date: ${new Date().toLocaleDateString()}`, 140, 35);

  // Customer Info
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0);
  doc.text('Customer:', 20, 60);
  doc.setFont('helvetica', 'normal');
  doc.text(quotation.customerName, 50, 60);

  // Table
  const tableData = quotation.items.map(item => {
    const unitLabel = UNIT_TYPES.find(u => u.value === item.product.unitType)?.label || item.product.unitType;
    return [
      item.product.name,
      `${formatPrice(item.product.unitPrice)} / ${unitLabel}`,
      item.quantity.toString(),
      formatPrice(item.product.unitPrice * item.quantity),
    ];
  });

  autoTable(doc, {
    startY: 70,
    head: [['Product', 'Unit Price', 'Quantity', 'Total']],
    body: tableData,
    theme: 'striped',
    headStyles: {
      fillColor: [31, 78, 121],
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
  doc.text(formatPrice(quotation.subtotal), 185, finalY, { align: 'right' });

  if (quotation.discount > 0) {
    doc.setTextColor(200, 0, 0);
    doc.text(`Discount (${quotation.discount}%):`, totalsX, finalY + 7);
    doc.text(`-${formatPrice(quotation.subtotal - quotation.total)}`, 185, finalY + 7, { align: 'right' });
    doc.setTextColor(0);
  }

  const totalY = quotation.discount > 0 ? finalY + 17 : finalY + 10;
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(31, 78, 121);
  doc.text('Total:', totalsX, totalY);
  doc.text(formatPrice(quotation.total), 185, totalY, { align: 'right' });

  // Footer
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(150);
  doc.text('Thank you for your business!', 105, 280, { align: 'center' });

  return doc;
}

export function downloadQuotationPDF(
  quotation: SavedQuotation | {
    customerName: string;
    items: QuotationItem[];
    discount: number;
    subtotal: number;
    total: number;
  },
  companyInfo: CompanyInfo,
  filename?: string
) {
  const doc = generateQuotationPDF(quotation, companyInfo);
  const name = filename || `quotation-${quotation.customerName.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;
  doc.save(name);
}
