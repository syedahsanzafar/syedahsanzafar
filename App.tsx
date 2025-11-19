import React, { useState } from 'react';
import { initialItems, initialCustomers, initialDiscounts } from './data/mockData';
import useLocalStorage from './hooks/useLocalStorage';
import { Item, Customer, Discount, Sale, View, Purchase, Payment } from './types';
import { NewSale } from './components/NewSale';
import { Reports } from './components/Reports';
import { StockReport } from './components/StockReport';
import { Manage } from './components/Manage';
import { Purchases } from './components/Purchases';
import { PosIcon, ReportIcon, StockIcon, CogIcon, PackageIcon } from './components/Icons';

const App: React.FC = () => {
  const [items, setItems] = useLocalStorage<Item[]>('pos_items', initialItems);
  const [customers, setCustomers] = useLocalStorage<Customer[]>('pos_customers', initialCustomers);
  const [discounts, setDiscounts] = useLocalStorage<Discount[]>('pos_discounts', initialDiscounts);
  const [sales, setSales] = useLocalStorage<Sale[]>('pos_sales', []);
  const [purchases, setPurchases] = useLocalStorage<Purchase[]>('pos_purchases', []);
  const [payments, setPayments] = useLocalStorage<Payment[]>('pos_payments', []);
  const [activeView, setActiveView] = useState<View>(View.POS);

  const handleAddSale = (sale: Sale) => {
    setSales(prevSales => [...prevSales, sale]);
    
    // Update stock
    setItems(prevItems => {
      const newItems = [...prevItems];
      sale.items.forEach(saleItem => {
        const itemIndex = newItems.findIndex(i => i.id === saleItem.itemId);
        if (itemIndex !== -1) {
          newItems[itemIndex].stock -= saleItem.quantity;
        }
      });
      return newItems;
    });

    // Update customer credit
    setCustomers(prevCustomers => {
        const newCustomers = [...prevCustomers];
        const customerIndex = newCustomers.findIndex(c => c.id === sale.customerId);
        if (customerIndex !== -1) {
            newCustomers[customerIndex].creditBalance += sale.totalAmount;
        }
        return newCustomers;
    });
  };

  const handleAddPurchase = (purchase: Purchase) => {
    setPurchases(prev => [...prev, purchase]);
    setItems(prevItems => {
        const newItems = [...prevItems];
        const itemIndex = newItems.findIndex(i => i.id === purchase.itemId);
        if (itemIndex !== -1) {
            newItems[itemIndex].stock += purchase.quantity;
        }
        return newItems;
    });
  };

  const handleAddPayment = (payment: Payment) => {
      setPayments(prev => [...prev, payment]);
      setCustomers(prevCustomers => {
          const newCustomers = [...prevCustomers];
          const customerIndex = newCustomers.findIndex(c => c.id === payment.customerId);
          if (customerIndex !== -1) {
              newCustomers[customerIndex].creditBalance -= payment.amount;
          }
          return newCustomers;
      });
  };

  const handleUpdateItem = (updatedItem: Item) => {
    setItems(prevItems => prevItems.map(item => item.id === updatedItem.id ? updatedItem : item));
  };
  
  const handleUpdateCustomer = (updatedCustomer: Customer) => {
    setCustomers(prevCustomers => prevCustomers.map(customer => customer.id === updatedCustomer.id ? updatedCustomer : customer));
  };

  const handleUpdateDiscount = (updatedDiscount: Discount) => {
    setDiscounts(prevDiscounts => {
      const existingDiscountIndex = prevDiscounts.findIndex(d => d.customerId === updatedDiscount.customerId && d.itemId === updatedDiscount.itemId);
      if (existingDiscountIndex > -1) {
        const newDiscounts = [...prevDiscounts];
        newDiscounts[existingDiscountIndex] = updatedDiscount;
        return newDiscounts;
      }
      return [...prevDiscounts, updatedDiscount];
    });
  };

  const renderView = () => {
    switch (activeView) {
      case View.POS:
        return <NewSale items={items} customers={customers} discounts={discounts} onAddSale={handleAddSale} />;
      case View.Reports:
        return <Reports sales={sales} items={items} customers={customers} payments={payments} />;
      case View.Stock:
        return <StockReport items={items} />;
      case View.Manage:
        return <Manage 
                  items={items} 
                  customers={customers} 
                  discounts={discounts}
                  onUpdateItem={handleUpdateItem}
                  onUpdateCustomer={handleUpdateCustomer}
                  onUpdateDiscount={handleUpdateDiscount} 
                  onAddPayment={handleAddPayment}
                />;
      case View.Purchase:
        return <Purchases items={items} purchases={purchases} onAddPurchase={handleAddPurchase} />;
      default:
        return <NewSale items={items} customers={customers} discounts={discounts} onAddSale={handleAddSale} />;
    }
  };

  const NavItem: React.FC<{ view: View; label: string; icon: React.ReactNode }> = ({ view, label, icon }) => (
    <button
      onClick={() => setActiveView(view)}
      className={`flex-1 flex flex-col items-center justify-center p-2 text-xs md:text-sm md:flex-row md:justify-start md:space-x-2 md:px-4 md:py-3 transition-colors duration-200 rounded-md ${
        activeView === view ? 'bg-indigo-600 text-white' : 'text-gray-400 hover:bg-gray-700 hover:text-white'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Sidebar Navigation for larger screens */}
      <aside className="hidden md:flex md:flex-col md:w-64 bg-gray-800 p-4 space-y-2">
        <h1 className="text-2xl font-bold text-white mb-6 px-2">Wholesale POS</h1>
        <NavItem view={View.POS} label="New Sale" icon={<PosIcon className="h-6 w-6" />} />
        <NavItem view={View.Purchase} label="Purchases" icon={<PackageIcon className="h-6 w-6" />} />
        <NavItem view={View.Reports} label="Reports" icon={<ReportIcon className="h-6 w-6" />} />
        <NavItem view={View.Stock} label="Stock" icon={<StockIcon className="h-6 w-6" />} />
        <NavItem view={View.Manage} label="Manage" icon={<CogIcon className="h-6 w-6" />} />
      </aside>

      <main className="flex-1 bg-gray-900 pb-16 md:pb-0 overflow-y-auto">
        {renderView()}
      </main>

      {/* Bottom Navigation for mobile screens */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-gray-800 border-t border-gray-700 flex justify-around p-1">
        <NavItem view={View.POS} label="Sale" icon={<PosIcon className="h-6 w-6 mb-1" />} />
        <NavItem view={View.Purchase} label="Purchase" icon={<PackageIcon className="h-6 w-6 mb-1" />} />
        <NavItem view={View.Reports} label="Reports" icon={<ReportIcon className="h-6 w-6 mb-1" />} />
        <NavItem view={View.Stock} label="Stock" icon={<StockIcon className="h-6 w-6 mb-1" />} />
        <NavItem view={View.Manage} label="Manage" icon={<CogIcon className="h-6 w-6 mb-1" />} />
      </nav>
    </div>
  );
};

export default App;