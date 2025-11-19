import React, { forwardRef } from 'react';
import { Sale, Customer } from '../types';

interface InvoiceProps {
  sale: Sale;
  customer: Customer;
}

export const Invoice = forwardRef<HTMLDivElement, InvoiceProps>(({ sale, customer }, ref) => {
    
    // The customer object's creditBalance is from BEFORE the current sale.
    // We calculate the balances for display purposes here.
    const previousBalance = customer.creditBalance;
    const newBalance = customer.creditBalance + sale.totalAmount;

    return (
        <div ref={ref} className="bg-white text-black p-8 font-sans w-full">
            <header className="flex justify-between items-start pb-6 border-b-2 border-gray-200">
                <div className="flex items-center space-x-4">
                    {/* 
                      To add your own logo:
                      1. Upload your logo to an image hosting service (like imgur.com).
                      2. Copy the direct image link (e.g., "https://i.imgur.com/your-logo.png").
                      3. Replace the `src` value in the <img> tag below with your link.
                    */}
                    <img 
                        src="data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAxMDAgMTAwIiBmaWxsPSJub25lIiBzdHJva2U9IiM0QTU1NjgiIHN0cm9rZS13aWR0aD0iOCI+PHJlY3QgeD0iMTAiIHk9IjEwIiB3aWR0aD0iODAiIGhlaWdodD0iODAiIHJ4PSIxMCIvPjxwYXRoIGQ9Ik0zMCA3MCBWIDMwIEggNzIiLz48L3N2Zz4="
                        alt="Company Logo" 
                        className="h-16 w-16" 
                    />
                    <div>
                        <h1 className="text-3xl font-bold text-gray-800">Wholesale POS</h1>
                        <p className="text-gray-500">Sales Invoice</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-sm">Invoice #: <span className="font-semibold">{sale.id}</span></p>
                    <p className="text-sm">Date: <span className="font-semibold">{new Date(sale.date).toLocaleDateString()}</span></p>
                </div>
            </header>

            <section className="mt-8">
                <h2 className="text-lg font-semibold text-gray-700">Bill To:</h2>
                <p className="text-gray-600">{customer.name}</p>
                {customer.phone && <p className="text-gray-600">Phone: {customer.phone}</p>}
            </section>

            <section className="mt-8">
                <table className="w-full text-left">
                    <thead>
                        <tr className="bg-gray-100">
                            <th className="p-3 text-sm font-semibold text-gray-600">Item Description</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 text-center">Qty</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 text-right">Unit Price</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 text-right">Discount</th>
                            <th className="p-3 text-sm font-semibold text-gray-600 text-right">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items.map(item => (
                            <tr key={item.itemId} className="border-b border-gray-100">
                                <td className="p-3">{item.itemName}</td>
                                <td className="p-3 text-center">{item.quantity}</td>
                                <td className="p-3 text-right">RS {item.unitPrice.toFixed(2)}</td>
                                <td className="p-3 text-right">RS {item.discount.toFixed(2)}</td>
                                <td className="p-3 text-right font-semibold">RS {((item.unitPrice - item.discount) * item.quantity).toFixed(2)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </section>

            <section className="mt-8 flex justify-end">
                <div className="w-full max-w-xs space-y-2">
                    <div className="flex justify-between text-gray-600">
                        <span>Previous Balance:</span>
                        <span>RS {previousBalance.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                        <span>Current Sale:</span>
                        <span>RS {sale.totalAmount.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-xl text-gray-800 pt-2 border-t border-gray-300">
                        <span>New Balance:</span>
                        <span>RS {newBalance.toFixed(2)}</span>
                    </div>
                </div>
            </section>

             <footer className="mt-16 text-center text-xs text-gray-400 border-t pt-4">
                <p>Thank you for your business!</p>
                <p>All sales are final. Please check your items before leaving.</p>
            </footer>
        </div>
    );
});