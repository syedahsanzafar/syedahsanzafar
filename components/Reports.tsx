import React, { useState, useMemo } from 'react';
import { Item, Sale, Customer, Payment } from '../types';
import { InvoiceModal } from './InvoiceModal';

interface ReportsProps {
  sales: Sale[];
  items: Item[];
  customers: Customer[];
  payments: Payment[];
}

type ReportType = 'sales' | 'profit' | 'item-wise' | 'target' | 'credit';

const ReportCard: React.FC<{title: string, value: string, subValue?: string}> = ({title, value, subValue}) => (
    <div className="bg-gray-800 p-4 rounded-lg shadow-md flex-1 text-center">
        <h4 className="text-sm text-gray-400 uppercase font-bold">{title}</h4>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subValue && <p className="text-xs text-gray-500">{subValue}</p>}
    </div>
);

const BarChart: React.FC<{ data: { label: string; values: { value: number; color: string; label: string }[] }[] }> = ({ data }) => {
    const maxValue = Math.max(...data.flatMap(d => d.values.map(v => v.value)), 1);

    return (
        <div className="space-y-6">
            <div className="flex justify-center space-x-4 text-sm">
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-blue-500 mr-2"></span>Target</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-green-500 mr-2"></span>Sold</div>
                <div className="flex items-center"><span className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></span>Stock</div>
            </div>
            {data.map((item, index) => (
                <div key={index} className="grid grid-cols-1 md:grid-cols-4 gap-2 items-center">
                    <div className="text-sm font-medium text-white truncate md:col-span-1">{item.label}</div>
                    <div className="md:col-span-3 space-y-2">
                        {item.values.map((v, i) => (
                            <div key={i} className="flex items-center">
                                <div className="w-16 text-xs text-gray-400 pr-2 text-right">{v.label}</div>
                                <div className="flex-1 bg-gray-700 rounded-full h-6">
                                    <div
                                        className={`${v.color} h-6 rounded-full flex items-center justify-end pr-2 text-xs font-bold text-white`}
                                        style={{ width: `${(v.value / maxValue) * 100}%` }}
                                    >
                                        {v.value}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};


export const Reports: React.FC<ReportsProps> = ({ sales, items, customers, payments }) => {
  const [activeReport, setActiveReport] = useState<ReportType>('sales');
  const [viewingSale, setViewingSale] = useState<Sale | null>(null);

  const customerMap = useMemo(() => new Map(customers.map(c => [c.id, c.name])), [customers]);
  const itemCostMap = useMemo(() => new Map(items.map(i => [i.id, i.costPrice])), [items]);

  const sortedSales = useMemo(() => [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()), [sales]);
  
  const viewingCustomer = useMemo(() => {
    if (!viewingSale) return null;
    return customers.find(c => c.id === viewingSale.customerId) || null;
  }, [viewingSale, customers]);
  
  const handleCloseInvoice = () => setViewingSale(null);

  const totalRevenue = useMemo(() => sales.reduce((acc, sale) => acc + sale.totalAmount, 0), [sales]);
  const totalProfit = useMemo(() => {
    return sales.reduce((saleProfit, sale) => {
        const saleItemsProfit = sale.items.reduce((itemProfit, saleItem) => {
            const costPrice = itemCostMap.get(saleItem.itemId) || 0;
            const profitPerItem = (saleItem.unitPrice - saleItem.discount) - costPrice;
            return itemProfit + (profitPerItem * saleItem.quantity);
        }, 0);
        return saleProfit + saleItemsProfit;
    }, 0);
  }, [sales, itemCostMap]);

  const itemWiseSales = useMemo(() => {
    const report: { [itemId: string]: { name: string; quantity: number; revenue: number; stock: number; target: number; } } = {};
    for (const item of items) {
        report[item.id] = { name: item.name, quantity: 0, revenue: 0, stock: item.stock, target: item.targetSale };
    }
    for (const sale of sales) {
        for (const saleItem of sale.items) {
            if(report[saleItem.itemId]) {
              report[saleItem.itemId].quantity += saleItem.quantity;
              report[saleItem.itemId].revenue += (saleItem.unitPrice - saleItem.discount) * saleItem.quantity;
            }
        }
    }
    return Object.values(report).sort((a,b) => b.revenue - a.revenue);
  }, [sales, items]);

  const salesTargetData = useMemo(() => {
      return itemWiseSales.map(item => ({
          label: item.name,
          values: [
              { value: item.target, color: 'bg-blue-500', label: 'Target' },
              { value: item.quantity, color: 'bg-green-500', label: 'Sold' },
              { value: item.stock, color: 'bg-yellow-500', label: 'Stock' },
          ]
      }));
  }, [itemWiseSales]);

  const creditReportData = useMemo(() => {
    return customers.map(customer => {
        const totalPurchases = sales
            .filter(s => s.customerId === customer.id)
            .reduce((sum, s) => sum + s.totalAmount, 0);
        const totalPayments = payments
            .filter(p => p.customerId === customer.id)
            .reduce((sum, p) => sum + p.amount, 0);
        return {
            id: customer.id,
            name: customer.name,
            totalPurchases,
            totalPayments,
            balance: customer.creditBalance
        };
    }).sort((a, b) => b.balance - a.balance);
  }, [customers, sales, payments]);
  
  const renderReport = () => {
    switch(activeReport) {
      case 'sales':
        return (
          <table className="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Date</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Invoice #</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Customer</th>
                <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Items</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Total Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-800">
              {sortedSales.map(sale => (
                <tr key={sale.id} onClick={() => setViewingSale(sale)} className="cursor-pointer hover:bg-gray-700/50 transition-colors duration-150">
                  <td className="py-4 pl-4 pr-3 text-sm text-gray-300 sm:pl-0">{new Date(sale.date).toLocaleString()}</td>
                  <td className="px-3 py-4 text-sm text-gray-400 font-mono">{sale.id}</td>
                  <td className="px-3 py-4 text-sm text-gray-300">{customerMap.get(sale.customerId) || 'Unknown'}</td>
                  <td className="px-3 py-4 text-sm text-gray-300">{sale.items.length}</td>
                  <td className="px-3 py-4 text-sm text-gray-300 text-right">RS {sale.totalAmount.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        );
      case 'profit':
        return (
             <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Sale Date</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Customer</th>
                        <th className="px-3 py-3.5 text-left text-sm font-semibold text-white">Revenue</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Profit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {sortedSales.map(sale => {
                        const profit = sale.items.reduce((acc, item) => {
                            const cost = itemCostMap.get(item.itemId) || 0;
                            return acc + ((item.unitPrice - item.discount - cost) * item.quantity);
                        }, 0);
                        return (
                            <tr key={sale.id}>
                                <td className="py-4 pl-4 pr-3 text-sm text-gray-300 sm:pl-0">{new Date(sale.date).toLocaleDateString()}</td>
                                <td className="px-3 py-4 text-sm text-gray-300">{customerMap.get(sale.customerId)}</td>
                                <td className="px-3 py-4 text-sm text-gray-300">RS {sale.totalAmount.toFixed(2)}</td>
                                <td className={`px-3 py-4 text-sm text-right ${profit > 0 ? 'text-green-400' : 'text-red-400'}`}>RS {profit.toFixed(2)}</td>
                            </tr>
                        );
                    })}
                </tbody>
            </table>
        );
      case 'item-wise':
        return (
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Item Name</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Quantity Sold</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Total Revenue</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {itemWiseSales.map(item => (
                        <tr key={item.name}>
                            <td className="py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{item.name}</td>
                            <td className="px-3 py-4 text-sm text-gray-300 text-right">{item.quantity}</td>
                            <td className="px-3 py-4 text-sm text-gray-300 text-right">RS {item.revenue.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
      case 'target':
        return <BarChart data={salesTargetData} />;
      case 'credit':
        return (
            <table className="min-w-full divide-y divide-gray-700">
                <thead>
                    <tr>
                        <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-white sm:pl-0">Customer Name</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Total Purchases</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Total Payments</th>
                        <th className="px-3 py-3.5 text-right text-sm font-semibold text-white">Outstanding Credit</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                    {creditReportData.map(c => (
                        <tr key={c.id}>
                            <td className="py-4 pl-4 pr-3 text-sm font-medium text-white sm:pl-0">{c.name}</td>
                            <td className="px-3 py-4 text-sm text-gray-300 text-right">RS {c.totalPurchases.toFixed(2)}</td>
                            <td className="px-3 py-4 text-sm text-gray-300 text-right">RS {c.totalPayments.toFixed(2)}</td>
                            <td className={`px-3 py-4 text-sm text-right font-bold ${c.balance > 0 ? 'text-yellow-400' : 'text-green-400'}`}>RS {c.balance.toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        );
      default: return null;
    }
  }

  const getButtonClass = (report: ReportType) => 
    `px-4 py-2 text-sm font-medium rounded-md ${activeReport === report ? 'bg-indigo-600 text-white' : 'text-gray-300 bg-gray-700 hover:bg-gray-600'}`;


  return (
    <div className="p-4 md:p-6 space-y-6">
        <div className="flex flex-col md:flex-row gap-4">
            <ReportCard title="Total Revenue" value={`RS ${totalRevenue.toFixed(2)}`} />
            <ReportCard title="Total Profit" value={`RS ${totalProfit.toFixed(2)}`} />
            <ReportCard title="Total Sales" value={sales.length.toString()} />
        </div>
        <div className="bg-gray-800 p-4 rounded-lg shadow-lg">
            <div className="flex items-center justify-between mb-4 border-b border-gray-700 pb-3 flex-wrap gap-2">
                 <h2 className="text-xl font-bold">Reports</h2>
                 <div className="flex space-x-2 flex-wrap">
                    <button className={getButtonClass('sales')} onClick={() => setActiveReport('sales')}>Sales</button>
                    <button className={getButtonClass('profit')} onClick={() => setActiveReport('profit')}>Profit</button>
                    <button className={getButtonClass('item-wise')} onClick={() => setActiveReport('item-wise')}>Item Wise</button>
                    <button className={getButtonClass('target')} onClick={() => setActiveReport('target')}>Sales Target</button>
                    <button className={getButtonClass('credit')} onClick={() => setActiveReport('credit')}>Credit Report</button>
                 </div>
            </div>
            <div className="overflow-x-auto">
                {renderReport()}
            </div>
        </div>
        {viewingSale && viewingCustomer && (
            <InvoiceModal 
                sale={viewingSale} 
                customer={viewingCustomer} 
                onClose={handleCloseInvoice}
            />
        )}
    </div>
  );
};