import { Item, Customer, Discount } from '../types';

export const initialItems: Item[] = [
  { id: 'item-1', name: 'Premium Grade A Rice (50kg)', costPrice: 2000, sellingPrice: 2500, stock: 500, targetSale: 400 },
  { id: 'item-2', name: 'Sunflower Oil (15L Tin)', costPrice: 1500, sellingPrice: 1800, stock: 300, targetSale: 250 },
  { id: 'item-3', name: 'Whole Wheat Flour (25kg)', costPrice: 800, sellingPrice: 1000, stock: 800, targetSale: 600 },
  { id: 'item-4', name: 'Refined Sugar (50kg Sack)', costPrice: 2200, sellingPrice: 2600, stock: 400, targetSale: 300 },
  { id: 'item-5', name: 'Toor Dal (30kg Bag)', costPrice: 2800, sellingPrice: 3200, stock: 250, targetSale: 200 },
  { id: 'item-6', name: 'Basmati Rice (25kg)', costPrice: 3000, sellingPrice: 3500, stock: 200, targetSale: 150 },
  { id: 'item-7', name: 'Groundnut Oil (15L Tin)', costPrice: 2100, sellingPrice: 2400, stock: 280, targetSale: 220 },
  { id: 'item-8', name: 'Tea Powder (10kg Pack)', costPrice: 1800, sellingPrice: 2200, stock: 150, targetSale: 100 },
  { id: 'item-9', name: 'Cashew Nuts (10kg Box)', costPrice: 6000, sellingPrice: 7000, stock: 100, targetSale: 80 },
  { id: 'item-10', name: 'Ghee (5L Tin)', costPrice: 2500, sellingPrice: 2900, stock: 180, targetSale: 150 },
];

export const initialCustomers: Customer[] = Array.from({ length: 50 }, (_, i) => ({
  id: `cust-${i + 1}`,
  name: `Retail Store #${i + 1}`,
  creditBalance: 0,
  phone: `9230012345${String(i + 1).padStart(2, '0')}`,
}));

export const initialDiscounts: Discount[] = [];

initialCustomers.forEach(customer => {
  initialItems.forEach(item => {
    // Generate a pseudo-random but consistent discount for each customer-item pair
    const discount = ( ( (customer.id.charCodeAt(5) - 48) + (item.id.charCodeAt(5) - 48) ) % 10 ) + 1; // Between 1% and 10%
    initialDiscounts.push({
      customerId: customer.id,
      itemId: item.id,
      discountPercentage: discount,
    });
  });
});