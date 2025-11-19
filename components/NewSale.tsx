
import React, { useState, useMemo } from 'react';
import { Item, Customer, Discount, CartItem, Sale } from '../types';
import { TrashIcon } from './Icons';
import { InvoiceModal } from './InvoiceModal';

interface NewSaleProps {
  items: Item[];
  customers: Customer[];
  discounts: Discount[];
  onAddSale: (sale: Sale) => void;
}

export const NewSale: React.FC<NewSaleProps> = ({ items, customers, discounts, onAddSale }) => {
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  const [showInvoiceModal, setShowInvoiceModal] = useState(false);
  const [lastCompletedSale, setLastCompletedSale] = useState<Sale | null>(null);

  const availableItems = useMemo(() => {
    return items.filter(item => !cart.some(cartItem => cartItem.itemId === item.id));
  }, [items, cart]);
  
  const handleAddItemToCart = () => {
    if (!selectedCustomerId || !selectedItemId || quantity <= 0) return;

    const item = items.find(i => i.id === selectedItemId);
    if (!item || item.stock < quantity) {
      alert('Item not found or insufficient stock!');
      return;
    }

    const discountInfo = discounts.find(d => d.customerId === selectedCustomerId && d.itemId === selectedItemId);
    const discountPercentage = discountInfo ? discountInfo.discountPercentage : 0;
    const discountAmount = item.sellingPrice * (discountPercentage / 100);

    const newItem: CartItem = {
      itemId: item.id,
      itemName: item.name,
      quantity: quantity,
      unitPrice: item.sellingPrice,
      discount: discountAmount,
    };

    setCart([...cart, newItem]);
    setSelectedItemId('');
    setQuantity(1);
  };

  const handleRemoveItem = (itemId: string) => {
    setCart(cart.filter(item => item.itemId !== itemId));
  };
  
  const totalAmount = useMemo(() => {
    return cart.reduce((acc, item) => {
      const totalItemPrice = (item.unitPrice - item.discount) * item.quantity;
      return acc + totalItemPrice;
    }, 0);
  }, [cart]);

  const handleCompleteSale = () => {
    if (!selectedCustomerId || cart.length === 0) {
      alert('Please select a customer and add items to the cart.');
      return;
    }
    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      customerId: selectedCustomerId,
      date: new Date().toISOString(),
      items: cart,
      totalAmount: totalAmount,
    };
    onAddSale(newSale);
    setLastCompletedSale(newSale);
    setShowInvoiceModal(true);
  };

  const handleCloseInvoice = () => {
    setShowInvoiceModal(false);
    setLastCompletedSale(null);
    setCart([]);
    setSelectedCustomerId('');
  };

  const lastSaleCustomer = useMemo(() => {
    if (!lastCompletedSale) return null;
    return customers.find(c => c.id === lastCompletedSale.customerId) || null;
  }, [lastCompletedSale, customers]);


  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-800 p-4 rounded-lg shadow-lg">
        <div>
          <label htmlFor="customer" className="block text-sm font-medium text-gray-400 mb-1">Select Customer</label>
          <select
            id="customer"
            value={selectedCustomerId}
            onChange={(e) => {
              setSelectedCustomerId(e.target.value);
              setCart([]); // Clear cart on customer change
            }}
            className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">-- Select a Customer --</option>
            {customers.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>
      </div>

      {selectedCustomerId && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Add Items to Cart</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
            <div className="md:col-span-1">
              <label htmlFor="item" className="block text-sm font-medium text-gray-400 mb-1">Item</label>
              <select
                id="item"
                value={selectedItemId}
                onChange={(e) => setSelectedItemId(e.target.value)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
              >
                <option value="">-- Select an Item --</option>
                {availableItems.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
              </select>
            </div>
            <div>
              <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">Quantity</label>
              <input
                type="number"
                id="quantity"
                min="1"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                className="w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm p-2 text-white focus:ring-indigo-500 focus:border-indigo-500"
              />
            </div>
            <button
              onClick={handleAddItemToCart}
              className="w-full bg-indigo-600 text-white font-bold py-2 px-4 rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500"
            >
              Add to Cart
            </button>
          </div>
        </div>
      )}

      {cart.length > 0 && (
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
          <h3 className="text-xl font-bold mb-4">Current Sale</h3>
          <div className="flow-root">
            <div className="-my-2 overflow-x-auto">
              <div className="inline-block min-w-full py-2 align-middle">
                <table className="min-w-full divide-y divide-gray-700">
                  <thead>
                    <tr>
                      <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Item</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Qty</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Price</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Discount</th>
                      <th scope="col" className="px-3 py-3.5 text-left text-sm font-semibold text-white">Total</th>
                      <th scope="col" className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Remove</span></th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-800">
                    {cart.map((item) => (
                      <tr key={item.itemId}>
                        <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{item.itemName}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">{item.quantity}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">RS {item.unitPrice.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">RS {item.discount.toFixed(2)}</td>
                        <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-300">RS {((item.unitPrice - item.discount) * item.quantity).toFixed(2)}</td>
                        <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                          <button onClick={() => handleRemoveItem(item.itemId)} className="text-red-500 hover:text-red-700"><TrashIcon className="h-5 w-5"/></button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div className="mt-6 border-t border-gray-700 pt-4 flex justify-between items-center">
            <div className="text-2xl font-bold">Grand Total: RS {totalAmount.toFixed(2)}</div>
            <button
              onClick={handleCompleteSale}
              className="bg-green-600 text-white font-bold py-3 px-6 rounded-md hover:bg-green-700 text-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
            >
              Complete Sale
            </button>
          </div>
        </div>
      )}
      {showInvoiceModal && lastCompletedSale && lastSaleCustomer && (
        <InvoiceModal 
            sale={lastCompletedSale} 
            customer={lastSaleCustomer} 
            onClose={handleCloseInvoice}
        />
    )}
    </div>
  );
};