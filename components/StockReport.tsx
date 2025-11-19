
import React from 'react';
import { Item } from '../types';

interface StockReportProps {
  items: Item[];
}

export const StockReport: React.FC<StockReportProps> = ({ items }) => {
  const sortedItems = [...items].sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div className="p-4 md:p-6">
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <h2 className="text-xl font-bold mb-4 border-b border-gray-700 pb-3">Stock Report</h2>
             <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead>
                        <tr>
                            <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Item Name</th>
                            <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Current Stock</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800">
                        {sortedItems.map(item => (
                            <tr key={item.id}>
                                <td className="py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{item.name}</td>
                                <td className={`px-3 py-4 text-sm text-right font-bold ${item.stock < 50 ? 'text-red-400' : 'text-green-400'}`}>
                                    {item.stock}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
             </div>
        </div>
    </div>
  );
};
