import React, { useRef, useEffect, useState } from 'react';
import { Sale, Customer } from '../types';
import { Invoice } from './Invoice';

declare const htmlToImage: any;

interface InvoiceModalProps {
  sale: Sale;
  customer: Customer;
  onClose: () => void;
}

export const InvoiceModal: React.FC<InvoiceModalProps> = ({ sale, customer, onClose }) => {
  const invoiceRef = useRef<HTMLDivElement>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [canUseNativeShare, setCanUseNativeShare] = useState(false);

  useEffect(() => {
    // Check for Web Share API support on component mount
    if (navigator.share && typeof navigator.canShare === 'function') {
      setCanUseNativeShare(true);
    }
  }, []);

  const generateFile = async (): Promise<File | null> => {
    if (!invoiceRef.current) return null;
    try {
      const dataUrl = await htmlToImage.toJpeg(invoiceRef.current, { 
          quality: 0.95,
          backgroundColor: '#ffffff',
      });
      const blob = await (await fetch(dataUrl)).blob();
      return new File([blob], `Invoice-${customer.name.replace(/ /g, '_')}-${sale.id}.jpg`, { type: 'image/jpeg' });
    } catch (error) {
      console.error('Failed to generate image file', error);
      alert('Error: Could not generate the invoice image.');
      return null;
    }
  };

  const handleNativeShare = async () => {
    setIsSharing(true);
    const file = await generateFile();
    if (file && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          title: 'Your Invoice',
          text: `Invoice for ${customer.name}`,
          files: [file],
        });
      } catch (error) {
        console.error('Native sharing failed', error);
        // User might have cancelled the share, so no alert needed.
      }
    } else if (file) {
      alert("Your browser does not support sharing files directly. Please download the invoice.");
    }
    setIsSharing(false);
  };
  
  const handleWhatsAppShare = () => {
    if (!customer.phone) {
        alert("This customer does not have a phone number saved.");
        return;
    }
    const phoneNumber = customer.phone.replace(/[^0-9]/g, '');
    const message = encodeURIComponent(`Dear ${customer.name}, here is your invoice for RS ${sale.totalAmount.toFixed(2)}. Thank you for your business!`);
    window.open(`https://wa.me/${phoneNumber}?text=${message}`, '_blank');
  };

  const handleDownload = async () => {
    setIsSharing(true);
    if (!invoiceRef.current) return;
    try {
        const dataUrl = await htmlToImage.toJpeg(invoiceRef.current, { 
            quality: 0.95,
            backgroundColor: '#ffffff' 
        });
        const link = document.createElement('a');
        link.download = `Invoice-${customer.name.replace(/ /g, '_')}-${sale.id}.jpg`;
        link.href = dataUrl;
        link.click();
    } catch (error) {
        console.error('Download failed', error);
        alert('Could not download the invoice.');
    }
    setIsSharing(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl flex flex-col max-h-[95vh]" onClick={(e) => e.stopPropagation()}>
        <div className="p-4 flex-1 overflow-y-auto">
            <Invoice ref={invoiceRef} sale={sale} customer={customer} />
        </div>
        <div className="bg-gray-700 p-4 flex flex-wrap justify-end gap-3 rounded-b-lg flex-shrink-0">
          {canUseNativeShare && (
            <button onClick={handleNativeShare} disabled={isSharing} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded disabled:bg-blue-800">
              {isSharing ? 'Processing...' : 'Share Invoice'}
            </button>
          )}
          {!canUseNativeShare && (
            <>
              <button onClick={handleWhatsAppShare} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">
                  Share on WhatsApp
              </button>
              <button onClick={handleDownload} disabled={isSharing} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded disabled:bg-indigo-800">
                {isSharing ? 'Processing...' : 'Download JPG'}
              </button>
            </>
          )}
          <button onClick={onClose} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
