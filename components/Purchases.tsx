import React, { useState, useMemo } from 'react';
import { Item, Purchase } from '../types';

interface PurchasesProps {
  items: Item[];
  purchases: Purchase[];
  onAddPurchase: (purchase: Purchase) => void;
}

export const Purchases: React.FC<PurchasesProps> = ({ items, purchases, onAddPurchase }) => {
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  
  const itemMap = useMemo(() => new Map(items.map(i => [i.id, i.name])), [items]);
  const sortedPurchases = useMemo(() => [...purchases].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [purchases]);

  const handleAddStock = () => {
    if (!selectedItemId || quantity <= 0) {
      alert('Please select an item and enter a valid quantity.');
      return;
    }

    const newPurchase: Purchase = {
      id: `purchase-${Date.now()}`,
      itemId: selectedItemId,
      quantity,
      date: new Date().toISOString(),
    };

    onAddPurchase(newPurchase);
    setSelectedItemId('');
    setQuantity(1);
  };

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h3 className="text-lg font-semibold mb-3 border-b border-gray-700 pb-2">Record New Purchase</h3>
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
              {items.map(i => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          <div>
            <label htmlFor="quantity" className="block text-sm font-medium text-gray-400 mb-1">Quantity Received</label>
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
            onClick={handleAddStock}
            className="w-full bg-green-600 text-white font-bold py-2 px-4 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-green-500"
          >
            Add Stock
          </button>
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-3">Purchase History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Item Name</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Quantity Added</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedPurchases.map(p => (
                <tr key={p.id}>
                  <td className="py-4 pl-4 pr-3 text-sm text-gray-300 sm:pl-0">{new Date(p.date).toLocaleString()}</td>
                  <td className="px-3 py-4 text-sm font-medium text-white">{itemMap.get(p.itemId) || 'Unknown Item'}</td>
                  <td className="px-3 py-4 text-sm text-green-400 text-right font-bold">+{p.quantity}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};