import React, { useState, useMemo } from 'react';
import { Item, Customer, Discount, Payment } from '../types';

interface ManageProps {
  items: Item[];
  customers: Customer[];
  discounts: Discount[];
  onUpdateItem: (item: Item) => void;
  onUpdateCustomer: (customer: Customer) => void;
  onUpdateDiscount: (discount: Discount) => void;
  onAddPayment: (payment: Payment) => void;
}

type ActiveTab = 'items' | 'customers';

export const Manage: React.FC<ManageProps> = ({ items, customers, discounts, onUpdateItem, onUpdateCustomer, onUpdateDiscount, onAddPayment }) => {
  const [activeTab, setActiveTab] = useState<ActiveTab>('items');

  // State for modals
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [managingDiscountsFor, setManagingDiscountsFor] = useState<Customer | null>(null);
  const [receivingPaymentFor, setReceivingPaymentFor] = useState<Customer | null>(null);
  
  const [paymentAmount, setPaymentAmount] = useState<number>(0);

  const discountMap = useMemo(() => {
    const map = new Map<string, number>();
    if (managingDiscountsFor) {
      discounts
        .filter(d => d.customerId === managingDiscountsFor.id)
        .forEach(d => map.set(d.itemId, d.discountPercentage));
    }
    return map;
  }, [discounts, managingDiscountsFor]);

  const [itemFormData, setItemFormData] = useState<Item | null>(null);
  const [customerFormData, setCustomerFormData] = useState<Customer | null>(null);
  const [discountFormData, setDiscountFormData] = useState<Map<string, number>>(new Map());

  // Handlers to open modals
  const handleEditItemClick = (item: Item) => {
    setItemFormData(item);
    setEditingItem(item);
  };
  
  const handleEditCustomerClick = (customer: Customer) => {
    setCustomerFormData(customer);
    setEditingCustomer(customer);
  };
  
  const handleManageDiscountsClick = (customer: Customer) => {
    setDiscountFormData(new Map(discountMap));
    setManagingDiscountsFor(customer);
  };

  const handleReceivePaymentClick = (customer: Customer) => {
    setPaymentAmount(customer.creditBalance > 0 ? customer.creditBalance : 0);
    setReceivingPaymentFor(customer);
  };

  // Handlers for closing modals
  const closeModal = () => {
    setEditingItem(null);
    setEditingCustomer(null);
    setManagingDiscountsFor(null);
    setReceivingPaymentFor(null);
    setItemFormData(null);
    setCustomerFormData(null);
    setDiscountFormData(new Map());
    setPaymentAmount(0);
  };
  
  // Save handlers
  const handleSaveItem = () => {
    if (itemFormData) {
      onUpdateItem(itemFormData);
      closeModal();
    }
  };

  const handleSaveCustomer = () => {
    if (customerFormData) {
      onUpdateCustomer(customerFormData);
      closeModal();
    }
  };

  const handleSaveDiscounts = () => {
    if (managingDiscountsFor) {
      for (const [itemId, discountPercentage] of discountFormData.entries()) {
        const originalDiscount = discountMap.get(itemId) ?? 0;
        if (discountPercentage !== originalDiscount) {
          onUpdateDiscount({
            customerId: managingDiscountsFor.id,
            itemId,
            discountPercentage,
          });
        }
      }
      closeModal();
    }
  };

  const handleRecordPayment = () => {
    if (receivingPaymentFor && paymentAmount > 0) {
        onAddPayment({
            id: `payment-${Date.now()}`,
            customerId: receivingPaymentFor.id,
            amount: paymentAmount,
            date: new Date().toISOString(),
        });
        closeModal();
    }
  };
  
  const renderTabContent = () => {
    if (activeTab === 'items') {
      return (
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Item Name</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Cost Price</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Selling Price</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Stock</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Target Sale</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Edit</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {items.map(item => (
              <tr key={item.id}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{item.name}</td>
                <td className="px-3 py-4 text-sm text-gray-300 text-right">RS {item.costPrice.toFixed(2)}</td>
                <td className="px-3 py-4 text-sm text-gray-300 text-right">RS {item.sellingPrice.toFixed(2)}</td>
                <td className="px-3 py-4 text-sm text-gray-300 text-right">{item.stock}</td>
                <td className="px-3 py-4 text-sm text-gray-300 text-right">{item.targetSale}</td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0">
                    <button onClick={() => handleEditItemClick(item)} className="text-indigo-400 hover:text-indigo-300">Edit</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    if (activeTab === 'customers') {
      return (
        <table className="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Customer Name</th>
              <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Phone</th>
              <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Credit Balance</th>
              <th className="relative py-3.5 pl-3 pr-4 sm:pr-0"><span className="sr-only">Actions</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {customers.map(customer => (
              <tr key={customer.id}>
                <td className="py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{customer.name}</td>
                <td className="px-3 py-4 text-sm text-gray-300">{customer.phone || 'N/A'}</td>
                <td className={`px-3 py-4 text-sm text-right font-semibold ${customer.creditBalance > 0 ? 'text-yellow-400' : 'text-gray-300'}`}>
                    RS {customer.creditBalance.toFixed(2)}
                </td>
                <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-0 space-x-4">
                  <button onClick={() => handleReceivePaymentClick(customer)} className="text-blue-400 hover:text-blue-300">Receive Payment</button>
                  <button onClick={() => handleEditCustomerClick(customer)} className="text-indigo-400 hover:text-indigo-300">Edit Customer</button>
                  <button onClick={() => handleManageDiscountsClick(customer)} className="text-green-400 hover:text-green-300">Manage Discounts</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      );
    }

    return null;
  };

  const getTabClass = (tabName: ActiveTab) =>
    `px-4 py-2 text-sm font-medium rounded-md ${activeTab === tabName ? 'bg-indigo-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`;

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
        <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3">
          <h2 className="text-xl font-bold">Manage</h2>
          <div className="flex space-x-2">
            <button className={getTabClass('items')} onClick={() => setActiveTab('items')}>Items</button>
            <button className={getTabClass('customers')} onClick={() => setActiveTab('customers')}>Customers</button>
          </div>
        </div>
        <div className="overflow-x-auto">{renderTabContent()}</div>
      </div>

      {/* Item Edit Modal */}
      {editingItem && itemFormData && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Edit Item: {editingItem.name}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Item Name</label>
              <input type="text" value={itemFormData.name} onChange={e => setItemFormData({...itemFormData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Cost Price</label>
              <input type="number" value={itemFormData.costPrice} onChange={e => setItemFormData({...itemFormData, costPrice: parseFloat(e.target.value) || 0})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Selling Price</label>
              <input type="number" value={itemFormData.sellingPrice} onChange={e => setItemFormData({...itemFormData, sellingPrice: parseFloat(e.target.value) || 0})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Current Stock</label>
              <input type="number" value={itemFormData.stock} onChange={e => setItemFormData({...itemFormData, stock: parseInt(e.target.value, 10) || 0})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Target Sale</label>
              <input type="number" value={itemFormData.targetSale} onChange={e => setItemFormData({...itemFormData, targetSale: parseInt(e.target.value, 10) || 0})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
              <button onClick={handleSaveItem} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Customer Edit Modal */}
      {editingCustomer && customerFormData && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Edit Customer: {editingCustomer.name}</h3>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Customer Name</label>
              <input type="text" value={customerFormData.name} onChange={e => setCustomerFormData({...customerFormData, name: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
             <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Phone Number</label>
              <input type="text" value={customerFormData.phone || ''} onChange={e => setCustomerFormData({...customerFormData, phone: e.target.value})} className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
              <button onClick={handleSaveCustomer} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-2 px-4 rounded">Save</button>
            </div>
          </div>
        </div>
      )}

      {/* Discounts Edit Modal */}
      {managingDiscountsFor && (
         <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
            <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-lg">
                <h3 className="text-lg font-bold mb-4">Manage Discounts for: {managingDiscountsFor.name}</h3>
                <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {items.map(item => (
                        <div key={item.id} className="grid grid-cols-3 items-center gap-4">
                            <label className="text-sm text-gray-300 col-span-2">{item.name}</label>
                            <div className="relative">
                                <input 
                                    type="number" 
                                    value={discountFormData.get(item.id) ?? (discountMap.get(item.id) || 0)}
                                    onChange={e => {
                                        const newMap = new Map(discountFormData);
                                        newMap.set(item.id, parseFloat(e.target.value) || 0);
                                        setDiscountFormData(newMap);
                                    }}
                                    className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white pr-6"
                                />
                                <span className="absolute inset-y-0 right-0 flex items-center pr-2 text-gray-400 text-sm">%</span>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end space-x-3 pt-6">
                    <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
                    <button onClick={handleSaveDiscounts} className="bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-4 rounded">Save Discounts</button>
                </div>
            </div>
        </div>
      )}

      {/* Receive Payment Modal */}
      {receivingPaymentFor && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg shadow-xl p-6 w-full max-w-md space-y-4">
            <h3 className="text-lg font-bold">Receive Payment from: {receivingPaymentFor.name}</h3>
            <p className="text-sm text-gray-400">Current Balance: <span className="font-bold text-yellow-400">RS {receivingPaymentFor.creditBalance.toFixed(2)}</span></p>
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1">Payment Amount</label>
              <input 
                type="number" 
                value={paymentAmount} 
                onChange={e => setPaymentAmount(parseFloat(e.target.value) || 0)}
                className="w-full bg-gray-700 border border-gray-600 rounded-md p-2 text-white" 
                max={receivingPaymentFor.creditBalance}
                min="0"
              />
            </div>
            <div className="flex justify-end space-x-3 pt-4">
              <button onClick={closeModal} className="bg-gray-600 hover:bg-gray-500 text-white font-bold py-2 px-4 rounded">Cancel</button>
              <button onClick={handleRecordPayment} className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Record Payment</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};